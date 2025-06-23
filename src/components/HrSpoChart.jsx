"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Line } from "react-chartjs-2"
import ChartPagination from "./ChartPagination"
import { useMobile } from "../actions/use-mobile"

const HrSpoChart = ({ sessionData, groupSessions, isGroupMode }) => {
   const [hrChartPage, setHrChartPage] = useState(1)
   const isMobile = useMobile()

   // Mobile: 1 minute per page, Desktop: 3 minutes per page
   const MINUTES_PER_PAGE = isMobile ? 1 : 3
   const INTERVALS_PER_MINUTE = 12 // 12 intervals per minute (5 seconds each)
   const INTERVALS_PER_PAGE = MINUTES_PER_PAGE * INTERVALS_PER_MINUTE

   // Get paginated data for charts
   const getPaginatedData = (timeIntervals, page) => {
      const startIndex = (page - 1) * INTERVALS_PER_PAGE
      const endIndex = startIndex + INTERVALS_PER_PAGE
      return timeIntervals.slice(startIndex, endIndex)
   }

   // Calculate total pages for charts
   const getChartTotalPages = (timeIntervals) => {
      return Math.ceil(timeIntervals.length / INTERVALS_PER_PAGE)
   }

   // Get time range for current page
   const getTimeRange = (page) => {
      const startMinute = (page - 1) * MINUTES_PER_PAGE
      const endMinute = page * MINUTES_PER_PAGE
      return `${startMinute}:00 - ${endMinute}:00`
   }

   if (isGroupMode && groupSessions) {
      const sessionA = groupSessions.a
      const sessionB = groupSessions.b

      if (!sessionA && !sessionB) return null

      // Get time intervals for both sessions
      const timeIntervalsA = sessionA ? Object.keys(sessionA.data).filter((key) => key !== "total_count") : []
      const timeIntervalsB = sessionB ? Object.keys(sessionB.data).filter((key) => key !== "total_count") : []

      // Use the longer session for pagination
      const maxIntervals = Math.max(timeIntervalsA.length, timeIntervalsB.length)
      const totalPages = Math.ceil(maxIntervals / INTERVALS_PER_PAGE)

      // Get paginated data for both sessions
      const paginatedIntervalsA = sessionA ? getPaginatedData(timeIntervalsA, hrChartPage) : []
      const paginatedIntervalsB = sessionB ? getPaginatedData(timeIntervalsB, hrChartPage) : []

      // Create combined labels (use the longer one)
      const combinedLabels =
         paginatedIntervalsA.length >= paginatedIntervalsB.length ? paginatedIntervalsA : paginatedIntervalsB

      // Prepare datasets
      const datasets = []

      if (sessionA) {
         const heartRateDataA = paginatedIntervalsA.map((time) => sessionA.data[time]?.heart?.heart_rate || null)
         const spo2DataA = paginatedIntervalsA.map((time) => sessionA.data[time]?.heart?.spo2 || null)

         datasets.push(
            {
               label: `Session A - Heart Rate (bpm)`,
               data: heartRateDataA,
               borderColor: "#f97316", // orange-500
               backgroundColor: "rgba(249, 115, 22, 0.1)",
               borderWidth: isMobile ? 2 : 3,
               pointRadius: isMobile ? 2 : 4,
               pointHoverRadius: isMobile ? 4 : 6,
               tension: 0.4,
               yAxisID: "y",
               spanGaps: true,
            },
            {
               label: `Session A - SpO₂ (%)`,
               data: spo2DataA,
               borderColor: "#fb923c", // orange-400
               backgroundColor: "rgba(251, 146, 60, 0.1)",
               borderWidth: isMobile ? 2 : 3,
               pointRadius: isMobile ? 2 : 4,
               pointHoverRadius: isMobile ? 4 : 6,
               tension: 0.4,
               yAxisID: "y1",
               spanGaps: true,
            },
         )
      }

      if (sessionB) {
         const heartRateDataB = paginatedIntervalsB.map((time) => sessionB.data[time]?.heart?.heart_rate || null)
         const spo2DataB = paginatedIntervalsB.map((time) => sessionB.data[time]?.heart?.spo2 || null)

         datasets.push(
            {
               label: `Session B - Heart Rate (bpm)`,
               data: heartRateDataB,
               borderColor: "#3b82f6", // blue-500
               backgroundColor: "rgba(59, 130, 246, 0.1)",
               borderWidth: isMobile ? 2 : 3,
               pointRadius: isMobile ? 2 : 4,
               pointHoverRadius: isMobile ? 4 : 6,
               tension: 0.4,
               yAxisID: "y",
               spanGaps: true,
            },
            {
               label: `Session B - SpO₂ (%)`,
               data: spo2DataB,
               borderColor: "#60a5fa", // blue-400
               backgroundColor: "rgba(96, 165, 250, 0.1)",
               borderWidth: isMobile ? 2 : 3,
               pointRadius: isMobile ? 2 : 4,
               pointHoverRadius: isMobile ? 4 : 6,
               tension: 0.4,
               yAxisID: "y1",
               spanGaps: true,
            },
         )
      }

      const chartData = {
         labels: combinedLabels,
         datasets: datasets,
      }

      const chartOptions = {
         responsive: true,
         maintainAspectRatio: false,
         plugins: {
            legend: {
               position: "top",
               labels: {
                  color: "#cbd5e1",
                  font: {
                     size: isMobile ? 9 : 12,
                  },
                  usePointStyle: true,
                  pointStyle: "circle",
               },
            },
            tooltip: {
               mode: "index",
               intersect: false,
               backgroundColor: "#1e293b",
               titleColor: "#cbd5e1",
               bodyColor: "#cbd5e1",
               borderColor: "#475569",
               borderWidth: 1,
               titleFont: { size: isMobile ? 10 : 14 },
               bodyFont: { size: isMobile ? 9 : 13 },
               callbacks: {
                  afterBody: (context) => {
                     const dataIndex = context[0].dataIndex
                     const results = []

                     if (sessionA && paginatedIntervalsA[dataIndex]) {
                        const time = paginatedIntervalsA[dataIndex]
                        const status = sessionA.data[time]?.status || "UNKNOWN"
                        results.push(`Session A Status: ${status}`)
                     }

                     if (sessionB && paginatedIntervalsB[dataIndex]) {
                        const time = paginatedIntervalsB[dataIndex]
                        const status = sessionB.data[time]?.status || "UNKNOWN"
                        results.push(`Session B Status: ${status}`)
                     }

                     return results
                  },
               },
            },
         },
         interaction: {
            mode: "nearest",
            axis: "x",
            intersect: false,
         },
         scales: {
            x: {
               display: true,
               title: {
                  display: !isMobile,
                  text: "Time Intervals (5 second intervals)",
                  color: "#cbd5e1",
                  font: { size: isMobile ? 10 : 14 },
               },
               ticks: {
                  color: "#cbd5e1",
                  font: { size: isMobile ? 8 : 12 },
                  maxTicksLimit: isMobile ? 8 : 15,
               },
               grid: {
                  color: "#475569",
                  drawBorder: false,
               },
            },
            y: {
               type: "linear",
               display: true,
               position: "left",
               title: {
                  display: !isMobile,
                  text: "Heart Rate (bpm)",
                  color: "#ef4444",
                  font: { size: isMobile ? 10 : 14 },
               },
               ticks: {
                  color: "#ef4444",
                  font: { size: isMobile ? 8 : 12 },
               },
               grid: {
                  color: "#475569",
                  drawBorder: false,
               },
            },
            y1: {
               type: "linear",
               display: true,
               position: "right",
               title: {
                  display: !isMobile,
                  text: "SpO₂ (%)",
                  color: "#3b82f6",
                  font: { size: isMobile ? 10 : 14 },
               },
               ticks: {
                  color: "#3b82f6",
                  font: { size: isMobile ? 8 : 12 },
               },
               grid: {
                  drawOnChartArea: false,
                  color: "#475569",
                  drawBorder: false,
               },
            },
         },
      }

      return (
         <div className="bg-slate-700 p-4 lg:p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-4">
               <Heart className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-red-400`} />
               <h3 className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-white`}>
                  Heart Rate & SpO₂ Comparison
               </h3>
            </div>
            <div
               className={`${isMobile ? "h-[300px]" : "h-[500px]"} bg-slate-800 rounded-lg ${isMobile ? "p-3" : "p-6"} border border-slate-600`}
            >
               <Line data={chartData} options={chartOptions} />
            </div>
            <ChartPagination
               currentPage={hrChartPage}
               totalPages={totalPages}
               onPageChange={setHrChartPage}
               title="HR & SpO₂ Comparison"
               getTimeRange={getTimeRange}
            />
         </div>
      )
   }

   // Single session mode (original logic)
   if (!sessionData?.data) return null

   const timeIntervals = Object.keys(sessionData.data).filter((key) => key !== "total_count")
   const totalPages = getChartTotalPages(timeIntervals)
   const paginatedIntervals = getPaginatedData(timeIntervals, hrChartPage)

   const heartRateData = paginatedIntervals.map((time) => sessionData.data[time].heart?.heart_rate || 0)
   const spo2Data = paginatedIntervals.map((time) => sessionData.data[time].heart?.spo2 || 0)

   const chartData = {
      labels: paginatedIntervals,
      datasets: [
         {
            label: "Heart Rate (bpm)",
            data: heartRateData,
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderWidth: isMobile ? 2 : 3,
            pointRadius: isMobile ? 2 : 4,
            pointHoverRadius: isMobile ? 4 : 6,
            tension: 0.4,
            yAxisID: "y",
         },
         {
            label: "SpO₂ (%)",
            data: spo2Data,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: isMobile ? 2 : 3,
            pointRadius: isMobile ? 2 : 4,
            pointHoverRadius: isMobile ? 4 : 6,
            tension: 0.4,
            yAxisID: "y1",
         },
      ],
   }

   const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
         legend: {
            position: "top",
            labels: {
               color: "#cbd5e1",
               font: {
                  size: isMobile ? 10 : 14,
               },
               usePointStyle: true,
               pointStyle: "circle",
            },
         },
         tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "#1e293b",
            titleColor: "#cbd5e1",
            bodyColor: "#cbd5e1",
            borderColor: "#475569",
            borderWidth: 1,
            titleFont: { size: isMobile ? 10 : 14 },
            bodyFont: { size: isMobile ? 9 : 13 },
            callbacks: {
               afterBody: (context) => {
                  const dataIndex = context[0].dataIndex
                  const time = paginatedIntervals[dataIndex]
                  const status = sessionData.data[time]?.status || "UNKNOWN"
                  return [`Status: ${status}`]
               },
            },
         },
      },
      interaction: {
         mode: "nearest",
         axis: "x",
         intersect: false,
      },
      scales: {
         x: {
            display: true,
            title: {
               display: !isMobile,
               text: "Time Intervals (5 second intervals)",
               color: "#cbd5e1",
               font: { size: isMobile ? 10 : 14 },
            },
            ticks: {
               color: "#cbd5e1",
               font: { size: isMobile ? 8 : 12 },
               maxTicksLimit: isMobile ? 8 : 15,
            },
            grid: {
               color: "#475569",
               drawBorder: false,
            },
         },
         y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
               display: !isMobile,
               text: "Heart Rate (bpm)",
               color: "#ef4444",
               font: { size: isMobile ? 10 : 14 },
            },
            ticks: {
               color: "#ef4444",
               font: { size: isMobile ? 8 : 12 },
            },
            grid: {
               color: "#475569",
               drawBorder: false,
            },
         },
         y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
               display: !isMobile,
               text: "SpO₂ (%)",
               color: "#3b82f6",
               font: { size: isMobile ? 10 : 14 },
            },
            ticks: {
               color: "#3b82f6",
               font: { size: isMobile ? 8 : 12 },
            },
            grid: {
               drawOnChartArea: false,
               color: "#475569",
               drawBorder: false,
            },
         },
      },
   }

   return (
      <div className="bg-slate-700 p-4 lg:p-6 rounded-lg shadow-lg">
         <div className="flex items-center gap-2 mb-4">
            <Heart className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-red-400`} />
            <h3 className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-white`}>
               Heart Rate & SpO₂ Over Time
            </h3>
         </div>
         <div
            className={`${isMobile ? "h-[300px]" : "h-[500px]"} bg-slate-800 rounded-lg ${isMobile ? "p-3" : "p-6"} border border-slate-600`}
         >
            <Line data={chartData} options={chartOptions} />
         </div>
         <ChartPagination
            currentPage={hrChartPage}
            totalPages={totalPages}
            onPageChange={setHrChartPage}
            title="HR & SpO₂ Chart"
            getTimeRange={getTimeRange}
         />
      </div>
   )
}

export default HrSpoChart
