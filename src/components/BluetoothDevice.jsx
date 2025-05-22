import { Bluetooth, BluetoothOff, CheckCircle2, Info, Loader2, RefreshCw, Wifi } from "lucide-react"
import { useEffect, useState } from "react"
import { usePairedDevice } from "../context/PairedDeviceContext"
import { useToast } from "../context/ToastContext"

const BluetoothDevice = () => {
   const [isBluetoothSupported, setIsBluetoothSupported] = useState(true)
   const [isScanning, setIsScanning] = useState(false)
   const [devices, setDevices] = useState([])
   const [isPairing, setIsPairing] = useState(false)
   const [pairingDeviceId, setPairingDeviceId] = useState(null)
   const [pairedDevices, setPairedDevices] = useState([])
   const [connectedDevice, setConnectedDevice] = useState(null)
   const [characteristics, setCharacteristics] = useState([])

   // Access the device context
   const { updatePairedDevice } = usePairedDevice()

   const BLE_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
   const BLE_CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8"

   const toast = useToast()

   useEffect(() => {
      checkBluetoothSupport()
   }, [])

   const checkBluetoothSupport = () => {
      if (!navigator.bluetooth) {
         setIsBluetoothSupported(false)
         toast.error("Bluetooth is not supported in this browser")
         return false
      }
      return true
   }

   const scanForDevices = async () => {
      if (!checkBluetoothSupport()) return

      try {
         setIsScanning(true)

         const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [BLE_SERVICE_UUID],
         })

         if (device) {
            const newDevice = {
               id: device.id || Math.random().toString(36).substring(7),
               name: device.name || "Unknown BLE Device",
               device: device,
            }

            setDevices((prevDevices) => {
               const exists = prevDevices.some((d) => d.id === newDevice.id)
               if (!exists) {
                  return [...prevDevices, newDevice]
               }
               return prevDevices
            })
         }
      } catch (error) {
         console.error("Error scanning for BLE devices:", error)
      } finally {
         setIsScanning(false)
      }
   }

   const connectToDevice = async (deviceInfo) => {
      try {
         setIsPairing(true)
         setPairingDeviceId(deviceInfo.id)

         const device = deviceInfo.device
         console.log("Connecting to BLE device:", device.name)

         const server = await device.gatt.connect()
         try {
            const service = await server.getPrimaryService(BLE_SERVICE_UUID)

            const chars = await service.getCharacteristics()
            setCharacteristics(chars)

            setConnectedDevice(deviceInfo)

            toast.success(`Successfully connected to ${device.name}`)

            setPairedDevices((prev) => {
               if (!prev.includes(deviceInfo.id)) {
                  return [...prev, deviceInfo.id]
               }
               return prev
            })

            updatePairedDevice({
               device_uuid: device.name,
               name: device.name,
               ssid: "dummy",
               password: "dummy",
            })
         } catch (error) {
            console.error("Error accessing BLE service:", error)
         }
      } catch (error) {
         console.error("Error connecting to BLE device:", error)
      } finally {
         setIsPairing(false)
         setPairingDeviceId(null)
      }
   }

   const sendDataToBLE = async (data) => {
      if (!connectedDevice) return

      try {
         const writeChar = characteristics.find((char) => char.properties.write || char.properties.writeWithoutResponse)

         if (!writeChar) return

         const encoder = new TextEncoder()
         const dataBuffer = encoder.encode(data)

         await writeChar.writeValue(dataBuffer)
      } catch (error) {
         console.error("Error sending data to BLE device:", error)
      }
   }

   const readDataFromBLE = async () => {
      if (!connectedDevice) return

      try {
         const readChar = characteristics.find((char) => char.properties.read)

         if (!readChar) return

         const value = await readChar.readValue()

         const decoder = new TextDecoder()
         const data = decoder.decode(value)

         return data
      } catch (error) {
         console.error("Error reading data from BLE device:", error)
      }
   }

   const disconnectDevice = async () => {
      if (!connectedDevice) return

      try {
         await connectedDevice.device.gatt.disconnect()

         setConnectedDevice(null)
         setCharacteristics([])

         setPairedDevices((prev) => prev.filter((id) => id !== connectedDevice.id))
      } catch (error) {
         console.error("Error disconnecting from BLE device:", error)
      }
   }

   return (
      <div>
         <div className="max-w-4xl mx-auto">
            <header className="mb-8">
               <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
                  <Bluetooth className="text-blue-400" size={28} />
                  Device Manager
               </h1>
               <p className="text-gray-400 mt-2">Discover and connect to nearby Bluetooth Low Energy devices</p>
            </header>

            {!isBluetoothSupported ? (
               <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden mb-6 p-6">
                  <div className="text-center text-gray-300">
                     <BluetoothOff className="mx-auto mb-4 text-gray-400" size={48} />
                     <h2 className="text-xl font-semibold mb-2">Bluetooth Not Supported</h2>
                     <p>
                        Your browser doesn't support the Web Bluetooth API. Please try using Chrome, Edge, or another compatible
                        browser.
                     </p>
                  </div>
               </div>
            ) : (
               <>
                  {/* Tips Section */}
                  <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden mb-6">
                     <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
                        <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                           <Info size={20} className="text-blue-400" />
                           Quick Tips
                        </h2>
                     </div>
                     <div className="p-6">
                        <ul className="space-y-2 text-gray-300">
                           <li className="flex items-start gap-2">
                              <span className="bg-slate-700 text-blue-400 rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                                 1
                              </span>
                              <span>Make sure Bluetooth is turned on in your device settings</span>
                           </li>
                           <li className="flex items-start gap-2">
                              <span className="bg-slate-700 text-blue-400 rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                                 2
                              </span>
                              <span>Click "Scan for Devices" to find nearby BLE devices</span>
                           </li>
                           <li className="flex items-start gap-2">
                              <span className="bg-slate-700 text-blue-400 rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                                 3
                              </span>
                              <span>Select a device from the list and click "Connect" to establish a BLE connection</span>
                           </li>
                        </ul>

                        <div className="mt-6">
                           <button
                              onClick={scanForDevices}
                              disabled={isScanning || isPairing}
                              className={`relative overflow-hidden group text-sm font-medium text-white py-2 px-4 rounded shadow transition-colors duration-300
                      ${isScanning || isPairing
                                    ? "bg-slate-600 opacity-50 cursor-not-allowed"
                                    : "bg-slate-700 hover:bg-slate-600"
                                 }`}
                           >
                              <span className="relative z-10 flex items-center gap-2">
                                 {isScanning ? (
                                    <>
                                       <Loader2 className="animate-spin" size={16} />
                                       Scanning...
                                    </>
                                 ) : (
                                    <>
                                       <RefreshCw size={16} />
                                       Scan for BLE Devices
                                    </>
                                 )}
                              </span>
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Connected Device Section */}
                  {connectedDevice && (
                     <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden mb-6">
                        <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
                           <h2 className="text-xl font-semibold text-gray-100">Connected Device</h2>
                        </div>
                        <div className="p-6">
                           <div className="flex items-center justify-between mb-4">
                              <div>
                                 <h3 className="text-lg font-medium text-gray-100">{connectedDevice.name}</h3>
                                 <p className="text-sm text-gray-400">BLE Device</p>
                              </div>
                              <div className="flex items-center gap-1 bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full">
                                 <CheckCircle2 size={12} />
                                 <span>Connected</span>
                              </div>
                           </div>

                           <div className="flex flex-wrap gap-2 mt-4">
                              <button
                                 onClick={() => readDataFromBLE()}
                                 className="text-sm font-medium text-white bg-slate-700 py-1.5 px-4 rounded shadow hover:bg-slate-600 transition-colors duration-300"
                              >
                                 Read Data
                              </button>
                              <button
                                 onClick={() => sendDataToBLE("Hello BLE Device")}
                                 className="text-sm font-medium text-white bg-slate-700 py-1.5 px-4 rounded shadow hover:bg-slate-600 transition-colors duration-300"
                              >
                                 Send Data
                              </button>
                              <button
                                 onClick={disconnectDevice}
                                 className="text-sm font-medium text-white bg-red-700 py-1.5 px-4 rounded shadow hover:bg-red-600 transition-colors duration-300"
                              >
                                 Disconnect
                              </button>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Nearby Devices Section */}
                  <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                     <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
                        <h2 className="text-xl font-semibold text-gray-100">Nearby BLE Devices</h2>
                     </div>

                     {isScanning ? (
                        <div className="px-6 py-12 flex justify-center">
                           <svg
                              className="animate-spin h-8 w-8 text-slate-500"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                           >
                              <circle
                                 className="opacity-25"
                                 cx="12"
                                 cy="12"
                                 r="10"
                                 stroke="currentColor"
                                 strokeWidth="4"
                              ></circle>
                              <path
                                 className="opacity-75"
                                 fill="currentColor"
                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                           </svg>
                        </div>
                     ) : devices.length === 0 ? (
                        <div className="px-6 py-6 text-center text-gray-400">
                           <p className="mb-4">No BLE devices found</p>
                           <button
                              onClick={scanForDevices}
                              disabled={isPairing}
                              className={`relative overflow-hidden group text-sm font-medium text-white bg-slate-700 py-1.5 px-4 rounded shadow hover:bg-slate-600 transition-colors duration-300 ${isPairing ? "opacity-50 cursor-not-allowed" : ""
                                 }`}
                           >
                              <span className="relative z-10 flex items-center gap-2">
                                 <RefreshCw size={16} />
                                 Scan Again
                              </span>
                           </button>
                        </div>
                     ) : (
                        <ul className="divide-y divide-slate-700">
                           {devices.map((device) => {
                              const isPaired = pairedDevices.includes(device.id)
                              const isCurrentlyPairing = isPairing && pairingDeviceId === device.id
                              const isConnected = connectedDevice && connectedDevice.id === device.id

                              return (
                                 <li key={device.id} className="px-6 py-4 hover:bg-slate-700 transition-colors duration-150">
                                    <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-2">
                                          <div>
                                             <h3 className="text-lg font-medium text-gray-100">{device.name}</h3>
                                             <p className="text-sm text-gray-400">BLE Device</p>
                                          </div>
                                          {isConnected && (
                                             <div className="flex items-center gap-1 bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full">
                                                <CheckCircle2 size={12} />
                                                <span>Connected</span>
                                             </div>
                                          )}
                                          {isPaired && !isConnected && (
                                             <div className="flex items-center gap-1 bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded-full">
                                                <Wifi size={12} />
                                                <span>Paired</span>
                                             </div>
                                          )}
                                       </div>
                                       <button
                                          onClick={() => connectToDevice(device)}
                                          disabled={isPairing || isConnected}
                                          className={`text-sm font-medium text-white py-1.5 px-4 rounded shadow transition-colors duration-300 ${isPairing || isConnected
                                             ? "bg-slate-600 opacity-50 cursor-not-allowed"
                                             : "bg-slate-700 hover:bg-slate-600"
                                             }`}
                                       >
                                          {isCurrentlyPairing ? (
                                             <span className="flex items-center gap-2">
                                                <Loader2 className="animate-spin" size={16} />
                                                Connecting...
                                             </span>
                                          ) : isConnected ? (
                                             "Connected"
                                          ) : (
                                             "Connect"
                                          )}
                                       </button>
                                    </div>
                                 </li>
                              )
                           })}
                        </ul>
                     )}
                  </div>
               </>
            )}
         </div>
      </div>
   )
}

export default BluetoothDevice
