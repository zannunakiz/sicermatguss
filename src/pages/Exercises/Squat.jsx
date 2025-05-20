import React, { useCallback, useEffect, useRef, useState } from 'react';
import HeartRate from '../../components/HeartRate';
import ResetDialog from '../../components/ResetDialog';
import { usePairedDevice } from '../../context/PairedDeviceContext';
import { useToast } from '../../context/ToastContext';

const Squat = ({ fetchData }) => {
   // State variables
   const [squatCount, setSquatCount] = useState(0);
   const [squatSet, setSquatSet] = useState(0);
   const [stabilityRate, setStabilityRate] = useState(0);
   const [timeElapsedSquat, setTimeElapsedSquat] = useState(0);
   const [isRunning, setIsRunning] = useState(false);
   const [time, setTime] = useState(0);
   const [isFetching, setIsFetching] = useState(false);
   const [resetDialog, setResetDialog] = useState(false)

   // Refs for chart instances and DOM elements
   const squatGaugeRef = useRef(null);
   const squatChartRef = useRef(null);
   const squatChartCanvasRef = useRef(null);
   const squatGaugeCanvasRef = useRef(null);
   const timerRef = useRef(null);
   const strSquatRef = useRef(null);
   const rstSquatRef = useRef(null);

   // Data storage
   const lastSquatTimeRef = useRef(0);
   const squatIntervalsRef = useRef([]);
   const allSquatDataRef = useRef([]);
   const timerIntervalRef = useRef(null);

   const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      return `${minutes}:${secs}`;
   };

   const toast = useToast()
   const { pairedDevice } = usePairedDevice()
   const intervalRef = useRef(null);

   const startExercise = () => {
      if (pairedDevice.name === "") {
         toast.error("No device connected");
         return;
      }

      setIsFetching(prev => {
         const nextState = !prev;
         startPauseTime();
         toast.normal(`Squat Exercise ${nextState ? "Started" : "Paused"}`);

         // Kalau mulai (ON)
         if (nextState) {
            fetchData("squat");
            intervalRef.current = setInterval(() => {
               fetchData("squat");
            }, 500);
         } else {
            // Kalau berhenti (OFF)
            clearInterval(intervalRef.current);
            intervalRef.current = null;
         }

         return nextState;
      });
   };


   // Initialize charts on component mount
   useEffect(() => {
      // Initialize gauge
      squatGaugeRef.current = new window.Gauge(squatGaugeCanvasRef.current).setOptions({
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
      squatGaugeRef.current.maxValue = 100;
      squatGaugeRef.current.setMinValue(0);
      squatGaugeRef.current.set(0);

      // Initialize chart
      const ctx = squatChartCanvasRef.current.getContext('2d');
      squatChartRef.current = new window.Chart(ctx, {
         type: 'line',
         data: {
            labels: [],
            datasets: [
               {
                  label: 'Squat Speed',
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
         if (squatChartRef.current) {
            squatChartRef.current.destroy();
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

      const squatOneSec = Math.floor(Math.random() * 3) + 1;
      setSquatCount(prev => prev + squatOneSec);
      setSquatSet(prev => prev + squatOneSec);

      // Track squat intervals
      if (squatOneSec > 0) {
         const currentTime = timeElapsedSquat;
         if (lastSquatTimeRef.current > 0) {
            const interval = currentTime - lastSquatTimeRef.current;
            squatIntervalsRef.current.push(interval);
         }
         lastSquatTimeRef.current = currentTime;
      }

      setTimeElapsedSquat(prev => prev + 1);

      // Update chart every 3 seconds
      if (timeElapsedSquat % 3 === 0) {
         squatGaugeRef.current.set(squatSet);

         // Calculate stability rate
         if (squatIntervalsRef.current.length > 1) {
            const avgInterval = squatIntervalsRef.current.reduce((a, b) => a + b, 0) / squatIntervalsRef.current.length;
            const stableIntervals = squatIntervalsRef.current.filter(interval =>
               Math.abs(interval - avgInterval) <= 0.5
            );
            const newStabilityRate = Math.round((stableIntervals.length / squatIntervalsRef.current.length) * 100);
            setStabilityRate(newStabilityRate);
         }

         // Update chart data
         const chart = squatChartRef.current;
         if (timeElapsedSquat > 30) {
            chart.data.labels.shift();
            chart.data.datasets.forEach(dataset => {
               dataset.data.shift();
            });
         }

         chart.data.labels.push(`${timeElapsedSquat} Sec`);
         chart.data.datasets[0].data.push(squatSet);
         chart.data.datasets[1].data.push(stabilityRate / 10);
         chart.update();

         allSquatDataRef.current.push({ time: `Time ${timeElapsedSquat}`, speed: squatSet });
         setSquatSet(0);
      }
   }, [stabilityRate, timeElapsedSquat, isFetching, squatSet]);



   const resetExercise = () => {
      setSquatCount(0);
      setSquatSet(0);
      setStabilityRate(0);
      setTimeElapsedSquat(0);
      setIsFetching(false);
      clearInterval(intervalRef.current);


      lastSquatTimeRef.current = 0;
      squatIntervalsRef.current = [];
      allSquatDataRef.current = [];

      // Reset gauge
      squatGaugeRef.current.set(0);

      // Reset chart
      const chart = squatChartRef.current;
      chart.data.labels = [];
      chart.data.datasets.forEach(dataset => {
         dataset.data = [];
      });
      chart.update();

      resetTime();
   };

   // Export data
   const exportData = () => {
      let csvContent = "Time, Total(squats/ 3sec)\n";
      allSquatDataRef.current.forEach(entry => {
         csvContent += `${entry.time},${entry.speed}\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "all_squat_data.csv";
      link.click();
      URL.revokeObjectURL(url);
   };

   // Simulate data updates
   useEffect(() => {
      const interval = setInterval(updateData, 1000);
      return () => clearInterval(interval);
   }, [isFetching, timeElapsedSquat, stabilityRate, updateData]);

   return (
      <section id="squat-content" className='overflow-x-hidden'>
         <div className="container dashboard-container" id="squat-training">
            <h1 className="dashboard-title boxing-title">Squat Exercise Dashboard</h1>
            <h4 className="dashboard-subtitle text-center text-white mb-10">(Place device on the Thigh)</h4>

            <section id="control-section">
               <div className="text-white">
                  <button
                     ref={strSquatRef}
                     id="str-squat"
                     className="str-btn"
                     onClick={startExercise}
                  >
                     {isFetching ? "Pause" : "Start"}
                  </button>
                  <button
                     ref={rstSquatRef}
                     id="rst-squat"
                     className="rst-btn"
                     onClick={() => setResetDialog(true)}
                  >
                     Reset
                  </button>
               </div>
            </section>

            <div className="row cards-container">
               <div className="col-md-3">
                  <div className="card carddata">
                     <div className="card-body">
                        <h5 className="card-title text-white">Squat Count</h5>
                        <p className="card-text">{squatCount}</p>
                        <img src="../icon/squat.svg" alt="squat icon" className="w-[130px] mt-[40px]" />
                     </div>
                  </div>
               </div>

               <div className="col-md-3">
                  <div className="card carddata">
                     <div className="card-body">
                        <h5 className="card-title text-yellow-300">Squat Speed</h5>
                        <div className="squatSpeedItem">
                           <h5 className="card-text text-center mt-[50px]">{squatSet}</h5>
                           <p className="text-white text-center text-[0.8rem] mt-[40px]">squats / 3 sec</p>
                           <canvas ref={squatGaugeCanvasRef} id="squatGauge" className="mt-[-90px]"></canvas>
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
                        <h5 className="text-white graph-title">Squat Graph</h5>
                        <div className="chart-container">
                           <canvas ref={squatChartCanvasRef} id="squatChart"></canvas>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div>
            <button id="export-squat" onClick={exportData}>Export Squat Graph</button>
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

export default Squat; 