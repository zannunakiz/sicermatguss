"use client"

import { useState, useEffect } from "react"
import {
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  Heart,
  Droplets,
  Activity,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  SkipBack,
  SkipForward,
} from "lucide-react"
import { useMobile } from "../actions/use-mobile"


const DetailedSession = ({ sessionData, groupSessions, isGroupMode }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [inputPage, setInputPage] = useState("1")
  const isMobile = useMobile()

  // Mobile: 5 rows per page, Desktop: 10 rows per page
  const rowsPerPage = isMobile ? 5 : 10

  // Update input when currentPage changes
  useEffect(() => {
    setInputPage(currentPage.toString())
  }, [currentPage])

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

  if (isGroupMode && groupSessions) {
    const sessionA = groupSessions.a
    const sessionB = groupSessions.b

    if (!sessionA && !sessionB) return null

    // Get time intervals for both sessions
    const timeIntervalsA = sessionA ? Object.keys(sessionA.data).filter((key) => key !== "total_count") : []
    const timeIntervalsB = sessionB ? Object.keys(sessionB.data).filter((key) => key !== "total_count") : []

    // Use the longer session for pagination
    const maxIntervals = Math.max(timeIntervalsA.length, timeIntervalsB.length)
    const totalPages = Math.ceil(maxIntervals / rowsPerPage)
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage

    // Get current rows for both sessions
    const currentRowsA = timeIntervalsA.slice(startIndex, endIndex)
    const currentRowsB = timeIntervalsB.slice(startIndex, endIndex)

    // Create combined rows (use the longer one as base)
    const combinedRows = currentRowsA.length >= currentRowsB.length ? currentRowsA : currentRowsB

    // Calculate summary stats for both sessions
    const calculateStats = (session, timeIntervals) => {
      if (!session) return { totalCount: 0, avgCount: 0, avgHR: 0, avgSpO2: 0, avgStatus: "UNKNOWN" }

      const validData = timeIntervals.filter(
        (time) => session.data[time]?.heart?.heart_rate && session.data[time]?.heart?.spo2,
      )

      const totalCount = session.data.total_count
      const avgCount = Math.round(
        timeIntervals.reduce((sum, time) => sum + (session.data[time]?.sport?.count || 0), 0) / timeIntervals.length,
      )
      const avgHR =
        validData.length > 0
          ? Math.round(validData.reduce((sum, time) => sum + session.data[time].heart.heart_rate, 0) / validData.length)
          : 0
      const avgSpO2 =
        validData.length > 0
          ? Math.round(validData.reduce((sum, time) => sum + session.data[time].heart.spo2, 0) / validData.length)
          : 0

      // Calculate most common status
      const statusCounts = {}
      validData.forEach((time) => {
        const status = session.data[time].status
        statusCounts[status] = (statusCounts[status] || 0) + 1
      })
      const avgStatus =
        Object.keys(statusCounts).length > 0
          ? Object.keys(statusCounts).reduce((a, b) => (statusCounts[a] > statusCounts[b] ? a : b))
          : "UNKNOWN"

      return { totalCount, avgCount, avgHR, avgSpO2, avgStatus }
    }

    const statsA = sessionA ? calculateStats(sessionA, timeIntervalsA) : null
    const statsB = sessionB ? calculateStats(sessionB, timeIntervalsB) : null

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
        setInputPage(currentPage.toString())
      }
    }

    const renderPageNumbers = () => {
      const pages = []
      const maxVisible = isMobile ? 3 : 5

      if (totalPages <= maxVisible + 2) {
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

        if (currentPage > (isMobile ? 3 : 4)) {
          pages.push(
            <span key="ellipsis1" className="px-1 text-slate-500 flex items-center">
              <MoreHorizontal className={`${isMobile ? "w-2 h-2" : "w-3 h-3"}`} />
            </span>,
          )
        }

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

        if (currentPage < totalPages - (isMobile ? 2 : 3)) {
          pages.push(
            <span key="ellipsis2" className="px-1 text-slate-500 flex items-center">
              <MoreHorizontal className={`${isMobile ? "w-2 h-2" : "w-3 h-3"}`} />
            </span>,
          )
        }

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

    // Calculate accumulative for both sessions
    let accumulativeA = 0
    let accumulativeB = 0

    for (let i = 0; i < startIndex; i++) {
      if (timeIntervalsA[i]) {
        accumulativeA += sessionA.data[timeIntervalsA[i]].sport?.count || 0
      }
      if (timeIntervalsB[i]) {
        accumulativeB += sessionB.data[timeIntervalsB[i]].sport?.count || 0
      }
    }

    return (
      <div className="bg-slate-700 p-4 lg:p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-blue-400`} />
          <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-white`}>Group Session Comparison</h2>
        </div>

        {/* Summary Stats with Group Comparison */}
        <div className={`grid ${isMobile ? "grid-cols-2 gap-2" : "grid-cols-2 lg:grid-cols-4 gap-4"} mb-6`}>
          <div className="bg-slate-800 p-3 lg:p-4 rounded-lg border border-slate-600 hover:border-emerald-400/50 hover:bg-slate-750 hover:shadow-lg hover:shadow-emerald-400/10 transition-all duration-300 cursor-pointer group">
            <div className={`flex items-center ${isMobile ? "gap-1" : "gap-2"} mb-2`}>
              <Target
                className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} text-emerald-400 group-hover:scale-110 transition-transform duration-300`}
              />
              <span
                className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300 group-hover:text-slate-200 transition-colors duration-300`}
              >
                Total Count
              </span>
            </div>
            <div className="space-y-1">
              {statsA && (
                <div className={`${isMobile ? "text-sm" : "text-lg"} font-bold text-orange-400`}>
                  A: {statsA.totalCount}
                </div>
              )}
              {statsB && (
                <div className={`${isMobile ? "text-sm" : "text-lg"} font-bold text-blue-400`}>
                  B: {statsB.totalCount}
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800 p-3 lg:p-4 rounded-lg border border-slate-600 hover:border-red-400/50 hover:bg-slate-750 hover:shadow-lg hover:shadow-red-400/10 transition-all duration-300 cursor-pointer group">
            <div className={`flex items-center ${isMobile ? "gap-1" : "gap-2"} mb-2`}>
              <Heart
                className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} text-red-400 group-hover:scale-110 transition-transform duration-300`}
              />
              <span
                className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300 group-hover:text-slate-200 transition-colors duration-300`}
              >
                Avg Heart Rate
              </span>
            </div>
            <div className="space-y-1">
              {statsA && (
                <div className={`${isMobile ? "text-sm" : "text-lg"} font-bold text-orange-400`}>
                  A: {statsA.avgHR} <span className={`${isMobile ? "text-xs" : "text-sm"}`}>bpm</span>
                </div>
              )}
              {statsB && (
                <div className={`${isMobile ? "text-sm" : "text-lg"} font-bold text-blue-400`}>
                  B: {statsB.avgHR} <span className={`${isMobile ? "text-xs" : "text-sm"}`}>bpm</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800 p-3 lg:p-4 rounded-lg border border-slate-600 hover:border-blue-400/50 hover:bg-slate-750 hover:shadow-lg hover:shadow-blue-400/10 transition-all duration-300 cursor-pointer group">
            <div className={`flex items-center ${isMobile ? "gap-1" : "gap-2"} mb-2`}>
              <Droplets
                className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} text-blue-400 group-hover:scale-110 transition-transform duration-300`}
              />
              <span
                className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300 group-hover:text-slate-200 transition-colors duration-300`}
              >
                Avg SpO₂
              </span>
            </div>
            <div className="space-y-1">
              {statsA && (
                <div className={`${isMobile ? "text-sm" : "text-lg"} font-bold text-orange-400`}>
                  A: {statsA.avgSpO2}
                  <span className={`${isMobile ? "text-xs" : "text-sm"}`}>%</span>
                </div>
              )}
              {statsB && (
                <div className={`${isMobile ? "text-sm" : "text-lg"} font-bold text-blue-400`}>
                  B: {statsB.avgSpO2}
                  <span className={`${isMobile ? "text-xs" : "text-sm"}`}>%</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800 p-3 lg:p-4 rounded-lg border border-slate-600 hover:border-yellow-400/50 hover:bg-slate-750 hover:shadow-lg hover:shadow-yellow-400/10 transition-all duration-300 cursor-pointer group">
            <div className={`flex items-center ${isMobile ? "gap-1" : "gap-2"} mb-2`}>
              <Activity
                className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} text-yellow-400 group-hover:scale-110 transition-transform duration-300`}
              />
              <span
                className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300 group-hover:text-slate-200 transition-colors duration-300`}
              >
                Avg Status
              </span>
            </div>
            <div className="space-y-1">
              {statsA && (
                <div className="flex justify-center">
                  <span
                    className={`inline-block ${isMobile ? "w-20 text-center px-1 py-1 text-[9px] " : "w-28 text-center px-1 py-1 text-xs"} rounded-full font-medium ${getStatusBadgeColor(statsA.avgStatus)} group-hover:scale-105 transition-transform duration-300`}
                  >
                    A: {statsA.avgStatus}
                  </span>
                </div>
              )}
              {statsB && (
                <div className="flex justify-center">
                  <span
                    className={`inline-block ${isMobile ? "w-20 text-center px-1 py-1 text-[9px]" : "w-28 text-center px-1 py-1 text-xs"} rounded-full font-medium ${getStatusBadgeColor(statsB.avgStatus)} group-hover:scale-105 transition-transform duration-300`}
                  >
                    B: {statsB.avgStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-600">
          <table className={`w-full ${isMobile ? "text-xs" : "text-sm"}`}>
            <thead className="bg-slate-900">
              <tr>
                <th
                  className={`text-center ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[60px]" : ""}`}
                >
                  <div className={`flex items-center justify-center ${isMobile ? "gap-1" : "gap-2"}`}>
                    <Clock className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                    Interval
                  </div>
                </th>
                <th
                  className={`text-center ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[100px]" : ""}`}
                >
                  <div className={`flex items-center justify-center ${isMobile ? "gap-1" : "gap-2"}`}>
                    <Target className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                    Count A/B
                  </div>
                </th>
                <th
                  className={`text-center ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[80px]" : ""}`}
                >
                  <div className={`flex items-center justify-center ${isMobile ? "gap-1" : "gap-2"}`}>
                    <TrendingUp className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                    {isMobile ? "Acc A/B" : "Accumulative A/B"}
                  </div>
                </th>
                <th
                  className={`text-center ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[80px]" : ""}`}
                >
                  <div className={`flex items-center justify-center ${isMobile ? "gap-1" : "gap-2"}`}>
                    <Heart className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                    {isMobile ? "HR A/B" : "Heart Rate A/B"}
                  </div>
                </th>
                <th
                  className={`text-center ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[100px]" : ""}`}
                >
                  <div className={`flex items-center justify-center ${isMobile ? "gap-1" : "gap-2"}`}>
                    <Droplets className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                    SpO₂ A/B
                  </div>
                </th>
                <th
                  className={`text-center  ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[100px]" : ""}`}
                >
                  <div className={`flex items-center justify-center ${isMobile ? "gap-1" : "gap-2"}`}>
                    <Activity className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                    Status A/B
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {combinedRows.map((time, index) => {
                const actualIndex = startIndex + index
                const timeA = currentRowsA[index]
                const timeB = currentRowsB[index]
                const dataA = timeA && sessionA ? sessionA.data[timeA] : null
                const dataB = timeB && sessionB ? sessionB.data[timeB] : null

                if (dataA) accumulativeA += dataA.sport?.count || 0
                if (dataB) accumulativeB += dataB.sport?.count || 0

                return (
                  <tr
                    key={`${actualIndex}-${time}`}
                    className="border-b border-slate-600 hover:bg-slate-700/50 text-center transition-colors"
                  >
                    <td
                      className={`${isMobile ? "p-2" : "p-3"} font-mono text-blue-400 font-medium ${isMobile ? "text-[10px]" : ""}`}
                    >
                      {timeA ||
                        timeB ||
                        `${Math.floor((actualIndex * 5) / 60)
                          .toString()
                          .padStart(2, "0")}:${((actualIndex * 5) % 60).toString().padStart(2, "0")}`}
                    </td>
                    <td className={`${isMobile ? "p-2" : "p-3"}`}>
                      <div className="space-y-1">
                        <div className="text-orange-400 font-semibold">{dataA ? dataA.sport?.count || 0 : "-"}</div>
                        <div className="text-blue-400 font-semibold">{dataB ? dataB.sport?.count || 0 : "-"}</div>
                      </div>
                    </td>
                    <td className={`${isMobile ? "p-2" : "p-3"}`}>
                      <div className="space-y-1">
                        <div className="text-orange-400 font-semibold">{sessionA ? accumulativeA : "-"}</div>
                        <div className="text-blue-400 font-semibold">{sessionB ? accumulativeB : "-"}</div>
                      </div>
                    </td>
                    <td className={`${isMobile ? "p-2" : "p-3"}`}>
                      <div className="space-y-1">
                        <div className="text-orange-400">{dataA?.heart?.heart_rate || "-"}</div>
                        <div className="text-blue-400">{dataB?.heart?.heart_rate || "-"}</div>
                      </div>
                    </td>
                    <td className={`${isMobile ? "p-2" : "p-3"}`}>
                      <div className="space-y-1">
                        <div className="text-orange-400">{dataA?.heart?.spo2 ? `${dataA.heart.spo2}%` : "-"}</div>
                        <div className="text-blue-400">{dataB?.heart?.spo2 ? `${dataB.heart.spo2}%` : "-"}</div>
                      </div>
                    </td>
                    <td className={`${isMobile ? "p-2" : "p-3"}`}>
                      <div className="space-y-1">
                        {dataA && (
                          <div className="flex justify-center">
                            <span
                              className={`inline-block ${isMobile ? "min-w-16 text-center px-1 py-1 text-[8px]" : "w-20 text-center px-1 py-1 text-xs"} rounded-full font-medium ${getStatusBadgeColor(dataA.status)}`}
                            >
                              {isMobile ? dataA.status : dataA.status}
                            </span>
                          </div>
                        )}
                        {!dataA && (
                          <div className="flex justify-center">
                            <span className="text-slate-500">-</span>
                          </div>
                        )}
                        {dataB && (
                          <div className="flex justify-center">
                            <span
                              className={`inline-block ${isMobile ? "min-w-16 text-center px-1 py-1 text-[8px]" : "w-20 text-center px-1 py-1 text-xs"} rounded-full font-medium ${getStatusBadgeColor(dataB.status)}`}
                            >
                              {isMobile ? dataB.status : dataB.status}
                            </span>
                          </div>
                        )}
                        {!dataB && (
                          <div className="flex justify-center">
                            <span className="text-slate-500">-</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className={`flex flex-col ${isMobile ? "gap-2" : "sm:flex-row gap-3"} items-center justify-between ${isMobile ? "mt-2 p-2" : "mt-3 p-3"} bg-slate-800/50 rounded border border-slate-600/50`}
        >
          <div
            className={`${isMobile ? "text-[10px]" : "text-xs"} text-slate-400 text-center ${isMobile ? "order-2" : ""}`}
          >
            Showing {startIndex + 1}-{Math.min(endIndex, maxIntervals)} of {maxIntervals} entries
          </div>

          <div className={`flex ${isMobile ? "flex-row gap-4 order-1" : "items-center gap-1"}`}>
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
      </div>
    )
  }

  // Single session mode (original logic)
  if (!sessionData?.data) return null

  const timeIntervals = Object.keys(sessionData.data).filter((key) => key !== "total_count")

  // Calculate pagination
  const totalRows = timeIntervals.length
  const totalPages = Math.ceil(totalRows / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentRows = timeIntervals.slice(startIndex, endIndex)

  // Calculate averages for all data
  const validData = timeIntervals.filter(
    (time) => sessionData.data[time].heart?.heart_rate && sessionData.data[time].heart?.spo2,
  )

  const totalCount = sessionData.data.total_count

  const avgCount = Math.round(
    timeIntervals.reduce((sum, time) => sum + (sessionData.data[time].sport?.count || 0), 0) / timeIntervals.length,
  )
  const avgHR =
    validData.length > 0
      ? Math.round(validData.reduce((sum, time) => sum + sessionData.data[time].heart.heart_rate, 0) / validData.length)
      : 0
  const avgSpO2 =
    validData.length > 0
      ? Math.round(validData.reduce((sum, time) => sum + sessionData.data[time].heart.spo2, 0) / validData.length)
      : 0

  // Calculate most common status
  const statusCounts = {}

  validData.forEach((time) => {
    const status = sessionData.data[time].status
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })



  // Mapping AVG STATUS ALOGORITHM PAKAI KALAU GA DUMMY
  // Langkah pertama: ambil semua status
  const statuses = Object.values(sessionData.data).map(entry => entry.status);
  // console.log("StATUSESSS", statuses)

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
  // console.log(avgStatus); // Outputnya string status yang paling sering muncul

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

  // Calculate accumulative up to current page
  let accumulative = 0
  for (let i = 0; i < startIndex; i++) {
    accumulative += sessionData.data[timeIntervals[i]].sport?.count || 0
  }

  return (
    <div className="bg-slate-700 p-4 lg:p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className={`${isMobile ? "w-4 h-4" : "w-5 h-5"} text-blue-400`} />
        <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-white`}>Detailed Session Data</h2>
      </div>

      {/* Summary Stats with Hover Effects */}
      <div className={`grid ${isMobile ? "grid-cols-2 gap-2" : "grid-cols-2 lg:grid-cols-4 gap-4"} mb-6`}>
        <div className="bg-slate-800 p-3 lg:p-4 rounded-lg border border-slate-600 hover:border-emerald-400/50 hover:bg-slate-750 hover:shadow-lg hover:shadow-emerald-400/10 transition-all duration-300 cursor-pointer group">
          <div className={`flex items-center ${isMobile ? "gap-1" : "gap-2"} mb-2`}>
            <Target
              className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} text-emerald-400 group-hover:scale-110 transition-transform duration-300`}
            />
            <span
              className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300 group-hover:text-slate-200 transition-colors duration-300`}
            >
              Total Count
            </span>
          </div>
          <div
            className={`${isMobile ? "text-lg" : "text-2xl"} font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300`}
          >
            {totalCount}
          </div>
        </div>
        <div className="bg-slate-800 p-3 lg:p-4 rounded-lg border border-slate-600 hover:border-red-400/50 hover:bg-slate-750 hover:shadow-lg hover:shadow-red-400/10 transition-all duration-300 cursor-pointer group">
          <div className={`flex items-center ${isMobile ? "gap-1" : "gap-2"} mb-2`}>
            <Heart
              className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} text-red-400 group-hover:scale-110 transition-transform duration-300`}
            />
            <span
              className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300 group-hover:text-slate-200 transition-colors duration-300`}
            >
              Avg Heart Rate
            </span>
          </div>
          <div
            className={`${isMobile ? "text-lg" : "text-2xl"} font-bold text-red-400 group-hover:text-red-300 transition-colors duration-300`}
          >
            {avgHR} <span className={`${isMobile ? "text-xs" : "text-sm"}`}>bpm</span>
          </div>
        </div>
        <div className="bg-slate-800 p-3 lg:p-4 rounded-lg border border-slate-600 hover:border-blue-400/50 hover:bg-slate-750 hover:shadow-lg hover:shadow-blue-400/10 transition-all duration-300 cursor-pointer group">
          <div className={`flex items-center ${isMobile ? "gap-1" : "gap-2"} mb-2`}>
            <Droplets
              className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} text-blue-400 group-hover:scale-110 transition-transform duration-300`}
            />
            <span
              className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300 group-hover:text-slate-200 transition-colors duration-300`}
            >
              Avg SpO₂
            </span>
          </div>
          <div
            className={`${isMobile ? "text-lg" : "text-2xl"} font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-300`}
          >
            {avgSpO2}
            <span className={`${isMobile ? "text-xs" : "text-sm"}`}>%</span>
          </div>
        </div>
        <div className="bg-slate-800 p-3 lg:p-4 rounded-lg border border-slate-600 hover:border-yellow-400/50 hover:bg-slate-750 hover:shadow-lg hover:shadow-yellow-400/10 transition-all duration-300 cursor-pointer group">
          <div className={`flex items-center ${isMobile ? "gap-1" : "gap-2"} mb-2`}>
            <Activity
              className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} text-yellow-400 group-hover:scale-110 transition-transform duration-300`}
            />
            <span
              className={`${isMobile ? "text-xs" : "text-sm"} text-slate-300 group-hover:text-slate-200 transition-colors duration-300`}
            >
              Avg Status
            </span>
          </div>
          {/* Fixed width status badge */}
          <div className="flex justify-center">
            <span
              className={`inline-block ${isMobile ? "w-16 text-center px-1 py-1 text-[10px]" : "w-20 text-center px-2 py-1 text-xs"} rounded-full font-medium ${getStatusBadgeColor(avgStatus)} group-hover:scale-105 transition-transform duration-300`}
            >
              {avgStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-600">
        <table className={`w-full ${isMobile ? "text-xs" : "text-sm"}`}>
          <thead className="bg-slate-900">
            <tr>
              <th
                className={`text-left ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[60px]" : ""}`}
              >
                <div className={`flex items-center justify-center  ${isMobile ? "gap-1" : "gap-2"}`}>
                  <Clock className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                  Interval
                </div>
              </th>
              <th
                className={`text-left ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[50px]" : ""}`}
              >
                <div className={`flex items-center justify-center ${isMobile ? "gap-1" : "gap-2"}`}>
                  <Target className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                  Count
                </div>
              </th>
              <th
                className={`text-left ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[60px]" : ""}`}
              >
                <div className={`flex items-center justify-center ${isMobile ? "gap-1" : "gap-2"}`}>
                  <TrendingUp className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                  {isMobile ? "Accum" : "Accumulative"}
                </div>
              </th>
              <th
                className={`text-left ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[50px]" : ""}`}
              >
                <div className={`flex items-center justify-center ${isMobile ? "gap-1" : "gap-2"}`}>
                  <Heart className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                  {isMobile ? "HR" : "Heart Rate"}
                </div>
              </th>
              <th
                className={`text-left ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[50px]" : ""}`}
              >
                <div className={`flex items-center justify-center ${isMobile ? "gap-1" : "gap-2"}`}>
                  <Droplets className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                  SpO₂
                </div>
              </th>
              <th
                className={`text-left ${isMobile ? "p-2" : "p-3"} text-slate-300 font-medium ${isMobile ? "min-w-[60px]" : ""}`}
              >
                <div className={`flex items-center justify-center ${isMobile ? "gap-1" : "gap-2"}`}>
                  <Activity className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                  Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((time) => {
              const data = sessionData.data[time]
              accumulative += data.sport?.count || 0

              return (
                <tr key={time} className="border-b border-slate-600 hover:bg-slate-700/50 transition-colors">
                  <td
                    className={`${isMobile ? "p-2" : "p-3"} font-mono text-blue-400 font-medium text-center ${isMobile ? "text-[10px]" : ""}`}
                  >
                    {time}
                  </td>
                  <td className={`${isMobile ? "p-2" : "p-3"} font-semibold text-white  text-center`}>{data.sport?.count || 0}</td>
                  <td className={`${isMobile ? "p-2" : "p-3"} text-emerald-400 font-semibold text-center`}>{accumulative}</td>
                  <td className={`${isMobile ? "p-2" : "p-3"} text-red-400 text-center`}>{data.heart?.heart_rate || "N/A"}</td>
                  <td className={`${isMobile ? "p-2" : "p-3"} text-blue-400 text-center`}>
                    {data.heart?.spo2 ? `${data.heart.spo2}%` : "N/A"}
                  </td>
                  <td className={`${isMobile ? "p-2" : "p-3"} flex justify-center items-center`}>
                    {/* Fixed width status badge */}
                    <span
                      className={`inline-block ${isMobile ? "w-12 text-center px-1 py-1 text-[9px]" : "w-20 text-center px-2 py-1 text-xs"} rounded-full font-medium ${getStatusBadgeColor(data.status)}`}
                    >
                      {isMobile ? data.status : data.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Compact Pagination - Similar to ChartPagination */}
      <div
        className={`flex flex-col ${isMobile ? "gap-2" : "sm:flex-row gap-3"} items-center justify-between ${isMobile ? "mt-2 p-2" : "mt-3 p-3"} bg-slate-800/50 rounded border border-slate-600/50`}
      >
        <div
          className={`${isMobile ? "text-[10px]" : "text-xs"} text-slate-400 text-center ${isMobile ? "order-2" : ""}`}
        >
          Showing {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows} entries
        </div>

        <div className={`flex ${isMobile ? "flex-row gap-3 order-1" : "items-center gap-1"}`}>
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

          {/* Page Input - Now available on mobile below the buttons */}
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
    </div>
  )
}

export default DetailedSession
