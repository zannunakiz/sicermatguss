export async function fetchData(label) {
   console.log("Starting to fetch data for label:", label);

   while (true) {
      try {
         console.log("Fetching data for label:", label);

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

         await new Promise(resolve => setTimeout(resolve, 500)); // tunggu 500ms
      } catch (error) {
         console.error("Error while fetching:", error);
      }
   }
}
