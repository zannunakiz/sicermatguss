import { useState } from "react";
import { X, Check } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { sendWSMessage } from "../lib/wsClient";

const SubmitDialog = ({ payload, onClose, isOpen }) => {
   const [loading, setLoading] = useState(false);
   const toast = useToast();

   if (!isOpen) return null;

   const handleSubmit = async () => {
      setLoading(true);

      try {
         const device = JSON.parse(localStorage.getItem("device") || "{}");

         if (!device.device_uuid) {
            throw new Error("Device UUID tidak ditemukan");
         }

         const success = sendWSMessage({
            type: "save_session",
            data: {
               sport_type: payload.name,
               device_uuid: device.device_uuid
            }
         });

         if (success && window.handlePunchData) {
            delete window.handlePunchData;
         }

         if (success) {
            toast.normal(`✅ Session ${payload.name} berhasil disimpan`);
            onClose(); // Tutup dialog
         } else {
            toast.error(`❌ Gagal menyimpan session ${payload.name}`);
         }
      } catch (error) {
         toast.error(`❌ Ada kesalahan pada sistem. Error: ${error.message}`);
      } finally {
         setLoading(false);
      }
   };

   return (
      <>
         {/* Backdrop */}
         <div
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
         ></div>

         {/* Dialog Box */}
         <div className="fixed w-[90%] top-1/2 left-1/2 max-w-md md:w-full -translate-x-1/2 z-[1000] -translate-y-1/2 rounded-lg bg-slate-800/80 border border-slate-700 p-6 shadow-lg text-gray-300">
            {/* Header with close */}
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Check className="w-6 h-6 text-yellow-400" />
                  Finish Exercise
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
               Are you sure you want to finish exercise?
            </p>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
               <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-md border border-slate-700 text-gray-400 hover:text-white hover:border-gray-400 transition-colors disabled:opacity-50"
               >
                  Cancel
               </button>

               <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`relative overflow-hidden px-5 py-2 rounded-md font-semibold group ${
                     loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 text-white'
                  }`}
               >
                  {/* Layer sliding background */}
                  {!loading && (
                     <span
                        className="absolute inset-0 bg-red-700 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out"
                        aria-hidden="true"
                     ></span>
                  )}

                  {/* Loading spinner or text */}
                  <span className="relative z-10 flex items-center gap-2">
                     {loading ? (
                        <>
                           <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Sending...
                        </>
                     ) : (
                        "Yes"
                     )}
                  </span>
               </button>
            </div>
         </div>
      </>
   );
};

export default SubmitDialog;