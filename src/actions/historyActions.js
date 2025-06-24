
import { getToken } from "./creds"

// Function to generate fuzzy status based on heart rate and SpO2
export const fuzzySugeno = (spo2, heartRate) => {
   if (!spo2 || !heartRate) return "UNKNOWN"

   if (spo2 >= 95 && heartRate >= 60 && heartRate <= 100) {
      return "EXCELLENT"
   } else if (spo2 >= 90 && heartRate >= 50 && heartRate <= 120) {
      return "GOOD"
   } else if (spo2 >= 85 && heartRate >= 40 && heartRate <= 140) {
      return "FAIR"
   } else {
      return "POOR"
   }
}

// Function to get history from API
export const getHistory = async () => {
   try {
      const response = await fetch(`${process.env.REACT_APP_API}/log/get-logs`, {
         method: "GET",
         headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`,
         },
      })
      if (!response.ok) {
         throw new Error("Failed to fetch history")
      }

      const { content } = await response.json()
      // console.log("CONTEnt", content)
      return content

      // return { logs: data.sort((a, b) => new Date(b.date) - new Date(a.date)) };
   } catch (error) {
      console.error("Error fetching history:", error)
      throw error
   }
}



export const getHistoryDummy = () => {
   const exercises = ["punch", "situp", "pushup", "squat"];
   const logs = [];

   exercises.forEach((exercise, exerciseIndex) => {
      // Generate 5 sessions per exercise
      for (let sessionIndex = 0; sessionIndex < 5; sessionIndex++) {
         const date = new Date();
         date.setDate(date.getDate() - (exerciseIndex * 2 + sessionIndex));

         const timeIntervals = [];
         // 25:33 menit = 1533 detik / 5 = 307 data point
         for (let i = 0; i < 307; i++) {
            const totalSeconds = i * 5;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            timeIntervals.push(
               `${minutes.toString().padStart(2, "0")}:${seconds
                  .toString()
                  .padStart(2, "0")}`
            );
         }

         const data = {};
         let totalCount = 0;

         timeIntervals.forEach((time) => {
            const count = Math.floor(Math.random() * 6) + 2; // 2-7 count
            const heartRate = Math.floor(Math.random() * 60) + 60; // 60-120 bpm
            const spo2 = Math.floor(Math.random() * 18) + 80; // 80-98%
            totalCount += count;

            data[time] = {
               heart: {
                  heart_rate: heartRate,
                  spo2: spo2,
               },
               sport: {
                  count: count,
               },
               status: fuzzySugeno(spo2, heartRate),
            };
         });

         data.total_count = totalCount;

         logs.push({
            uuid: `${exercise}-${sessionIndex}-${Math.random()
               .toString(36)
               .substr(2, 9)}`,
            user_uuid: "df418da3-646a-459f-8bdb-cc11f7e807dd",
            date: date.toISOString(),
            exercise: exercise,
            data: data,
            created_at: date.toISOString(),
         });
      }
   });
   // console.log({
   //    logs: logs.sort((a, b) => new Date(b.date) - new Date(a.date))
   // })
   return { logs: logs.sort((a, b) => new Date(b.date) - new Date(a.date)) };

};
