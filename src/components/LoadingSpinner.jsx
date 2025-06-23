const LoadingSpinner = ({ size = "medium", text = "Loading..." }) => {
   const sizeClasses = {
      small: "w-4 h-4",
      medium: "w-8 h-8",
      large: "w-12 h-12",
   }

   return (
      <div className="flex flex-col items-center justify-center p-8">
         <div
            className={`${sizeClasses[size]} border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin`}
         ></div>
         {text && <p className="mt-4 text-slate-400">{text}</p>}
      </div>
   )
}

export default LoadingSpinner
