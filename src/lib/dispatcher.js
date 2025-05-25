// dispatcher.js
import * as receiveSportReadings from './handlers/receiveSportReadings.js';
import * as updateDeviceStatus from './handlers/updateDeviceStatus.js';

const handlers = {
   sport_sensing: receiveSportReadings,
   updateDeviceStatus: updateDeviceStatus
};

export const dispatch = async (json) => {
   const handler = handlers[json.type];
   if (!handler) {
      console.warn(`Unknown message type: ${json.type}`);
      return;
   }

   try {
      await handler.handle(json.data);
   } catch (e) {
      console.error("Error in handler:", e);
   }
};