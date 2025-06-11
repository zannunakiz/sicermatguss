export const handle = (data) => {
   const situpData = {
      timestamp: data.detection,
      count: data.count
   };

   if (typeof window.handleSitupData === 'function') {
      window.handleSitupData(situpData);
   }
};