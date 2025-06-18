import React, { useState } from 'react';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../firebase/auth'; // Assuming correct path
import useForm from '../hooks/useForm'; // Assuming correct path and hook functionality
import { useAuth } from '../context/AuthContext'; // Assuming correct path and context functionality

const AuthForm = ({ onSubmit = () => { }, title = "In" }) => {
    // State for form data, managed by a custom hook (useForm)
    const [formData, setFormData, handleOnChange] = useForm({ email: "", password: "" });

    // Access authentication context
    const { setUserData } = useAuth();

    // Function to handle Google login
    const handleGoogleLogin = async () => {
        try {
            const { uid, googleAccessToken } = await loginWithGoogle();
            setUserData(uid); // Set user data in context
            localStorage.setItem("accessToken", googleAccessToken); // Store access token
        } catch (err) {
            console.log('Error during Google login: ', err); // Log error for debugging
            // You might want to display a user-friendly error message here
        }
    };

    const navigate = useNavigate(); // Hook for navigation

    return (
        <div className='h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 relative flex items-center justify-center p-4'>
            {/* Animated Background Elements - These create the blurred, pulsing shapes */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-indigo-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-100/20 to-indigo-100/20 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>

            {/* Auth Card - The main white translucent container for the form */}
            <div className='relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl border border-purple-200/50 shadow-2xl shadow-purple-100/20'>
                {/* Header Section of the Auth Card */}
                <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-6">
                    {/* Background decoration for the header */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/90 to-indigo-500/90"></div>
                    <div className="absolute top-4 right-6 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute bottom-4 left-6 w-12 h-12 bg-white/5 rounded-full blur-lg"></div>
                    {/* Sparkle icons for visual flair */}
                    <Sparkles className="absolute top-4 left-6 text-white/30 animate-pulse" size={18} />
                    <Sparkles className="absolute bottom-6 right-8 text-white/20 animate-pulse delay-1000" size={14} />

                    <div className="relative z-10"> {/* Ensures text/logo are above background decorations */}
                        {/* Logo and Title */}
                        <div className="text-center">
                            <div className="flex justify-center mb-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20">
                                    <span className="text-white font-bold text-xl">T</span> {/* Your "T" logo */}
                                </div>
                            </div>
                            <h1 className="text-xl font-bold text-white mb-1">Task Manager</h1>
                            <p className="text-purple-100 text-sm">Sign {title} to continue your journey</p>
                        </div>
                    </div>
                </div>

                {/* Form Section - Contains input fields and buttons */}
                <div className="p-6">
                    <div className='space-y-4'> {/* Adds vertical space between form elements */}
                        {/* Email Field */}
                        <div className='space-y-2'>
                            <label htmlFor="email" className='flex items-center gap-2 text-sm font-semibold text-purple-800'>
                                <Mail size={14} className="text-purple-600" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name='email'
                                value={formData.email}
                                onChange={handleOnChange}
                                placeholder='Enter your email'
                                // Tailwind classes for input styling
                                className='w-full px-4 py-2.5 bg-white/70 border border-purple-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-purple-900 placeholder-purple-400 hover:border-purple-300 backdrop-blur-sm shadow-sm hover:shadow-md'
                            />
                        </div>

                        {/* Password Field */}
                        <div className='space-y-2'>
                            <label htmlFor="password" className='flex items-center gap-2 text-sm font-semibold text-purple-800'>
                                <Lock size={14} className="text-purple-600" />
                                Password
                            </label>
                            <input
                                type="password"
                                name='password'
                                value={formData.password}
                                onChange={handleOnChange}
                                placeholder='Enter your password'
                                // Tailwind classes for input styling
                                className='w-full px-4 py-2.5 bg-white/70 border border-purple-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-purple-900 placeholder-purple-400 hover:border-purple-300 backdrop-blur-sm shadow-sm hover:shadow-md'
                            />
                        </div>

                        {/* Sign In/Up Button */}
                        <button
                            type="button"
                            onClick={() => onSubmit(formData)}
                            // Tailwind classes for button styling, including hover effects
                            className='group relative w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] font-semibold flex items-center justify-center gap-3 overflow-hidden cursor-pointer mt-6'
                        >
                            {/* Animated overlay for hover effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <div className="relative flex items-center gap-3">
                                <span className="text-base">Sign {title}</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                            </div>
                        </button>

                        {/* Divider with "or" text */}
                        <div className="flex items-center gap-4 my-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
                            <span className='text-xs text-purple-600 font-medium bg-white/50 px-2 py-1 rounded-full border border-purple-200/50'>or</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
                        </div>
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        // Tailwind classes for Google button styling
                        className='w-full px-6 py-2.5 border-2 border-purple-200/50 text-purple-800 bg-white/60 backdrop-blur-sm rounded-xl flex items-center gap-3 justify-center cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 transform hover:scale-[1.01] font-medium shadow-sm hover:shadow-lg group'
                        onClick={handleGoogleLogin}
                    >
                        {/* Google "G" icon */}
                        <div className='w-4 h-4 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform duration-300'>
                            G
                        </div>
                        <span className="text-sm">Continue with Google</span>
                    </button>

                    {/* Footer Links (Sign In/Sign Up toggle) */}
                    <div className="text-center mt-4">
                        {title === "Up" ? (
                            <p className="text-purple-600 text-xs">
                                Already have an account?
                                <button
                                    className="text-purple-700 hover:text-purple-800 underline font-semibold ml-2 transition-colors cursor-pointer hover:no-underline bg-transparent border-none"
                                    onClick={() => {
                                        navigate("/signin")
                                    }}
                                >
                                    Sign In
                                </button>
                            </p>
                        ) : (
                            <p className="text-purple-600 text-xs">
                                Don't have an account?
                                <button
                                    className="text-purple-700 hover:text-purple-800 underline font-semibold ml-2 transition-colors cursor-pointer hover:no-underline bg-transparent border-none"
                                    onClick={() => {
                                        navigate("/signup")
                                    }}
                                >
                                    Sign Up
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;