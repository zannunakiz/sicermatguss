export const handle = (data) => {
   const punchData = {
      punchPower: data.power || 0,
      retractionTime: data.retractionTime || 0,
   };

   if (typeof window.handlePunchData === 'function') {
      window.handlePunchData(punchData);
   }
};