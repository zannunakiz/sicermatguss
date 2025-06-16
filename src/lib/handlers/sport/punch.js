export const handle = (data) => {
   const punchData = {
      timestamp: data.detection,
      retractionTime: data.metrics.retractionTime || 0,
      punchPower: data.metrics.punchPower || 0,
      count: data.count 
   };
   console.log(`[Punch Handler] Received data: ${JSON.stringify(punchData)}`);

   if (typeof window.handlePunchData === 'function') {
      window.handlePunchData(punchData);
   }
};