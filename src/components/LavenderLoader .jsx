import React from 'react';
import { Loader2, Sparkles } from 'lucide-react'; // Using Loader2 for a spinning effect

const LavenderLoader = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 z-50">
            {/* Animated Background Elements - Similar to AuthForm */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-indigo-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-100/20 to-indigo-100/20 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-purple-200/50 shadow-2xl shadow-purple-100/20">
                <div className="relative mb-6">
                    {/* Spinning Loader Icon */}
                    <Loader2 className="animate-spin text-purple-600" size={48} />
                    {/* Subtle Sparkles around the loader */}
                    <Sparkles className="absolute top-0 left-0 text-purple-400/50 animate-pulse" size={16} />
                    <Sparkles className="absolute bottom-0 right-0 text-indigo-400/50 animate-pulse delay-300" size={12} />
                </div>
                <h2 className="text-xl font-bold text-purple-800 mb-2">Loading...</h2>
                <p className="text-purple-600 text-sm">Please wait a moment</p>
                <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mt-4 animate-pulse"></div>
            </div>
        </div>
    );
};

export default LavenderLoader;