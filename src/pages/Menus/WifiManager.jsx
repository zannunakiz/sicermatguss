"use client"

import { Edit, Loader2, PlusCircle, RefreshCw, Trash2, WifiIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { getWifi } from "../../actions/wifiActions"
import WifiPopups from "../../components/WifiPopups"
import { useToast } from "../../context/ToastContext"


const WifiManager = () => {
  const [wifiNetworks, setWifiNetworks] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddPopup, setShowAddPopup] = useState(false)
  const [showEditPopup, setShowEditPopup] = useState(false)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [selectedWifi, setSelectedWifi] = useState(null)

  const toast = useToast()

  useEffect(() => {
    fetchWifiNetworks()
  }, [])

  const fetchWifiNetworks = async () => {
    setLoading(true)
    try {
      const res = await getWifi()
      if (res.success) {
        setWifiNetworks(res.wifi)
        console.log(res.wifi)
        toast.success("Successfully fetched WiFi networks")
      } else {
        toast.error("Error fetching WiFi networks")
        setWifiNetworks([])
      }
    } catch (error) {
      console.error("Error fetching WiFi networks:", error)
      toast.error("Network error while fetching WiFi networks")
      setWifiNetworks([])
    } finally {
      setLoading(false)
    }
  }

  const refreshWifiNetworks = async () => {
    setRefreshing(true)
    try {
      const res = await getWifi()
      if (res.success) {
        setWifiNetworks(res.wifi)
        toast.success("Successfully refreshed WiFi networks")
      } else {
        toast.error("Error refreshing WiFi networks")
      }
    } catch (error) {
      console.error("Error refreshing WiFi networks:", error)
      toast.error("Network error while refreshing WiFi networks")
    } finally {
      setRefreshing(false)
    }
  }

  const handleEditClick = (wifi) => {
    setSelectedWifi(wifi)
    setShowEditPopup(true)
  }

  const handleDeleteClick = (wifi) => {
    setSelectedWifi(wifi)
    setShowDeletePopup(true)
  }

  const handleAddWifi = (newWifi) => {
    setWifiNetworks([...wifiNetworks, newWifi])
    setShowAddPopup(false)
  }

  const handleEditWifi = (updatedWifi) => {
    const updatedData = {
      uuid: updatedWifi.wifi_uuid,
      ssid: updatedWifi.ssid,
      password: updatedWifi.password
    }
    const updatedNetworks = wifiNetworks.map((wifi) => (wifi.uuid === updatedWifi.wifi_uuid ? updatedData : wifi))
    setWifiNetworks(updatedNetworks)
    setShowEditPopup(false)
  }

  const handleDeleteWifi = async (uuid) => {
    const updatedNetworks = wifiNetworks.filter((wifi) => wifi.uuid !== uuid)
    setWifiNetworks(updatedNetworks)
    setShowDeletePopup(false)
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-3">
            <WifiIcon className="text-blue-400" size={28} />
            WiFi Manager
          </h1>
          <p className="text-gray-400 mt-2">Manage List of saved WiFi networks for the device to connect.</p>
        </header>

        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-slate-700 border-b border-slate-600 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-100">Saved Networks</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddPopup(true)}
                disabled={loading || refreshing}
                className="text-sm font-medium text-white bg-slate-800 py-1.5 px-3 rounded shadow hover:bg-slate-600 transition-colors duration-300 flex items-center gap-1"
              >
                <PlusCircle size={16} />
                <span className="hidden sm:inline">Add Network</span>
              </button>
              {wifiNetworks?.length > 0 && (
                <button
                  onClick={refreshWifiNetworks}
                  disabled={refreshing}
                  className={`relative overflow-hidden group text-sm font-medium text-white bg-slate-800 py-1.5 px-3 rounded shadow transition-colors duration-300 ${refreshing ? "opacity-70 cursor-not-allowed" : "hover:bg-slate-600"
                    }`}
                >
                  <span className="relative z-10 flex items-center gap-1">
                    {refreshing ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span className="hidden sm:inline">Refreshing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        <span className="hidden sm:inline">Refresh</span>
                      </>
                    )}
                  </span>
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 flex justify-center">
              <svg
                className="animate-spin h-8 w-8 text-slate-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : wifiNetworks.length === 0 ? (
            <div className="px-6 py-6 text-center text-gray-400">
              <p className="mb-4">No WiFi networks saved</p>
              <button
                disabled={loading || refreshing}
                onClick={() => setShowAddPopup(true)}
                className="relative overflow-hidden group text-sm font-medium text-white bg-slate-700 py-1.5 px-4 rounded shadow hover:bg-slate-600 transition-colors duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <PlusCircle size={16} />
                  Add Network
                </span>
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-700">
              {wifiNetworks?.map((wifi) => (
                <li key={wifi.uuid} className="px-6 py-4 hover:bg-slate-700 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-100">{wifi.ssid}</h3>
                      <p className="text-sm text-gray-400">Password: {wifi.password}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(wifi)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-slate-600 rounded transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(wifi)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-600 rounded transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Popups */}
      {showAddPopup && <WifiPopups.AddWifi onClose={() => setShowAddPopup(false)} onAdd={handleAddWifi} />}

      {showEditPopup && selectedWifi && (
        <WifiPopups.EditWifi wifi={selectedWifi} onClose={() => setShowEditPopup(false)} onEdit={handleEditWifi} />
      )}

      {showDeletePopup && selectedWifi && (
        <WifiPopups.DeleteWifi
          wifi={selectedWifi}
          onClose={() => setShowDeletePopup(false)}
          onDelete={() => handleDeleteWifi(selectedWifi.uuid)}
        />
      )}
    </div>
  )
}

export default WifiManager
