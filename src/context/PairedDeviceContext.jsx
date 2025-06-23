import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./ToastContext";

const PairedDeviceContext = createContext(null);

export const PairedDeviceProvider = ({ children }) => {
   const [pairedDevice, setPairedDevice] = useState({
      device_uuid: "",
      name: "",
      ssid: "",
      password: ""
   });
   const toast = useToast();

   useEffect(() => {
      const savedDevice = localStorage.getItem("device");
      if (savedDevice) {
         try {
            const parsed = JSON.parse(savedDevice);
            setPairedDevice(parsed);
         } catch (e) {
            console.error("Failed to parse saved device:", e);
         }
      }
   }, []);

   // Add status monitoring
   useEffect(() => {
      const checkDeviceStatus = () => {
         if (pairedDevice.device_uuid) {
            const paired_devices = JSON.parse(localStorage.getItem("paired_devices") || "{}");
            if (!paired_devices[pairedDevice.device_uuid]) {
               toast.warning("Device has gone offline. You have been disconnected.");
               setPairedDevice({
                  device_uuid: "",
                  name: "",
                  ssid: "",
                  password: ""
               });
               localStorage.removeItem("device");
            }
         }
      };

      const interval = setInterval(checkDeviceStatus, 1000);
      return () => clearInterval(interval);
   }, [pairedDevice.device_uuid, toast]);

   const updatePairedDevice = (data) => {
      setPairedDevice((prev) => {
         const updated = { ...prev, ...data };
         localStorage.setItem("device", JSON.stringify(updated));
         return updated;
      });
   };

   return (
      <PairedDeviceContext.Provider value={{ pairedDevice, updatePairedDevice }}>
         {children}
      </PairedDeviceContext.Provider>
   );
};

export const usePairedDevice = () => useContext(PairedDeviceContext);