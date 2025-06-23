"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Activity, ChartAreaIcon } from "lucide-react"
import { Line, Bar } from "react-chartjs-2"
import ChartPagination from "./ChartPagination"
import { useMobile } from "../actions/use-mobile"


const ExerciseChart = ({ sessionData, groupSessions, isGroupMode }) => {
   const [activeTab, setActiveTab] = useState("interval")
   const [exerciseChartPage, setExerciseChartPage] = useState(1)
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

   const renderGroupIntervalBarChart = (sessionA, sessionB) => {
      const timeIntervalsA = sessionA ? Object.keys(sessionA.data).filter((key) => key !== "total_count") : []
      const timeIntervalsB = sessionB ? Object.keys(sessionB.data).filter((key) => key !== "total_count") : []

      const maxIntervals = Math.max(timeIntervalsA.length, timeIntervalsB.length)
      const totalPages = Math.ceil(maxIntervals / INTERVALS_PER_PAGE)

      const paginatedIntervalsA = sessionA ? getPaginatedData(timeIntervalsA, exerciseChartPage) : []
      const paginatedIntervalsB = sessionB ? getPaginatedData(timeIntervalsB, exerciseChartPage) : []

      const combinedLabels =
         paginatedIntervalsA.length >= paginatedIntervalsB.length ? paginatedIntervalsA : paginatedIntervalsB

      const datasets = []

      if (sessionA) {
         datasets.push({
            label: `Session A - ${sessionA.exercise} Count`,
            data: paginatedIntervalsA.map((time) => sessionA.data[time]?.sport?.count || 0),
            backgroundColor: "rgba(249, 115, 22, 0.8)", // orange-500
            borderColor: "#f97316",
            borderWidth: 1,
            borderRadius: 4,
         })
      }

      if (sessionB) {
         datasets.push({
            label: `Session B - ${sessionB.exercise} Count`,
            data: paginatedIntervalsB.map((time) => sessionB.data[time]?.sport?.count || 0),
            backgroundColor: "rgba(59, 130, 246, 0.8)", // blue-500
            borderColor: "#3b82f6",
            borderWidth: 1,
            borderRadius: 4,
         })
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
                  font: { size: isMobile ? 9 : 12 },
               },
            },
            tooltip: {
               backgroundColor: "#1e293b",
               titleColor: "#cbd5e1",
               bodyColor: "#cbd5e1",
               borderColor: "#475569",
               borderWidth: 1,
               titleFont: { size: isMobile ? 10 : 14 },
               bodyFont: { size: isMobile ? 9 : 13 },
            },
         },
         scales: {
            x: {
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
               title: {
                  display: !isMobile,
                  text: "Count",
                  color: "#cbd5e1",
                  font: { size: isMobile ? 10 : 14 },
               },
               ticks: {
                  color: "#cbd5e1",
                  font: { size: isMobile ? 8 : 12 },
               },
               grid: {
                  color: "#475569",
                  drawBorder: false,
               },
            },
         },
      }

      return (
         <div>
            <div
               className={`${isMobile ? "h-[300px]" : "h-[450px]"} bg-slate-800 rounded-lg ${isMobile ? "p-3" : "p-6"} border border-slate-600`}
            >
               <Bar data={chartData} options={chartOptions} />
            </div>
            <ChartPagination
               currentPage={exerciseChartPage}
               totalPages={totalPages}
               onPageChange={setExerciseChartPage}
               title="Exercise Comparison"
               getTimeRange={getTimeRange}
            />
         </div>
      )
   }

   const renderGroupAccumulativeBarChart = (sessionA, sessionB) => {
      const timeIntervalsA = sessionA ? Object.keys(sessionA.data).filter((key) => key !== "total_count") : []
      const timeIntervalsB = sessionB ? Object.keys(sessionB.data).filter((key) => key !== "total_count") : []

      const maxIntervals = Math.max(timeIntervalsA.length, timeIntervalsB.length)
      const totalPages = Math.ceil(maxIntervals / INTERVALS_PER_PAGE)

      const paginatedIntervalsA = sessionA ? getPaginatedData(timeIntervalsA, exerciseChartPage) : []
      const paginatedIntervalsB = sessionB ? getPaginatedData(timeIntervalsB, exerciseChartPage) : []

      const combinedLabels =
         paginatedIntervalsA.length >= paginatedIntervalsB.length ? paginatedIntervalsA : paginatedIntervalsB

      // Calculate accumulative data for both sessions
      let accumulativeA = 0
      let accumulativeB = 0

      // Add previous pages data
      if (sessionA) {
         for (let i = 0; i < (exerciseChartPage - 1) * INTERVALS_PER_PAGE; i++) {
            if (timeIntervalsA[i]) {
               accumulativeA += sessionA.data[timeIntervalsA[i]].sport?.count || 0
            }
         }
      }

      if (sessionB) {
         for (let i = 0; i < (exerciseChartPage - 1) * INTERVALS_PER_PAGE; i++) {
            if (timeIntervalsB[i]) {
               accumulativeB += sessionB.data[timeIntervalsB[i]].sport?.count || 0
            }
         }
      }

      const datasets = []

      if (sessionA) {
         const accumulativeDataA = paginatedIntervalsA.map((time) => {
            accumulativeA += sessionA.data[time]?.sport?.count || 0
            return accumulativeA
         })

         datasets.push({
            label: `Session A - Accumulative ${sessionA.exercise}`,
            data: accumulativeDataA,
            backgroundColor: "rgba(249, 115, 22, 0.8)",
            borderColor: "#f97316",
            borderWidth: 1,
            borderRadius: 4,
         })
      }

      if (sessionB) {
         const accumulativeDataB = paginatedIntervalsB.map((time) => {
            accumulativeB += sessionB.data[time]?.sport?.count || 0
            return accumulativeB
         })

         datasets.push({
            label: `Session B - Accumulative ${sessionB.exercise}`,
            data: accumulativeDataB,
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderColor: "#3b82f6",
            borderWidth: 1,
            borderRadius: 4,
         })
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
                  font: { size: isMobile ? 9 : 12 },
               },
            },
            tooltip: {
               backgroundColor: "#1e293b",
               titleColor: "#cbd5e1",
               bodyColor: "#cbd5e1",
               borderColor: "#475569",
               borderWidth: 1,
               titleFont: { size: isMobile ? 10 : 14 },
               bodyFont: { size: isMobile ? 9 : 13 },
            },
         },
         scales: {
            x: {
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
               title: {
                  display: !isMobile,
                  text: "Accumulative Count",
                  color: "#cbd5e1",
                  font: { size: isMobile ? 10 : 14 },
               },
               ticks: {
                  color: "#cbd5e1",
                  font: { size: isMobile ? 8 : 12 },
               },
               grid: {
                  color: "#475569",
                  drawBorder: false,
               },
            },
         },
      }

      return (
         <div>
            <div
               className={`${isMobile ? "h-[300px]" : "h-[450px]"} bg-slate-800 rounded-lg ${isMobile ? "p-3" : "p-6"} border border-slate-600`}
            >
               <Bar data={chartData} options={chartOptions} />
            </div>
            <ChartPagination
               currentPage={exerciseChartPage}
               totalPages={totalPages}
               onPageChange={setExerciseChartPage}
               title="Exercise Comparison"
               getTimeRange={getTimeRange}
            />
         </div>
      )
   }

   const renderGroupProgressionChart = (sessionA, sessionB) => {
      const timeIntervalsA = sessionA ? Object.keys(sessionA.data).filter((key) => key !== "total_count") : []
      const timeIntervalsB = sessionB ? Object.keys(sessionB.data).filter((key) => key !== "total_count") : []

      const maxIntervals = Math.max(timeIntervalsA.length, timeIntervalsB.length)
      const totalPages = Math.ceil(maxIntervals / INTERVALS_PER_PAGE)

      const paginatedIntervalsA = sessionA ? getPaginatedData(timeIntervalsA, exerciseChartPage) : []
      const paginatedIntervalsB = sessionB ? getPaginatedData(timeIntervalsB, exerciseChartPage) : []

      const combinedLabels =
         paginatedIntervalsA.length >= paginatedIntervalsB.length ? paginatedIntervalsA : paginatedIntervalsB

      // Calculate accumulative data for progression
      let accumulativeA = 0
      let accumulativeB = 0

      // Add previous pages data
      if (sessionA) {
         for (let i = 0; i < (exerciseChartPage - 1) * INTERVALS_PER_PAGE; i++) {
            if (timeIntervalsA[i]) {
               accumulativeA += sessionA.data[timeIntervalsA[i]].sport?.count || 0
            }
         }
      }

      if (sessionB) {
         for (let i = 0; i < (exerciseChartPage - 1) * INTERVALS_PER_PAGE; i++) {
            if (timeIntervalsB[i]) {
               accumulativeB += sessionB.data[timeIntervalsB[i]].sport?.count || 0
            }
         }
      }

      const datasets = []

      if (sessionA) {
         const progressionDataA = paginatedIntervalsA.map((time) => {
            accumulativeA += sessionA.data[time]?.sport?.count || 0
            return accumulativeA
         })

         datasets.push({
            label: `Session A - ${sessionA.exercise} Progression`,
            data: progressionDataA,
            borderColor: "#f97316", // orange-500
            backgroundColor: "rgba(249, 115, 22, 0.1)",
            borderWidth: isMobile ? 2 : 3,
            pointRadius: isMobile ? 2 : 4,
            pointHoverRadius: isMobile ? 4 : 6,
            tension: 0.4,
            fill: true,
         })
      }

      if (sessionB) {
         const progressionDataB = paginatedIntervalsB.map((time) => {
            accumulativeB += sessionB.data[time]?.sport?.count || 0
            return accumulativeB
         })

         datasets.push({
            label: `Session B - ${sessionB.exercise} Progression`,
            data: progressionDataB,
            borderColor: "#3b82f6", // blue-500
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: isMobile ? 2 : 3,
            pointRadius: isMobile ? 2 : 4,
            pointHoverRadius: isMobile ? 4 : 6,
            tension: 0.4,
            fill: true,
         })
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
                  font: { size: isMobile ? 9 : 12 },
               },
            },
            tooltip: {
               backgroundColor: "#1e293b",
               titleColor: "#cbd5e1",
               bodyColor: "#cbd5e1",
               borderColor: "#475569",
               borderWidth: 1,
               titleFont: { size: isMobile ? 10 : 14 },
               bodyFont: { size: isMobile ? 9 : 13 },
            },
         },
         scales: {
            x: {
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
               title: {
                  display: !isMobile,
                  text: "Total Count",
                  color: "#cbd5e1",
                  font: { size: isMobile ? 10 : 14 },
               },
               ticks: {
                  color: "#cbd5e1",
                  font: { size: isMobile ? 8 : 12 },
               },
               grid: {
                  color: "#475569",
                  drawBorder: false,
               },
            },
         },
      }

      return (
         <div>
            <div
               className={`${isMobile ? "h-[300px]" : "h-[450px]"} bg-slate-800 rounded-lg ${isMobile ? "p-3" : "p-6"} border border-slate-600`}
            >
               <Line data={chartData} options={chartOptions} />
            </div>
            <ChartPagination
               currentPage={exerciseChartPage}
               totalPages={totalPages}
               onPageChange={setExerciseChartPage}
               title="Exercise Comparison"
               getTimeRange={getTimeRange}
            />
         </div>
      )
   }

   // Single session rendering functions (original logic)
   const renderIntervalBarChart = (sessionData, timeIntervals) => {
      const totalPages = getChartTotalPages(timeIntervals)
      const paginatedIntervals = getPaginatedData(timeIntervals, exerciseChartPage)

      const chartData = {
         labels: paginatedIntervals,
         datasets: [
            {
               label: `${sessionData.exercise} Count per Interval`,
               data: paginatedIntervals.map((time) => sessionData.data[time].sport?.count || 0),
               backgroundColor: "rgba(59, 130, 246, 0.8)",
               borderColor: "#3b82f6",
               borderWidth: 1,
               borderRadius: 4,
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
                  font: { size: isMobile ? 10 : 14 },
               },
            },
            tooltip: {
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
         scales: {
            x: {
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
               title: {
                  display: !isMobile,
                  text: "Count",
                  color: "#cbd5e1",
                  font: { size: isMobile ? 10 : 14 },
               },
               ticks: {
                  color: "#cbd5e1",
                  font: { size: isMobile ? 8 : 12 },
               },
               grid: {
                  color: "#475569",
                  drawBorder: false,
               },
            },
         },
      }

      return (
         <div>
            <div
               className={`${isMobile ? "h-[300px]" : "h-[450px]"} bg-slate-800 rounded-lg ${isMobile ? "p-3" : "p-6"} border border-slate-600`}
            >
               <Bar data={chartData} options={chartOptions} />
            </div>
            <ChartPagination
               currentPage={exerciseChartPage}
               totalPages={totalPages}
               onPageChange={setExerciseChartPage}
               title="Exercise Analysis"
               getTimeRange={getTimeRange}
            />
         </div>
      )
   }

   const renderAccumulativeBarChart = (sessionData, timeIntervals) => {
      const totalPages = getChartTotalPages(timeIntervals)
      const paginatedIntervals = getPaginatedData(timeIntervals, exerciseChartPage)

      // Calculate accumulative data up to the current page
      let accumulative = 0
      for (let i = 0; i < (exerciseChartPage - 1) * INTERVALS_PER_PAGE; i++) {
         if (timeIntervals[i]) {
            accumulative += sessionData.data[timeIntervals[i]].sport?.count || 0
         }
      }

      const accumulativeData = paginatedIntervals.map((time) => {
         accumulative += sessionData.data[time].sport?.count || 0
         return accumulative
      })

      const chartData = {
         labels: paginatedIntervals,
         datasets: [
            {
               label: `Accumulative ${sessionData.exercise} Count`,
               data: accumulativeData,
               backgroundColor: "rgba(16, 185, 129, 0.8)",
               borderColor: "#10b981",
               borderWidth: 1,
               borderRadius: 4,
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
                  font: { size: isMobile ? 10 : 14 },
               },
            },
            tooltip: {
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
                     const intervalCount = sessionData.data[time].sport?.count || 0
                     const status = sessionData.data[time]?.status || "UNKNOWN"
                     return [`Interval Count: ${intervalCount}`, `Status: ${status}`]
                  },
               },
            },
         },
         scales: {
            x: {
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
               title: {
                  display: !isMobile,
                  text: "Accumulative Count",
                  color: "#cbd5e1",
                  font: { size: isMobile ? 10 : 14 },
               },
               ticks: {
                  color: "#cbd5e1",
                  font: { size: isMobile ? 8 : 12 },
               },
               grid: {
                  color: "#475569",
                  drawBorder: false,
               },
            },
         },
      }

      return (
         <div>
            <div
               className={`${isMobile ? "h-[300px]" : "h-[450px]"} bg-slate-800 rounded-lg ${isMobile ? "p-3" : "p-6"} border border-slate-600`}
            >
               <Bar data={chartData} options={chartOptions} />
            </div>
            <ChartPagination
               currentPage={exerciseChartPage}
               totalPages={totalPages}
               onPageChange={setExerciseChartPage}
               title="Exercise Analysis"
               getTimeRange={getTimeRange}
            />
         </div>
      )
   }

   const renderProgressionChart = (sessionData, timeIntervals) => {
      const totalPages = getChartTotalPages(timeIntervals)
      const paginatedIntervals = getPaginatedData(timeIntervals, exerciseChartPage)

      // Calculate accumulative data up to the current page
      let accumulative = 0
      for (let i = 0; i < (exerciseChartPage - 1) * INTERVALS_PER_PAGE; i++) {
         if (timeIntervals[i]) {
            accumulative += sessionData.data[timeIntervals[i]].sport?.count || 0
         }
      }

      const progressionData = paginatedIntervals.map((time) => {
         accumulative += sessionData.data[time].sport?.count || 0
         return accumulative
      })

      const chartData = {
         labels: paginatedIntervals,
         datasets: [
            {
               label: `${sessionData.exercise} Progression`,
               data: progressionData,
               borderColor: "#f59e0b",
               backgroundColor: "rgba(245, 158, 11, 0.1)",
               borderWidth: isMobile ? 2 : 3,
               pointRadius: isMobile ? 2 : 4,
               pointHoverRadius: isMobile ? 4 : 6,
               tension: 0.4,
               fill: true,
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
                  font: { size: isMobile ? 10 : 14 },
               },
            },
            tooltip: {
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
                     const intervalCount = sessionData.data[time].sport?.count || 0
                     const status = sessionData.data[time]?.status || "UNKNOWN"
                     return [`Interval Count: ${intervalCount}`, `Status: ${status}`]
                  },
               },
            },
         },
         scales: {
            x: {
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
               title: {
                  display: !isMobile,
                  text: "Total Count",
                  color: "#cbd5e1",
                  font: { size: isMobile ? 10 : 14 },
               },
               ticks: {
                  color: "#cbd5e1",
                  font: { size: isMobile ? 8 : 12 },
               },
               grid: {
                  color: "#475569",
                  drawBorder: false,
               },
            },
         },
      }

      return (
         <div>
            <div
               className={`${isMobile ? "h-[300px]" : "h-[450px]"} bg-slate-800 rounded-lg ${isMobile ? "p-3" : "p-6"} border border-slate-600`}
            >
               <Line data={chartData} options={chartOptions} />
            </div>
            <ChartPagination
               currentPage={exerciseChartPage}
               totalPages={totalPages}
               onPageChange={setExerciseChartPage}
               title="Exercise Analysis"
               getTimeRange={getTimeRange}
            />
         </div>
      )
   }

   const renderTabContent = () => {
      if (isGroupMode && groupSessions) {
         const sessionA = groupSessions.a
         const sessionB = groupSessions.b

         if (!sessionA && !sessionB) return null

         switch (activeTab) {
            case "interval":
               return renderGroupIntervalBarChart(sessionA, sessionB)
            case "accumulative":
               return renderGroupAccumulativeBarChart(sessionA, sessionB)
            case "progression":
               return renderGroupProgressionChart(sessionA, sessionB)
            default:
               return null
         }
      }

      // Single session mode
      if (!sessionData?.data) return null

      const timeIntervals = Object.keys(sessionData.data).filter((key) => key !== "total_count")

      switch (activeTab) {
         case "interval":
            return renderIntervalBarChart(sessionData, timeIntervals)
         case "accumulative":
            return renderAccumulativeBarChart(sessionData, timeIntervals)
         case "progression":
            return renderProgressionChart(sessionData, timeIntervals)
         default:
            return null
      }
   }

   if (isGroupMode && groupSessions) {
      const sessionA = groupSessions.a
      const sessionB = groupSessions.b

      if (!sessionA && !sessionB) return null
   } else if (!sessionData?.data) {
      return null
   }

   return (
      <div className="bg-slate-700 p-4 lg:p-6 rounded-lg shadow-lg">
         <div className="flex items-center gap-2 mb-4">
            <ChartAreaIcon className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-blue-400`} />
            <h3 className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-white`}>
               {isGroupMode ? "Exercise Comparison" : "Exercise Analysis"}
            </h3>
         </div>
         <div className={`flex ${isMobile ? "flex-col gap-1" : "flex-wrap gap-2"} mb-4`}>
            {[
               { id: "interval", label: "Per Interval", icon: BarChart3 },
               { id: "accumulative", label: "Accumulative", icon: TrendingUp },
               { id: "progression", label: "Progression", icon: Activity },
            ].map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 ${isMobile ? "px-3 py-2 text-sm" : "px-4 py-2"} rounded-lg font-medium transition-colors ${activeTab === tab.id ? "bg-blue-600 text-white" : "bg-slate-600 text-slate-300 hover:bg-slate-500"
                     }`}
               >
                  <tab.icon className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                  {tab.label}
               </button>
            ))}
         </div>
         {renderTabContent()}
      </div>
   )
}

export default ExerciseChart
