import React, { useEffect, useRef, useState } from 'react';

const HeartRate = ({ isFetching }) => {
  // State variables
  const [heartRate, setHeartRate] = useState(0);
  const [spo2, setSpo2] = useState(0);
  const [athleteStatus, setAthleteStatus] = useState('Normal');

  // Refs for gauge instances
  const heartRateGaugeRef = useRef(null);
  const spo2GaugeRef = useRef(null);
  const heartRateGaugeCanvasRef = useRef(null);
  const spo2GaugeCanvasRef = useRef(null);

  useEffect(() => {
    if (athleteStatus === 'STOP LATIHAN') {
      const audio = new Audio('/audio/buzzer.mp3');
      audio.play();
    }
  }, [athleteStatus])

  //Math Random every 2 sec for heartrate spo if isFetching
  useEffect(() => {
    if (isFetching) {
      const interval = setInterval(() => {
        const randomHeartRate = Math.floor(Math.random() * (100 - 85 + 1)) + 85;
        const randomSpo2 = Math.floor(Math.random() * (100 - 96 + 1)) + 96;
        setHeartRate(randomHeartRate);
        setSpo2(randomSpo2);
        if (heartRateGaugeRef.current) heartRateGaugeRef.current.set(randomHeartRate);
        if (spo2GaugeRef.current) spo2GaugeRef.current.set(randomSpo2);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isFetching]);

  // Initialize gauges on component mount
  useEffect(() => {
    // Initialize heart rate gauge
    heartRateGaugeRef.current = new window.Gauge(heartRateGaugeCanvasRef.current).setOptions({
      angle: -0.5,
      lineWidth: 0.1,
      radiusScale: 1.1,
      pointer: {
        length: 0,
        strokeWidth: 0,
        color: 'red'
      },
      limitMax: 'true',
      highDpiSupport: true,
      colorStart: '#ff0000',
      colorStop: '#ff6347',
      strokeColor: '#E0E0E0',
      generateGradient: true
    });
    heartRateGaugeRef.current.maxValue = 200;
    heartRateGaugeRef.current.setMinValue(0);
    heartRateGaugeRef.current.set(0);

    // Initialize SPO2 gauge
    spo2GaugeRef.current = new window.Gauge(spo2GaugeCanvasRef.current).setOptions({
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
      colorStart: '#0000ff',
      colorStop: '#1e90ff',
      strokeColor: '#E0E0E0',
      generateGradient: true
    });
    spo2GaugeRef.current.maxValue = 100;
    spo2GaugeRef.current.setMinValue(0);
    spo2GaugeRef.current.set(0);

    // Tidak perlu interval simulasi data random lagi karena pakai WebSocket
  }, []);

  // Update data function
  const updateData = (data) => {
    const { heart_rate, spo2, status } = data;
    setHeartRate(heart_rate);
    setSpo2(spo2);

    // Update gauges
    if (heartRateGaugeRef.current) heartRateGaugeRef.current.set(heart_rate);
    if (spo2GaugeRef.current) spo2GaugeRef.current.set(spo2);

    //  // Update athlete status based on values
    //  let status = 'Normal';
    //  if (heartRate > 100 || spo2 < 95) {
    //    status = 'Warning';
    //  }
    //  if (heartRate > 120 || spo2 < 90) {
    //    status = 'Critical';
    //  }
    setAthleteStatus(status);
  };

  // Assign to window for external access
  useEffect(() => {

    window.heartController = (data) => {
      console.log("[heartController] Received data:", data);
      updateData(data);
    };
    console.log("[heartController] window.heartController:", window.heartController);

    // Cleanup when component unmounts
    return () => {
      if (window.heartController) {
        delete window.heartController;
      }
    };
  }, []);

  return (
    <section id="fuzzy-heart" className="pt-10">
      <h1 className="text-center text-white font-bold text-[1.5rem] md:text-[2rem] w-fit px-5 py-1 mx-auto bg-slate-500">
        Heart Rate & SPO2
      </h1>
      <h1 id="fuzzy" className="text-center mb-10 mt-10 text-[1.3rem] font-bold text-white">
        <span className="font-light">Athlete Status: </span>
        {athleteStatus}
      </h1>

      <div id="hr-spo" className="row mt-5 justify-center mb-10 gap-3">
        {/* Heart Rate Card */}
        <div className="col-md-3">
          <div className="card carddata">
            <div className="card-body">
              <div className="flex justify-center items-center gap-2">
                <img src="/icon/hr.svg" alt="hrIcon" className="w-[30px] pb-[10px]" />
                <h5 className="card-title text-red-200">Heart Rate</h5>
              </div>
              <canvas
                ref={heartRateGaugeCanvasRef}
                id="heartRateGauge"
              ></canvas>
              <h5 className="card-text mt-[-88px] !text-[1.1rem]">
                {heartRate} BPM
              </h5>
            </div>
          </div>
        </div>

        {/* SPO2 Card */}
        <div className="col-md-3">
          <div className="card carddata">
            <div className="card-body">
              <div className="flex justify-center items-center gap-1">
                <img src="/icon/spo.svg" alt="spoIcon" className="w-[30px] pb-[10px]" />
                <h5 className="card-title text-blue-400">SpO2</h5>
              </div>
              <canvas
                ref={spo2GaugeCanvasRef}
                id="spo2Gauge"
              ></canvas>
              <h5 className="card-text mt-[-92px] !text-[1.5rem]">
                {spo2}%
              </h5>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeartRate;