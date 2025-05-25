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
   const [wifiInputs, setWifiInputs] = useState({});
   const [showWifiModal, setShowWifiModal] = useState(false);
   const [wifiCredentials, setWifiCredentials] = useState({});
   const [connectingDevice, setConnectingDevice] = useState(null); // Untuk simpan device sementara

   // Access the device context
   const { updatePairedDevice } = usePairedDevice()

   const CUSTOM_SERVICE_UUID = "c93138c5-5259-4c29-bb5e-750f55cc9a71";
   const TX_CHARACTERISTIC_UUID = "ac38898f-55fd-4e3d-9380-dddce7d0901b";
   const RX_CHARACTERISTIC_UUID = "55145f14-e7d6-4282-add9-62134c57dc6a";

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

   const handleSendWifi = async (e) => {
      e.preventDefault();

      if (!wifiCredentials.ssid || !wifiCredentials.password) {
         toast.warn("Please enter both SSID and Password");
         return;
      }

      const { ssid, password } = wifiCredentials;
      try {
         console.log("Connecting to GATT server...");
         const server = await connectingDevice.device.gatt.connect();

         console.log("Getting service...");
         const service = await server.getPrimaryService(CUSTOM_SERVICE_UUID);

         console.log("Getting TX & RX Characteristics...");
         const txChar = await service.getCharacteristic(TX_CHARACTERISTIC_UUID);
         const rxChar = await service.getCharacteristic(RX_CHARACTERISTIC_UUID);

         // TODO: Read response dari ESP32 buat konfirm kalau cred yang dikirim udah OK
         const onCharacteristicChanged = (event) => {
            const value = event.target.value;
            const decoder = new TextDecoder();
            const response = decoder.decode(value.buffer);

            console.log(`Received response: ${response}`);

            if (response === "WIFI_OK") {
               toast.success("✅ WiFi credentials accepted by device!");

               
               console.log(JSON.stringify(connectedDevice))
               // Simpan info paired device
               setConnectedDevice({
                  id: connectingDevice.id,
                  name: connectingDevice.name
               });

               console.log(JSON.stringify(connectedDevice))

               
               console.log(JSON.stringify(pairedDevices))
               updatePairedDevice({
                  device_uuid: connectingDevice.name,
                  name: connectingDevice.name,
                  ssid,
                  password
               });
               console.log(JSON.stringify(pairedDevices))

               setShowWifiModal(false);
               setConnectingDevice(null);
            } else if (response === "WIFI_FAIL") {
               toast.error("❌ Failed to connect to WiFi. Please check credentials.");
               setShowWifiModal(true); // Tetap tampilkan form untuk input ulang
            }

            // Hapus listener setelah dapat balasan
            txChar.removeEventListener("characteristicvaluechanged", onCharacteristicChanged);
         };

         txChar.addEventListener("characteristicvaluechanged", onCharacteristicChanged);
         await txChar.startNotifications(); // Aktifkan notifikasi

         // 📤 Kirim data WiFi ke ESP32
         const encoder = new TextEncoder();
         const wifiData = JSON.stringify({ ssid, password });
         await rxChar.writeValueWithoutResponse(encoder.encode(wifiData));

         toast.normal("🔄 Waiting for ESP32 confirmation...");

      } catch (error) {
         console.error("Error sending WiFi data:", error);
         toast.error("Failed to send WiFi credentials");
      }
   };

   const scanForDevices = async () => {
      if (!checkBluetoothSupport()) return

      try {
         setIsScanning(true)

         const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [CUSTOM_SERVICE_UUID] }],
         })
         // const device = await navigator.bluetooth.requestDevice({
         //    acceptAllDevices: true,
         //    optionalServices: [BLE_SERVICE_UUID],
         // })

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
         setIsPairing(true);
         setPairingDeviceId(deviceInfo.id);

         const device = deviceInfo.device;
         console.log("Connecting to BLE device:", deviceInfo.name);

         const server = await device.gatt.connect();
         const service = await server.getPrimaryService(CUSTOM_SERVICE_UUID);
         
         const txChar = await service.getCharacteristic(TX_CHARACTERISTIC_UUID);
         const rxChar = await service.getCharacteristic(RX_CHARACTERISTIC_UUID);

         console.log(`rxChar properties: ${JSON.stringify(rxChar.properties)}`);

         // Baca UUID dari ESP32
         const value = await txChar.readValue();
         const deviceUUID = JSON.parse(new TextDecoder().decode(value)).device_uuid;

         // Simpan device sementara dan tampilkan modal WiFi
         setConnectingDevice({
            id: device.id,
            name: deviceUUID,
            device: device,
            service: service,
            rxChar: rxChar
         });

         setIsPairing(false);
         setShowWifiModal(true);

      } catch (error) {
         console.error("Error connecting to BLE device:", error);
         toast.error("Failed to connect or read device info");
         setIsPairing(false);
      }
   };

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
                     <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden mb-6 p-6">
                        <h3 className="text-lg font-medium text-gray-100">Enter WiFi Credentials</h3>
                        <form onSubmit={(e) => handleSendWifi(e, connectedDevice)} className="mt-4 space-y-3">
                           <input
                              type="text"
                              placeholder="SSID"
                              value={wifiInputs[connectedDevice.id]?.ssid || ''}
                              onChange={(e) =>
                                 setWifiInputs({
                                    ...wifiInputs,
                                    [connectedDevice.id]: {
                                       ...wifiInputs[connectedDevice.id],
                                       ssid: e.target.value
                                    }
                                 })
                              }
                              className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                              required
                           />
                           <input
                              type="password"
                              placeholder="Password"
                              value={wifiInputs[connectedDevice.id]?.password || ''}
                              onChange={(e) =>
                                 setWifiInputs({
                                    ...wifiInputs,
                                    [connectedDevice.id]: {
                                       ...wifiInputs[connectedDevice.id],
                                       password: e.target.value
                                    }
                                 })
                              }
                              className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                              required
                           />
                           <button
                              type="submit"
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                           >
                              Send WiFi Data
                           </button>
                        </form>
                     </div>
                  )}

                  {/* Send WiFi Modal */}
                  {showWifiModal && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                     <div className="bg-slate-800 rounded-lg p-6 w-[400px] shadow-xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Enter WiFi Credentials</h3>
                        <form onSubmit={handleSendWifi}>
                           <div className="mb-4">
                              <label className="block text-gray-300 text-sm mb-1">SSID</label>
                              <input
                                 type="text"
                                 required
                                 className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                                 placeholder="WiFi Name"
                                 onChange={(e) =>
                                    setWifiCredentials({ ...wifiCredentials, ssid: e.target.value })
                                 }
                              />
                           </div>
                           <div className="mb-6">
                              <label className="block text-gray-300 text-sm mb-1">Password</label>
                              <input
                                 type="password"
                                 required
                                 className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                                 placeholder="WiFi Password"
                                 onChange={(e) =>
                                    setWifiCredentials({ ...wifiCredentials, password: e.target.value })
                                 }
                              />
                           </div>
                           <div className="flex justify-end gap-3">
                              <button
                                 type="button"
                                 onClick={() => {
                                    setShowWifiModal(false);
                                    setConnectingDevice(null);
                                 }}
                                 className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded"
                              >
                                 Cancel
                              </button>
                              <button
                                 type="submit"
                                 className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
                              >
                                 Send WiFi Data
                              </button>
                           </div>
                        </form>
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
