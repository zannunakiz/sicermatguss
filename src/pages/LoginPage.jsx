import { Eye, EyeOff, Lock, Mail, User, UserCircle, UserPlus } from 'lucide-react'
import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'
import { authSignIn, authSignUp } from '../actions/authActions'
import { checkAuth } from '../actions/creds'
import { useToast } from '../context/ToastContext'

const LoginPage = () => {
   const [activeTab, setActiveTab] = useState("signin")
   const [showPassword, setShowPassword] = useState(false)
   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
   const [loading, setLoading] = useState(false)

   const navigate = useNavigate()
   const toast = useToast()

   useEffect(() => {
      const isAuth = checkAuth()
      if (isAuth) {
         window.location.href = "/homepage"
      }
   }, [])

   // Form states
   const [signinForm, setSigninForm] = useState({
      email: "",
      password: "",
   })

   const [signupForm, setSignupForm] = useState({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
   })

   const handleSigninChange = (e) => {
      const { name, value } = e.target
      setSigninForm((prev) => ({
         ...prev,
         [name]: value,
      }))
   }

   const handleSignupChange = (e) => {
      const { name, value } = e.target
      setSignupForm((prev) => ({
         ...prev,
         [name]: value,
      }))
   }

   const handleSignin = async (e) => {
      e.preventDefault()
      await setLoading(true)

      const res = await authSignIn(signinForm)
      if (!res) {
         toast.error("Sign In Failed !")
         setLoading(false)
         return
      }
      await setLoading(false)
      await toast.success("Successfully Signed In!")
      navigate("/homepage")
   }

   const handleSignup = async (e) => {
      e.preventDefault();
      setLoading(true);

      // Format username (capitalize first letter)
      const formattedUsername =
         signupForm.username.charAt(0).toUpperCase() + signupForm.username.slice(1);

      // Format name to all lowercase
      const formattedName = signupForm.name.toLowerCase();

      // Password rules check
      const password = signupForm.password;
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

      if (!passwordRegex.test(password)) {
         toast.error(
            "Password must be at least 8 characters and contain a capital letter, a number, and a symbol!"
         );
         setLoading(false);
         return;
      }

      if (password !== signupForm.confirmPassword) {
         toast.error("Password and Confirm Password do not match!");
         setLoading(false);
         return;
      }

      // Strip confirmPassword & submit updated data
      const { confirmPassword, ...rest } = signupForm;
      const signUpData = {
         ...rest,
         username: formattedUsername,
         name: formattedName,
      };

      const res = await authSignUp(signUpData);
      if (res) {
         toast.success(
            "Sign Up Successful! Please check your email to verify your account."
         );
      } else {
         toast.error("Sign Up Failed!");
      }

      setLoading(false);
   };


   return (
      <div className="min-h-[92dvh] flex items-center justify-center p-4 ">

         <div className='w-screen fixed bg-gradient-to-r from-slate-900 to-slate-700  h-screen top-0 flex items-center justify-center '>
            <img src='login.gif' className='size-[400px] ' alt="login-gif" />
         </div>


         <div className="w-full max-w-md">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden !border-slate-700 border">
               {/* Logo and Header */}
               <div className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                     <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                        <UserCircle className="h-8 w-8 text-white" />
                     </div>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">SICERMAT</h1>
                  <p className="text-slate-400 text-sm">Sistem Cerdas Monitoring Atlet Terpadu</p>
               </div>

               {/* Tabs */}
               <div className="flex border-b border-slate-700 px-6">
                  <button
                     className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ease-in-out flex items-center justify-center gap-2 ${activeTab === "signin"
                        ? "text-white border-b-2 border-blue-500"
                        : "text-slate-400 hover:text-white"
                        }`}
                     onClick={() => setActiveTab("signin")}
                  >
                     <User className="h-4 w-4" />
                     Sign In
                  </button>
                  <button
                     className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ease-in-out flex items-center justify-center gap-2 ${activeTab === "signup"
                        ? "text-white border-b-2 border-blue-500"
                        : "text-slate-400 hover:text-white"
                        }`}
                     onClick={() => setActiveTab("signup")}
                  >
                     <UserPlus className="h-4 w-4" />
                     Sign Up
                  </button>
               </div>

               <div className="p-8">
                  {/* Sign In Form */}
                  {activeTab === "signin" && (
                     <form onSubmit={handleSignin} className="space-y-5">
                        <div>
                           <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                              Email
                           </label>
                           <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <Mail className="h-5 w-5 text-slate-500" />
                              </div>
                              <input
                                 type="email"
                                 id="email"
                                 autoComplete='off'
                                 name="email"
                                 value={signinForm.email}
                                 onChange={handleSigninChange}
                                 className="w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                 placeholder="Enter your email"
                                 required
                              />
                           </div>
                        </div>

                        <div>
                           <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                              Password
                           </label>
                           <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <Lock className="h-5 w-5 text-slate-500" />
                              </div>
                              <input
                                 type={showPassword ? "text" : "password"}
                                 id="password"
                                 name="password"
                                 autoComplete='new-password'
                                 value={signinForm.password}
                                 onChange={handleSigninChange}
                                 className="w-full pl-10 pr-10 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                 placeholder="Enter your password"
                                 required
                              />
                              <button
                                 type="button"
                                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                                 onClick={() => setShowPassword(!showPassword)}
                              >
                                 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                           </div>
                        </div>

                        <div className="flex items-center">
                           <div className="text-sm">
                              <a href="/forgot-mogus" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                 Forgot password?
                              </a>
                           </div>
                        </div>

                        <div className="pt-2">
                           <button
                              disabled={loading}
                              type="submit"
                              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                           >
                              {loading ? "Signing In..." : "Sign In"}
                           </button>
                        </div>
                     </form>
                  )}

                  {/* Sign Up Form */}
                  {activeTab === "signup" && (
                     <form onSubmit={handleSignup} className="space-y-5">
                        <div>
                           <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                              Full Name
                           </label>
                           <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <UserCircle className="h-5 w-5 text-slate-500" />
                              </div>
                              <input
                                 type="text"
                                 id="name"
                                 name="name"
                                 value={signupForm.name}
                                 onChange={handleSignupChange}
                                 className="w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                 placeholder="Enter your full name"
                                 required
                              />
                           </div>
                        </div>

                        <div>
                           <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1.5">
                              Username
                           </label>
                           <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <User className="h-5 w-5 text-slate-500" />
                              </div>
                              <input
                                 type="text"
                                 id="username"
                                 name="username"
                                 value={signupForm.username}
                                 onChange={handleSignupChange}
                                 className="w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                 placeholder="Choose a username"
                                 required
                              />
                           </div>
                        </div>

                        <div>
                           <label htmlFor="signup-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                              Email
                           </label>
                           <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <Mail className="h-5 w-5 text-slate-500" />
                              </div>
                              <input
                                 type="email"
                                 id="signup-email"
                                 name="email"
                                 value={signupForm.email}
                                 onChange={handleSignupChange}
                                 className="w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                 placeholder="Enter your email"
                                 required
                              />
                           </div>
                        </div>

                        <div>
                           <label htmlFor="signup-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                              Password
                           </label>
                           <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <Lock className="h-5 w-5 text-slate-500" />
                              </div>
                              <input
                                 type={showPassword ? "text" : "password"}
                                 id="signup-password"
                                 name="password"
                                 value={signupForm.password}
                                 onChange={handleSignupChange}
                                 className="w-full pl-10 pr-10 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                 placeholder="Create a password"
                                 required
                              />
                              <button
                                 type="button"
                                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                                 onClick={() => setShowPassword(!showPassword)}
                              >
                                 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                           </div>
                        </div>

                        <div>
                           <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                              Confirm Password
                           </label>
                           <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <Lock className="h-5 w-5 text-slate-500" />
                              </div>
                              <input
                                 type={showConfirmPassword ? "text" : "password"}
                                 id="confirm-password"
                                 name="confirmPassword"
                                 value={signupForm.confirmPassword}
                                 onChange={handleSignupChange}
                                 className="w-full pl-10 pr-10 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                 placeholder="Confirm your password"
                                 required
                              />
                              <button
                                 type="button"
                                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                 {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                           </div>
                        </div>

                        <div className="pt-2">
                           <button
                              disabled={loading}
                              type="submit"
                              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                           >
                              {loading ? "Signing Up..." : "Create"}
                           </button>
                        </div>
                     </form>
                  )}
               </div>

               {/* Footer */}
               <div className="px-8 py-4 bg-slate-700/90 border-t border-slate-700">
                  <p className="text-center text-sm text-slate-400">&copy; 2025 SICERMAT. All rights reserved.</p>
               </div>
            </div>
         </div>
      </div >
   )
}

export default LoginPage