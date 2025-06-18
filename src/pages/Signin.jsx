import React from 'react'
import { X, LogIn } from 'lucide-react'
import { loginWithGoogle } from '../firebase/auth'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'; // Assuming correct path and context functionality


const Signin = () => {


    const navigate = useNavigate();
    const { setUserData } = useAuth();


    const handleGoogleLogin = async () => {
        try {
            const { uid, googleAccessToken } = await loginWithGoogle();
            setUserData(uid); // Se\t user data in context
            navigate('/user-dashboard')
            localStorage.setItem("accessToken", googleAccessToken); // Store access token
        } catch (err) {
            console.log('Error during Google login: ', err); // Log error for debugging
            // You might want to display a user-friendly error message here
        }
    };


    return (
        <>
            <div className='fixed inset-0 flex justify-center items-center  backdrop-blur-sm z-50 p-4 bg-[#d3c2e4]'>
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className='w-full max-w-md relative'>
                    <div className='bg-white/90 backdrop-blur-xl rounded-3xl border border-purple-200/50 shadow-3xl shadow-purple-100/20 overflow-hidden'>

                        {/* Header Section with Gradient */}
                        <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 p-8 pb-10">


                            {/* Logo and Title */}
                            <div className="flex flex-col items-center text-center">
                                {/* Task Manager Logo */}
                                <div className="mb-4 p-2 bg-white rounded-2xl backdrop-blur-sm">
                                    <img src="/done.png" alt="" width="100px" />
                                </div>

                                <div>
                                    <h1 className='text-3xl font-bold text-white mb-2'>
                                        Task Manager
                                    </h1>
                                    <p className="text-purple-100">
                                        Sign in to manage your tasks
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Login Content */}
                        <div className="p-8 space-y-6">
                            {/* Welcome Message */}
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-semibold text-gray-800">
                                    Welcome Back
                                </h2>
                                <p className="text-gray-600">
                                    Continue with your Google account to access your tasks
                                </p>
                            </div>

                            {/* Google Login Button */}
                            <button
                                onClick={handleGoogleLogin}
                                className='cursor-pointer group relative w-full overflow-hidden bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-800 px-6 py-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-semibold flex items-center justify-center gap-1 sm:gap-4'

                            >
                                {/* Google Logo */}
                                <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>

                                <span>Continue with Google</span>

                                <LogIn size={18} className="group-hover:translate-x-1 transition-transform duration-300" />

                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Signin