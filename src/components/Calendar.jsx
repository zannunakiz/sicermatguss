"use client"

import { useState } from "react"

const Calendar = ({ availableDates, selectedDate, onDateSelect, onClose }) => {
   const [currentMonth, setCurrentMonth] = useState(new Date())

   const getDaysInMonth = (date) => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      const startingDayOfWeek = firstDay.getDay()

      const days = []

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
         days.push(null)
      }

      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
         days.push(new Date(year, month, day))
      }

      return days
   }

   const isDateAvailable = (date) => {
      if (!date) return false
      const dateStr = date.toISOString().split("T")[0]
      return availableDates.some((availableDate) => new Date(availableDate).toISOString().split("T")[0] === dateStr)
   }

   const isDateSelected = (date) => {
      if (!date || !selectedDate) return false
      const dateStr = date.toISOString().split("T")[0]
      const selectedStr = new Date(selectedDate).toISOString().split("T")[0]
      return dateStr === selectedStr
   }

   const handlePrevMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
   }

   const handleNextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
   }

   const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
   ]

   const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className="bg-slate-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-white">Select Date</h3>
               <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">
                  ×
               </button>
            </div>

            <div className="flex justify-between items-center mb-4">
               <button onClick={handlePrevMonth} className="text-slate-400 hover:text-white p-1">
                  ←
               </button>
               <h4 className="text-white font-medium">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
               </h4>
               <button onClick={handleNextMonth} className="text-slate-400 hover:text-white p-1">
                  →
               </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
               {dayNames.map((day) => (
                  <div key={day} className="text-center text-slate-400 text-sm p-2">
                     {day}
                  </div>
               ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
               {getDaysInMonth(currentMonth).map((date, index) => (
                  <button
                     key={index}
                     onClick={() => date && isDateAvailable(date) && onDateSelect(date.toISOString())}
                     disabled={!date || !isDateAvailable(date)}
                     className={`
                p-2 text-sm rounded transition-colors
                ${!date ? "invisible" : ""}
                ${isDateAvailable(date)
                           ? isDateSelected(date)
                              ? "bg-blue-600 text-white"
                              : "text-white hover:bg-slate-600"
                           : "text-slate-500 cursor-not-allowed"
                        }
              `}
                  >
                     {date?.getDate()}
                  </button>
               ))}
            </div>

            <div className="mt-4 flex justify-end gap-2">
               <button onClick={() => onDateSelect(null)} className="px-4 py-2 text-slate-400 hover:text-white">
                  Clear
               </button>
               <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Close
               </button>
            </div>
         </div>
      </div>
   )
}

export default Calendar
