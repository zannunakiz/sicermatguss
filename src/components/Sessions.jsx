
import { useState, useEffect } from "react"
import Calendar from "../components/Calendar"
import { useToast } from "../context/ToastContext"
import { useMobile } from "../actions/use-mobile"
import DialogGroup from "./DialogGroup"

import GroupsSelect from "./GroupsSelect"

import {
   ChevronDown,
   ChevronUp,
   CalendarIcon,
   Filter,
   SortAsc,
   Activity,
   Clock,
   Target,
   TrendingUp,
   ChevronLeft,
   ChevronRight,
   MoreHorizontal,
   SkipBack,
   SkipForward,
   Users,
   User, Dumbbell, CalendarClock, Hash, ActivitySquare
} from "lucide-react"



const Sessions = ({
   sessions,
   selectedSession,
   onSessionSelect,
   onToast,
   isExpanded,
   onToggleExpanded,
   groupSessions,
   onGroupSessionsChange,
   isGroupMode,
}) => {
   const [sortBy, setSortBy] = useState("newest")
   const [filterExercise, setFilterExercise] = useState("all")
   const [filterDate, setFilterDate] = useState(null)
   const [showCalendar, setShowCalendar] = useState(false)
   const [currentPage, setCurrentPage] = useState(1)
   const [inputPage, setInputPage] = useState("1")
   const [showDialogGroup, setShowDialogGroup] = useState(false)
   const [pendingGroupSession, setPendingGroupSession] = useState(null)

   const toast = useToast()
   const isMobile = useMobile()

   // Mobile: 5 rows per page, Desktop: 10 rows per page
   const rowsPerPage = isMobile ? 5 : 10

   // Update input when currentPage changes
   useEffect(() => {
      setInputPage(currentPage.toString())
   }, [currentPage])

   const exercises = ["all", "punch", "situp", "pushup", "squat"]
   const sortOptions = [
      { value: "newest", label: "Newest First" },
      { value: "oldest", label: "Oldest First" },
      { value: "totalCountDesc", label: "Total Count (High to Low)" },
      { value: "totalCountAsc", label: "Total Count (Low to High)" },
      { value: "exercise", label: "Exercise (A-Z)" },
   ]

   const getAvailableDates = () => {
      return sessions.map((session) => session.date)
   }

   const getSortedAndFilteredSessions = () => {
      let filtered = sessions

      // Filter by exercise
      if (filterExercise !== "all") {
         filtered = filtered.filter((session) => session.exercise === filterExercise)
      }

      // Filter by date
      if (filterDate) {
         const filterDateStr = new Date(filterDate).toISOString().split("T")[0]
         filtered = filtered.filter((session) => {
            const sessionDateStr = new Date(session.date).toISOString().split("T")[0]
            return sessionDateStr === filterDateStr
         })
      }

      // Sort
      const sorted = [...filtered].sort((a, b) => {
         switch (sortBy) {
            case "newest":
               return new Date(b.date) - new Date(a.date)
            case "oldest":
               return new Date(a.date) - new Date(b.date)
            case "totalCountDesc":
               return b.data.total_count - a.data.total_count
            case "totalCountAsc":
               return a.data.total_count - b.data.total_count
            case "exercise":
               return a.exercise.localeCompare(b.exercise)
            default:
               return 0
         }
      })

      return sorted
   }

   const handleSessionClick = (session) => {
      // Clear group sessions when doing normal selection
      if (Object.keys(groupSessions).length > 0) {
         onGroupSessionsChange({})
         toast.normal("Group sessions cleared. Selected individual session.")
      }

      onSessionSelect(session)
      const formatDate = (dateString) => {
         return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
         })
      }

      toast.success(
         `Selected ${session.exercise} session from ${formatDate(session.date)} (${session.data.total_count} total count)`,
      )
   }

   const handleSelectAsGroup = (session) => {
      // Check if session is already in group
      const isAlreadyInGroup = Object.values(groupSessions).some((groupSession) => groupSession?.uuid === session.uuid)

      if (isAlreadyInGroup) {
         toast.error("This session is already selected in the group comparison.")
         return
      }

      // Auto-deselect current session when adding to group
      if (selectedSession) {
         onSessionSelect(null)
      }

      setPendingGroupSession(session)
      setShowDialogGroup(true)
   }

   const handleGroupDialogConfirm = (position) => {
      if (pendingGroupSession) {
         const newGroupSessions = { ...groupSessions }
         newGroupSessions[position] = pendingGroupSession
         onGroupSessionsChange(newGroupSessions)

         const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString("en-US", {
               year: "numeric",
               month: "short",
               day: "numeric",
               hour: "2-digit",
               minute: "2-digit",
            })
         }

         toast.success(
            `Added ${pendingGroupSession.exercise} session from ${formatDate(pendingGroupSession.date)} to Group ${position.toUpperCase()}`,
         )
      }
      setShowDialogGroup(false)
      setPendingGroupSession(null)
   }

   const handleRemoveFromGroup = (position) => {
      const newGroupSessions = { ...groupSessions }
      delete newGroupSessions[position]
      onGroupSessionsChange(newGroupSessions)
      toast.normal(`Removed session from Group ${position.toUpperCase()}`)
   }

   // Handle sort change with toast
   const handleSortChange = (newSortBy) => {
      setSortBy(newSortBy)
      setCurrentPage(1) // Reset to first page when sorting
      const sortLabel = sortOptions.find((option) => option.value === newSortBy)?.label || newSortBy
      toast.success(`Sorted by: ${sortLabel}`)
   }

   // Handle exercise filter change with toast
   const handleExerciseFilterChange = (newExercise) => {
      setFilterExercise(newExercise)
      setCurrentPage(1) // Reset to first page when filtering
      const exerciseLabel =
         newExercise === "all" ? "All Exercises" : newExercise.charAt(0).toUpperCase() + newExercise.slice(1)
      toast.success(`Filtered by exercise: ${exerciseLabel}`)
   }

   // Handle date filter change with toast
   const handleDateFilterChange = (newDate) => {
      setFilterDate(newDate)
      setCurrentPage(1) // Reset to first page when filtering
      if (newDate) {
         const dateLabel = new Date(newDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
         })
         toast.success(`Filtered by date: ${dateLabel}`)
      } else {
         toast.normal("Date filter cleared")
      }
      setShowCalendar(false)
   }

   const formatDate = (dateString) => {
      if (isMobile) {
         return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
         })
      }
      return new Date(dateString).toLocaleDateString("en-US", {
         month: "short",
         day: "numeric",
         hour: "2-digit",
         minute: "2-digit",
      })
   }

   const getExerciseIcon = (exercise) => {
      switch (exercise) {
         case "punch":
            return <img src='/icon/punchWhite.svg' alt="Punch" className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
         case "situp":
            return <img src='/icon/situpWhite.svg' alt="Situp" className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
         case "pushup":
            return <img src='/icon/pushupWhite.svg' alt="Pushup" className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
         case "squat":
            return <img src='/icon/squatWhite.svg' alt="Squat" className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
         default:
            return <Dumbbell className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
      }
   }

   const getStatusColor = (status) => {
      switch (status) {
         case "EXCELLENT":
            return "bg-green-500 text-white"
         case "GOOD":
            return "bg-blue-500 text-white"
         case "FAIR":
            return "bg-yellow-500 text-white"
         case "POOR":
            return "bg-red-500 text-white"
         default:
            return "bg-gray-500 text-white"
      }
   }

   // Fixed: Calculate average status for each session
   const calculateSessionAverageStatus = (sessionData) => {
      const timeIntervals = Object.keys(sessionData).filter((key) => key !== "total_count")
      const validData = timeIntervals.filter(
         (time) => sessionData[time].heart?.heart_rate && sessionData[time].heart?.spo2,
      )

      if (validData.length === 0) return "UNKNOWN"

      // Calculate most common status
      const statusCounts = {}
      validData.forEach((time) => {
         const status = sessionData[time].status
         statusCounts[status] = (statusCounts[status] || 0) + 1
      })

      return Object.keys(statusCounts).reduce((a, b) => (statusCounts[a] > statusCounts[b] ? a : b))
   }

   const filteredSessions = getSortedAndFilteredSessions()

   // Pagination logic
   const totalRows = filteredSessions.length
   const totalPages = Math.ceil(totalRows / rowsPerPage)
   const startIndex = (currentPage - 1) * rowsPerPage
   const endIndex = startIndex + rowsPerPage
   const currentRows = filteredSessions.slice(startIndex, endIndex)

   const handlePageChange = (page) => {
      setCurrentPage(page)
   }

   const handleInputChange = (e) => {
      setInputPage(e.target.value)
   }

   const handleInputSubmit = (e) => {
      e.preventDefault()
      const pageNum = Number.parseInt(inputPage)
      if (pageNum >= 1 && pageNum <= totalPages) {
         handlePageChange(pageNum)
      } else {
         setInputPage(currentPage.toString()) // Reset to current page if invalid
      }
   }

   const renderPageNumbers = () => {
      const pages = []
      const maxVisible = isMobile ? 3 : 5

      if (totalPages <= maxVisible + 2) {
         // Show all pages if total is small
         for (let i = 1; i <= totalPages; i++) {
            pages.push(
               <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`${isMobile ? "px-1.5 py-1" : "px-2 py-1"} rounded transition-colors ${isMobile ? "text-[10px]" : "text-xs"} ${currentPage === i ? "bg-blue-600 text-white" : "bg-slate-600 text-white hover:bg-slate-500"
                     }`}
               >
                  {i}
               </button>,
            )
         }
      } else {
         // Always show first page
         pages.push(
            <button
               key={1}
               onClick={() => handlePageChange(1)}
               className={`${isMobile ? "px-1.5 py-1" : "px-2 py-1"} rounded transition-colors ${isMobile ? "text-[10px]" : "text-xs"} ${currentPage === 1 ? "bg-blue-600 text-white" : "bg-slate-600 text-white hover:bg-slate-500"
                  }`}
            >
               1
            </button>,
         )

         // Show ellipsis if needed
         if (currentPage > (isMobile ? 3 : 4)) {
            pages.push(
               <span key="ellipsis1" className="px-1 text-slate-500 flex items-center">
                  <MoreHorizontal className={`${isMobile ? "w-2 h-2" : "w-3 h-3"}`} />
               </span>,
            )
         }

         // Show pages around current page
         const start = Math.max(2, currentPage - (isMobile ? 0 : 1))
         const end = Math.min(totalPages - 1, currentPage + (isMobile ? 0 : 1))

         for (let i = start; i <= end; i++) {
            pages.push(
               <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`${isMobile ? "px-1.5 py-1" : "px-2 py-1"} rounded transition-colors ${isMobile ? "text-[10px]" : "text-xs"} ${currentPage === i ? "bg-blue-600 text-white" : "bg-slate-600 text-white hover:bg-slate-500"
                     }`}
               >
                  {i}
               </button>,
            )
         }

         // Show ellipsis if needed
         if (currentPage < totalPages - (isMobile ? 2 : 3)) {
            pages.push(
               <span key="ellipsis2" className="px-1 text-slate-500 flex items-center">
                  <MoreHorizontal className={`${isMobile ? "w-2 h-2" : "w-3 h-3"}`} />
               </span>,
            )
         }

         // Always show last page
         pages.push(
            <button
               key={totalPages}
               onClick={() => handlePageChange(totalPages)}
               className={`${isMobile ? "px-1.5 py-1" : "px-2 py-1"} rounded transition-colors ${isMobile ? "text-[10px]" : "text-xs"} ${currentPage === totalPages ? "bg-blue-600 text-white" : "bg-slate-600 text-white hover:bg-slate-500"
                  }`}
            >
               {totalPages}
            </button>,
         )
      }

      return pages
   }

   const isSessionInGroup = (session) => {
      return Object.values(groupSessions).some((groupSession) => groupSession?.uuid === session.uuid)
   }

   return (
      <div className="bg-slate-700 rounded-lg overflow-hidden shadow-lg p-2">
         {/* Header */}
         <div className={`${isMobile ? "p-4" : "p-6"} border-b border-slate-600`}>
            <div className="flex justify-between items-center mb-2 md:mb-4">
               <div className="flex items-center gap-2 ">
                  <Dumbbell className={`${isMobile ? "w-5 h-5" : "w-6 h-6"} text-blue-400`} />
                  <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-white`}>Exercise Sessions</h2>
               </div>
               <button
                  onClick={onToggleExpanded}
                  className={`flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors text-white ${isMobile ? "text-sm" : ""}`}
               >
                  {isExpanded ? (
                     <>
                        <ChevronUp className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                        <span className="hidden sm:inline">Collapse</span>
                     </>
                  ) : (
                     <>
                        <ChevronDown className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                        <span className="hidden sm:inline">Expand</span>
                     </>
                  )}
               </button>
            </div>

            {/* Filters and Sort - Only show when expanded */}
            {isExpanded && (
               <div className={`grid ${isMobile ? "grid-cols-1 gap-2" : "grid-cols-1 md:grid-cols-3 gap-4"}`}>
                  {/* Sort */}
                  <div>
                     <label className={`flex items-center gap-2 ${isMobile ? "text-xs" : "text-sm"} text-slate-300 mb-2`}>
                        <SortAsc className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                        Sort by:
                     </label>
                     <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className={`w-full bg-slate-800 text-white rounded-lg px-3 py-2 ${isMobile ? "text-xs" : "text-sm"} border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                     >
                        {sortOptions.map((option) => (
                           <option key={option.value} value={option.value}>
                              {option.label}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* Exercise Filter */}
                  <div>
                     <label className={`flex items-center gap-2 ${isMobile ? "text-xs" : "text-sm"} text-slate-300 mb-2`}>
                        <Filter className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                        Exercise:
                     </label>
                     <select
                        value={filterExercise}
                        onChange={(e) => handleExerciseFilterChange(e.target.value)}
                        className={`w-full bg-slate-800 text-white rounded-lg px-3 py-2 ${isMobile ? "text-xs" : "text-sm"} border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                     >
                        {exercises.map((exercise) => (
                           <option key={exercise} value={exercise}>
                              {exercise.charAt(0).toUpperCase() + exercise.slice(1)}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                     <label className={`flex items-center gap-2 ${isMobile ? "text-xs" : "text-sm"} text-slate-300 mb-2`}>
                        <CalendarIcon className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                        Date:
                     </label>
                     <div className="flex gap-2">
                        <button
                           onClick={() => setShowCalendar(true)}
                           className={`flex-1 bg-slate-800 text-white rounded-lg px-3 py-2 ${isMobile ? "text-xs" : "text-sm"} border border-slate-600 hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left flex items-center gap-2`}
                        >
                           <CalendarIcon className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                           <span className="truncate">
                              {filterDate ? new Date(filterDate).toLocaleDateString() : "Select date..."}
                           </span>
                        </button>
                        {filterDate && (
                           <button
                              onClick={() => handleDateFilterChange(null)}
                              className={`px-3 py-2 bg-red-600 text-white rounded-lg ${isMobile ? "text-xs" : "text-sm"} hover:bg-red-700 transition-colors`}
                           >
                              ×
                           </button>
                        )}
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Group Sessions Display */}
         {isExpanded && Object.keys(groupSessions).length > 0 && (
            <GroupsSelect groupSessions={groupSessions} onRemoveFromGroup={handleRemoveFromGroup} isMobile={isMobile} />
         )}

         {/* Sessions Table */}
         {isExpanded && (
            <>
               {/* Table Container - Adaptive height, no scroll */}
               <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-600">
                  <table className={`w-full ${isMobile ? "text-xs" : "text-sm"}`}>
                     <thead className="bg-slate-900">
                        <tr>
                           <th
                              className={`text-center ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[100px]" : ""}`}
                           >
                              <div className="flex items-center justify-center gap-1">
                                 <Dumbbell size={14} />
                                 Exercise
                              </div>
                           </th>

                           <th
                              className={`text-center ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[140px]" : ""}`}
                           >
                              <div className="flex items-center justify-center gap-1">
                                 <CalendarClock size={14} />
                                 Date & Time
                              </div>
                           </th>

                           <th
                              className={`text-center ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[100px]" : ""}`}
                           >
                              <div className="flex items-center justify-center gap-1">
                                 <Target size={14} />
                                 Total Count
                              </div>
                           </th>

                           <th
                              className={`text-center ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[100px]" : ""}`}
                           >
                              <div className="flex items-center justify-center gap-1">
                                 <ActivitySquare size={14} />
                                 Avg Status
                              </div>
                           </th>

                           <th
                              className={`text-center ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[120px]" : "min-w-[140px]"}`}
                           >
                              <div className="flex items-center justify-center gap-1">
                                 <MoreHorizontal size={14} />
                                 Actions
                              </div>
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        {currentRows.map((session) => {
                           const isSelected = selectedSession?.uuid === session.uuid
                           const avgStatus = calculateSessionAverageStatus(session.data)
                           const inGroup = isSessionInGroup(session)

                           return (
                              <tr
                                 key={session.uuid}
                                 className={`
                        transition-all duration-200 border-b border-slate-600 hover:bg-slate-700/50 
                        ${isSelected ? "bg-blue-600/20 border-blue-500/50" : ""}
                        ${inGroup ? "bg-green-600/10 border-green-500/30" : ""}
                      `}
                              >
                                 <td className={`${isMobile ? "p-2" : "p-3"}  `}>
                                    <div className={`flex  items-center justify-center ${isMobile ? "gap-2" : "gap-3"}`}>
                                       {getExerciseIcon(session.exercise)}
                                       <div>
                                          <span className={`capitalize font-medium text-white ${isMobile ? "text-xs" : ""}`}>
                                             {session.exercise}
                                          </span>
                                          {isSelected && (
                                             <div className="flex items-center gap-1 mt-1">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                                <span className={`${isMobile ? "text-[10px]" : "text-xs"} text-blue-400`}>
                                                   Selected
                                                </span>
                                             </div>
                                          )}
                                          {inGroup && (
                                             <div className="flex items-center gap-1 mt-1">
                                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                <span className={`${isMobile ? "text-[10px]" : "text-xs"} text-green-400`}>
                                                   In Group
                                                </span>
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                 </td>
                                 <td className={`${isMobile ? "p-2" : "p-3"}  `}>
                                    <div className={`flex items-center justify-center ${isMobile ? "gap-1" : "gap-2"} text-slate-300`}>
                                       <Clock className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                                       <span className={`${isMobile ? "text-[10px]" : "text-sm"} whitespace-nowrap`}>
                                          {formatDate(session.date)}
                                       </span>
                                    </div>
                                 </td>
                                 <td className={`${isMobile ? "p-2" : "p-3"}  `}>
                                    <div className={`flex items-center justify-center ${isMobile ? "gap-1" : "gap-2"}`}>
                                       <Target className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} text-emerald-400`} />
                                       <span className={`text-emerald-400 font-semibold ${isMobile ? "text-sm" : "text-lg"}`}>
                                          {session.data.total_count}
                                       </span>
                                    </div>
                                 </td>
                                 <td className={`${isMobile ? "p-2" : "p-3"} h-full mx-auto  `}>
                                    <span
                                       className={`flex justify-center items-center mx-auto ${isMobile ? "w-16 text-center px-1 py-1 text-[10px]" : "w-20 text-center px-2 py-1 text-xs"} rounded-full font-medium ${getStatusColor(avgStatus)}`}
                                    >
                                       {avgStatus}
                                    </span>
                                 </td>
                                 <td className={`${isMobile ? "p-2" : "p-3"}  `}>
                                    <div className={`flex items-center justify-center ${isMobile ? "flex-col gap-1" : "gap-2"}`}>
                                       <button
                                          onClick={() => handleSessionClick(session)}
                                          disabled={isGroupMode}
                                          className={`flex items-center gap-1 ${isMobile ? "px-2 py-1 text-[10px]" : "px-3 py-1 text-xs"} bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600`}
                                       >
                                          <User className={`${isMobile ? "w-2 h-2" : "w-3 h-3"}`} />
                                          Select
                                       </button>
                                       <button
                                          onClick={() => handleSelectAsGroup(session)}
                                          className={`flex items-center gap-1 ${isMobile ? "px-2 py-1 text-[10px]" : "px-3 py-1 text-xs"} bg-green-600 text-white rounded hover:bg-green-700 transition-colors`}
                                       >
                                          <Users className={`${isMobile ? "w-2 h-2" : "w-3 h-3"}`} />
                                          Group
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           )
                        })}
                     </tbody>
                  </table>
               </div>

               {currentRows.length === 0 && (
                  <div className={`${isMobile ? "p-6" : "p-8"} text-center text-slate-400`}>
                     <Activity className={`${isMobile ? "w-8 h-8" : "w-12 h-12"} mx-auto mb-4 opacity-50`} />
                     <p className={`${isMobile ? "text-sm" : ""}`}>No sessions found matching your filters.</p>
                  </div>
               )}

               {/* Pagination - Always show when totalPages > 1 */}
               {totalPages > 1 && (
                  <div
                     className={`flex flex-col ${isMobile ? "gap-2" : "sm:flex-row gap-3"} items-center justify-between ${isMobile ? "mt-2 p-2" : "mt-3 p-3"} bg-slate-800/50 rounded border border-slate-600/50`}
                  >
                     <div
                        className={`${isMobile ? "text-[10px]" : "text-xs"} text-slate-400 text-center ${isMobile ? "order-2" : ""}`}
                     >
                        Showing {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows} sessions
                     </div>

                     <div className={`flex ${isMobile ? "flex-row gap-4 order-1" : "items-center gap-1"}`}>
                        {/* Navigation Buttons */}
                        <div className={`flex items-center ${isMobile ? "gap-0.5" : "gap-1"}`}>
                           <button
                              onClick={() => handlePageChange(1)}
                              disabled={currentPage === 1}
                              className={`flex items-center gap-1 ${isMobile ? "px-1.5 py-1" : "px-2 py-1"} rounded bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500 transition-colors ${isMobile ? "text-[10px]" : "text-xs"}`}
                           >
                              <SkipBack className={`${isMobile ? "w-2 h-2" : "w-3 h-3"}`} />
                              {!isMobile && <span className="hidden sm:inline">First</span>}
                           </button>
                           <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className={`flex items-center gap-1 ${isMobile ? "px-1.5 py-1" : "px-2 py-1"} rounded bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500 transition-colors ${isMobile ? "text-[10px]" : "text-xs"}`}
                           >
                              <ChevronLeft className={`${isMobile ? "w-2 h-2" : "w-3 h-3"}`} />
                              {!isMobile && <span className="hidden sm:inline">Prev</span>}
                           </button>

                           {/* Smart Page Numbers */}
                           {renderPageNumbers()}

                           <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className={`flex items-center gap-1 ${isMobile ? "px-1.5 py-1" : "px-2 py-1"} rounded bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500 transition-colors ${isMobile ? "text-[10px]" : "text-xs"}`}
                           >
                              {!isMobile && <span className="hidden sm:inline">Next</span>}
                              <ChevronRight className={`${isMobile ? "w-2 h-2" : "w-3 h-3"}`} />
                           </button>
                           <button
                              onClick={() => handlePageChange(totalPages)}
                              disabled={currentPage === totalPages}
                              className={`flex items-center gap-1 ${isMobile ? "px-1.5 py-1" : "px-2 py-1"} rounded bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500 transition-colors ${isMobile ? "text-[10px]" : "text-xs"}`}
                           >
                              {!isMobile && <span className="hidden sm:inline">Last</span>}
                              <SkipForward className={`${isMobile ? "w-2 h-2" : "w-3 h-3"}`} />
                           </button>
                        </div>

                        {/* Page Input */}
                        <form onSubmit={handleInputSubmit} className="flex items-center gap-1">
                           <span className={`${isMobile ? "text-[10px]" : "text-xs"} text-slate-400`}>Go:</span>
                           <input
                              type="number"
                              min="1"
                              max={totalPages}
                              value={inputPage}
                              onChange={handleInputChange}
                              className={`${isMobile ? "w-10 px-1 py-1 text-[10px]" : "w-12 px-1 py-1 text-xs"} bg-slate-700 text-white rounded border border-slate-600/50 focus:border-blue-500 focus:outline-none text-center`}
                           />
                           <button
                              type="submit"
                              className={`px-2 py-1 bg-blue-600 text-white rounded ${isMobile ? "text-[10px]" : "text-xs"} hover:bg-blue-700 transition-colors`}
                           >
                              Go
                           </button>
                        </form>
                     </div>
                  </div>
               )}
            </>
         )}

         {/* Calendar Modal */}
         {showCalendar && (
            <Calendar
               availableDates={getAvailableDates()}
               selectedDate={filterDate}
               onDateSelect={handleDateFilterChange}
               onClose={() => setShowCalendar(false)}
            />
         )}

         {/* Group Dialog */}
         {showDialogGroup && (
            <DialogGroup
               groupSessions={groupSessions}
               onConfirm={handleGroupDialogConfirm}
               onCancel={() => {
                  setShowDialogGroup(false)
                  setPendingGroupSession(null)
               }}
               isMobile={isMobile}
            />
         )}
      </div>
   )
}

export default Sessions
