import { Route, Routes, useLocation } from "react-router-dom"
import Header from "./components/Header"
import NotFound from "./components/NotFound"
import { fetchData } from "./lib/fetchData"
import Jump from './pages/Exercises/Jump'
import Pushup from './pages/Exercises/Puhshup'
import Punch from './pages/Exercises/Punch'
import Situp from './pages/Exercises/Situp'
import Squat from './pages/Exercises/Squat'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import Device from './pages/Menus/Device'
import History from './pages/Menus/History'



const App = () => {
  const location = useLocation()
  const isLoginPage = location.pathname === "/"

  return (

    <div className={`min-h-screen bg-slate-900`}>
      {!isLoginPage && (
        <Header />
      )}
      <main className={`${!isLoginPage ? "pt-32" : ""} max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-transparent`}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/menus/device" element={<Device />} />
          <Route path="/menus/history" element={<History />} />
          <Route path="/exercises/pushup" element={<Pushup fetchData={fetchData} />} />
          <Route path="/exercises/situp" element={<Situp fetchData={fetchData} />} />
          <Route path="/exercises/squat" element={<Squat fetchData={fetchData} />} />
          <Route path="/exercises/jump" element={<Jump fetchData={fetchData} />} />
          <Route path="/exercises/punch" element={<Punch fetchData={fetchData} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>

  )
}

export default App