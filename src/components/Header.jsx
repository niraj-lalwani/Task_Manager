import React from 'react'
import { LogOut } from 'lucide-react';
import { logout } from '../firebase/auth';

const Header = () => {
    return (
        <>
            <header className=' shadow-sm py-4'>
                <div className='w-[90%] mx-auto flex justify-between items-center'>
                    <h1 className='text-4xl font-semibold'><span className='text-blue-500'>Task</span> Manager</h1>
                    <div className='flex gap-3 items-center'>
                        <button className="button bg-red-500 flex items-center gap-2" onClick={logout}> <span className='hidden md:block'>Logout</span> <LogOut strokeWidth={2} size={14} /></button>
                    </div>
                </div>
            </header>
        </>
    )
}

export default Header
