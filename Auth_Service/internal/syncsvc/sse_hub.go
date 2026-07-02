package syncsvc

import "time"

// clientReg mendaftarkan klien baru ke SSEHub.
type clientReg struct {
	id string
	ch chan SSEEvent
}

// SSEHub mengelola koneksi SSE dari semua klien Dashboard.
// Semua akses ke map clients dijaga oleh event-loop goroutine (Run).
type SSEHub struct {
	clients    map[string]chan SSEEvent // clientID → channel
	register   chan clientReg
	unregister chan string
	broadcast  chan SSEEvent
	keepalive  *time.Ticker
}

// NewSSEHub membuat SSEHub baru dan menjalankan goroutine Run-nya.
func NewSSEHub() *SSEHub {
	h := &SSEHub{
		clients:    make(map[string]chan SSEEvent),
		register:   make(chan clientReg, 1),
		unregister: make(chan string, 1),
		broadcast:  make(chan SSEEvent, 10),
		keepalive:  time.NewTicker(30 * time.Second),
	}
	go h.Run()
	return h
}

// Run adalah event-loop utama SSEHub. Harus dijalankan sebagai goroutine.
func (h *SSEHub) Run() {
	for {
		select {
		case reg := <-h.register:
			h.clients[reg.id] = reg.ch

		case id := <-h.unregister:
			if ch, ok := h.clients[id]; ok {
				close(ch)
				delete(h.clients, id)
			}

		case evt := <-h.broadcast:
			for _, ch := range h.clients {
				select {
				case ch <- evt:
				default: // skip klien yang lambat agar tidak memblokir
				}
			}

		case <-h.keepalive.C:
			keepaliveEvt := SSEEvent{Event: "keepalive"}
			for _, ch := range h.clients {
				select {
				case ch <- keepaliveEvt:
				default:
				}
			}
		}
	}
}

// Register mendaftarkan klien baru dengan clientID dan mengembalikan channel event-nya.
// Channel dibuffer 16 event agar HTTP handler punya ruang saat menulis.
func (h *SSEHub) Register(clientID string) chan SSEEvent {
	ch := make(chan SSEEvent, 16)
	h.register <- clientReg{id: clientID, ch: ch}
	return ch
}

// Unregister melepas registrasi klien dan menutup channel-nya.
// Operasi diselesaikan oleh event-loop dalam ≤5 detik (non-blocking dari sisi pemanggil).
func (h *SSEHub) Unregister(clientID string) {
	h.unregister <- clientID
}

// Broadcast mengirimkan SSEEvent ke semua klien terdaftar.
// Jika hub sedang penuh (channel broadcast terisi), event akan di-drop (non-blocking).
func (h *SSEHub) Broadcast(evt SSEEvent) {
	select {
	case h.broadcast <- evt:
	default: // drop jika hub kelebihan beban
	}
}
