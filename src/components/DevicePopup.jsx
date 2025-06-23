"use client";

import { BluetoothOff, Edit3, Link2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { updateDeviceName } from "../actions/deviceActions";
import { usePairedDevice } from "../context/PairedDeviceContext";
import { useToast } from "../context/ToastContext";

const DevicePopup = ({ device, onClose, refetch, setRefetch }) => {
   const [activeTab, setActiveTab] = useState("pair");
   const [name, setName] = useState(device?.name || "");
   const [loading, setLoading] = useState(false);
   const { updatePairedDevice } = usePairedDevice();

   const toast = useToast();

   const handleTabChange = (tab) => setActiveTab(tab);

   const handleSubmit = async (type) => {
      if (type === "name" && !name.trim()) {
         toast.error("Please enter a device name");
         return;
      }

      setLoading(true);
      try {
         let payload = {};
         let res = false;
         let device_uuid = device.uuid;

         switch (type) {
            case "pair":
               updatePairedDevice({ device_uuid, name });
               res = true;
               break;
            case "name":
               payload = { name, device_uuid };
               res = await updateDeviceName(payload);
               break;
         }

         if (res) {
            toast.success(
               type === "name"
                  ? "Successfully changed device name!"
                  : "Successfully paired device!"
            );
            setRefetch(!refetch);
            onClose();
         } else {
            toast.error(
               type === "name"
                  ? "Error while changing device name!"
                  : "Error while pairing device!"
            );
         }
      } catch {
         toast.error("Network error!");
      } finally {
         setLoading(false);
      }
   };

   const [deviceStatus, setDeviceStatus] = useState(false);

   useEffect(() => {
      const checkStatus = () => {
         const status = JSON.parse(localStorage.getItem("paired_devices") || "{}");
         setDeviceStatus(status[device.uuid] || false);
      };

      checkStatus();
      const interval = setInterval(checkStatus, 1000);
      return () => clearInterval(interval);
   }, [device.uuid]);

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
         <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md md:min-w-[500px] overflow-hidden relative">
            {/* Close Button */}
            <button
               className="absolute top-3 right-3 text-gray-400 hover:text-white transition-all"
               onClick={onClose}
            >
               <XCircle className="w-6 h-6" />
            </button>

            <div className="px-6 py-4 bg-slate-700 text-white border-b border-slate-600">
               <h3 className="text-lg font-medium">Configure {device.name}</h3>
            </div>

            <div className="flex border-b border-slate-600 bg-slate-700 text-white">
               {[
                  { label: "Pair Device", tab: "pair", icon: <Link2 className="w-4 h-4 mr-2" /> },
                  { label: "Change Name", tab: "name", icon: <Edit3 className="w-4 h-4 mr-2" /> }
               ].map(({ label, tab, icon }) => (
                  <button
                     key={tab}
                     className={`flex flex-1 items-center justify-center px-4 py-3 text-sm font-medium transition-all ${activeTab === tab
                        ? "text-white border-b-2 border-slate-400"
                        : "text-gray-400 hover:text-white"
                        }`}
                     onClick={() => handleTabChange(tab)}
                  >
                     <div>{icon}</div>
                     <div className="hidden md:inline">{label}</div>
                  </button>
               ))}
            </div>

            <div className="p-6">
               {activeTab === "pair" && (
                  <div className="text-center">
                     {deviceStatus ? (
                        <>
                           <p className="text-gray-300 mb-6">Pair with device?</p>
                           <button
                              className="flex mx-auto items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-bold px-4 py-2 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                              onClick={() => handleSubmit("pair")}
                              disabled={loading}
                           >
                              <Link2 className="w-4 h-4" />
                              {loading ? "Pairing..." : "Click to Pair"}
                           </button>
                        </>
                     ) : (
                        <>
                           <p className="text-red-400 mb-6">Device is currently offline</p>
                           <button
                              className="flex mx-auto items-center justify-center gap-2 bg-slate-600 text-white font-bold px-4 py-2 rounded opacity-50 cursor-not-allowed"
                              disabled
                           >
                              <BluetoothOff className="w-4 h-4" />
                              Device Offline
                           </button>
                        </>
                     )}
                  </div>
               )}

               {activeTab === "name" && (
                  <div className="mb-6">
                     <label className="block text-gray-300 text-sm font-bold mb-2">Device Name</label>
                     <input
                        type="text"
                        className="w-full rounded bg-slate-700 text-white border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        placeholder="Enter device name"
                        autoComplete="off"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                     />
                  </div>
               )}

               {activeTab === "name" && (
                  <div className="flex items-center justify-between mt-10">
                     <button
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
                        onClick={onClose}
                     >
                        <XCircle className="w-4 h-4" /> Cancel
                     </button>
                     <button
                        disabled={loading || !name}
                        className="bg-slate-600 hover:bg-slate-500 text-white font-bold px-4 py-2 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        onClick={() => handleSubmit("name")}
                     >
                        {loading ? "Saving..." : "Change Name"}
                     </button>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default DevicePopup;