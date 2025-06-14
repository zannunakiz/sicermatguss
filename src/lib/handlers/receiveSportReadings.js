// handlers/receiveSportReadings.js
import * as punchHandler from './sport/punch.js';
import * as pushupHandler from './sport/pushup.js';
import * as situpHandler from './sport/situp.js';
import * as squatHandler from './sport/squat.js';
const SPORT_HANDLERS = {
   punch: punchHandler,
   pushup: pushupHandler,
   situp: situpHandler,
   squat: squatHandler
};

export const handle = (data) => {
   const sportType = data.sport_type;

   const handler = SPORT_HANDLERS[sportType];
   if (!handler) {
      console.warn(`Sport handler tidak ditemukan untuk tipe: ${sportType}`);
      return;
   }

   handler.handle(data);
};