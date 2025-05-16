import { ChevronRight } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

const ExerciseCard = ({ title, description, icon: Icon, to }) => {
   const [isHovered, setIsHovered] = useState(false)

   const getCategoryColor = (title) => {
      const lowerTitle = title.toLowerCase()

      if (["pushups", "situps"].includes(lowerTitle)) {
         return "bg-green-600" // core
      } else if (["jumps", "squats"].includes(lowerTitle)) {
         return "bg-purple-600" // stamina
      } else if (["punches"].includes(lowerTitle)) {
         return "bg-blue-600" // strength
      } else {
         return "bg-gray-600"
      }
   }

   const getCategoryLabel = (title) => {
      const lowerTitle = title.toLowerCase()

      if (["pushups", "situps"].includes(lowerTitle)) return "Core"
      if (["jumps", "squats"].includes(lowerTitle)) return "Stamina"
      if (["punches"].includes(lowerTitle)) return "Strength"
      return "Unknown"
   }

   return (
      <Link
         to={to}
         className={`block relative overflow-hidden rounded-xl transition-all duration-300 ${isHovered ? "transform scale-[1.02] shadow-xl" : "shadow-md"
            }`}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
      >
         <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>

         <div className="relative p-6">
            <div className="flex items-start mb-4">
               <div
                  className={`flex items-center justify-center p-3 rounded-lg mr-4 transition-colors duration-300 ${isHovered ? "bg-blue-600" : "bg-slate-700"
                     }`}
               >
                  <Icon className={`h-6 w-6 transition-colors duration-300 ${isHovered ? "text-white" : "text-blue-400"}`} />
               </div>
               <div>
                  <h2 className="text-xl text-white font-bold">{title}</h2>
                  <span
                     className={`inline-block px-2 py-1 mt-2 text-xs font-medium text-white rounded-full ${getCategoryColor(title)}`}
                  >
                     {title !== "Connect Device" ? getCategoryLabel(title) : "Settings"}
                  </span>
               </div>
            </div>

            <p className="text-gray-300 mb-4">{description}</p>

            <div
               className={`flex items-center transition-all duration-300 ${isHovered ? "text-blue-400 transform translate-x-2" : "text-blue-600"
                  }`}
            >
               <span className="text-sm font-medium">Start Exercise</span>
               <ChevronRight className="h-4 w-4 ml-1" />
            </div>
         </div>

         {/* Bottom indicator bar */}
         <div
            className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 ${isHovered ? "bg-blue-600" : "bg-transparent"
               }`}
         ></div>
      </Link>
   )
}

export default ExerciseCard
