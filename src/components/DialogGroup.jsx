"use client"

import { X, Users, AlertCircle } from "lucide-react"

const DialogGroup = ({ groupSessions, onConfirm, onCancel, isMobile }) => {
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

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className={`bg-slate-700 rounded-lg ${isMobile ? "w-full max-w-sm" : "w-full max-w-md"} shadow-xl`}>
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-600">
               <div className="flex items-center gap-2">
                  <Users className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-green-400`} />
                  <h3 className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-white`}>Select Group Position</h3>
               </div>
               <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
                  <X className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
               </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
               <div className="flex items-start gap-2 p-3 bg-blue-600/20 rounded-lg border border-blue-500/30">
                  <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className={`${isMobile ? "text-xs" : "text-sm"} text-blue-200`}>
                     Choose which position to assign this session. Maximum 2 sessions can be compared.
                  </p>
               </div>

               {/* Group A */}
               <div className="space-y-2">
                  <button
                     onClick={() => onConfirm("a")}
                     className={`w-full p-3 rounded-lg border-2 transition-all ${sessionA
                           ? "border-orange-500/50 bg-orange-600/20 hover:bg-orange-600/30"
                           : "border-green-500/50 bg-green-600/20 hover:bg-green-600/30"
                        }`}
                  >
                     <div className="flex items-center justify-between">
                        <div className="text-left">
                           <div className={`${isMobile ? "text-sm" : "text-base"} font-medium text-white`}>Session A</div>
                           {sessionA ? (
                              <div className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300`}>
                                 <div className="capitalize">{sessionA.exercise}</div>
                                 <div>{formatDate(sessionA.date)}</div>
                                 <div className="text-orange-400">Click to replace</div>
                              </div>
                           ) : (
                              <div className={`${isMobile ? "text-xs" : "text-sm"} text-green-400`}>Available</div>
                           )}
                        </div>
                        <div
                           className={`w-8 h-8 rounded-full flex items-center justify-center ${sessionA ? "bg-orange-500" : "bg-green-500"
                              }`}
                        >
                           <span className="text-white font-bold text-sm">A</span>
                        </div>
                     </div>
                  </button>
               </div>

               {/* Group B */}
               <div className="space-y-2">
                  <button
                     onClick={() => onConfirm("b")}
                     className={`w-full p-3 rounded-lg border-2 transition-all ${sessionB
                           ? "border-orange-500/50 bg-orange-600/20 hover:bg-orange-600/30"
                           : "border-green-500/50 bg-green-600/20 hover:bg-green-600/30"
                        }`}
                  >
                     <div className="flex items-center justify-between">
                        <div className="text-left">
                           <div className={`${isMobile ? "text-sm" : "text-base"} font-medium text-white`}>Session B</div>
                           {sessionB ? (
                              <div className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300`}>
                                 <div className="capitalize">{sessionB.exercise}</div>
                                 <div>{formatDate(sessionB.date)}</div>
                                 <div className="text-orange-400">Click to replace</div>
                              </div>
                           ) : (
                              <div className={`${isMobile ? "text-xs" : "text-sm"} text-green-400`}>Available</div>
                           )}
                        </div>
                        <div
                           className={`w-8 h-8 rounded-full flex items-center justify-center ${sessionB ? "bg-orange-500" : "bg-green-500"
                              }`}
                        >
                           <span className="text-white font-bold text-sm">B</span>
                        </div>
                     </div>
                  </button>
               </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-slate-600">
               <button
                  onClick={onCancel}
                  className={`px-4 py-2 ${isMobile ? "text-xs" : "text-sm"} bg-slate-600 text-white rounded hover:bg-slate-500 transition-colors`}
               >
                  Cancel
               </button>
            </div>
         </div>
      </div>
   )
}

export default DialogGroup
