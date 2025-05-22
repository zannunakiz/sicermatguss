"use client"

import { AlertTriangle, Wifi, X } from "lucide-react"
import { useState } from "react"
import { assignWifi, deleteWifi, updateWifi } from "../actions/wifiActions"
import { useToast } from "../context/ToastContext"

// Add WiFi Popup
const AddWifi = ({ onClose, onAdd }) => {
   const [ssid, setSsid] = useState("")
   const [password, setPassword] = useState("")
   const [loading, setLoading] = useState(false)

   const toast = useToast()

   const handleSubmit = async (e) => {
      e.preventDefault()

      if (!ssid.trim() || !password.trim()) {
         return
      }

      setLoading(true)
      try {
         const newWifiPayload = {
            ssid: ssid,
            password: password,
         }

         const res = await assignWifi(newWifiPayload)
         if (res) {
            toast.success(`Successfully added [${ssid}] SSID !`)
            onAdd(newWifiPayload)
         }
         else {
            console.log(res.message)
            toast.error(`Error While adding new Network !`)
         }
      } catch (error) {
         toast.error(`Error While adding new Network !`)
         console.error("Error adding WiFi:", error)
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
         <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-slate-700 border-b border-slate-600 flex justify-between items-center">
               <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Wifi size={18} />
                  Add WiFi Network
               </h3>
               <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-200">
                  <X size={20} />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
               <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="add-ssid">
                     Network Name (SSID)
                  </label>
                  <input
                     id="add-ssid"
                     type="text"
                     className="shadow appearance-none border border-slate-600 rounded w-full py-2 px-3 bg-slate-700 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                     placeholder="Enter network name"
                     value={ssid}
                     autoComplete="off"
                     onChange={(e) => setSsid(e.target.value)}
                     required
                  />
               </div>

               <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="add-password">
                     Password
                  </label>
                  <input
                     id="add-password"
                     autoComplete="new-password"
                     type="password"
                     className="shadow appearance-none border border-slate-600 rounded w-full py-2 px-3 bg-slate-700 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                     placeholder="Enter password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                  />
               </div>

               <div className="flex items-center justify-between">
                  <button
                     type="button"
                     className="bg-red-500 hover:bg-red-600 text-gray-100 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-slate-400"
                     onClick={onClose}
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     disabled={loading || !ssid.trim() || !password.trim()}
                     className={`bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 ${loading || !ssid.trim() || !password.trim() ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                  >
                     {loading ? "Adding..." : "Add Network"}
                  </button>
               </div>
            </form>
         </div>
      </div>
   )
}

// Edit WiFi Popup
const EditWifi = ({ wifi, onClose, onEdit }) => {
   const [ssid, setSsid] = useState(wifi.ssid)
   const [password, setPassword] = useState(wifi.password)
   const [loading, setLoading] = useState(false)

   const toast = useToast()


   const handleSubmit = async (e) => {
      e.preventDefault()

      if (!ssid.trim() || !password.trim()) {
         return
      }
      setLoading(true)

      try {
         const updatedWifiPayload = {
            wifi_uuid: wifi.uuid,
            ssid: ssid,
            password: password,
         }

         const res = await updateWifi(updatedWifiPayload)
         if (res) {
            toast.success(`Successfully updated [${ssid}] Network !`)
            onEdit(updatedWifiPayload)
         }
         else {
            console.log(res.message)
            toast.error(`Error While Updating Network !`)
         }

      } catch (error) {
         console.error("Error updating WiFi:", error)
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
         <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-slate-700 border-b border-slate-600 flex justify-between items-center">
               <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Wifi size={18} />
                  Edit WiFi Network
               </h3>
               <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-200">
                  <X size={20} />
               </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
               <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="edit-ssid">
                     Network Name (SSID)
                  </label>
                  <input
                     id="edit-ssid"
                     type="text"
                     className="shadow appearance-none border border-slate-600 rounded w-full py-2 px-3 bg-slate-700 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                     placeholder="Enter network name"
                     value={ssid}
                     onChange={(e) => setSsid(e.target.value)}
                     required
                  />
               </div>

               <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="edit-password">
                     Password
                  </label>
                  <input
                     id="edit-password"
                     type="password"
                     className="shadow appearance-none border border-slate-600 rounded w-full py-2 px-3 bg-slate-700 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                     placeholder="Enter password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                  />
               </div>

               <div className="flex items-center justify-between">
                  <button
                     type="button"
                     className="bg-red-500 hover:bg-red-600 text-gray-100 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-slate-400"
                     onClick={onClose}
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     disabled={loading || !ssid.trim() || !password.trim()}
                     className={`bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 ${loading || !ssid.trim() || !password.trim() ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                  >
                     {loading ? "Updating..." : "Update Network"}
                  </button>
               </div>
            </form>
         </div>
      </div>
   )
}

// Delete WiFi Popup
const DeleteWifi = ({ wifi, onClose, onDelete }) => {
   const [loading, setLoading] = useState(false)
   const toast = useToast()

   const handleDelete = async () => {
      setLoading(true)
      try {
         const res = await deleteWifi(wifi.uuid)
         if (res) {
            toast.success(`WiFi network [${wifi.ssid}] deleted successfully`)
            onDelete()
         }
         else {
            toast.error("Error When Deleting Wifi")
         }

      } catch (error) {
         console.error("Error deleting WiFi:", error)
      } finally {
         setLoading(false)
      }
   }

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
         <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-slate-700 border-b border-slate-600 flex justify-between items-center">
               <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-400" />
                  Delete WiFi Network
               </h3>
               <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-200">
                  <X size={20} />
               </button>
            </div>

            <div className="p-6">
               <div className="mb-6">
                  <p className="text-gray-300 mb-2">Are you sure you want to delete <strong>{wifi.ssid}</strong> WiFi network?</p>
                  <div className="bg-slate-700 p-3 rounded border border-slate-600">
                     <p className="text-white font-medium">{wifi.ssid}</p>
                  </div>
                  <p className="text-gray-400 mt-4 text-sm">This action cannot be undone.</p>
               </div>

               <div className="flex items-center justify-between">
                  <button
                     className="bg-slate-600 hover:bg-slate-500 text-gray-100 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-slate-400"
                     onClick={onClose}
                  >
                     Cancel
                  </button>
                  <button
                     disabled={loading}
                     className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded ${loading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                     onClick={handleDelete}
                  >
                     {loading ? "Deleting..." : "Delete Network"}
                  </button>
               </div>
            </div>
         </div>
      </div>
   )
}

// Export all popups as a single object
const WifiPopups = {
   AddWifi,
   EditWifi,
   DeleteWifi,
}

export default WifiPopups
