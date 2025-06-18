import React from 'react';
import { LogOut } from 'lucide-react';
import { logout } from '../firebase/auth';

const Header = () => {
    return (
        <header className="bg-gradient-to-r from-purple-100 via-lavender-50 to-purple-100 shadow-lg border-b-2 border-purple-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo/Title Section */}
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">T</span>
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                            Task Manager
                        </h1>
                    </div>

                    {/* User Actions Section */}
                    <div className="flex items-center space-x-4">
                        {/* Welcome Message (Optional) */}
                        <span className="hidden sm:block text-purple-700 font-medium">
                            Welcome back!
                        </span>

                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="cursor-pointer group flex items-center space-x-2 px-4 py-2 bg-white hover:bg-purple-50 text-purple-700 hover:text-purple-800 rounded-lg border border-purple-200 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;