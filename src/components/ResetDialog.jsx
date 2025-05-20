import { AlertTriangle, X } from "lucide-react";
import React from "react";

const ResetDialog = ({ onSubmit, onClose, isOpen }) => {
   if (!isOpen) return null; // kalo gak open, gak render apa2

   return (
      <>
         {/* Backdrop gelap blur */}
         <div
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
         ></div>

         {/* Dialog Box */}
         <div className="fixed w-[90%]  top-1/2 left-1/2 max-w-md md:w-full -translate-x-1/2 z-[1000] -translate-y-1/2 rounded-lg bg-slate-800/80 border border-slate-700 p-6 shadow-lg text-gray-300">

            {/* Header with close */}
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  Reset Exercise
               </h3>
               <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="text-gray-400 hover:text-gray-200 transition-colors"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* Body */}
            <p className="mb-6 text-sm text-gray-300">
               Are you sure you want to reset the exercise? This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
               <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md border border-slate-700 text-gray-400 hover:text-white hover:border-gray-400 transition-colors"
               >
                  Cancel
               </button>

               <button
                  onClick={() => {
                     onSubmit()
                     onClose()
                  }}
                  className="relative overflow-hidden px-5 py-2 rounded-md bg-red-600 text-white font-semibold group"
               >
                  {/* Layer sliding background */}
                  <span
                     className="absolute inset-0 bg-red-700 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out"
                     aria-hidden="true"
                  ></span>
                  {/* Text on top */}
                  <span className="relative z-10">Yes</span>
               </button>
            </div>
         </div>
      </>
   );
};

export default ResetDialog;
