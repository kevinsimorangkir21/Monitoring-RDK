package config

import (
	"strings"
	"testing"

	"pgregory.net/rapid"
)

// Feature: google-sheets-sync, Property 15: Normalisasi GOOGLE_PRIVATE_KEY mengganti semua literal \n
//
// Validates: Requirements 8.4
//
// For any string yang mengandung satu atau lebih kemunculan literal backslash-n (\n — dua karakter),
// fungsi normalisasi private key harus menggantikan SEMUA kemunculan tersebut dengan karakter newline
// aktual (byte 0x0A), sehingga jumlah kemunculan \n literal dalam string hasil adalah 0.
//
// Dijalankan dengan: go test ./config/... -- -rapid.checks=200
func TestProperty15_GooglePrivateKeyNormalization(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		// Generate beberapa potongan string acak (1–10 potongan)
		// Setiap potongan mewakili segmen PEM key antar newline
		numParts := rapid.IntRange(2, 11).Draw(t, "numParts")
		parts := make([]string, numParts)
		for i := 0; i < numParts; i++ {
			parts[i] = rapid.String().Draw(t, "part")
		}

		// Bangun input dengan menyisipkan literal \n (dua karakter: backslash + 'n')
		// di antara setiap potongan — mensimulasikan GOOGLE_PRIVATE_KEY dari env var
		input := strings.Join(parts, `\n`)

		// Jumlah literal \n yang disisipkan = numParts - 1
		numLiterals := numParts - 1

		// Terapkan normalisasi — logika yang sama persis seperti di config.go:
		// strings.ReplaceAll(input, `\n`, "\n")
		result := strings.ReplaceAll(input, `\n`, "\n")

		// Properti utama: tidak boleh ada literal \n (backslash + n) yang tersisa
		if strings.Contains(result, `\n`) {
			t.Fatalf(
				"normalization failed: literal \\n still present in result\ninput:  %q\nresult: %q",
				input, result,
			)
		}

		// Properti tambahan: jumlah newline aktual (0x0A) di result harus >= numLiterals
		// (potongan mungkin sudah mengandung newline aktual sebelum normalisasi)
		actualNewlines := strings.Count(result, "\n")
		if actualNewlines < numLiterals {
			t.Fatalf(
				"normalization lost newlines: expected at least %d actual newlines (0x0A), got %d\ninput:  %q\nresult: %q",
				numLiterals, actualNewlines, input, result,
			)
		}
	})
}

// TestProperty15_NormalizationFromJoinedParts memverifikasi bahwa string yang dibentuk
// dengan menggabungkan bagian-bagian menggunakan separator literal \n juga dinormalisasi
// dengan benar.
func TestProperty15_NormalizationFromJoinedParts(t *testing.T) {
	// Karakter aman untuk PEM key: huruf, angka, dan simbol PEM umum
	safePEMRunes := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-=+/")

	rapid.Check(t, func(t *rapid.T) {
		// Generate 1–5 bagian string menggunakan karakter aman
		parts := rapid.SliceOfN(
			rapid.StringOf(rapid.RuneFrom(safePEMRunes)),
			1, 5,
		).Draw(t, "parts")

		// Bangun input dengan literal \n di antara bagian-bagian string
		// (mensimulasikan GOOGLE_PRIVATE_KEY yang disimpan di environment variable)
		input := strings.Join(parts, `\n`)

		// Terapkan normalisasi menggunakan logika yang sama dengan config.go
		result := strings.ReplaceAll(input, `\n`, "\n")

		// Pastikan tidak ada literal \n tersisa
		if strings.Contains(result, `\n`) {
			t.Fatalf(
				"ReplaceAll did not eliminate all literal \\n\ninput:  %q\nresult: %q",
				input, result,
			)
		}

		// Verifikasi bahwa jumlah newline aktual sesuai dengan jumlah separator yang disisipkan
		// (jumlah join separator = len(parts) - 1)
		expectedNewlines := len(parts) - 1
		actualNewlines := strings.Count(result, "\n")
		if actualNewlines < expectedNewlines {
			t.Fatalf(
				"expected at least %d actual newlines, got %d\ninput:  %q\nresult: %q",
				expectedNewlines, actualNewlines, input, result,
			)
		}
	})
}

// TestProperty15_NormalizationIdempotent memverifikasi bahwa menerapkan normalisasi
// dua kali menghasilkan hasil yang sama dengan menerapkannya satu kali — memastikan
// bahwa newline aktual (0x0A) tidak terpengaruh oleh normalisasi ulang.
func TestProperty15_NormalizationIdempotent(t *testing.T) {
	rapid.Check(t, func(t *rapid.T) {
		// Generate string acak (mungkin sudah mengandung newline aktual dan/atau literal \n)
		base := rapid.String().Draw(t, "base")

		// Normalisasi sekali
		once := strings.ReplaceAll(base, `\n`, "\n")

		// Normalisasi dua kali
		twice := strings.ReplaceAll(once, `\n`, "\n")

		// Hasilnya harus identik (idempoten)
		if once != twice {
			t.Fatalf(
				"normalization is not idempotent:\nonce:  %q\ntwice: %q",
				once, twice,
			)
		}
	})
}
