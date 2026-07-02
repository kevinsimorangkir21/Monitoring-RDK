package syncsvc

import (
	"context"
	"fmt"
	"testing"
	"time"

	"pgregory.net/rapid"
)

// ── Property 13: ConflictResolver deterministik berdasarkan updated_at ─────────
//
// Validates: Requirements 6.1, 6.2, 6.3, 6.4
// For any pair of non-zero timestamps, calling Resolve twice with the same inputs
// must return the same decision, and that decision must match LWW semantics.

func TestProperty13_ConflictResolverDeterministic(t *testing.T) {
	resolver := NewConflictResolver()
	rapid.Check(t, func(t *rapid.T) {
		ctx := context.Background()

		// Generate two non-zero timestamps (Unix seconds in a reasonable range)
		sheetsUnix := rapid.Int64Range(1_000_000, 9_999_999_999).Draw(t, "sheetsUnix")
		mysqlUnix := rapid.Int64Range(1_000_000, 9_999_999_999).Draw(t, "mysqlUnix")

		sheetsTs := time.Unix(sheetsUnix, 0).UTC()
		mysqlTs := time.Unix(mysqlUnix, 0).UTC()

		// Call Resolve twice with identical inputs
		dec1, err1 := resolver.Resolve(ctx, "test_table", 1, sheetsTs, mysqlTs,
			func() error { return nil },
			func() error { return nil },
		)
		dec2, err2 := resolver.Resolve(ctx, "test_table", 1, sheetsTs, mysqlTs,
			func() error { return nil },
			func() error { return nil },
		)

		// Both must return nil error
		if err1 != nil {
			t.Fatalf("first Resolve returned error: %v", err1)
		}
		if err2 != nil {
			t.Fatalf("second Resolve returned error: %v", err2)
		}

		// Both decisions must be identical (deterministic)
		if dec1 != dec2 {
			t.Fatalf("non-deterministic: same inputs produced %q and %q\nsheets=%v mysql=%v",
				dec1, dec2, sheetsTs, mysqlTs)
		}

		// Verify LWW correctness
		diff := sheetsTs.Sub(mysqlTs)
		switch {
		case diff > 0:
			if dec1 != DecisionSheetsWins {
				t.Fatalf("sheets is newer (diff=%v) but decision=%q (expected %q)",
					diff, dec1, DecisionSheetsWins)
			}
		case diff < 0:
			if dec1 != DecisionMySQLWins {
				t.Fatalf("mysql is newer (diff=%v) but decision=%q (expected %q)",
					diff, dec1, DecisionMySQLWins)
			}
		default: // diff == 0
			if dec1 != DecisionNoConflict {
				t.Fatalf("timestamps equal but decision=%q (expected %q)",
					dec1, DecisionNoConflict)
			}
		}
	})
}

// ── Property 14: Null/zero updated_at kalah ────────────────────────────────────
//
// Validates: Requirements 6.6, 6.7
// When one source has a zero timestamp, that source always loses.
// Write-back must be called for the losing source, and Resolve must never return
// a non-nil error even when write-back itself fails.

func TestProperty14_ZeroTimestampLoses(t *testing.T) {
	resolver := NewConflictResolver()
	rapid.Check(t, func(t *rapid.T) {
		ctx := context.Background()

		// Choose which side gets zero timestamp
		sheetsIsZero := rapid.Bool().Draw(t, "sheetsIsZero")
		validUnix := rapid.Int64Range(1_000_000, 9_999_999_999).Draw(t, "validUnix")
		validTs := time.Unix(validUnix, 0).UTC()

		var sheetsTs, mysqlTs time.Time
		if sheetsIsZero {
			sheetsTs = time.Time{} // zero
			mysqlTs = validTs
		} else {
			sheetsTs = validTs
			mysqlTs = time.Time{} // zero
		}

		writeBackCalled := false
		writeBackFn := func() error {
			writeBackCalled = true
			return nil
		}
		noopFn := func() error { return nil }

		var dec ConflictDecision
		var err error

		if sheetsIsZero {
			// Sheets is zero → mysql wins → write-back to sheets should be called
			dec, err = resolver.Resolve(ctx, "test_table", 42, sheetsTs, mysqlTs,
				noopFn,      // writeBackToMySQL (not called)
				writeBackFn, // writeBackToSheets (must be called)
			)
			if dec != DecisionMySQLWins {
				t.Fatalf("sheets zero but decision=%q (expected %q)", dec, DecisionMySQLWins)
			}
		} else {
			// MySQL is zero → sheets wins → write-back to mysql should be called
			dec, err = resolver.Resolve(ctx, "test_table", 42, sheetsTs, mysqlTs,
				writeBackFn, // writeBackToMySQL (must be called)
				noopFn,      // writeBackToSheets (not called)
			)
			if dec != DecisionSheetsWins {
				t.Fatalf("mysql zero but decision=%q (expected %q)", dec, DecisionSheetsWins)
			}
		}

		// Error must always be nil (even with write-back)
		if err != nil {
			t.Fatalf("Resolve returned non-nil error: %v", err)
		}

		// Write-back must have been called for the losing (zero-timestamp) source
		if !writeBackCalled {
			t.Fatalf("write-back was not called for the losing (zero-timestamp) source; decision=%q", dec)
		}
	})
}

// TestProperty14_FailedWriteBackNotPropagated verifies that write-back failures
// are swallowed (logged) and never surfaced as errors to the caller.
func TestProperty14_FailedWriteBackNotPropagated(t *testing.T) {
	resolver := NewConflictResolver()
	rapid.Check(t, func(t *rapid.T) {
		ctx := context.Background()

		failingFn := func() error {
			return fmt.Errorf("simulated write-back failure")
		}

		// Make sheets always newer so writeBackToMySQL is called (and will fail)
		mysqlUnix := rapid.Int64Range(1_000_000, 4_999_999_999).Draw(t, "mysqlUnix")
		sheetsUnix := mysqlUnix + rapid.Int64Range(1, 1_000_000).Draw(t, "delta")

		sheetsTs := time.Unix(sheetsUnix, 0).UTC()
		mysqlTs := time.Unix(mysqlUnix, 0).UTC()

		_, err := resolver.Resolve(ctx, "test_table", 1, sheetsTs, mysqlTs,
			failingFn,                   // writeBackToMySQL — will fail
			func() error { return nil }, // writeBackToSheets
		)

		// Error must NOT be propagated
		if err != nil {
			t.Fatalf("write-back failure was propagated as Resolve error: %v", err)
		}
	})
}
