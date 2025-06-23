import { Bluetooth, BluetoothOff, CheckCircle2, Info, Loader2, RefreshCw, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { pairDevice } from "../actions/deviceActions";
import { usePairedDevice } from "../context/PairedDeviceContext";
import { useToast } from "../context/ToastContext";

const BluetoothDevice = () => {
   const [isBluetoothSupported, setIsBluetoothSupported] = useState(true);
   const [isScanning, setIsScanning] = useState(false);
   const [devices, setDevices] = useState([]);
   const [isPairing, setIsPairing] = useState(false);
   const [pairingDeviceId, setPairingDeviceId] = useState(null);
   const [pairedDevices, setPairedDevices] = useState([]);
   const [showWifiModal, setShowWifiModal] = useState(false);
   const [wifiCredentials, setWifiCredentials] = useState({});
   const [connectingDevice, setConnectingDevice] = useState(null);
   const [wifiTimeoutId, setWifiTimeoutId] = useState(null);

   const CUSTOM_SERVICE_UUID = "c93138c5-5259-4c29-bb5e-750f55cc9a71";
   const TX_CHARACTERISTIC_UUID = "ac38898f-55fd-4e3d-9380-dddce7d0901b";
   const RX_CHARACTERISTIC_UUID = "55145f14-e7d6-4282-add9-62134c57dc6a";

   const { updatePairedDevice } = usePairedDevice();
   const toast = useToast();

   useEffect(() => {
      checkBluetoothSupport();
   }, []);

   const checkBluetoothSupport = () => {
      if (!navigator.bluetooth) {
         setIsBluetoothSupported(false);
         toast.error("Bluetooth is not supported in this browser");
         return false;
      }
      return true;
   };

   const scanForDevices = async () => {
      if (!checkBluetoothSupport()) return;

      try {
         setIsScanning(true);

         const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [CUSTOM_SERVICE_UUID] }]
         });

         if (device) {
            const newDevice = {
               id: device.id,
               name: device.name || "Unknown BLE Device",
               device: device
            };

            setDevices((prev) => {
               const exists = prev.some((d) => d.id === newDevice.id);
               return exists ? prev : [...prev, newDevice];
            });
         }
      } catch (error) {
         console.error("Error scanning for devices:", error);
         toast.error("Failed to scan for BLE devices");
      } finally {
         setIsScanning(false);
      }
   };

   // useEffect(() => {
   //    window.pairRequest = async (deviceUuid, status) => {
   //       console.log(`[Bluetooth] Ini udah masuk script view!: ${JSON.stringify(deviceUuid)}, ${JSON.stringify(status)}`);
   //       if (connectingDevice && connectingDevice.name === deviceUuid && status) {
   //          if (wifiTimeoutId){
   //             clearTimeout(wifiTimeoutId);
   //             setWifiTimeoutId(null);
   //          }
   //          toast.success("✅ ESP32 berhasil konek ke WiFi!");
   //          console.log(`✅ ESP32 ${connectingDevice.name} berhasil konek ke WiFi!`);

   //          const status = await pairDevice({
   //             device_uuid: connectingDevice.name,
   //             name: connectingDevice.name,
   //             ssid: wifiCredentials.ssid,
   //             password: wifiCredentials.password
   //          });
   //          if (status){
   //             update
   // Device({
   //                device_uuid: connectingDevice.name,
   //                name: connectingDevice.name,
   //                ssid: wifiCredentials.ssid,
   //                password: wifiCredentials.password
   //             });

   //             setShowWifiModal(false);
   //             setConnectingDevice(null);
   //          }
   //       }
   //    };

   //    return () => {
   //       delete window.pairRequest;
   //    };
   // }, [connectingDevice, wifiCredentials]);

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

         // 🔍 Baca UUID dari ESP32
         const value = await txChar.readValue();
         const deviceUUID = JSON.parse(new TextDecoder().decode(value)).device_uuid;

         // 💡 Simpan device sementara untuk dikirim nanti
         setConnectingDevice({
            id: device.id,
            name: deviceUUID,
            device: device,
            txChar: txChar,
            rxChar: rxChar
         });

         setIsPairing(false);
         setShowWifiModal(true); // Tampilkan modal input WiFi
         toast.success(`Found device with UUID: ${deviceUUID}`);

      } catch (error) {
         console.error("Error connecting to BLE device:", error);
         toast.error("Failed to read device info");
         setIsPairing(false);
      }
   };

   // const handleSendWifi = async (e) => {
   //    e.preventDefault();

   //    if (!wifiCredentials.ssid || !wifiCredentials.password) {
   //       toast.warn("Please enter both SSID and Password");
   //       return;
   //    }

   //    const { ssid, password } = wifiCredentials;

   //    try {
   //       const { rxChar, txChar } = connectingDevice; // Ambil txChar untuk dengarkan respon

   //       // 📢 Tambahkan listener untuk menunggu respon dari ESP32
   //       const onCharacteristicChanged = (event) => {
   //          const value = event.target.value;
   //          const decoder = new TextDecoder();
   //          const response = decoder.decode(value.buffer);

   //          let parsedResponse = {};
   //          try {
   //             parsedResponse = JSON.parse(response);
   //          } catch (e) {
   //             console.error("Gagal parse respon dari ESP32", response);
   //             return;
   //          }

   //          console.log("Received response from ESP32:", parsedResponse);
   //          if (parsedResponse.status === "OK") {
   //             toast.success("✅ WiFi credentials accepted by device!");
   //             console.log("✅ WiFi credentials accepted by device!");

   //             // ✅ Update paired device di context
   //             updatePairedDevice({
   //                device_uuid: connectingDevice.name,
   //                name: connectingDevice.name,
   //                ssid,
   //                password
   //             });

   //             // 🚀 Dummy API call (ganti dengan fetch() / axios)
   //             pairDevice({ device_uuid: connectingDevice.name, ssid, password });

   //             setShowWifiModal(false);
   //             setConnectingDevice(null);

   //          } else if (parsedResponse.status === "FAIL") {
   //             console.log("Failed to connect to WiFi due to status error. Please check credentials.");
   //             toast.error("❌ Failed to connect to WiFi. Please check credentials.");
   //             setWifiCredentials({}); // Kosongkan input
   //          }

   //          // Hapus listener setelah dapat balasan
   //          txChar.removeEventListener("characteristicvaluechanged", onCharacteristicChanged);
   //       };

   //       // 🔔 Aktifkan notifikasi untuk TX Char
   //       await txChar.startNotifications();
   //       txChar.addEventListener("characteristicvaluechanged", onCharacteristicChanged);

   //       // 🔐 Kirim WiFi credentials ke ESP32
   //       const encoder = new TextEncoder();
   //       const wifiData = JSON.stringify({ ssid, password });
   //       await rxChar.writeValue(encoder.encode(wifiData));

   //       toast.info("🔄 Waiting for ESP32 confirmation...");

   //    } catch (error) {
   //       console.error("Error sending WiFi data:", error);
   //       toast.error("Failed to send WiFi credentials");
   //    }
   // };

   // BUG: Untuk listener window mungkin ngga akan mati/unmount secara langsung kalau ga kepakai.
   const handleSendWifi = async (e) => {
      e.preventDefault();
      if (!wifiCredentials.ssid || !wifiCredentials.password) {
         toast.normal("Please enter both SSID and Password");
         return;
      }

      const { ssid, password } = wifiCredentials;

      // Simpan device sementara untuk digunakan di callback
      const currentDevice = connectingDevice;

      // Definisikan window.pairRequest secara langsung
      window.pairRequest = async (deviceUuid, status) => {
         console.log(`[Bluetooth] ESP32 Respon: ${deviceUuid}, Status: ${status}`);

         if (currentDevice && currentDevice.name === deviceUuid && status) {
            toast.success("✅ ESP32 berhasil konek ke WiFi!");
            console.log("✅ ESP32 berhasil konek ke WiFi!");

            try {
               const response = await pairDevice({
                  device_uuid: currentDevice.name,
                  name: currentDevice.name,
                  ssid: ssid,
                  password: password
               });

               if (response && response.status) {
                  updatePairedDevice({
                     device_uuid: currentDevice.name,
                     name: currentDevice.name,
                     ssid: ssid,
                     password: password
                  });
                  setShowWifiModal(false);
                  setConnectingDevice(null);
               }
            } catch (err) {
               console.error("Gagal menyimpan pairing:", err);
               toast.error("Gagal menyimpan data perangkat");
            }
         }
      };

      const user = JSON.parse(localStorage.getItem('credentials'));

      try {
         const rxChar = currentDevice.rxChar;
         const encoder = new TextEncoder();
         const wifiData = JSON.stringify({
            ssid,
            password,
            user_uuid: user.uuid,
            coba: '🔑lorem ipsum dolor sit amet'
         });

         await rxChar.writeValue(encoder.encode(wifiData));
         toast.normal("🔄 Sending WiFi data to ESP32...");

         // Set timeout: jika tidak ada respon dalam 30 detik
         const timeoutId = setTimeout(() => {
            toast.error("⏰ No response from ESP32. Please try again.");
            setWifiCredentials({});

            // Hapus listener setelah timeout
            if (window.pairRequest) {
               delete window.pairRequest;
            }
         }, 30000); // 30 detik

         // Opsional: simpan timeout ID untuk clear nanti kalau perlu
         setWifiTimeoutId(timeoutId);

      } catch (error) {
         console.error("Error sending WiFi data:", error);
         toast.error("Failed to send WiFi credentials");
      }
   };

   return (
      <div>
         <div className="max-w-4xl mx-auto mt-10">
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
                     <p>Your browser doesn't support Web Bluetooth API</p>
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
                              <span>Make sure Bluetooth is turned on</span>
                           </li>
                           <li className="flex items-start gap-2">
                              <span className="bg-slate-700 text-blue-400 rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                                 2
                              </span>
                              <span>Click “Scan for Devices” to find nearby BLE devices</span>
                           </li>
                           <li className="flex items-start gap-2">
                              <span className="bg-slate-700 text-blue-400 rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                                 3
                              </span>
                              <span>Select a device and click “Connect”</span>
                           </li>
                        </ul>
                        <div className="mt-6">
                           <button
                              onClick={scanForDevices}
                              disabled={isScanning || isPairing}
                              className={`relative overflow-hidden group text-sm font-medium text-white py-2 px-4 rounded shadow transition-colors duration-300 ${isScanning || isPairing
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

                  {/* Modal Input WiFi */}
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
                                       setWifiCredentials((prev) => ({
                                          ...prev,
                                          ssid: e.target.value
                                       }))
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
                                       setWifiCredentials((prev) => ({
                                          ...prev,
                                          password: e.target.value
                                       }))
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
                           <p>No BLE devices found</p>
                           <button
                              onClick={scanForDevices}
                              disabled={isPairing}
                              className={`mt-4 relative overflow-hidden group text-sm font-medium text-white bg-slate-700 py-1.5 px-4 rounded shadow hover:bg-slate-600 transition-colors duration-300 ${isPairing ? "opacity-50 cursor-not-allowed" : ""
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
                              const isPaired = pairedDevices.includes(device.id);
                              const isCurrentlyPairing = isPairing && pairingDeviceId === device.id;
                              const isConnected = false; // TODO: tambahkan logika jika perlu

                              return (
                                 <li
                                    key={device.id}
                                    className="px-6 py-4 hover:bg-slate-700 transition-colors duration-150"
                                 >
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
                              );
                           })}
                        </ul>
                     )}
                  </div>
               </>
            )}
         </div>
      </div>
   );
};

export default BluetoothDevice;