import { useRef, useState, useEffect } from "react"
import { RefreshCw, Watch, Wifi } from 'lucide-react'
import { getDevices } from '../../actions/deviceActions'
import BluetoothDevice from '../../components/BluetoothDevice'
import DevicePopup from '../../components/DevicePopup'
import { usePairedDevice } from '../../context/PairedDeviceContext'
import { useToast } from '../../context/ToastContext'

const Device = () => {
   const [devices, setDevices] = useState([])
   const [showPopup, setShowPopup] = useState(false)
   const [selectedDevice, setSelectedDevice] = useState(null)
   const [loading, setLoading] = useState(false)
   const [refreshing, setRefreshing] = useState(false)
   const [refetch, setRefetch] = useState(false)
   const isFirstRender = useRef(true);
   const toast = useToast()
   const { pairedDevice } = usePairedDevice()

   useEffect(() => {
      const fetchDevices = async () => {
         if (isFirstRender.current) {
            setLoading(true);
         }
         try {
            const res = await getDevices();

            if (res.success) {
               if (isFirstRender.current) {
                  toast.success("Successfully Fetch Devices");
               }
               setDevices(res.devices || []);
            } else {
               toast.error("Error While Fetching Devices");
               setDevices([]);
            }
         } catch (error) {
            toast.error("Network Error While Fetching Devices");
            setDevices([]);
         } finally {
            if (isFirstRender.current) {
               setLoading(false);
               isFirstRender.current = false;
            }
         }
      };
      fetchDevices();
   }, [refetch]);

   const fetchDevices = async () => {
      setRefreshing(true)
      try {
         const res = await getDevices()
         if (res.success) {
            toast.success("Successfully Fetch Devices")
            setDevices(res.devices || [])
         } else {
            toast.error("Error While Fetching Devices")
            setDevices([])
         }
      } catch (error) {
         toast.error("Network Error While Fetching Devices")
         setDevices([])
      } finally {
         setRefreshing(false)
      }
   }

   const handleDeviceClick = (device) => {
      setSelectedDevice(device)
      setShowPopup(true)
   }

   const closePopup = () => {
      setShowPopup(false)
   }

   return (
      <div className="p-6">
         <div className="max-w-4xl mx-auto ">
            <header className="mb-8">
               <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">🔧 Device Manager</h1>
               <p className="text-gray-400 mt-2">Select a device to configure its network settings</p>
            </header>

            <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
               <div className="px-6 py-4 bg-slate-700 border-b border-slate-600 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-100 flex items-center"><Watch className='mr-2' />Available Devices</h2>
                  {devices.length > 0 && (
                     <button
                        onClick={() => fetchDevices()}
                        disabled={refreshing}
                        className={`relative overflow-hidden group text-sm font-medium text-white bg-slate-800 py-1.5 px-4 rounded shadow transition-colors duration-300 ${refreshing ? 'opacity-70 cursor-not-allowed' : ''
                           }`}
                     >
                        <span className="absolute inset-0 bg-slate-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />
                        <span className="relative z-10 flex items-center gap-2">
                           {refreshing ? (
                              <>
                                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 Refreshing...
                              </>
                           ) : (
                              <>
                                 <RefreshCw size={16} />
                                 Refresh
                              </>
                           )}
                        </span>
                     </button>
                  )}
               </div>

               {loading ? (
                  <div className="px-6 py-12 flex justify-center">
                     <svg className="animate-spin h-8 w-8 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                  </div>
               ) : devices.length === 0 ? (
                  <div className="px-6 py-6 text-center text-gray-400">
                     <p className="mb-4">No devices detected</p>
                     <button
                        onClick={() => fetchDevices()}
                        disabled={refreshing}
                        className={`relative overflow-hidden group text-sm font-medium text-white bg-slate-800 py-1.5 px-4 rounded shadow transition-colors duration-300 ${refreshing ? 'opacity-70 cursor-not-allowed' : ''
                           }`}
                     >
                        <span className="absolute inset-0 bg-slate-600 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />
                        <span className="relative z-10 flex items-center gap-2">
                           {refreshing ? (
                              <>
                                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 Refreshing...
                              </>
                           ) : (
                              <>
                                 <RefreshCw size={16} />
                                 Refresh
                              </>
                           )}
                        </span>
                     </button>
                  </div>
               ) : (
                  <ul className="divide-y divide-slate-700">
                     {devices.map((device, index) => (
                        <li
                           key={index}
                           className="px-6 py-4 hover:bg-slate-700 cursor-pointer transition-colors duration-150"
                           onClick={() => handleDeviceClick(device)}
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-10">
                                 <h3 className="text-sm font-medium text-gray-100 md:text-lg">{device.name}</h3>
                                 {pairedDevice?.device_uuid === device.uuid && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-900 bg-opacity-30 px-2 py-0.5 rounded-full">
                                       <Wifi size={12} />
                                       Paired
                                    </span>
                                 )}
                              </div>


                              {device.status === "Configuring..." ? (
                                 <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">{device.status}</span>
                                    <svg className="animate-spin h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                 </div>
                              ) : (
                                 <svg
                                    className="ml-2 w-5 h-5 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                 >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                 </svg>
                              )}
                           </div>
                        </li>
                     ))}
                  </ul>
               )}



            </div>

            <BluetoothDevice />
         </div>

         {/* Device Popup Component */}
         {showPopup && selectedDevice && (
            <DevicePopup
               device={selectedDevice}
               onClose={closePopup}
               refetch={refetch}
               setRefetch={setRefetch}
            />
         )}
      </div>
   )
}

export default Device
