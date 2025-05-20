import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
   const [toasts, setToasts] = useState([]);

   const addToast = useCallback((type, message) => {
      const id = Date.now();
      const newToast = { id, type, message };
      setToasts(prev => [...prev, newToast]);

      setTimeout(() => {
         setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
   }, []);

   const toast = {
      success: (msg) => addToast("success", msg),
      error: (msg) => addToast("error", msg),
      normal: (msg) => addToast("normal", msg),
   };

   return (
      <ToastContext.Provider value={toast}>
         {children}
         {createPortal(
            <div className="fixed bottom-5 left-5 flex flex-col gap-2 z-[9999]">
               <AnimatePresence>
                  {toasts.map(({ id, type, message }) => (
                     <motion.div
                        key={id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        className={`rounded-2xl px-4 py-3 text-white backdrop-blur-md bg-slate-800/60 shadow-lg border border-white/10 min-w-[220px] ${type === "success"
                           ? "border-green-400/30"
                           : type === "error"
                              ? "border-red-400/30"
                              : "border-white/10"
                           }`}
                     >
                        {type !== "normal" && (
                           <p className="text-sm font-medium flex items-center gap-2">
                              {type === "success" && (
                                 <>
                                    <CheckCircle size={14} className="text-white" />
                                    Success:
                                 </>
                              )}
                              {type === "error" && (
                                 <>
                                    <XCircle size={14} className="text-white" />
                                    Error:
                                 </>
                              )}
                           </p>
                        )}
                        <p className={`text-xs ${type !== "normal" ? "mt-1 " : "mt-0 text-center"}`}>{message}</p>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>,
            document.body
         )}
      </ToastContext.Provider>
   );
};

export const useToast = () => useContext(ToastContext);
