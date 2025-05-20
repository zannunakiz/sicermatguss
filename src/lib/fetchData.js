//FUNGSI PEROLEH DATA DARI SENSOR, RUN SETIAP 500ms


export async function fetchData(label) {
   console.log("Starting to fetch data for label:", label);

   try {
      console.log("Fetching SENSOR data for label:", label);

      let result;
      switch (label) {
         case "jump":
            result = "jump";
            break;
         case "situp":
            result = "situp";
            break;
         case "punch":
            result = "punch";
            break;
         case "squat":
            result = "squat";
            break;
         case "pushup":
            result = "pushup";
            break;
         default:
            result = "unknown";
      }

      console.log("Fetched:", result);


   } catch (error) {
      console.error("Error while fetching:", error);
   }
}

