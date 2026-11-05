// ============================================
// Tarmoq qatlami: PeerJS (WebRTC) ustidagi yupqa o'ram
// O'yin mantig'ini bilmaydi, faqat xabar tashiydi.
// Yulduz sxemasi: har bir mehmon faqat xona egasiga ulanadi.
// ============================================

(() => {
    'use strict';

    const PREFIX = 'dustzone3d-xona-';
    // Adashtiradigan belgilar (0/O, 1/I) kodga kirmaydi
    const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const CODE_LENGTH = 5;
    // To'g'ridan-to'g'ri yo'l topilmaganda aloqa Metered oraliq serveri orqali o'tadi.
    // 443-port TLS bilan: qattiq cheklangan tarmoqlarda ham ochiq bo'ladi
    const TURN_AUTH = { username: '69a50f78402c0ac74006997f', credential: 'B1KCsfd8DY/3eR4s' };
    const ICE_SERVERS = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.relay.metered.ca:80' },
        { urls: 'turn:global.relay.metered.ca:80', ...TURN_AUTH },
        { urls: 'turn:global.relay.metered.ca:80?transport=tcp', ...TURN_AUTH },
        { urls: 'turn:global.relay.metered.ca:443', ...TURN_AUTH },
        { urls: 'turns:global.relay.metered.ca:443?transport=tcp', ...TURN_AUTH },
    ];
    const PEER_OPTIONS = { config: { iceServers: ICE_SERVERS } };
    const JOIN_TIMEOUT = 30000; // oraliq server orqali ulanish sekinroq
    const KEEPALIVE_MS = 1000;
    const SILENCE_LIMIT = 20000; // o'yin yuklanayotganda brauzer bir necha soniya band bo'ladi
    const RECONNECT_DELAY = 3000;
    const CONNECT_OPTIONS = { reliable: true, serialization: 'json' };

    function makeCode() {
        const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
        return Array.from(bytes, b => CODE_CHARS[b % CODE_CHARS.length]).join('');
    }

    function normalizeCode(code) {
        return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
    }

    function describeError(err) {
        switch (err && err.type) {
            case 'peer-unavailable': return "Xona topilmadi. Kodni tekshiring.";
            case 'browser-incompatible': return "Bu brauzer onlayn o'yinni qo'llab-quvvatlamaydi.";
            case 'network':
            case 'server-error':
            case 'socket-error':
            case 'socket-closed': return "Ulanish serveriga chiqib bo'lmadi. Internetni tekshiring.";
            default: return "Ulanib bo'lmadi. Qayta urinib ko'ring.";
        }
    }

    function peerLibraryReady(handlers) {
        if (window.Peer) return true;
        setTimeout(() => handlers.onError("Tarmoq kutubxonasi yuklanmadi. Sahifani yangilang."), 0);
        return false;
    }

    // === XONA EGASI ===
    function host(handlers) {
        const guests = new Map(); // peerId -> { conn, lastSeen }
        let peer = null;
        let opened = false;
        let closed = false;
        let attempts = 0;

        function drop(id, conn) {
            const entry = guests.get(id);
            if (!entry || (conn && entry.conn !== conn)) return;
            guests.delete(id);
            entry.conn.close();
            if (!closed) handlers.onGuestLeave(id);
        }

        function accept(conn) {
            const entry = { conn, lastSeen: Date.now() };
            conn.on('open', () => guests.set(conn.peer, entry));
            conn.on('data', msg => {
                entry.lastSeen = Date.now();
                if (msg && msg.t !== 'k') handlers.onGuestMessage(conn.peer, msg);
            });
            conn.on('close', () => drop(conn.peer, conn));
            conn.on('error', () => drop(conn.peer, conn));
        }

        function open() {
            const code = makeCode();
            peer = new window.Peer(PREFIX + code, PEER_OPTIONS);
            peer.on('open', () => {
                opened = true;
                handlers.onOpen(code);
            });
            peer.on('connection', accept);
            // Signal serveri faqat yangi mehmonlar uchun kerak: o'yin to'xtamaydi
            peer.on('disconnected', () => {
                setTimeout(() => {
                    if (!closed && !peer.destroyed && peer.disconnected) peer.reconnect();
                }, RECONNECT_DELAY);
            });
            peer.on('error', err => {
                if (opened) return;
                if (err.type === 'unavailable-id' && attempts++ < 5) {
                    peer.destroy();
                    open();
                    return;
                }
                handlers.onError(describeError(err));
            });
        }

        open();

        const keepalive = setInterval(() => {
            const now = Date.now();
            for (const [id, entry] of guests) {
                if (now - entry.lastSeen > SILENCE_LIMIT) drop(id);
                else if (entry.conn.open) entry.conn.send({ t: 'k' });
            }
        }, KEEPALIVE_MS);

        return {
            send(id, msg) {
                const entry = guests.get(id);
                if (entry && entry.conn.open) entry.conn.send(msg);
            },
            broadcast(msg, exceptId) {
                for (const [id, entry] of guests) {
                    if (id !== exceptId && entry.conn.open) entry.conn.send(msg);
                }
            },
            kick(id) { drop(id); },
            close() {
                closed = true;
                clearInterval(keepalive);
                if (peer) peer.destroy();
            },
        };
    }

    // === MEHMON ===
    function join(rawCode, handlers) {
        const peer = new window.Peer(PEER_OPTIONS);
        let conn = null;
        let connected = false;
        let finished = false;
        let lastSeen = Date.now();
        let keepalive = null;

        function finish(notify, text) {
            if (finished) return;
            finished = true;
            clearTimeout(timeout);
            clearInterval(keepalive);
            peer.destroy();
            if (notify) notify(text);
        }

        const timeout = setTimeout(() => {
            finish(handlers.onError, "Ulanib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.");
        }, JOIN_TIMEOUT);

        peer.on('open', () => {
            conn = peer.connect(PREFIX + normalizeCode(rawCode), CONNECT_OPTIONS);
            conn.on('open', () => {
                connected = true;
                clearTimeout(timeout);
                lastSeen = Date.now();
                keepalive = setInterval(() => {
                    if (Date.now() - lastSeen > SILENCE_LIMIT) {
                        finish(handlers.onClose, "Xona bilan aloqa uzildi.");
                    } else if (conn.open) {
                        conn.send({ t: 'k' });
                    }
                }, KEEPALIVE_MS);
                handlers.onOpen();
            });
            conn.on('data', msg => {
                lastSeen = Date.now();
                if (msg && msg.t !== 'k') handlers.onMessage(msg);
            });
            conn.on('close', () => {
                if (connected) finish(handlers.onClose, "Xona bilan aloqa uzildi.");
            });
            conn.on('error', err => {
                if (!connected) finish(handlers.onError, describeError(err));
            });
        });

        peer.on('error', err => {
            // Ulangandan keyin signal xatolari o'yinga ta'sir qilmaydi
            if (!connected) finish(handlers.onError, describeError(err));
        });

        return {
            send(msg) {
                if (conn && conn.open) conn.send(msg);
            },
            close() { finish(null); },
        };
    }

    window.Net = {
        normalizeCode,
        host(handlers) {
            return peerLibraryReady(handlers) ? host(handlers) : null;
        },
        join(code, handlers) {
            return peerLibraryReady(handlers) ? join(code, handlers) : null;
        },
    };
})();
