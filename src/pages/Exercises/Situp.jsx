import React, { useCallback, useEffect, useRef, useState } from 'react';
import HeartRate from '../../components/HeartRate';
import ResetDialog from '../../components/ResetDialog';
import { usePairedDevice } from '../../context/PairedDeviceContext';
import { useToast } from '../../context/ToastContext';
import { sendWSMessage } from '../../lib/wsClient';


const Situp = () => {
   // State variables
   const [situpCount, setSitupCount] = useState(0);
   const [situpSet, setSitupSet] = useState(0);
   const [stabilityRate, setStabilityRate] = useState(0);
   const [timeElapsedSitup, setTimeElapsedSitup] = useState(0);
   const [isRunning, setIsRunning] = useState(false);
   const [time, setTime] = useState(0);
   const [isFetching, setIsFetching] = useState(false);
   const [resetDialog, setResetDialog] = useState(false)

   // Refs for chart instances and DOM elements
   const situpGaugeRef = useRef(null);
   const situpChartRef = useRef(null);
   const situpChartCanvasRef = useRef(null);
   const situpGaugeCanvasRef = useRef(null);
   const timerRef = useRef(null);
   const strSitupRef = useRef(null);
   const rstSitupRef = useRef(null);

   // Data storage
   const lastSitupTimeRef = useRef(0);
   const situpIntervalsRef = useRef([]);
   const allSitupDataRef = useRef([]);
   const timerIntervalRef = useRef(null);

   // Format time for display
   const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      return `${minutes}:${secs}`;
   };


   const toast = useToast()
   const { pairedDevice } = usePairedDevice()
   const intervalRef = useRef(null);

   // TODO: perlu logika buat destroy window.handleSitupData saat leave page
   const startExercise = () => {
      if (pairedDevice.name === "") {
         toast.error("No device connected");
         return;
      }

      setIsFetching(prev => {
         const nextState = !prev;
         startPauseTime()
         toast.normal(`Situp Exercise ${nextState ? "Started" : "Paused"}`);
         const device = JSON.parse(localStorage.getItem("device") || "{}");
            
         // Kalau mulai (ON)
         if (nextState) {
            const notify_status = sendWSMessage({ type: "start_session", data: { sport_type: "situp", device_uuid: device.device_uuid } });
            if (notify_status){
               console.log(`[Situp on] before: ${window.handleSitupData}`);
               window.handleSitupData = (situpData) => {
                  console.log(`[Situp] Received data: ${JSON.stringify(situpData)}`);
                  if (isFetching) {
                     updateData(situpData);
                  }
               }
               console.log(`[Situp on] after: ${window.handleSitupData}`);
            }
            // fetchData("situp");
            // intervalRef.current = setInterval(() => {
            //    fetchData("situp");
            // }, 500);
         } else {
            // Kalau berhenti (OFF)
            const notify_status = sendWSMessage({ type: "pause_session", data: { sport_type: "situp", device_uuid: device.device_uuid } });
            if (!notify_status) toast.error("Failed to pause session")
            else {
               toast.normal("Situp Exercise Paused");
               clearInterval(timerIntervalRef.current);
               intervalRef.current = null;
               if (window.handleSitupData) delete window.handleSitupData;
               console.log(`[Situp off] window.handleSitupData: ${window.handleSitupData}`);
            }
         }

         return nextState;
      });
   };

   // Initialize charts on component mount
   useEffect(() => {
      // Initialize gauge
      situpGaugeRef.current = new window.Gauge(situpGaugeCanvasRef.current).setOptions({
         angle: -0.5,
         lineWidth: 0.1,
         radiusScale: 1.1,
         pointer: {
            length: 0,
            strokeWidth: 0,
            color: '#32cd32'
         },
         limitMax: 'true',
         highDpiSupport: true,
         colorStart: '#ffff00',
         colorStop: '#ffffe0',
         strokeColor: '#E0E0E0',
         generateGradient: true
      });
      situpGaugeRef.current.maxValue = 100;
      situpGaugeRef.current.setMinValue(0);
      situpGaugeRef.current.set(0);

      // Initialize chart
      const ctx = situpChartCanvasRef.current.getContext('2d');
      situpChartRef.current = new window.Chart(ctx, {
         type: 'line',
         data: {
            labels: [],
            datasets: [
               {
                  label: 'Sit Up Speed',
                  data: [],
                  borderColor: '#ffff00',
                  borderWidth: 1,
                  fill: false,
               },
               {
                  label: 'Stability Rate',
                  data: [],
                  borderColor: '#32cd32',
                  borderWidth: 1,
                  fill: false,
               }
            ],
         },
         options: {
            responsive: true,
            scales: {
               y: {
                  beginAtZero: true,
                  ticks: { color: 'white' },
                  grid: { color: 'rgba(255, 255, 255, 0.2)' }
               },
               x: {
                  ticks: { color: 'white' },
                  grid: { color: 'rgba(255, 255, 255, 0.2)' }
               }
            },
            plugins: {
               legend: {
                  labels: { color: 'white' }
               }
            }
         }
      });

      // Cleanup on unmount
      return () => {
         if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
         }
         if (situpChartRef.current) {
            situpChartRef.current.destroy();
         }
      };
   }, []);

   // Timer functions
   const startPauseTime = () => {
      if (isRunning) {
         clearInterval(timerIntervalRef.current);
      } else {
         timerIntervalRef.current = setInterval(() => {
            setTime(prevTime => prevTime + 1);
         }, 1000);
      }
      setIsRunning(!isRunning);
   };

   const resetTime = () => {
      clearInterval(timerIntervalRef.current);
      setTime(0);
      setIsRunning(false);
   };

   // Update data function
   const updateData = useCallback((data) => {
      if (!isFetching) return;

      const detectedSitup = data.situpCount || 1;
      // const situpOneSec = Math.floor(Math.random() * 3) + 1;
      setSitupCount(prev => prev + detectedSitup);
      setSitupSet(prev => prev + detectedSitup);

      const currentTime = timeElapsedSitup;

      if (lastSitupTimeRef.current > 0) {
         const interval = currentTime - lastSitupTimeRef.current;
         situpIntervalsRef.current.push(interval);
      }

      lastSitupTimeRef.current = currentTime;

      // // Track sit-up intervals
      // if (detectedSitup > 0) {
      //    const currentTime = timeElapsedSitup;
      //    if (lastSitupTimeRef.current > 0) {
      //       const interval = currentTime - lastSitupTimeRef.current;
      //       situpIntervalsRef.current.push(interval);
      //    }
      //    lastSitupTimeRef.current = currentTime;
      // }

      // setTimeElapsedSitup(prev => prev + 1);

      // Update chart every 3 seconds
      if (timeElapsedSitup % 3 === 0) {
         situpGaugeRef.current.set(situpSet);

         // Calculate stability rate
         if (situpIntervalsRef.current.length > 1) {
            const avgInterval = situpIntervalsRef.current.reduce((a, b) => a + b, 0) / situpIntervalsRef.current.length;
            const stableIntervals = situpIntervalsRef.current.filter(interval =>
               Math.abs(interval - avgInterval) <= 0.5
            );
            const newStabilityRate = Math.round((stableIntervals.length / situpIntervalsRef.current.length) * 100);
            setStabilityRate(newStabilityRate);
         }

         // Update chart data
         const chart = situpChartRef.current;
         if (timeElapsedSitup > 30) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => {
               dataset.data.shift();
            });
         }

         chart.data.labels.push(`${timeElapsedSitup} Sec`);
         chart.data.datasets[0].data.push(situpSet);
         chart.data.datasets[1].data.push(stabilityRate / 10);
         chart.update();

         allSitupDataRef.current.push({ time: `Time ${timeElapsedSitup}`, speed: situpSet });
         setSitupSet(0);
      }
   }, [stabilityRate, isFetching, timeElapsedSitup, situpSet]);

   const handleSitupData = useCallback((situpData) => {
      console.log("[Situp] Received data: ", situpData);

      if (isFetching) {
         updateData(situpData);
      }
   }, [isFetching, updateData]);

   useEffect(() => {
      window.handleSitupData = handleSitupData;
      return () => {
         if (window.handleSitupData) delete window.handleSitupData
      }
   })

   // Exercise control functions
   const resetExercise = () => {
      setSitupCount(0);
      setSitupSet(0);
      setStabilityRate(0);
      setTimeElapsedSitup(0);
      setIsFetching(false);
      clearInterval(intervalRef.current);

      lastSitupTimeRef.current = 0;
      situpIntervalsRef.current = [];
      allSitupDataRef.current = [];

      // Reset gauge
      situpGaugeRef.current.set(0);

      // Reset chart
      const chart = situpChartRef.current;
      chart.data.labels = [];
      chart.data.datasets.forEach(dataset => {
         dataset.data = [];
      });
      chart.update();

      if (window.handleSitupData) delete window.handleSitupData;
      const device = JSON.parse(localStorage.getItem("device") || "{}");
      sendWSMessage({ type: "save_session", device_uuid: device.device_uuid, sport: "situp"});

      resetTime();
   };

   // Export data
   const exportData = () => {
      let csvContent = "Time, Total(sit ups/ 3sec)\n";
      allSitupDataRef.current.forEach(entry => {
         csvContent += `${entry.time},${entry.speed}\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "all_situp_data.csv";
      link.click();
      URL.revokeObjectURL(url);
   };

   // Simulate data updates
   // useEffect(() => {
   //    const interval = setInterval(updateData, 1000);
   //    return () => clearInterval(interval);
   // }, [isFetching, timeElapsedSitup, stabilityRate, updateData]);
   useEffect(() => {
      window.handleSitupData = (data) => {
         console.log(`[Situp] Received data: ${JSON.stringify(data)}`);
         if (isFetching) {
            updateData(data);
         }
      }
      return () => {
         delete window.handleSitupData;
      };
   }, [isFetching, updateData]);

   return (
      <section id="situp-content" className='overflow-x-hidden'>
         <div className="container dashboard-container" id="situp-training">
            <h1 className="dashboard-title boxing-title">Sit Up Exercise Dashboard</h1>
            <h4 className="dashboard-subtitle text-center text-white mb-10">
               (Place device on the Abdomen)
            </h4>

            <section id="control-section">
               <div className="text-white">
                  <button
                     ref={strSitupRef}
                     id="str-situp"
                     className="str-btn"
                     onClick={startExercise}
                  >
                     {isFetching ? "Pause" : "Start"}
                  </button>
                  <button
                     ref={rstSitupRef}
                     id="rst-situp"
                     className="rst-btn"
                     onClick={() => setResetDialog(true)}>
                     Reset
                  </button>
               </div>
            </section>

            <div className="row cards-container">
               <div className="col-md-3">
                  <div className="card carddata">
                     <div className="card-body">
                        <h5 className="card-title text-white">Sit Up Count</h5>
                        <p className="card-text">{situpCount}</p>
                        <img src="/icon/situp.svg" alt="situp icon" className="w-[130px] mt-[40px]" />
                     </div>
                  </div>
               </div>

               <div className="col-md-3">
                  <div className="card carddata">
                     <div className="card-body">
                        <h5 className="card-title text-yellow-300">Sit Up Speed</h5>
                        <div className="situpSpeedItem">
                           <h5 className="card-text text-center mt-[50px]">{situpSet}</h5>
                           <p className="text-white text-center text-[0.8rem] mt-[40px]">situps / 3 sec</p>
                           <canvas ref={situpGaugeCanvasRef} id="situpGauge" className="mt-[-90px]"></canvas>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="col-md-3">
                  <div className="card carddata">
                     <div className="card-body">
                        <h5 className="card-title text-red-300">Stability Rate</h5>
                        <h5 className="card-text text-[3rem] self-center mt-[3rem] text-center">
                           {stabilityRate}%
                        </h5>
                     </div>
                  </div>
               </div>

               <div className="col-md-3">
                  <div className="card carddata">
                     <div className="card-body">
                        <h5 className="card-title text-green-300">Timer</h5>
                        <div className="flex flex-col h-[100%] gap-5 justify-evenly">
                           <h4 ref={timerRef} className="card-text">{formatTime(time)}</h4>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="row mt-5 graph-container">
               <div className="col-md-12">
                  <div className="card">
                     <div className="card-body">
                        <h5 className="text-white graph-title">Sit Up Graph</h5>
                        <div className="chart-container">
                           <canvas ref={situpChartCanvasRef} id="situpChart"></canvas>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div>
            <button id="export-situp" onClick={exportData}>Export Sit Up Graph</button>
         </div>

         <hr className='h-[3px] bg-blue-500 mt-20 mb-10'></hr>
         <HeartRate />

         {resetDialog &&
            <ResetDialog
               isOpen={resetDialog}
               onClose={() => setResetDialog(false)}
               onSubmit={resetExercise}
            />
         }
      </section>
   );
};

export default Situp;