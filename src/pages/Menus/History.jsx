import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import {
   Bar,
   BarChart,
   CartesianGrid,
   Legend,
   Line,
   LineChart,
   PolarAngleAxis,
   PolarGrid,
   PolarRadiusAxis,
   Radar,
   RadarChart,
   ResponsiveContainer,
   Tooltip,
   XAxis,
   YAxis,
} from "recharts"

// Mock data - replace with your actual data
const workoutSessions = [
   {
      id: 1,
      date: "2023-05-01",
      situps: 30,
      punches: 50,
      squats: 25,
      jumps: 20,
      pushups: 15,
      punchMaxPower: 85,
      jumpMaxHeight: 24,
      avgHeartRate: 125,
   },
   {
      id: 2,
      date: "2023-05-03",
      situps: 35,
      punches: 60,
      squats: 30,
      jumps: 25,
      pushups: 20,
      punchMaxPower: 90,
      jumpMaxHeight: 26,
      avgHeartRate: 130,
   },
   {
      id: 3,
      date: "2023-05-05",
      situps: 40,
      punches: 70,
      squats: 35,
      jumps: 30,
      pushups: 25,
      punchMaxPower: 95,
      jumpMaxHeight: 28,
      avgHeartRate: 135,
   },
   {
      id: 4,
      date: "2023-05-07",
      situps: 45,
      punches: 80,
      squats: 40,
      jumps: 35,
      pushups: 30,
      punchMaxPower: 100,
      jumpMaxHeight: 30,
      avgHeartRate: 140,
   },
   {
      id: 5,
      date: "2023-05-09",
      situps: 50,
      punches: 90,
      squats: 45,
      jumps: 40,
      pushups: 35,
      punchMaxPower: 105,
      jumpMaxHeight: 32,
      avgHeartRate: 145,
   },
]

