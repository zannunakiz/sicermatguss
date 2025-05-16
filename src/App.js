"use client"

import { LogOut, Menu, Wifi, WifiOff } from 'lucide-react'
import { useEffect, useRef, useState } from "react"
import { Link, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import { fetchData } from "./lib/fetchData"

import Device from "./pages/Device"
import History from "./pages/History"
import HomePage from "./pages/HomePage"
import Jump from "./pages/Jump"
import LoginPage from "./pages/LoginPage"
import Pushup from "./pages/Puhshup"
import Punch from "./pages/Punch"
import Situp from "./pages/Situp"
import Squat from "./pages/Squat"



// Create a separate component for the app content to use the useLocation hook
const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showDeviceInfo, setShowDeviceInfo] = useState(false)
  const deviceStatusRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  const deviceConnected = true

  const deviceInfo = {
    name: "Athlete Monitor X1",
    ssid: "SICERMAT_Network"
  }

  const isLoginPage = location.pathname === "/"

  function handleLogout() {
    navigate('/');
  }

  // Handle navigation to device page
  const handleManageDevice = (e) => {
    e.stopPropagation(); // Prevent the click from bubbling up
    navigate('/device');
  }

  useEffect(() => {
    function handleClickOutside(event) {
      // Check if the click is on a link or button inside the popup
      if (event.target.closest('a[href="/device"]') ||
        event.target.closest('button[data-manage-device="true"]')) {
        return;
      }

      if (deviceStatusRef.current && !deviceStatusRef.current.contains(event.target)) {
        setShowDeviceInfo(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [deviceStatusRef])

  return (
    <div className={`min-h-screen bg-slate-900`}>
      {/* Only render header and sidebar if not on login page */}
      {!isLoginPage && (
        <>
          <header className="shadow-sm py-3 fixed top-0 z-50 bg-gradient-to-r from-slate-800/80 to-slate-900 w-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              <div className="flex justify-between h-16 items-center">

                <div className="flex items-center mt-1 md:mt-0">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-md text-gray-300 border !border-slate-800 hover:bg-slate-800 focus:outline-none"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                  <Link to="/homepage" className="ml-4  text-lg md:text-2xl tracking-wide text-gray-300 font-semibold">
                    SICERMAT<span className="hidden md:inline !font-light !text-[1.2rem]"> (Sistem Cerdas Monitoring Atlet Terpadu)</span>
                  </Link>
                </div>

                <div className="flex items-center">
                  {/* Mobile Device Status (Icon Only) */}
                  <div
                    ref={deviceStatusRef}
                    className="relative md:hidden"
                    onClick={() => setShowDeviceInfo(!showDeviceInfo)}
                  >
                    <div className="p-2 rounded-full border !border-slate-700 cursor-pointer hover:bg-slate-800 mr-1">
                      {deviceConnected ? (
                        <Wifi className="h-5 w-5 text-green-500" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-red-500" />
                      )}
                    </div>

                    {/* Popup for mobile - Smaller width and right-aligned */}
                    {showDeviceInfo && (
                      <div className="absolute right-0 mt-1 w-56 bg-slate-800 border border-slate-600 rounded-md shadow-xl z-50 p-0 overflow-hidden">
                        {/* Popup Header */}
                        <div className={`p-2 ${deviceConnected ? 'bg-green-500/10' : 'bg-red-500/10'} border-b border-slate-600`}>
                          <h3 className="font-bold text-white flex items-center text-sm">
                            {deviceConnected ? (
                              <><Wifi className="h-4 w-4 mr-1.5 text-green-500" /> Device Connected</>
                            ) : (
                              <><WifiOff className="h-4 w-4 mr-1.5 text-red-500" /> Device Disconnected</>
                            )}
                          </h3>
                        </div>

                        {/* Popup Content - More compact for mobile */}
                        <div className="p-3">
                          <div className="mb-3 space-y-1.5">
                            <p className="text-gray-200 text-sm">
                              <span className="text-gray-400">Device:</span>{" "}
                              <span className="font-medium">{deviceInfo.name}</span>
                            </p>
                            <p className="text-gray-200 text-sm">
                              <span className="text-gray-400">SSID:</span>{" "}
                              <span className="font-medium">{deviceInfo.ssid}</span>
                            </p>
                          </div>

                          <Link
                            to="/device"
                            className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white py-1.5 px-3 rounded text-sm transition-colors font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Manage Device
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Desktop Device Status (With Text) - Hidden on Mobile */}
                  <div
                    className="relative hidden md:block"
                    onClick={() => setShowDeviceInfo(!showDeviceInfo)}
                  >
                    {/* Status Indicator Button */}
                    <div className="flex items-center px-3 py-2 rounded-xl border !border-slate-700 cursor-pointer hover:bg-slate-800">
                      {deviceConnected ? (
                        <Wifi className="h-5 w-5 mr-2 text-green-500" />
                      ) : (
                        <WifiOff className="h-5 w-5 mr-2 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${deviceConnected ? 'text-green-500' : 'text-red-500'}`}>
                        Device Status: {deviceConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>

                    {/* Popup for desktop */}
                    {showDeviceInfo && (
                      <div className="absolute right-0 mt-1 w-72 bg-slate-800 border border-slate-600 rounded-md shadow-xl z-50 p-0 overflow-hidden">
                        {/* Popup Header */}
                        <div className={`p-3 ${deviceConnected ? 'bg-green-500/10' : 'bg-red-500/10'} border-b border-slate-600`}>
                          <h3 className="font-bold text-white flex items-center">
                            {deviceConnected ? (
                              <><Wifi className="h-4 w-4 mr-2 text-green-500" /> Device Connected</>
                            ) : (
                              <><WifiOff className="h-4 w-4 mr-2 text-red-500" /> Device Disconnected</>
                            )}
                          </h3>
                        </div>

                        {/* Popup Content */}
                        <div className="p-4">
                          <div className="mb-4 space-y-2">
                            <p className="text-gray-200 flex justify-between">
                              <span className="text-gray-400">Device name:</span>
                              <span className="font-medium">{deviceInfo.name}</span>
                            </p>
                            <p className="text-gray-200 flex justify-between">
                              <span className="text-gray-400">SSID name:</span>
                              <span className="font-medium">{deviceInfo.ssid}</span>
                            </p>
                          </div>

                          {/* Using button instead of Link for better event handling */}
                          <button
                            data-manage-device="true"
                            onClick={handleManageDevice}
                            className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded transition-colors font-medium"
                          >
                            Manage Device
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logout Button - Hidden on Mobile */}
                  <button
                    onClick={handleLogout}
                    className="hidden md:flex px-10 py-2 rounded-xl items-center justify-center border !border-slate-700 relative overflow-hidden group ml-4"
                  >
                    {/* Background Sliding Layer */}
                    <span className="absolute inset-0 bg-slate-800 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out z-0"></span>

                    {/* Content */}
                    <span className="flex items-center text-slate-300 z-10 relative">
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </span>
                  </button>
                </div>

              </div>

            </div>
          </header>

          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        </>
      )}

      {/* Adjust main class based on whether we're on login page */}
      <main className={`${!isLoginPage ? "pt-32" : ""} max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-transparent`}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/device" element={<Device />} />
          <Route path="/history" element={<History />} />
          <Route path="/pushup" element={<Pushup fetchData={fetchData} />} />
          <Route path="/situp" element={<Situp fetchData={fetchData} />} />
          <Route path="/squat" element={<Squat fetchData={fetchData} />} />
          <Route path="/jump" element={<Jump fetchData={fetchData} />} />
          <Route path="/punch" element={<Punch fetchData={fetchData} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App