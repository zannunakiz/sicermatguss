import React, { useCallback, useEffect, useRef, useState } from 'react';
import HeartRate from '../components/HeartRate';

const Punch = ({ fetchData }) => {
   // State variables
   const [punchCount, setPunchCount] = useState(0);
   const [maxPower, setMaxPower] = useState(0);
   const [currentPunchPower, setCurrentPunchPower] = useState(0);
   const [currentRetractionTime, setCurrentRetractionTime] = useState(0);
   const [avgPower, setAvgPower] = useState(0);
   const [timeElapsedPunch, setTimeElapsedPunch] = useState(0);
   const [isFetching, setIsFetching] = useState(false);

   // Refs for chart instances and data
   const punchPowerGaugeRef = useRef(null);
   const retractionTimeGaugeRef = useRef(null);
   const powerChartRef = useRef(null);
   const punchPowerGaugeCanvasRef = useRef(null);
   const retractionTimeGaugeCanvasRef = useRef(null);
   const powerChartCanvasRef = useRef(null);
   const strPunchRef = useRef(null);
   const rstPunchRef = useRef(null);

   // Data storage
   const punchPowersRef = useRef([]);
   const allPunchDataRef = useRef([]);

   // Initialize charts on component mount
   useEffect(() => {
      // Initialize punch power gauge
      punchPowerGaugeRef.current = new window.Gauge(punchPowerGaugeCanvasRef.current).setOptions({
         angle: 0.1,
         lineWidth: 0.44,
         radiusScale: 0.6,
         pointer: {
            length: 0.9,
            strokeWidth: 0.035,
            color: '#ffffff'
         },
         staticLabels: {
            font: "10px sans-serif",
            labels: [0, 20, 40, 60, 80, 100],
            color: "white",
            fractionDigits: 0
         },
         limitMax: true,
         highDpiSupport: true,
         colorStart: '#6FADCF',
         colorStop: '#4F89A1',
         strokeColor: '#E0E0E0',
         generateGradient: true
      });
      punchPowerGaugeRef.current.maxValue = 100;
      punchPowerGaugeRef.current.setMinValue(0);
      punchPowerGaugeRef.current.set(0);

      // Initialize retraction time gauge
      retractionTimeGaugeRef.current = new window.Gauge(retractionTimeGaugeCanvasRef.current).setOptions({
         angle: 0.1,
         lineWidth: 0.44,
         radiusScale: 0.6,
         pointer: {
            length: 0.9,
            strokeWidth: 0.035,
            color: '#ffffff'
         },
         staticLabels: {
            font: "10px sans-serif",
            labels: [0, 20, 40, 60, 80, 100],
            color: "white",
            fractionDigits: 0
         },
         limitMax: true,
         highDpiSupport: true,
         colorStart: '#FF6F6F',
         colorStop: '#FF4F4F',
         strokeColor: '#E0E0E0',
         generateGradient: true
      });
      retractionTimeGaugeRef.current.maxValue = 100;
      retractionTimeGaugeRef.current.setMinValue(0);
      retractionTimeGaugeRef.current.set(0);

      // Initialize power chart
      const ctx = powerChartCanvasRef.current.getContext('2d');
      powerChartRef.current = new window.Chart(ctx, {
         type: 'line',
         data: {
            labels: [],
            datasets: [
               {
                  label: 'Punch Power',
                  data: [],
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1,
                  fill: false,
               },
               {
                  label: 'Retraction Power',
                  data: [],
                  borderColor: 'rgba(255, 99, 132, 1)',
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
         if (powerChartRef.current) {
            powerChartRef.current.destroy();
         }
      };
   }, []);

   // Update data function
   const updateData = useCallback((data) => {
      const { punchPower, retractionTime } = data;
      setPunchCount(prev => prev + 1);
      setCurrentPunchPower(punchPower);
      setCurrentRetractionTime(retractionTime);

      // Update max power
      setMaxPower(prev => Math.max(prev, punchPower));

      // Update average power
      punchPowersRef.current.push(punchPower);
      const newAvg = punchPowersRef.current.reduce((sum, power) => sum + power, 0) / punchPowersRef.current.length;
      setAvgPower(newAvg);

      // Store all data
      allPunchDataRef.current.push({
         time: `Time ${timeElapsedPunch + 1}`,
         punchPower,
         retractionTime
      });

      // Update gauges
      punchPowerGaugeRef.current.set(punchPower);
      retractionTimeGaugeRef.current.set(retractionTime);

      // Update chart
      setTimeElapsedPunch(prev => prev + 1);
      const chart = powerChartRef.current;

      if (timeElapsedPunch > 10) {
         chart.data.labels.shift();
         chart.data.datasets.forEach(dataset => {
            dataset.data.shift();
         });
      }

      chart.data.labels.push(`Time ${timeElapsedPunch + 1}`);
      chart.data.datasets[0].data.push(punchPower);
      chart.data.datasets[1].data.push(retractionTime);
      chart.update();
   }, [timeElapsedPunch])

   // Button handlers
   const startExercise = () => {
      setIsFetching(prev => !prev);

      fetchData("punch")
   };

   const resetExercise = () => {
      setPunchCount(0);
      setMaxPower(0);
      setCurrentPunchPower(0);
      setCurrentRetractionTime(0);
      setAvgPower(0);
      setTimeElapsedPunch(0);
      setIsFetching(false);
      punchPowersRef.current = [];
      allPunchDataRef.current = [];

      // Reset gauges
      punchPowerGaugeRef.current.set(0);
      retractionTimeGaugeRef.current.set(0);

      // Reset chart
      const chart = powerChartRef.current;
      chart.data.labels = [];
      chart.data.datasets[0].data = [];
      chart.data.datasets[1].data = [];
      chart.update();
   };

   // Export data
   const exportData = () => {
      let csvContent = "Time,Punch Power,Retraction Power\n";
      allPunchDataRef.current.forEach(entry => {
         csvContent += `${entry.time},${entry.punchPower},${entry.retractionTime}\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "punch_data.csv";
      link.click();
      URL.revokeObjectURL(url);
   };

   // Simulate data updates when fetching
   useEffect(() => {
      if (!isFetching) return;

      const interval = setInterval(() => {
         updateData({
            punchPower: Math.floor(Math.random() * 100),
            retractionTime: Math.floor(Math.random() * 100)
         });
      }, 1000);

      return () => clearInterval(interval);
   }, [isFetching, timeElapsedPunch, updateData]);

   return (
      <section id="punch-content">
         <div className="container dashboard-container" id="punch-training">
            <h1 className="dashboard-title boxing-title">Punching Exercise Dashboard</h1>
            <h4 className="text-center text-white mb-10 dashboard-subtitle">
               (Place device on the wrist)
            </h4>

            <section id="control-section">
               <div className="text-white">
                  <button
                     ref={strPunchRef}
                     id="str-punch"
                     className="str-btn"
                     onClick={startExercise}
                  >
                     {isFetching ? "Pause" : "Start"}
                  </button>
                  <button
                     ref={rstPunchRef}
                     id="rst-punch"
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
                        <h5 className="card-title text-white">Punch Count</h5>
                        <p className="card-text">{punchCount}</p>
                        <img src="/icon/punch.svg" alt="boxing icon" className="w-[150px] mt-[30px]" />
                     </div>
                  </div>
               </div>

               <div className="col-md-3">
                  <div className="card carddata">
                     <div className="card-body">
                        <h5 className="card-title text-blue-300">Punch Power</h5>
                        <h5 className="card-text">{currentPunchPower}</h5>
                        <canvas
                           ref={punchPowerGaugeCanvasRef}
                           id="punchPowerGauge"
                           className="mt-4 max-w-[260px]"
                           height="165"
                           width="365"
                        ></canvas>
                     </div>
                  </div>
               </div>

               <div className="col-md-3">
                  <div className="card carddata">
                     <div className="card-body">
                        <h5 className="card-title text-red-300">Retraction Power</h5>
                        <h5 className="card-text">{currentRetractionTime}</h5>
                        <canvas
                           ref={retractionTimeGaugeCanvasRef}
                           id="retractionTimeGauge"
                           className="mt-4 max-w-[260px] w-[255px]"
                           height="165"
                           width="365"
                        ></canvas>
                     </div>
                  </div>
               </div>

               <div className="col-md-3">
                  <div className="card carddata">
                     <div className="card-body justify-center gap-14">
                        <h5 className="card-title text-green-300">Max Power</h5>
                        <p className="card-text -mt-12   ">{maxPower}</p>
                        <h5 className="card-title text-yellow-200">Avg Power</h5>
                        <p className="card-text -mt-12">{avgPower.toFixed(2)}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="row mt-5">
               <div className="col-md-12 graph-container">
                  <div className="card">
                     <div className="card-body">
                        <h5 className="graph-title text-white">Power Graph</h5>
                        <div className="chart-container">
                           <canvas ref={powerChartCanvasRef} id="powerChart"></canvas>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div>
            <button id="export-punch" onClick={exportData}>Export Punching Graph</button>
         </div>

         <hr className='h-[3px] bg-blue-500 mt-20 mb-10'></hr>
         <HeartRate />
      </section>
   );
};

export default Punch;