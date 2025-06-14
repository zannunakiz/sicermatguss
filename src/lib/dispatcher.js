// dispatcher.js
import * as receiveSportReadings from './handlers/receiveSportReadings.js';
import * as updateDeviceStatus from './handlers/updateDeviceStatus.js';
import * as pairRequest from './handlers/pairRequest.js';
import * as heartSensing from './handlers/heartSensing.js';

const handlers = {
   sport_sensing: receiveSportReadings,
   device_status_update: updateDeviceStatus,
   pair_request: pairRequest,
   heart_sensing: heartSensing
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