import { dispatch } from "./dispatcher";

let socket;
let isConnected = false;
let isReconnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_INTERVAL = 3000; // 3 detik

// 🔁 Fungsi utama connect ke WebSocket
function establishConnection() {
   if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
      console.log('[WebSocket] Sudah terhubung atau sedang menyambung ulang...');
      return;
   }

   console.log('[WebSocket] Mencoba terhubung...');

   socket = new WebSocket('ws://localhost:3030/ws');

   socket.onopen = () => {
      console.log('[WebSocket] ✅ Terhubung ke server.');
      isConnected = true;
      reconnectAttempts = 0;
      isReconnecting = false;
      sendInitWs();
   };

   socket.onclose = () => {
      console.warn('[WebSocket] ❌ Terputus dari server.');
      isConnected = false;

      if (!isReconnecting) {
         startReconnect();
      }
   };

   socket.onerror = (err) => {
      console.error('[WebSocket] ⚠️ Error:', err.message);
      socket.close(); // Tutup koneksi bermasalah, trigger onclose
   };

   socket.onmessage = (event) => {
      console.log('[WebSocket] 📩 Pesan diterima:', event.data);

      try {
         const json = JSON.parse(event.data);

         switch (json.type) {
            case "ACK":
               console.log('[ACK] ✅ Pesan berhasil diproses:', json.payload);
               break;

            case "ERROR":
               console.error('[ERROR] ❌ Kesalahan dari server:', json.payload?.message || 'Unknown error');
               break;

            default:
               dispatch(json); // Kirim ke dispatcher untuk dihandle oleh komponen
               break;
         }

      } catch (e) {
         console.error('⚠️ Gagal parse pesan:', e);
      }
   };
}

// 🔁 Reconnect otomatis
function startReconnect() {
   isReconnecting = true;
   reconnectAttempts++;

   if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
      console.log(`[WebSocket] 🔁 Mencoba sambung ulang (percobaan ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
      setTimeout(() => {
         establishConnection();
      }, RECONNECT_INTERVAL);
   } else {
      console.error('[WebSocket] ❌ Melebihi batas percobaan sambung ulang.');
   }
}

// 📤 Kirim init_ws
function sendInitWs() {
   const stored = localStorage.getItem('credentials');
   if (!stored) {
      console.warn('[WebSocket] ⚠️ Tidak ada credentials tersimpan.');
      return;
   }

   try {
      const { uuid: user_uuid } = JSON.parse(stored);
      sendWSMessage({ type: 'init_ws_user', data: { user_uuid } });
   } catch (error) {
      console.error('[WebSocket] ⚠️ Format credentials tidak valid:', error);
   }
}

// ✉️ Kirim pesan ke server
export function sendWSMessage(message) {
   if (!message || typeof message !== 'object') {
      console.warn('[WebSocket] ⚠️ Gagal mengirim pesan: Data tidak valid.', message);
      return false;
   }

   if (isConnected && socket?.readyState === WebSocket.OPEN) {
      try {
         socket.send(JSON.stringify(message));
         console.log('[WebSocket] 📤 Mengirim pesan:', message);
         return true;
      } catch (e) {
         console.error('[WebSocket] ⚠️ Gagal mengirim pesan:', e);
         return false;
      }
   } else {
      console.warn('[WebSocket] ⚠️ Tidak dapat mengirim. Status koneksi:', {
         isConnected,
         readyState: socket?.readyState,
      });
      return false;
   }
}

// 🔌 Connect manual
export function connectToWebSocket() {
   if (!isConnected && !isReconnecting) {
      const stored = localStorage.getItem('credentials');
      if (stored) {
          establishConnection(); 
      }
   }
}

// 🚫 Disconnect manual
export function disconnectFromWebSocket() {
   if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      socket.close();
      console.log("[WebSocket] Manually closed by user.");
   }
   isConnected = false;
   isReconnecting = false;
   socket = null;
}

// 🔄 Reconnect manual
export function reconnectWebSocket() {
   if (!isConnected) {
      establishConnection();
   }
}