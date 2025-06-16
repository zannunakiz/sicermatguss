export const handle = (data) => {
   const pushupData = {
      timestamp: data.detection,
      count: data.count
   };

   if (typeof window.handlePushupData === 'function') {
      window.handlePushupData(pushupData);
   }
};