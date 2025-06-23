"use client"

import { X, Users, Target, Clock } from "lucide-react"

const GroupsSelect = ({ groupSessions, onRemoveFromGroup, isMobile }) => {
   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("en-US", {
         month: "short",
         day: "numeric",
         hour: "2-digit",
         minute: "2-digit",
      })
   }

   const sessionA = groupSessions.a
   const sessionB = groupSessions.b

   if (!sessionA && !sessionB) return null

   return (
      <div className={`${isMobile ? "p-3" : "p-4"} bg-slate-800/50 border-b border-slate-600`}>
         <div className="flex items-center gap-2 mb-3">
            <Users className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-green-400`} />
            <h3 className={`${isMobile ? "text-sm" : "text-base"} font-semibold text-white`}>
               Group Comparison ({Object.keys(groupSessions).length}/2)
            </h3>
         </div>

         <div className={`grid ${isMobile ? "grid-cols-1 gap-2" : "grid-cols-2 gap-4"}`}>
            {/* Session A */}
            {sessionA && (
               <div className="bg-slate-700 rounded-lg p-3 border-l-4 border-orange-500">
                  <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                           <span className="text-white font-bold text-xs">A</span>
                        </div>
                        <span className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-white`}>Session A</span>
                     </div>
                     <button
                        onClick={() => onRemoveFromGroup("a")}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  <div className="space-y-1">
                     <div className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300 capitalize`}>{sessionA.exercise}</div>
                     <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className={`${isMobile ? "text-xs" : "text-sm"} text-slate-400`}>
                           {formatDate(sessionA.date)}
                        </span>
                     </div>
                     <div className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-emerald-400" />
                        <span className={`${isMobile ? "text-xs" : "text-sm"} text-emerald-400 font-semibold`}>
                           {sessionA.data.total_count}
                        </span>
                     </div>
                  </div>
               </div>
            )}

            {/* Session B */}
            {sessionB && (
               <div className="bg-slate-700 rounded-lg p-3 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                           <span className="text-white font-bold text-xs">B</span>
                        </div>
                        <span className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-white`}>Session B</span>
                     </div>
                     <button
                        onClick={() => onRemoveFromGroup("b")}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                     >
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  <div className="space-y-1">
                     <div className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300 capitalize`}>{sessionB.exercise}</div>
                     <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className={`${isMobile ? "text-xs" : "text-sm"} text-slate-400`}>
                           {formatDate(sessionB.date)}
                        </span>
                     </div>
                     <div className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-emerald-400" />
                        <span className={`${isMobile ? "text-xs" : "text-sm"} text-emerald-400 font-semibold`}>
                           {sessionB.data.total_count}
                        </span>
                     </div>
                  </div>
               </div>
            )}

            {/* Empty slot placeholder */}
            {!sessionA && sessionB && (
               <div className="bg-slate-700/50 rounded-lg p-3 border-l-4 border-slate-500 border-dashed">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">A</span>
                     </div>
                     <span className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-slate-400`}>Session A</span>
                  </div>
                  <div className={`${isMobile ? "text-xs" : "text-sm"} text-slate-500 text-center py-2`}>
                     Select a session for Group A
                  </div>
               </div>
            )}

            {!sessionB && sessionA && (
               <div className="bg-slate-700/50 rounded-lg p-3 border-l-4 border-slate-500 border-dashed">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">B</span>
                     </div>
                     <span className={`${isMobile ? "text-xs" : "text-sm"} font-medium text-slate-400`}>Session B</span>
                  </div>
                  <div className={`${isMobile ? "text-xs" : "text-sm"} text-slate-500 text-center py-2`}>
                     Select a session for Group B
                  </div>
               </div>
            )}
         </div>
      </div>
   )
}

export default GroupsSelect
