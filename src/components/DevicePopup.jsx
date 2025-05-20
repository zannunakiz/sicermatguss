"use client"

import {
   Edit3,
   Link2,
   Wifi,
   XCircle
} from "lucide-react"
import { useState } from "react"
import { assignWifi, pairDevice, updateDeviceName } from "../actions/deviceActions"
import { usePairedDevice } from "../context/PairedDeviceContext"
import { useToast } from "../context/ToastContext"

const DevicePopup = ({ device, onClose, refetch, setRefetch }) => {
   const [activeTab, setActiveTab] = useState("pair")
   const [ssid, setSsid] = useState("")
   const [password, setPassword] = useState("")
   const [name, setName] = useState(device?.name || "")
   const [loading, setLoading] = useState(false)
   const { updatePairedDevice } = usePairedDevice()


   const toast = useToast()

   const handleTabChange = (tab) => setActiveTab(tab)

   const handleSubmit = async (type) => {
      if ((type === "pair" || type === "wifi") && (!ssid.trim() || !password.trim())) {
         toast.error("Please enter SSID and Password")
         return
      }

      if (type === "name" && !name.trim()) {
         toast.error("Please enter a device name")
         return
      }

      setLoading(true)
      try {
         let payload = {}
         let res = false
         let device_uuid = device.uuid


         switch (type) {
            case "pair":
               payload = { device_uuid, ssid, password }
               res = await pairDevice(payload)
               if (res) {
                  updatePairedDevice({
                     device_uuid,
                     name,
                     ssid,
                     password
                  })

               }
               break
            case "wifi":
               payload = { ssid, password }
               res = await assignWifi(payload)
               break
            case "name":
               payload = { name, device_uuid }
               res = await updateDeviceName(payload)
               break
         }

         if (res) {
            toast.success(
               type === "name"
                  ? "Successfully changed device name!"
                  : type === "pair"
                     ? "Successfully paired device!"
                     : "Successfully assigned device to network!"
            )
            setRefetch(!refetch)
            onClose()
         } else {
            toast.error(
               type === "name"
                  ? "Error while changing device name!"
                  : type === "pair"
                     ? "Error while pairing device!"
                     : "Error while assigning device to network! Network Might be registered already!"
            )
         }
      } catch {
         toast.error("Network error!")
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
         <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md md:min-w-[500px]  overflow-hidden">
            <div className="px-6 py-4 bg-slate-700 text-white border-b border-slate-600">
               <h3 className="text-lg font-medium">Configure {device.name}</h3>
            </div>

            <div className="flex border-b  border-slate-600 bg-slate-700 text-white">
               {[
                  { label: "Pair Device", tab: "pair", icon: <Link2 className="w-4 h-4 mr-2" /> },
                  { label: "Assign WiFi", tab: "wifi", icon: <Wifi className="w-4 h-4 mr-2" /> },
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
               {(activeTab === "pair" || activeTab === "wifi") && (
                  <>
                     <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2">WiFi Network Name (SSID)</label>
                        <input
                           type="text"
                           autoComplete="off"
                           className="w-full rounded bg-slate-700 text-white border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                           placeholder="Enter network name"
                           value={ssid}
                           onChange={(e) => setSsid(e.target.value)}
                        />
                     </div>
                     <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-bold mb-2">WiFi Password</label>
                        <input
                           type="password"
                           className="w-full rounded bg-slate-700 text-white border border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
                           placeholder="Enter password"
                           value={password}
                           autoComplete="new-password"
                           onChange={(e) => setPassword(e.target.value)}
                        />
                     </div>
                  </>
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

               <div className="flex items-center justify-between mt-10">
                  <button
                     className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
                     onClick={onClose}
                  >
                     <XCircle className="w-4 h-4" /> Cancel
                  </button>
                  <button
                     disabled={
                        loading ||
                        (activeTab !== "name" && (!ssid || !password)) ||
                        (activeTab === "name" && !name)
                     }
                     className="bg-slate-600 hover:bg-slate-500 text-white font-bold px-4 py-2 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                     onClick={() => handleSubmit(activeTab)}
                  >
                     {loading ? "Saving..." : activeTab === "name" ? "Change Name" : activeTab === "pair" ? "Pair Device" : "Assign WiFi"}
                  </button>
               </div>
            </div>
         </div>
      </div>
   )
}

export default DevicePopup