const History = () => {
   const [selectedSession, setSelectedSession] = useState(null)
   const [expanded, setExpanded] = useState(false)

   const handleSessionClick = (session) => {
      setSelectedSession(session)
   }

   const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
         year: "numeric",
         month: "short",
         day: "numeric",
      })
   }

   // Prepare data for the radar chart
   const prepareRadarData = (session) => {
      if (!session) return []

      return [
         {
            exercise: "Situps",
            count: session.situps,
         },
         {
            exercise: "Punches",
            count: session.punches,
         },
         {
            exercise: "Squats",
            count: session.squats,
         },
         {
            exercise: "Jumps",
            count: session.jumps,
         },
         {
            exercise: "Pushups",
            count: session.pushups,
         },
      ]
   }

   // Prepare data for the progress chart
   const prepareProgressData = () => {
      return workoutSessions.map((session) => ({
         date: formatDate(session.date),
         situps: session.situps,
         punches: session.punches,
         squats: session.squats,
         jumps: session.jumps,
         pushups: session.pushups,
      }))
   }

   return (
      <div className="bg-slate-800 text-white min-h-screen p-6">
         <h1 className="text-3xl font-bold mb-6">Workout History</h1>

         {/* Sessions List */}
         <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-semibold">Recent Sessions</h2>
               <button onClick={() => setExpanded(!expanded)} className="flex items-center text-slate-300 hover:text-white">
                  {expanded ? (
                     <>
                        <span>Collapse</span>
                        <ChevronUp className="ml-1 h-5 w-5" />
                     </>
                  ) : (
                     <>
                        <span>Expand</span>
                        <ChevronDown className="ml-1 h-5 w-5" />
                     </>
                  )}
               </button>
            </div>

            <div
               className={`bg-slate-700 rounded-lg overflow-hidden ${expanded ? "max-h-none" : "max-h-64 overflow-y-auto"}`}
            >
               {workoutSessions.map((session) => (
                  <div
                     key={session.id}
                     onClick={() => handleSessionClick(session)}
                     className={`p-4 border-b border-slate-600 cursor-pointer hover:bg-slate-600 transition-colors ${selectedSession?.id === session.id ? "bg-slate-600" : ""}`}
                  >
                     <div className="flex justify-between items-center">
                        <div>
                           <h3 className="font-medium">Session #{session.id}</h3>
                           <p className="text-slate-300 text-sm">{formatDate(session.date)}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-emerald-400">
                              {session.situps + session.punches + session.squats + session.jumps + session.pushups} exercises
                           </p>
                           <p className="text-slate-300 text-sm">Avg HR: {session.avgHeartRate} bpm</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Overall Progress Chart */}
         <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
            <div className="bg-slate-700 p-4 rounded-lg">
               <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={prepareProgressData()}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                     <XAxis dataKey="date" stroke="#cbd5e1" />
                     <YAxis stroke="#cbd5e1" />
                     <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "0.5rem" }}
                        itemStyle={{ color: "#fff" }}
                     />
                     <Legend />
                     <Line type="monotone" dataKey="situps" stroke="#3b82f6" strokeWidth={2} />
                     <Line type="monotone" dataKey="punches" stroke="#ef4444" strokeWidth={2} />
                     <Line type="monotone" dataKey="squats" stroke="#10b981" strokeWidth={2} />
                     <Line type="monotone" dataKey="jumps" stroke="#f59e0b" strokeWidth={2} />
                     <Line type="monotone" dataKey="pushups" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Selected Session Details */}
         {selectedSession && (
            <div className="mb-8">
               <h2 className="text-xl font-semibold mb-4">
                  Session #{selectedSession.id} - {formatDate(selectedSession.date)}
               </h2>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Exercise Distribution */}
                  <div className="bg-slate-700 p-4 rounded-lg">
                     <h3 className="text-lg font-medium mb-3">Exercise Distribution</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <RadarChart outerRadius={90} data={prepareRadarData(selectedSession)}>
                           <PolarGrid stroke="#475569" />
                           <PolarAngleAxis dataKey="exercise" stroke="#cbd5e1" />
                           <PolarRadiusAxis stroke="#cbd5e1" />
                           <Radar name="Exercises" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                           <Tooltip
                              contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "0.5rem" }}
                              itemStyle={{ color: "#fff" }}
                           />
                        </RadarChart>
                     </ResponsiveContainer>
                  </div>

                  {/* Exercise Counts */}
                  <div className="bg-slate-700 p-4 rounded-lg">
                     <h3 className="text-lg font-medium mb-3">Exercise Counts</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={prepareRadarData(selectedSession)}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                           <XAxis dataKey="exercise" stroke="#cbd5e1" />
                           <YAxis stroke="#cbd5e1" />
                           <Tooltip
                              contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "0.5rem" }}
                              itemStyle={{ color: "#fff" }}
                           />
                           <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Session Statistics */}
               <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                     <h3 className="text-lg font-medium mb-2">Punch Power</h3>
                     <div className="flex items-end">
                        <span className="text-3xl font-bold text-red-500">{selectedSession.punchMaxPower}</span>
                        <span className="ml-2 text-slate-300">max power</span>
                     </div>
                  </div>

                  <div className="bg-slate-700 p-4 rounded-lg">
                     <h3 className="text-lg font-medium mb-2">Jump Height</h3>
                     <div className="flex items-end">
                        <span className="text-3xl font-bold text-amber-500">{selectedSession.jumpMaxHeight}</span>
                        <span className="ml-2 text-slate-300">inches</span>
                     </div>
                  </div>

                  <div className="bg-slate-700 p-4 rounded-lg">
                     <h3 className="text-lg font-medium mb-2">Heart Rate</h3>
                     <div className="flex items-end">
                        <span className="text-3xl font-bold text-emerald-500">{selectedSession.avgHeartRate}</span>
                        <span className="ml-2 text-slate-300">avg bpm</span>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   )
}

export default History
