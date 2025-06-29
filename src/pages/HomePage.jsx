import { Dumbbell, History, Laptop, Wifi } from "lucide-react"
import { useEffect } from "react"
import { Link } from "react-router-dom"
import { checkAuth, getToken } from "../actions/creds"
import ExerciseCard from "../components/ExerciseCard"

const HomePage = () => {

   useEffect(() => {
      const isAuth = checkAuth()
      console.log(getToken())
      if (!isAuth) {
         window.location.href = "/"
      }
   }, [])

   const exercises = [
      {
         title: "Pushups",
         description:
            "Build upper body strength with this classic exercise that targets your chest, shoulders, and triceps.",
         icon: () => <img src="icon/pushupWhite.svg" alt="icon"></img>,
         to: "/exercises/pushup",
      },
      {
         title: "Situps",
         description: "Strengthen your core and abdominal muscles with this fundamental exercise.",
         icon: () => <img src="icon/situpWhite.svg" alt="icon"></img>,
         to: "/exercises/situp",
      },
      {
         title: "Squats",
         description: "Work your lower body with this powerful exercise that targets your quads, hamstrings, and glutes.",
         icon: () => <img src="icon/squatWhite.svg" alt="icon"></img>,
         to: "/exercises/squat",
      },
      {
         title: "Punches",
         description: "Enhance your upper body coordination and burn calories with boxing-inspired movements.",
         icon: () => <img src="icon/punchWhite.svg" alt="icon"></img>,
         to: "/exercises/punch",
      },
      {
         title: "Connect Device",
         description: "Change your device settings and connect to your smart device.",
         icon: Laptop,
         to: "/menus/device",
      },
      {
         title: "Network Manager",
         description: "Configure list of networks SSID for device to connect.",
         icon: Wifi,
         to: "/menus/wifi"
      },
      {
         title: "History",
         description: "View your workout history and track your progress over time.",
         icon: History,
         to: "/menus/history",
      },
   ]

   return (
      <div className="min-h-screen bg-gradient-to-b bg-slate-700 rounded-xl p-6">
         {/* Hero Section */}
         <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 mb-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-10 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-10 -ml-20 -mb-20"></div>

            <div className="relative z-10">
               <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-blue-100 bg-blue-900 bg-opacity-50 rounded-full">
                  Fitness Tracking System
               </div>

               <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">SICERMAT</h1>
               <p className="text-lg text-blue-300 font-light">Sistem Cerdas Monitoring Atlet Terpadu</p>

               <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-6"></div>

               <p className="mt-4 text-gray-300 max-w-2xl leading-relaxed">
                  Welcome to SICERMAT, your personal fitness companion, crafted to empower you on your fitness journey.
                  Connect a device, track your progress, and unlock a world of personalized workouts. Powered by ESP and
                  Artificial Intelligence.
               </p>

               <div className="flex flex-wrap gap-4 mt-8">
                  <Link
                     to="/menus/device"
                     className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-900/30"
                  >
                     <Laptop className="h-5 w-5" />
                     Connect Device
                  </Link>
                  <a href="#exercises" className="px-6 py-3 border border-blue-400 hover:border-blue-300 text-blue-300 hover:text-blue-200 font-medium rounded-lg transition-all duration-200 flex items-center gap-2">
                     <Dumbbell className="h-5 w-5" />
                     Start Exercise
                  </a>
               </div>
            </div>
         </div>

         {/* Exercise Library Section */}
         <div id="exercises" className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
               <div>
                  <div className="inline-block px-3 py-1 mb-3 text-xs font-semibold text-blue-100 bg-blue-900 bg-opacity-50 rounded-full">
                     Workout Collection
                  </div>
                  <h2 className="text-3xl text-white font-bold">Exercise Library</h2>
                  <p className="text-gray-400 mt-2 max-w-xl">
                     Choose an exercise from our collection to get started with your workout routine.
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {exercises.map((exercise) => (
                  <ExerciseCard
                     key={exercise.title}
                     title={exercise.title}
                     description={exercise.description}
                     icon={exercise.icon}
                     to={exercise.to}
                  />
               ))}
            </div>
         </div>

         <div>
            <p className="font-light text-gray-400 text-xs tracking-wider">Copyright &copy; 2025 SICERMAT || UNNES COMPUTER ENGINEERING 2022 || CAPSTONE TEAM 4</p>
         </div>

      </div>
   )
}

export default HomePage
