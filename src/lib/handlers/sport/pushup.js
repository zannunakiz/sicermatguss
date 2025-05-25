export const handle = (data) => {
   const punchData = {
      punchPower: data.detection || 0,
      retractionTime: data.metrics.retractionTime || 0,
   };

   if (typeof window.handlePunchData === 'function') {
      window.handlePunchData(punchData);
   }
};