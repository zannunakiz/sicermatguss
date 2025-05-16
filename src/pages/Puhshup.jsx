import React, { useCallback, useEffect, useRef, useState } from 'react';
import HeartRate from '../components/HeartRate';

const Pushup = ({ fetchData }) => {
   // State variables
   const [pushUpCount, setPushUpCount] = useState(0);
   const [pushUpSet, setPushUpSet] = useState(0);
   const [stabilityRate, setStabilityRate] = useState(0);
   const [timeElapsedPushup, setTimeElapsedPushup] = useState(0);
   const [isRunning, setIsRunning] = useState(false);
   const [time, setTime] = useState(0);
   const [isFetching, setIsFetching] = useState(false);

   // Refs for chart instances and DOM elements
   const pushupGaugeRef = useRef(null);
   const pushupChartRef = useRef(null);
   const pushupChartCanvasRef = useRef(null);
   const pushupGaugeCanvasRef = useRef(null);
   const timerRef = useRef(null);
   const strPushupRef = useRef(null);
   const rstPushupRef = useRef(null);

   // Data storage
   const lastPushupTimeRef = useRef(0);
   const pushupIntervalsRef = useRef([]);
   const allPushupDataRef = useRef([]);
   const timerIntervalRef = useRef(null);

   // Format time for display
   const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      return `${minutes}:${secs}`;
   };

   // Initialize charts on component mount
   useEffect(() => {
      // Initialize gauge
      pushupGaugeRef.current = new window.Gauge(pushupGaugeCanvasRef.current).setOptions({
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
      pushupGaugeRef.current.maxValue = 100;
      pushupGaugeRef.current.setMinValue(0);
      pushupGaugeRef.current.set(0);

      // Initialize chart
      const ctx = pushupChartCanvasRef.current.getContext('2d');
      pushupChartRef.current = new window.Chart(ctx, {
         type: 'line',
         data: {
            labels: [],
            datasets: [
               {
                  label: 'Push Up Speed',
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
         if (pushupChartRef.current) {
            pushupChartRef.current.destroy();
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
   const updateData = useCallback(() => {
      if (!isFetching) return;

      const pushUpOneSec = Math.floor(Math.random() * 3) + 1;
      setPushUpCount(prev => prev + pushUpOneSec);
      setPushUpSet(prev => prev + pushUpOneSec);

      // Track push-up intervals
      if (pushUpOneSec > 0) {
         const currentTime = timeElapsedPushup;
         if (lastPushupTimeRef.current > 0) {
            const interval = currentTime - lastPushupTimeRef.current;
            pushupIntervalsRef.current.push(interval);
         }
         lastPushupTimeRef.current = currentTime;
      }

      setTimeElapsedPushup(prev => prev + 1);

      // Update chart every 3 seconds
      if (timeElapsedPushup % 3 === 0) {
         pushupGaugeRef.current.set(pushUpSet);

         // Calculate stability rate
         if (pushupIntervalsRef.current.length > 1) {
            const avgInterval = pushupIntervalsRef.current.reduce((a, b) => a + b, 0) / pushupIntervalsRef.current.length;
            const stableIntervals = pushupIntervalsRef.current.filter(interval =>
               Math.abs(interval - avgInterval) <= 0.5
            );
            const newStabilityRate = Math.round((stableIntervals.length / pushupIntervalsRef.current.length) * 100);
            setStabilityRate(newStabilityRate);
         }

         // Update chart data
         const chart = pushupChartRef.current;
         if (timeElapsedPushup > 30) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => {
               dataset.data.shift();
            });
         }

         chart.data.labels.push(`${timeElapsedPushup} Sec`);
         chart.data.datasets[0].data.push(pushUpSet);
         chart.data.datasets[1].data.push(stabilityRate / 10);
         chart.update();

         allPushupDataRef.current.push({ time: `Time ${timeElapsedPushup}`, speed: pushUpSet });
         setPushUpSet(0);
      }
   }, [timeElapsedPushup, isFetching, pushUpSet, stabilityRate]);

   // Exercise control functions
   const startExercise = () => {
      setIsFetching(prev => !prev);
      startPauseTime();
      //ISIFUNGSI
      fetchData("pushup")
   };

   const resetExercise = () => {
      setPushUpCount(0);
      setPushUpSet(0);
      setStabilityRate(0);
      setTimeElapsedPushup(0);
      setIsFetching(false);
      lastPushupTimeRef.current = 0;
      pushupIntervalsRef.current = [];
      allPushupDataRef.current = [];

      // Reset gauge
      pushupGaugeRef.current.set(0);

      // Reset chart
      const chart = pushupChartRef.current;
      chart.data.labels = [];
      chart.data.datasets.forEach(dataset => {
         dataset.data = [];
      });
      chart.update();

      resetTime();
   };

   // Export data
   const exportData = () => {
      let csvContent = "Time, Total(push ups/ 3sec)\n";
      allPushupDataRef.current.forEach(entry => {
         csvContent += `${entry.time},${entry.speed}\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "all_pushup_data.csv";
      link.click();
      URL.revokeObjectURL(url);
   };

   // Simulate data updates
   useEffect(() => {
      const interval = setInterval(updateData, 1000);
      return () => clearInterval(interval);
   }, [isFetching, timeElapsedPushup, stabilityRate, updateData]);

   return (
      <section id="pushup-content">
         <div className="container dashboard-container" id="pushup-training">
            <h1 className="dashboard-title boxing-title">Push Up Exercise Dashboard</h1>
            <h4 className="dashboard-subtitle text-center text-white mb-10">
               (Place device on the Upper Arm)
            </h4>

            <section id="control-section">
               <div className="text-white">
                  <button
                     ref={strPushupRef}
                     id="str-pushup"
                     className="str-btn"
                     onClick={startExercise}
                  >
                     {isFetching ? "Pause" : "Start"}
                  </button>
                  <button
                     ref={rstPushupRef}
                     id="rst-pushup"
                     className="rst-btn"
                     onClick={resetExercise}
                  >
                     Reset
                  </button>
               </div>
            </section>

            <div className="row cards-container">
               <div className="col-md-3">
                  <div className="card carddata">
                     <div className="card-body">
                        <h5 className="card-title text-white">Push Up Count</h5>
                        <p className="card-text">{pushUpCount}</p>
                        <img src="/icon/pushup.svg" alt="pushup icon" className="w-[130px] mt-[40px]" />
                     </div>
                  </div>
               </div>

               <div className="col-md-3">
                  <div className="card carddata">
                     <div className="card-body">
                        <h5 className="card-title text-yellow-300">Push Up Speed</h5>
                        <div className="pushupSpeedItem">
                           <h5 className="card-text text-center mt-[50px]">{pushUpSet}</h5>
                           <p className="text-white text-center text-[0.8rem] mt-[40px]">pushups / 3 sec</p>
                           <canvas ref={pushupGaugeCanvasRef} id="pushupGauge" className="mt-[-90px]"></canvas>
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
                        <h5 className="text-white graph-title">Push Up Graph</h5>
                        <div className="chart-container">
                           <canvas ref={pushupChartCanvasRef} id="pushupChart"></canvas>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div>
            <button id="export-pushup" onClick={exportData}>Export Push Up Graph</button>
         </div>


         <hr className='h-[3px] bg-blue-500 mt-20 mb-10'></hr>
         <HeartRate />
      </section>
   );
};

export default Pushup;