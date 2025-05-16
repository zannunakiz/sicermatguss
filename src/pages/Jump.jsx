import React, { useCallback, useEffect, useRef, useState } from 'react';
import HeartRate from '../components/HeartRate';

const Jump = ({ fetchData }) => {

   const [jumpCount, setJumpCount] = useState(0);
   const [maxHeight, setMaxHeight] = useState(0);
   const [currentHeight, setCurrentHeight] = useState(0);
   const [timeElapsedJump, setTimeElapsedJump] = useState(0);
   const [allJumpData, setAllJumpData] = useState([]);
   const [isFetching, setIsFetching] = useState(false);

   // Refs for chart instances and DOM elements
   const jumpGaugeRef = useRef(null);
   const jumpChartRef = useRef(null);
   const heightChartRef = useRef(null);
   const strJumpRef = useRef(null);
   const rstJumpRef = useRef(null);

   // Initialize charts on component mount
   useEffect(() => {
      // Initialize JSCharting gauge
      jumpGaugeRef.current = window.JSC.chart('jumpHeightGauge', {
         debug: true,
         box: { fill: 'transparent' },
         defaultSeries_type: 'gauge linear vertical',
         height: 190,
         width: 100,
         yAxis_defaultTick_label_color: 'white',
         yAxis: {
            defaultTick_enabled: false,
            customTicks: [1, 3, 5, 7, 10],
            scale: { range: [1, 10] },
            line: {
               width: 5,
               color: 'smartPalette',
               breaks_gap: 0.03
            },
         },
         legend_visible: false,
         palette: {
            pointValue: '%yValue',
            ranges: [
               { value: 2, color: '#FF5353' },
               { value: 3, color: '#FFD221' },
               { value: 6, color: '#77E6B4' },
               { value: [9, 10], color: '#21D683' }
            ]
         },
         defaultSeries: {
            defaultPoint_tooltip: '%yValue',
            shape_label: {
               text: '%name',
               verticalAlign: 'bottom',
               style_fontSize: 15,
            }
         },
         series: [{ points: [['score', [1, 1]]] }]
      });

      // Initialize Chart.js line chart
      const ctx = heightChartRef.current.getContext('2d');
      jumpChartRef.current = new window.Chart(ctx, {
         type: 'line',
         data: {
            labels: [],
            datasets: [{
               label: 'Jump Height',
               data: [],
               borderColor: 'rgba(75, 192, 192, 1)',
               borderWidth: 1,
               fill: false,
            }],
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
         if (jumpChartRef.current) {
            jumpChartRef.current.destroy();
         }
      };
   }, []);

   // Update data function
   const updateData = useCallback((data) => {
      const { jumpHeight } = data;
      setJumpCount(prev => prev + 1);
      setAllJumpData(prev => [...prev, { time: `Time ${timeElapsedJump + 1}`, height: jumpHeight }]);
      setCurrentHeight(jumpHeight);
      setMaxHeight(prev => Math.max(prev, jumpHeight));
      setTimeElapsedJump(prev => prev + 1);

      // Update gauge
      jumpGaugeRef.current.options({
         series: [{ points: ['score', [1, jumpHeight]] }]
      });

      // Update line chart
      const chart = jumpChartRef.current;
      if (timeElapsedJump > 10) {
         chart.data.labels.shift();
         chart.data.datasets.forEach(dataset => {
            dataset.data.shift();
         });
      }
      chart.data.labels.push(`Time ${timeElapsedJump + 1}`);
      chart.data.datasets[0].data.push(jumpHeight);
      chart.update();
   }, [timeElapsedJump])

   // Button handlers
   const startExercise = () => {
      setIsFetching(prev => !prev);

      fetchData("jump")
   };

   const resetExercise = () => {
      setJumpCount(0);
      setMaxHeight(0);
      setCurrentHeight(0);
      setTimeElapsedJump(0);
      setIsFetching(false);
      setAllJumpData([]);

      // Reset gauge
      jumpGaugeRef.current.options({
         series: [{ points: ['score', [1, 1]] }]
      });

      // Reset line chart
      const chart = jumpChartRef.current;
      chart.data.labels = [];
      chart.data.datasets[0].data = [];
      chart.update();
   };

   // Export data
   const exportData = () => {
      let csvContent = "Time,Jump Height (m)\n";
      allJumpData.forEach(entry => {
         csvContent += `${entry.time},${entry.height}\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "all_jump_data.csv";
      link.click();
      URL.revokeObjectURL(url);
   };


   useEffect(() => {
      if (!isFetching) return;

      const interval = setInterval(() => {
         updateData({
            jumpHeight: Math.random() * 10 // Simulate jump height data
         });
      }, 1000);

      return () => clearInterval(interval);
   }, [isFetching, timeElapsedJump, updateData]);

   return (
      <section id="jump-content border-2 border-red-500">
         <div className="container dashboard-container" id="jump-training">
            <h1 className="dashboard-title">Vertical Jump Exercise Dashboard</h1>
            <h4 className="dashboard-subtitle text-center text-white mb-10">
               (Place device on the ankles)
            </h4>

            <section id="control-section">
               <div className="text-white">
                  <button
                     ref={strJumpRef}
                     id="str-jump"
                     className="str-btn"
                     onClick={startExercise}
                  >
                     {isFetching ? "Pause" : "Start"}
                  </button>
                  <button
                     ref={rstJumpRef}
                     id="rst-jump"
                     className="rst-btn"
                     onClick={resetExercise}
                  >
                     Reset
                  </button>
               </div>
            </section>

            <div className="row cards-container">
               <div className="col-md-4">
                  <div className="card carddata">
                     <div className="card-body">
                        <h5 className="card-title text-white">Jump Count</h5>
                        <p className="card-text">{jumpCount}</p>
                        <img src="/icon/jump.svg" alt="jump icon" className="w-[150px] mt-[25px]" />
                     </div>
                  </div>
               </div>

               <div className="col-md-4">
                  <div className="card carddata">
                     <div className="card-body">
                        <h5 className="card-title text-cyan-300">Jump Height</h5>
                        <div className="flex max-w-[200px] w-[100%] mt-[-5px] justify-around items-center">
                           <div id="jumpHeightGauge" className="my-0 items-center justify-center flex w-[50%]"></div>
                           <div className="card-text my-0 !text-[1.2rem] flex flex-col gap-2">
                              <p>{currentHeight.toFixed(2)} m</p>
                              <p>{(currentHeight * 100).toFixed(0)} cm</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="col-md-4 centered-grid">
                  <div className="card carddata">
                     <div className="card-body">
                        <h5 className="card-title text-green-300">Max Height</h5>
                        <h5 className="card-text text-[3rem] self-center mt-[3rem] text-center">
                           {maxHeight.toFixed(2)}
                        </h5>
                     </div>
                  </div>
               </div>
            </div>

            <div className="row mt-5">
               <div className="col-md-12 graph-container">
                  <div className="card">
                     <div className="card-body">
                        <h5 className="card-title text-white graph-title">Height Graph</h5>
                        <div className="chart-container">
                           <canvas ref={heightChartRef} id="heightChart"></canvas>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div>
            <button id="export-jump" onClick={exportData}>Export Jump Graph</button>
         </div>

         <hr className='h-[3px] bg-blue-500 mt-20 mb-10'></hr>
         <HeartRate />
      </section>
   );
};

export default Jump;