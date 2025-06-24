"use client"

import { useState, useEffect } from "react"
import { getHistory, getHistoryDummy } from "../../actions/historyActions"
import Sessions from "../../components/Sessions"
import LoadingSpinner from "../../components/LoadingSpinner"
import HrSpoChart from "../../components/HrSpoChart"
import ExerciseChart from "../../components/ExerciseChart"
import DetailedSession from "../../components/DetailedSession"
import { Activity, Heart, Droplets, Target, HistoryIcon } from "lucide-react"

// Import Chart.js
import {
   Chart as ChartJS,
   CategoryScale,
   LinearScale,
   PointElement,
   LineElement,
   Title,
   Tooltip,
   Legend,
   BarElement,
} from "chart.js"
import { useMobile } from "../../actions/use-mobile"


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const History = () => {
   const [historyData, setHistoryData] = useState(null)
   const [selectedSession, setSelectedSession] = useState(null)
   const [groupSessions, setGroupSessions] = useState({}) // { a: session, b: session }
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(null)
   const [sessionsExpanded, setSessionsExpanded] = useState(true)
   const isMobile = useMobile()

   const fetchData = async () => {
      try {
         setLoading(true)
         // Simulate loading delay
         await new Promise((resolve) => setTimeout(resolve, 1500))
         // const data = getHistoryDummy()
         const data = await getHistory()
         // console.log("Client Side", data.logs)
         setHistoryData(data.logs)
         if (data.logs.length > 0) {
            setSelectedSession(data.logs[0])
         }
      } catch (err) {
         setError(err.message)
      } finally {
         setLoading(false)
      }
   }

   const calculateAverages = (sessionData) => {
      if (!sessionData?.data) return { avgHR: 0, avgSpO2: 0, avgStatus: "UNKNOWN" }

      const timeIntervals = Object.keys(sessionData.data).filter((key) => key !== "total_count")
      const validData = timeIntervals.filter(
         (time) => sessionData.data[time].heart?.heart_rate && sessionData.data[time].heart?.spo2,
      )

      // if (validData.length === 0) return { avgHR: 0, avgSpO2: 0, avgStatus: "UNKNOWN" }

      const avgHR = Math.round(
         validData.reduce((sum, time) => sum + sessionData.data[time].heart.heart_rate, 0) / validData.length,
      )
      const avgSpO2 = Math.round(
         validData.reduce((sum, time) => sum + sessionData.data[time].heart.spo2, 0) / validData.length,
      )

      // Calculate most common status
      const statusCounts = {}
      validData.forEach((time) => {
         const status = sessionData.data[time].status
         statusCounts[status] = (statusCounts[status] || 0) + 1
      })
      // const avgStatus = Object.keys(statusCounts).reduce((a, b) => (statusCounts[a] > statusCounts[b] ? a : b))


      // Mapping AVG STATUS ALOGORITHM PAKAI KALAU GA DUMMY
      // Langkah pertama: ambil semua status
      const statuses = Object.values(sessionData.data).map(entry => entry.status);

      // Langkah kedua: hitung frekuensi tiap status
      const statusCount = {};
      statuses.forEach(status => {
         if (statusCount[status]) {
            statusCount[status]++;
         } else {
            statusCount[status] = 1;
         }
      });

      // Langkah ketiga: cari status dengan frekuensi terbanyak
      let avgStatus = null;
      let maxCount = 0;
      for (const status in statusCount) {
         if (statusCount[status] > maxCount) {
            maxCount = statusCount[status];
            avgStatus = status;
         }
      }

      return { avgHR, avgSpO2, avgStatus }
   }

   const getStatusBadgeColor = (status) => {
      switch (status) {
         case "NORMAL":
            return "bg-green-500 text-white"
         case "LELAH":
            return "bg-blue-500 text-white"
         case "OVERWORK":
            return "bg-yellow-500 text-white"
         case "STOP LATIHAN":
            return "bg-red-500 text-white"
         default:
            return "bg-gray-500 text-white"
      }
   }

   // Check if we're in group comparison mode
   const isGroupMode = Object.keys(groupSessions).length > 0
   const sessionA = groupSessions.a
   const sessionB = groupSessions.b

   // Calculate averages for group sessions
   const averagesA = sessionA ? calculateAverages(sessionA) : null
   const averagesB = sessionB ? calculateAverages(sessionB) : null

   useEffect(() => {
      fetchData()
   }, [])

   if (loading) {
      return (
         <div className="bg-slate-800 text-white min-h-screen p-4 lg:p-6 flex items-center justify-center">
            <LoadingSpinner size="large" text="Loading exercise history..." />
         </div>
      )
   }

   if (error) {
      return (
         <div className="bg-slate-800 text-white min-h-screen p-4 lg:p-6 flex items-center justify-center">
            <div className="text-center">
               <div className={`${isMobile ? "text-4xl" : "text-6xl"} mb-4`}>⚠️</div>
               <div className={`${isMobile ? "text-lg" : "text-xl"} text-red-400 mb-2`}>Error Loading Data</div>
               <div className={`${isMobile ? "text-sm" : ""} text-slate-400`}>{error}</div>
            </div>
         </div>
      )
   }

   const averages = selectedSession ? calculateAverages(selectedSession) : null
   // console.log("AVGSSS", averages)

   return (
      <div className="bg-slate-800 text-white min-h-screen p-3 lg:p-6  rounded-lg">
         <div className="flex items-center gap-3 mb-4 lg:mb-6">
            <HistoryIcon className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} text-blue-400`} />
            <h1 className={`${isMobile ? "text-xl" : "text-2xl lg:text-3xl"} font-bold`}>Exercise History</h1>
         </div>

         {/* Sessions Panel - Now at the top */}
         <div className="mb-4 lg:mb-6">
            <Sessions
               sessions={historyData?.logs || []}
               selectedSession={selectedSession}
               onSessionSelect={setSelectedSession}
               isExpanded={sessionsExpanded}
               onToggleExpanded={() => setSessionsExpanded(!sessionsExpanded)}
               groupSessions={groupSessions}
               onGroupSessionsChange={setGroupSessions}
            />
         </div>

         {/* Main Content - Full width */}
         <div className={`space-y-${isMobile ? "4" : "6"}`}>
            {(selectedSession || isGroupMode) && (
               <>
                  {/* Session Stats with Enhanced Hover Effects */}
                  <div className="bg-slate-700 p-3 lg:p-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-slate-900/20 transition-all duration-300">
                     <div className="flex items-center gap-2 mb-4">
                        <Target className={`${isMobile ? "w-5 h-5" : "w-6 h-6"} text-emerald-400`} />
                        <h2 className={`${isMobile ? "text-base" : "text-xl"} font-semibold`}>
                           {isGroupMode
                              ? "Group Comparison Summary"
                              : `Summary ${selectedSession.exercise} Session - ${new Date(selectedSession.date).toLocaleDateString()}`}
                        </h2>
                     </div>
                     <div className={`grid ${isMobile ? "grid-cols-2 gap-2" : "grid-cols-2 lg:grid-cols-4 gap-4"}`}>
                        {/* Total Count Card */}
                        <div className="bg-slate-800 p-3 lg:p-4 rounded-lg text-center border border-slate-600 hover:border-emerald-400/60 hover:bg-gradient-to-br hover:from-slate-800 hover:to-emerald-900/20 hover:shadow-lg hover:shadow-emerald-400/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
                           <div className="flex items-center justify-center gap-2 mb-2">
                              <Target
                                 className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-emerald-400 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300`}
                              />
                           </div>
                           <div
                              className={`${isMobile ? "text-xl" : "text-2xl lg:text-3xl"} font-bold text-emerald-400 group-hover:text-emerald-300 group-hover:scale-110 transition-all duration-300`}
                           >
                              {isGroupMode ? (
                                 <div className="space-y-1">
                                    {sessionA && <div className="text-orange-400">{sessionA.data.total_count}</div>}
                                    {sessionB && <div className="text-blue-400">{sessionB.data.total_count}</div>}
                                    {sessionA && sessionB && <div className="text-xs text-slate-400">A / B</div>}
                                 </div>
                              ) : (
                                 selectedSession.data.total_count
                              )}
                           </div>
                           <div
                              className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300 group-hover:text-slate-200 transition-colors duration-300`}
                           >
                              Total Count
                           </div>
                        </div>

                        {/* Heart Rate Card */}
                        <div className="bg-slate-800 p-3 lg:p-4 rounded-lg text-center border border-slate-600 hover:border-red-400/60 hover:bg-gradient-to-br hover:from-slate-800 hover:to-red-900/20 hover:shadow-lg hover:shadow-red-400/20 hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                           <div className="flex items-center justify-center gap-2 mb-2">
                              <Heart
                                 className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-red-400 group-hover:scale-125 group-hover:animate-pulse transition-all duration-300`}
                              />
                           </div>
                           <div
                              className={`${isMobile ? "text-xl" : "text-2xl lg:text-3xl"} font-bold text-red-400 group-hover:text-red-300 group-hover:scale-110 transition-all duration-300`}
                           >
                              {isGroupMode ? (
                                 <div className="space-y-1">
                                    {averagesA && <div className="text-orange-400">{averagesA.avgHR}</div>}
                                    {averagesB && <div className="text-blue-400">{averagesB.avgHR}</div>}
                                    {averagesA && averagesB && <div className="text-xs text-slate-400">A / B</div>}
                                 </div>
                              ) : (
                                 averages?.avgHR || "N/A"
                              )}
                           </div>
                           <div
                              className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300 group-hover:text-slate-200 transition-colors duration-300`}
                           >
                              Avg Heart Rate
                           </div>
                        </div>

                        {/* SpO2 Card */}
                        <div className="bg-slate-800 p-3 lg:p-4 rounded-lg text-center border border-slate-600 hover:border-blue-400/60 hover:bg-gradient-to-br hover:from-slate-800 hover:to-blue-900/20 hover:shadow-lg hover:shadow-blue-400/20 hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                           <div className="flex items-center justify-center gap-2 mb-2">
                              <Droplets
                                 className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-blue-400 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300`}
                              />
                           </div>
                           <div
                              className={`${isMobile ? "text-xl" : "text-2xl lg:text-3xl"} font-bold text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-300`}
                           >
                              {isGroupMode ? (
                                 <div className="space-y-1">
                                    {averagesA && <div className="text-orange-400">{averagesA.avgSpO2}%</div>}
                                    {averagesB && <div className="text-blue-400">{averagesB.avgSpO2}%</div>}
                                    {averagesA && averagesB && <div className="text-xs text-slate-400">A / B</div>}
                                 </div>
                              ) : averages?.avgSpO2 ? (
                                 `${averages.avgSpO2}%`
                              ) : (
                                 "N/A"
                              )}
                           </div>
                           <div
                              className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300 group-hover:text-slate-200 transition-colors duration-300`}
                           >
                              Avg SpO₂
                           </div>
                        </div>

                        {/* Status Card */}
                        <div className="bg-slate-800 p-3 lg:p-4 rounded-lg text-center border border-slate-600 hover:border-yellow-400/60 hover:bg-gradient-to-br hover:from-slate-800 hover:to-yellow-900/20 hover:shadow-lg hover:shadow-yellow-400/20 hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                           <div className="flex items-center justify-center gap-2 mb-2">
                              <Activity
                                 className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-yellow-400 group-hover:scale-125 group-hover:rotate-180 transition-all duration-500`}
                              />
                           </div>
                           <div className="flex justify-center mb-2">
                              {isGroupMode ? (
                                 <div className="space-y-1">
                                    {averagesA && (
                                       <span
                                          className={`inline-block ${isMobile ? "w-16 text-center px-1 py-1 text-[10px]" : "w-20 text-center px-2 py-1 text-xs"} font-medium ${getStatusBadgeColor(averagesA.avgStatus)} group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 rounded-full  `}
                                       >
                                          {isMobile && averagesA.avgStatus
                                             ? averagesA.avgStatus.substring(0, 4)
                                             : averagesA.avgStatus || "N/A"}
                                       </span>
                                    )}
                                    {averagesB && (
                                       <span
                                          className={`inline-block ${isMobile ? "w-16 text-center px-1 py-1 text-[10px]" : "w-20 text-center px-2 py-1 text-xs"} font-medium ${getStatusBadgeColor(averagesB.avgStatus)} group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 rounded-full`}
                                       >
                                          {isMobile && averagesB.avgStatus
                                             ? averagesB.avgStatus.substring(0, 4)
                                             : averagesB.avgStatus || "N/A"}
                                       </span>
                                    )}
                                    {averagesA && averagesB && <div className="text-xs text-slate-400">A / B</div>}
                                 </div>
                              ) : (
                                 <span
                                    className={`inline-block ${isMobile ? "w-16 text-center px-1 py-1 text-xs" : "w-24 text-center px-2 py-1 text-sm"} font-medium ${getStatusBadgeColor(averages?.avgStatus)} group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 rounded-full`}
                                 >
                                    {isMobile && averages?.avgStatus
                                       ? averages.avgStatus.substring(0, 4)
                                       : averages?.avgStatus || "N/A"}
                                 </span>
                              )}
                           </div>
                           <div
                              className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300 group-hover:text-slate-200 transition-colors duration-300`}
                           >
                              Avg Status
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* HR SpO2 Chart Component */}
                  <HrSpoChart
                     sessionData={selectedSession}
                     groupSessions={isGroupMode ? groupSessions : null}
                     isGroupMode={isGroupMode}
                  />

                  {/* Exercise Chart Component */}
                  <ExerciseChart
                     sessionData={selectedSession}
                     groupSessions={isGroupMode ? groupSessions : null}
                     isGroupMode={isGroupMode}
                  />

                  {/* Detailed Session Component */}
                  <DetailedSession
                     sessionData={selectedSession}
                     groupSessions={isGroupMode ? groupSessions : null}
                     isGroupMode={isGroupMode}
                  />
               </>
            )}
         </div>
      </div>
   )
}

export default History
