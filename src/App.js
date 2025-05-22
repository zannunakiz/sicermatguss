import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { fetchData } from "./lib/fetchData";

import Jump from './pages/Exercises/Jump';
import Pushup from './pages/Exercises/Puhshup';
import Punch from './pages/Exercises/Punch';
import Situp from './pages/Exercises/Situp';
import Squat from './pages/Exercises/Squat';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Device from './pages/Menus/Device';
import History from './pages/Menus/History';
import WifiManager from "./pages/Menus/WifiManager";

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-slate-900">
      {!isLoginPage && <Header />}
      <main className={`${!isLoginPage ? "pt-32" : ""} max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-transparent`}>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route path="/homepage" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />

          <Route path="/menus/device" element={
            <ProtectedRoute>
              <Device />
            </ProtectedRoute>
          } />

          <Route path="/menus/wifi" element={
            <ProtectedRoute>
              <WifiManager />
            </ProtectedRoute>
          } />

          <Route path="/menus/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />

          <Route path="/exercises/pushup" element={
            <ProtectedRoute>
              <Pushup fetchData={fetchData} />
            </ProtectedRoute>
          } />

          <Route path="/exercises/situp" element={
            <ProtectedRoute>
              <Situp fetchData={fetchData} />
            </ProtectedRoute>
          } />

          <Route path="/exercises/squat" element={
            <ProtectedRoute>
              <Squat fetchData={fetchData} />
            </ProtectedRoute>
          } />

          <Route path="/exercises/jump" element={
            <ProtectedRoute>
              <Jump fetchData={fetchData} />
            </ProtectedRoute>
          } />

          <Route path="/exercises/punch" element={
            <ProtectedRoute>
              <Punch fetchData={fetchData} />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
