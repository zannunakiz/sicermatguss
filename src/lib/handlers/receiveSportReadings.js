// handlers/receiveSportReadings.js
import * as punchHandler from './sport/punch.js';
import * as pushupHandler from './sport/pushup.js';
const SPORT_HANDLERS = {
   punch: punchHandler,
   pushup: pushupHandler
};

export const handle = (data) => {
   const sportType = data.type;

   const handler = SPORT_HANDLERS[sportType];
   if (!handler) {
      console.warn(`Sport handler tidak ditemukan untuk tipe: ${sportType}`);
      return;
   }

   handler.handle(data);
};