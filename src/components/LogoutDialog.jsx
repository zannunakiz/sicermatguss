import { AlertCircle, LogOut } from 'lucide-react'
import React from 'react'

const LogoutDialog = ({ isOpen, onConfirm, onCancel }) => {
   if (!isOpen) return null

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
         <div className="bg-slate-900 text-white rounded-2xl shadow-2xl w-[90%] max-w-sm p-6 border border-slate-700">
            {/* Title */}
            <h2 className="text-xl font-semibold mb-2 text-white flex items-center"><AlertCircle className="mr-2 " />Confirm Logout</h2>

            {/* Description */}
            <p className="text-sm text-slate-300 mb-6">
               Are you sure you want to logout? This action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-3">
               <button
                  onClick={onCancel}
                  className="px-4 py-2 rounded-lg text-sm border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 transition duration-200"
               >
                  Cancel
               </button>
               <button
                  onClick={onConfirm}
                  className="relative overflow-hidden px-4 py-2 rounded-lg flex items-center text-sm border border-red-700 text-white group"
               >
                  {/* Sliding Background */}
                  <span className="absolute inset-0 bg-red-700 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out z-0" />

                  {/* Content */}
                  <span className="flex items-center z-10 relative">
                     <LogOut className="mr-2 size-4" /> Logout
                  </span>
               </button>

            </div>
         </div>
      </div>
   )
}

export default LogoutDialog
