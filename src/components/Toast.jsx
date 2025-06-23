"use client"

import { useEffect } from "react"

const Toast = ({ message, type = "info", onClose, duration = 3000 }) => {
   useEffect(() => {
      const timer = setTimeout(() => {
         onClose()
      }, duration)

      return () => clearTimeout(timer)
   }, [onClose, duration])

   const getToastStyles = () => {
      switch (type) {
         case "success":
            return "bg-green-600 border-green-500"
         case "error":
            return "bg-red-600 border-red-500"
         case "warning":
            return "bg-yellow-600 border-yellow-500"
         default:
            return "bg-blue-600 border-blue-500"
      }
   }

   return (
      <div className="fixed top-4 right-4 z-50 animate-slide-in">
         <div className={`${getToastStyles()} text-white p-4 rounded-lg border-l-4 shadow-lg max-w-sm`}>
            <div className="flex justify-between items-start">
               <div className="flex-1">
                  <p className="text-sm font-medium">{message}</p>
               </div>
               <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
                  ×
               </button>
            </div>
         </div>
      </div>
   )
}

export default Toast
