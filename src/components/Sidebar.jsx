import {
   ArrowDown,
   ArrowUp,
   ChevronRight,
   Dumbbell,
   Hand,
   History,
   LightbulbIcon,
   LogOut,
   WatchIcon,
   X,
   Zap,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, setIsOpen }) => {
   const location = useLocation();

   // Split into 2 sections
   const exerciseItems = [
      { name: "Pushups", path: "/pushup", icon: Dumbbell },
      { name: "Situps", path: "/situp", icon: ArrowUp },
      { name: "Squats", path: "/squat", icon: ArrowDown },
      { name: "Jumps", path: "/jump", icon: Zap },
      { name: "Punches", path: "/punch", icon: Hand },
   ];

   const menuItems = [
      { name: "Devices", path: "/device", icon: WatchIcon },
      { name: "History", path: "/history", icon: History },
   ];

   const handleLogout = () => {
      window.location.href = "/";
   };

   return (
      <div>
         {/* Overlay */}
         {isOpen && (
            <div
               className="fixed inset-0 bg-black bg-opacity-50 z-[1000]"
               onClick={() => setIsOpen(false)}
            />
         )}

         {/* Sidebar */}
         <div
            className={`fixed top-0 left-0 h-full flex flex-col w-64 bg-slate-900 text-white shadow-lg transform transition-transform duration-300 ease-in-out z-[1001] ${isOpen ? "translate-x-0" : "-translate-x-full"
               }`}
         >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
               <h2 className="text-xl font-bold text-slate-100 flex items-center">
                  <LightbulbIcon className="mr-2" />
                  Features
               </h2>
               <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-md hover:bg-slate-800"
               >
                  <X className="h-5 w-5 text-slate-300" />
               </button>
            </div>

            <nav className="p-4 flex-col justify-between flex flex-1">

               <div>

                  {/* Section: Menus */}
                  <p className="text-sm text-slate-400 mb-2 px-1 uppercase tracking-widest">Menus</p>
                  <ul className="space-y-2 mb-6">
                     {menuItems.map((item) => (
                        <li key={item.path}>
                           <Link
                              to={item.path}
                              className={`group flex items-center justify-between p-3 rounded-md transition-colors ${location.pathname === item.path
                                 ? "bg-slate-700 text-white"
                                 : "hover:bg-slate-800 text-slate-300"
                                 }`}
                              onClick={() => setIsOpen(false)}
                           >
                              <div className="flex items-center">
                                 <item.icon className="h-5 w-5 mr-3" />
                                 {item.name}
                              </div>
                              <ChevronRight className="h-4 w-4 text-blue-600 transition-transform duration-200 group-hover:translate-x-3" />
                           </Link>
                        </li>
                     ))}
                  </ul>

                  {/* Section: Exercises */}
                  <p className="text-sm text-slate-400 mb-2 px-1 uppercase tracking-widest">Exercises</p>
                  <ul className="space-y-2 ">
                     {exerciseItems.map((item) => (
                        <li key={item.path}>
                           <Link
                              to={item.path}
                              className={`group flex items-center justify-between p-3 rounded-md transition-colors ${location.pathname === item.path
                                 ? "bg-slate-700 text-white"
                                 : "hover:bg-slate-800 text-slate-300"
                                 }`}
                              onClick={() => setIsOpen(false)}
                           >
                              <div className="flex items-center">
                                 <item.icon className="h-5 w-5 mr-3" />
                                 {item.name}
                              </div>
                              <ChevronRight className="h-4 w-4 text-blue-600 transition-transform duration-200 group-hover:translate-x-3" />
                           </Link>
                        </li>
                     ))}
                  </ul>


               </div>

               {/* Logout Button */}
               <button
                  onClick={handleLogout}
                  className="mt-6 w-full py-2 rounded-xl flex items-center justify-center border !border-slate-700 relative overflow-hidden group"
               >
                  {/* Background Sliding Layer */}
                  <span className="absolute inset-0 bg-slate-800 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out z-0"></span>

                  {/* Content */}
                  <span className="flex items-center text-slate-300 z-10 relative">
                     <LogOut className="h-5 w-5 mr-3" />
                     Logout
                  </span>
               </button>
            </nav>
         </div>
      </div>
   );
};

export default Sidebar;
