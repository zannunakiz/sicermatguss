import { createContext, useContext, useEffect, useState } from "react";

const PairedDeviceContext = createContext(null);

export const PairedDeviceProvider = ({ children }) => {
   const [pairedDevice, setPairedDevice] = useState({
      device_uuid: "",
      name: "",
      ssid: "",
      password: ""
   });


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

// Custom hook biar gampang manggil
export const usePairedDevice = () => useContext(PairedDeviceContext);
