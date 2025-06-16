export const handle = (data) => {
   const squatData = {
      timestamp: data.detection,
      count: data.count
   };

   if (typeof window.handleSquatData === 'function') {
      window.handleSquatData(squatData);
   }
};