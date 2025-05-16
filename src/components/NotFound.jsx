import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
   const audioRef = useRef(null);
   const [isDisco, setIsDisco] = useState(false);
   const [bgColor, setBgColor] = useState('bg-black');
   const [textColor, setTextColor] = useState('text-white');

   useEffect(() => {
      let interval;

      if (isDisco) {
         interval = setInterval(() => {
            const colors = [
               'bg-red-500', 'bg-pink-500', 'bg-yellow-400', 'bg-green-500',
               'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500'
            ];
            const textColors = [
               'text-black', 'text-white', 'text-yellow-200', 'text-pink-300',
               'text-red-100', 'text-green-100', 'text-indigo-200'
            ];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const randomText = textColors[Math.floor(Math.random() * textColors.length)];
            setBgColor(randomColor);
            setTextColor(randomText);
         }, 350);
      }

      return () => clearInterval(interval);
   }, [isDisco]);

   const handlePlay = () => {
      if (audioRef.current) {
         audioRef.current.play().catch((e) => {
            console.warn('Autoplay blocked:', e);
         });
      }
      setIsDisco(true);
   };

   return (
      <div className={`fixed inset-0 z-[2000] ${bgColor} ${textColor} flex flex-col items-center justify-center text-center px-6 transition-colors duration-100 ${isDisco ? 'animate-[shake_0.3s_infinite]' : ''}`}>

         {isDisco &&
            [...Array(30)].map((_, i) => (
               <div
                  key={i}
                  className="absolute  h-[4px] w-12 bg-white opacity-50 animate-wind-left"
                  style={{
                     top: `${Math.random() * 100}%`,
                     left: `${Math.random() * 100}%`,
                     animationDelay: `${Math.random() * 2}s`,
                     animationDuration: `${1 + Math.random() * 2}s`,
                  }}
               />
            ))}



         <h1 className={`text-5xl font-extrabold mb-6 tracking-wide drop-shadow-lg transition-all duration-300 ${isDisco ? 'animate-bounce rotate-6 scale-110' : ''}`}>
            404 - Page Not Found
         </h1>

         <button
            onClick={handlePlay}
            className={`mb-4 px-6 py-3 rounded-xl bg-gradient-to-r from-white to-gray-300 text-black font-semibold hover:brightness-110 transition duration-300 shadow-md 
               ${isDisco ? 'animate-pulse rotate-3 scale-105' : ''}`}
         >
            🔊 Click To Vibe
         </button>

         <Link to="/" className={`relative group mt-2 overflow-hidden ${isDisco ? 'animate-[wiggle_0.5s_ease-in-out_infinite]' : ''}`}>
            <span className="relative z-10 px-8 py-3 font-bold rounded-xl border border-white overflow-hidden">
               <span className="relative z-20 group-hover:text-black transition duration-300">
                  Click to SICERMAT
               </span>
               <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-in-out z-10" />
            </span>
         </Link>

         <audio ref={audioRef} src="/audio/tripi.mp3" loop />
      </div>
   );
};

export default NotFound;
