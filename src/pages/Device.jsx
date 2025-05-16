

import { useState } from "react"

const Device = () => {
   // State for devices list
   const [devices, setDevices] = useState([
      { id: 1, name: "Smart Thermostat", type: "Climate Control", status: "Online" },
      { id: 2, name: "Security Camera", type: "Security", status: "Offline" },
      { id: 3, name: "Smart Light", type: "Lighting", status: "Online" },
      { id: 4, name: "Smart Speaker", type: "Audio", status: "Online" },
      { id: 5, name: "Robot Vacuum", type: "Cleaning", status: "Offline" },
   ])

   // State for popup
   const [showPopup, setShowPopup] = useState(false)
   const [selectedDevice, setSelectedDevice] = useState(null)
   const [ssid, setSsid] = useState("")
   const [password, setPassword] = useState("")

   // Handle device click
   const handleDeviceClick = (device) => {
      setSelectedDevice(device)
      setShowPopup(true)
      // Reset form fields when opening popup
      setSsid("")
      setPassword("")
   }

   // Handle save button click
   const handleSave = () => {
      if (ssid.trim() === "" || password.trim() === "") {
         alert("Please enter both SSID and password")
         return
      }

      // Here you would typically send this data to your backend
      console.log("Saving configuration for device:", selectedDevice.name)
      console.log("SSID:", ssid)
      console.log("Password:", password)

      // Update the device status to "Configuring..." to provide feedback
      const updatedDevices = devices.map((device) =>
         device.id === selectedDevice.id ? { ...device, status: "Configuring..." } : device,
      )
      setDevices(updatedDevices)

      // Close the popup
      setShowPopup(false)
   }

   // Close popup
   const closePopup = () => {
      setShowPopup(false)
   }

   return (
      <div className="  p-6">
         <div className="max-w-4xl mx-auto">
            <header className="mb-8">

               <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">🔧 Device Manager</h1>

               <p className="text-gray-400 mt-2">Select a device to configure its network settings</p>
            </header>

            {/* Device List */}
            <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden ">
               <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
                  <h2 className="text-xl font-semibold text-gray-100">Available Devices</h2>
               </div>
               <ul className="divide-y divide-slate-700">
                  {devices.map((device) => (
                     <li
                        key={device.id}
                        className="px-6 py-4 hover:bg-slate-700 cursor-pointer transition-colors duration-150"
                        onClick={() => handleDeviceClick(device)}
                     >
                        <div className="flex items-center justify-between">
                           <div>
                              <h3 className="text-lg font-medium text-gray-100">{device.name}</h3>
                              <p className="text-sm text-gray-400">{device.type}</p>
                           </div>
                           <div className="flex items-center">

                              <svg
                                 className="ml-2 w-5 h-5 text-gray-500"
                                 fill="none"
                                 stroke="currentColor"
                                 viewBox="0 0 24 24"
                                 xmlns="http://www.w3.org/2000/svg"
                              >
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                              </svg>
                           </div>
                        </div>
                     </li>
                  ))}
               </ul>
            </div>
         </div>

         {/* Popup for SSID and Password */}
         {showPopup && selectedDevice && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
               <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="px-6 py-4 bg-slate-700 text-white">
                     <h3 className="text-lg font-medium">Configure {selectedDevice.name}</h3>
                  </div>

                  <div className="p-6">
                     <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="ssid">
                           WiFi Network Name (SSID)
                        </label>
                        <input
                           id="ssid"
                           type="text"
                           className="shadow appearance-none border border-slate-600 rounded w-full py-2 px-3 bg-slate-700 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                           placeholder="Enter network name"
                           value={ssid}
                           onChange={(e) => setSsid(e.target.value)}
                        />
                     </div>

                     <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                           WiFi Password
                        </label>
                        <input
                           id="password"
                           type="password"
                           className="shadow appearance-none border border-slate-600 rounded w-full py-2 px-3 bg-slate-700 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                           placeholder="Enter password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                        />
                     </div>

                     <div className="flex items-center justify-between">
                        <button
                           className="bg-red-500 hover:bg-red-600 text-gray-100 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-slate-400"
                           onClick={closePopup}
                        >
                           Cancel
                        </button>
                        <button
                           className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                           onClick={handleSave}
                        >
                           Save Configuration
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   )
}

export default Device
