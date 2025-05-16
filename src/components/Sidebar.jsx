import {
   ChevronRight,
   History,
   LightbulbIcon,
   LogOut,
   WatchIcon,
   X
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoutDialog from './LogoutDialog'; // import komponen dialog loh yaa

const Sidebar = ({ isOpen, setIsOpen }) => {
   const location = useLocation();
   const [showLogoutDialog, setShowLogoutDialog] = useState(false);

   const exerciseItems = [
      { name: 'Pushups', path: '/exercises/pushup', icon: () => <img alt='icon' className='-ml-1' src="/icon/pushupWhite.svg"></img> },
      { name: 'Situps', path: '/exercises/situp', icon: () => <img alt='icon' className='-ml-1' src="/icon/situpWhite.svg"></img> },
      { name: 'Squats', path: '/exercises/squat', icon: () => <img alt='icon' className='-ml-1' src="/icon/squatWhite.svg"></img> },
      { name: 'Jumps', path: '/exercises/jump', icon: () => <img alt='icon' className='-ml-1' src="/icon/jumpWhite.svg"></img> },
      { name: 'Punches', path: '/exercises/punch', icon: () => <img alt='icon' className='-ml-1' src="/icon/punchWhite.svg"></img> },
   ];

   const menuItems = [
      { name: 'Devices', path: '/menus/device', icon: WatchIcon },
      { name: 'History', path: '/menus/history', icon: History },
   ];

   const handleConfirmLogout = () => {
      setShowLogoutDialog(false);
      window.location.href = '/';
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
            className={`fixed top-0 left-0 h-full flex flex-col w-64 bg-slate-900 text-white shadow-lg transform transition-transform duration-300 ease-in-out z-[1001] ${isOpen ? 'translate-x-0' : '-translate-x-full'
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
                  {/* Menus */}
                  <p className="text-sm text-slate-400 mb-2 px-1 uppercase tracking-widest">Menus</p>
                  <ul className="space-y-2 mb-6">
                     {menuItems.map((item) => (
                        <li key={item.path}>
                           <Link
                              to={item.path}
                              className={`group flex items-center justify-between p-3 rounded-md transition-colors ${location.pathname === item.path
                                 ? 'bg-slate-700 text-white'
                                 : 'hover:bg-slate-800 text-slate-300'
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

                  {/* Exercises */}
                  <p className="text-sm text-slate-400 mb-2 px-1 uppercase tracking-widest">Exercises</p>
                  <ul className="space-y-2">
                     {exerciseItems.map((item) => (
                        <li key={item.path}>
                           <Link
                              to={item.path}
                              className={`group flex items-center justify-between p-3 rounded-md transition-colors ${location.pathname === item.path
                                 ? 'bg-slate-700 text-white'
                                 : 'hover:bg-slate-800 text-slate-300'
                                 }`}
                              onClick={() => setIsOpen(false)}
                           >
                              <div className="flex items-center">
                                 <div className='bor flex items-center size-6 mr-3'>{<item.icon />}</div>
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
                  onClick={() => {
                     setShowLogoutDialog(true)
                     setIsOpen(false)
                  }}
                  className="mt-6 w-full py-2 rounded-xl flex items-center justify-center border !border-slate-700 relative overflow-hidden group"
               >
                  <span className="absolute inset-0 bg-slate-800 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-in-out z-0"></span>
                  <span className="flex items-center text-slate-300 z-10 relative">
                     <LogOut className="h-5 w-5 mr-3" />
                     Logout
                  </span>
               </button>
            </nav>
         </div>

         {/* Logout Dialog */}
         <LogoutDialog
            isOpen={showLogoutDialog}
            onConfirm={handleConfirmLogout}
            onCancel={() => setShowLogoutDialog(false)}
         />
      </div>
   );
};

export default Sidebar;
