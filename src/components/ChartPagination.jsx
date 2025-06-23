"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal, SkipBack, SkipForward } from "lucide-react"
import { useMobile } from "../actions/use-mobile"

const ChartPagination = ({ currentPage, totalPages, onPageChange, title, getTimeRange }) => {
   const [inputPage, setInputPage] = useState(currentPage.toString())
   const isMobile = useMobile()

   // Update input when currentPage changes
   useEffect(() => {
      setInputPage(currentPage.toString())
   }, [currentPage])

   if (totalPages <= 1) return null

   const handleInputChange = (e) => {
      setInputPage(e.target.value)
   }

   const handleInputSubmit = (e) => {
      e.preventDefault()
      const pageNum = Number.parseInt(inputPage)
      if (pageNum >= 1 && pageNum <= totalPages) {
         onPageChange(pageNum)
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
                  onClick={() => onPageChange(i)}
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
               onClick={() => onPageChange(1)}
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
                  onClick={() => onPageChange(i)}
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
               onClick={() => onPageChange(totalPages)}
               className={`${isMobile ? "px-1.5 py-1" : "px-2 py-1"} rounded transition-colors ${isMobile ? "text-[10px]" : "text-xs"} ${currentPage === totalPages ? "bg-blue-600 text-white" : "bg-slate-600 text-white hover:bg-slate-500"
                  }`}
            >
               {totalPages}
            </button>,
         )
      }

      return pages
   }

   return (
      <div
         className={`flex flex-col ${isMobile ? "gap-2" : "sm:flex-row gap-3"} items-center justify-between ${isMobile ? "mt-2 p-2" : "mt-3 p-3"} bg-slate-800/50 rounded border border-slate-600/50`}
      >
         <div
            className={`${isMobile ? "text-[10px]" : "text-xs"} text-slate-400 text-center ${isMobile ? "order-2" : ""}`}
         >
            {title} - Page {currentPage} of {totalPages} {getTimeRange && `(${getTimeRange(currentPage)})`}
         </div>

         <div className={`flex ${isMobile ? "flex-row gap-4 order-1" : "items-center gap-1"}`}>
            {/* Navigation Buttons */}
            <div className={`flex items-center ${isMobile ? "gap-0.5" : "gap-1"}`}>
               <button
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 ${isMobile ? "px-1.5 py-1" : "px-2 py-1"} rounded bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500 transition-colors ${isMobile ? "text-[10px]" : "text-xs"}`}
               >
                  <SkipBack className={`${isMobile ? "w-2 h-2" : "w-3 h-3"}`} />
                  {!isMobile && <span className="hidden sm:inline">First</span>}
               </button>
               <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 ${isMobile ? "px-1.5 py-1" : "px-2 py-1"} rounded bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500 transition-colors ${isMobile ? "text-[10px]" : "text-xs"}`}
               >
                  <ChevronLeft className={`${isMobile ? "w-2 h-2" : "w-3 h-3"}`} />
                  {!isMobile && <span className="hidden sm:inline">Prev</span>}
               </button>

               {/* Smart Page Numbers */}
               {renderPageNumbers()}

               <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 ${isMobile ? "px-1.5 py-1" : "px-2 py-1"} rounded bg-slate-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500 transition-colors ${isMobile ? "text-[10px]" : "text-xs"}`}
               >
                  {!isMobile && <span className="hidden sm:inline">Next</span>}
                  <ChevronRight className={`${isMobile ? "w-2 h-2" : "w-3 h-3"}`} />
               </button>
               <button
                  onClick={() => onPageChange(totalPages)}
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
   )
}

export default ChartPagination
