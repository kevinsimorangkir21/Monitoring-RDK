package syncsvc

import (
	"fmt"
	"testing"
	"time"

	"pgregory.net/rapid"
)

// ── Property 10: Broadcast event ke semua klien terdaftar ──────────────────────
//
// Validates: Requirements 5.5, 7.3, 7.6
// For 1–50 registered clients, every client must receive a broadcast event
// within 500ms of it being sent.

func TestProperty10_BroadcastToAllClients(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		hub := NewSSEHub()

		// Generate 1–50 clients
		n := rapid.IntRange(1, 50).Draw(t, "numClients")

		channels := make([]chan SSEEvent, n)
		for i := 0; i < n; i++ {
			id := fmt.Sprintf("client-%d-%d", i, rapid.IntRange(0, 999999).Draw(t, fmt.Sprintf("suffix%d", i)))
			channels[i] = hub.Register(id)
		}

		// Let Register messages propagate through the Run() event loop
		time.Sleep(20 * time.Millisecond)

		// Broadcast a test event
		evt := SSEEvent{Event: "sync", Worksheet: "Inbound", ID: 42}
		hub.Broadcast(evt)

		// Each client must receive the event within 500ms
		deadline := time.Now().Add(500 * time.Millisecond)
		for i, ch := range channels {
			select {
			case received := <-ch:
				// Skip keepalive events that may have been buffered
				for received.Event == "keepalive" {
					timeLeft := time.Until(deadline)
					if timeLeft <= 0 {
						t.Fatalf("client %d did not receive sync event within 500ms (only got keepalive)", i)
					}
					select {
					case received = <-ch:
					case <-time.After(timeLeft):
						t.Fatalf("client %d did not receive sync event within 500ms", i)
					}
				}
				if received.Event != evt.Event {
					t.Fatalf("client %d: Event mismatch: got %q, want %q", i, received.Event, evt.Event)
				}
				if received.Worksheet != evt.Worksheet {
					t.Fatalf("client %d: Worksheet mismatch: got %q, want %q", i, received.Worksheet, evt.Worksheet)
				}
				if received.ID != evt.ID {
					t.Fatalf("client %d: ID mismatch: got %d, want %d", i, received.ID, evt.ID)
				}
			case <-time.After(time.Until(deadline)):
				t.Fatalf("client %d did not receive event within 500ms", i)
			}
		}
	})
}

// ── Property 11: SSE Hub membersihkan klien yang disconnect ────────────────────
//
// Validates: Requirements 7.4
// After Unregister is called, the client's channel must be closed within 5 seconds.
// A closed channel signals that the hub has cleaned up the registration.

func TestProperty11_CleanupOnDisconnect(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		hub := NewSSEHub()

		// Use a unique client ID per iteration
		seed := rapid.IntRange(0, 999999).Draw(t, "seed")
		clientID := fmt.Sprintf("test-client-%d", seed)

		// Register the client
		ch := hub.Register(clientID)

		// Let registration propagate
		time.Sleep(20 * time.Millisecond)

		// Unregister — simulates context.Done() in the SSE handler
		hub.Unregister(clientID)

		// The hub's Run() loop must close the channel within 5 seconds
		// Reading from a closed channel returns the zero value with ok=false
		timer := time.NewTimer(5 * time.Second)
		defer timer.Stop()

		for {
			select {
			case _, ok := <-ch:
				if !ok {
					// Channel closed — cleanup confirmed
					return
				}
				// Got an event (e.g. keepalive buffered before unregister) — drain and keep waiting
			case <-timer.C:
				t.Fatal("channel was not closed within 5 seconds after Unregister")
			}
		}
	})
}
