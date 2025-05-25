// wsClient.js
import { dispatch } from "./dispatcher";

let socket;
let isConnected = false;

export function connectToWebSocket() {
   socket = new WebSocket('ws://localhost:3030/ws');

   socket.onopen = () => {
      console.log('[WebSocket] ✅ Connected to server.');
      isConnected = true;
      sendInitWs();
   };

   socket.onclose = () => {
      console.warn('[WebSocket] ❌ Disconnected from server.');
      isConnected = false;
   };

   socket.onerror = (err) => {
      console.error('[WebSocket] ⚠️ Error:', err);
   };

   socket.onmessage = (event) => {
      console.log('[WebSocket] 📩 Message received:', event.data);

      try {
         const json = JSON.parse(event.data);
         dispatch(json); // <-- Kirim ke dispatcher
      } catch (e) {
         console.error('Gagal parse pesan:', e);
      }
   };
}

function sendInitWs() {
   const stored = localStorage.getItem('credentials');
   if (!stored) return;

   const { uuid: user_uuid } = JSON.parse(stored);
   sendWSMessage({ type: 'init_ws', data: { user_uuid } });
}

export function sendWSMessage(message) {
   if (isConnected && socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
   } else {
      console.warn("⚠️ WebSocket belum terhubung, tidak dapat mengirim:", message);
   }
}