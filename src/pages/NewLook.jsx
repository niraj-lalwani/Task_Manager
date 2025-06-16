import { Plus, SquarePen, Trash2, CalendarDays, CalendarCheck, ChevronDown } from 'lucide-react';

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const tasks = [
    { date: '2025-06-13', title: 'Design UI' },
    { date: '2025-06-13', title: 'API integration' },
    { date: '2025-06-14', title: 'Bug fix' },
];

const NewLook = () => {
    const [value, setValue] = useState(new Date());

    const getTasksCountForDate = (date) => {
        const dateString = date.toISOString().split('T')[0];
        return tasks.filter(task => task.date === dateString).length;
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const count = getTasksCountForDate(date);
            return count > 0 ? (
                <div style={{ fontSize: '0.6rem', color: 'green', marginTop: 4 }}>
                    {count} task{count > 1 ? 's' : ''}
                </div>
            ) : null;
        }
    };



    const data = [
        { name: 'Completed', value: 400 },
        { name: 'Pending', value: 300 },
        { name: 'In Progress', value: 300 },
        { name: 'Overdue', value: 200 },
    ];

    const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#FF4C4C'];


    return (
        <>
            <div className='new-look-page bg-gray-900 text-white min-h-screen'>
                <div className="w-[95%] sm:w-[90%] mx-auto pt-3 min-h-screen">
                    {/* Header */}
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0 min-h-[50px]'>
                        <h1 className='text-2xl sm:text-3xl font-semibold'>Task Manager</h1>
                        <button className='bg-[#fffbfb52] text-red-500 hover:font-semibold px-4 sm:px-5 py-2 rounded-md cursor-pointer text-sm sm:text-base'>
                            Logout
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="rounded-xl p-3 sm:p-4 text-black shadow-xl shadow-white bg-[#fffbfb52] min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-90px)]">


                        {/* Desktop Layout (Grid) */}
                        <div className="hidden lg:grid grid-cols-12 gap-3 h-full">
                            {/* Left Column - Calendar Only */}
                            <div className="col-span-5 h-full">
                                <Calendar
                                    onChange={setValue}
                                    className="!h-full !w-full"
                                    value={value}
                                    tileContent={tileContent}
                                />
                            </div>

                            {/* Right Column - Tasks List */}
                            <div className="col-span-7 border border-white rounded-md flex flex-col">
                                <div className="p-3 border-b border-white flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-white">Compeleted Tasks</h3>
                                    <div className='flex gap-3'>
                                        <button className='px-4 py-[5px] rounded-md bg-green-700 text-white flex items-center justify-center gap-3'>Sync <CalendarDays size={20} /></button>
                                        <button className='px-4 py-[5px] rounded-md bg-green-700 text-white flex items-center justify-center gap-3'>Add Task <Plus size={20} /></button>
                                    </div>
                                </div>
                                <div className="flex-1 p-3 overflow-y-auto">
                                    <div className='flex   gap-4 underline text-sm mb-4'>
                                        <span className=' text-yellow-700'>All(7)</span>
                                        <span className='text-red-700'>Pending(3)</span>
                                        <span className='text-blue-700'>In Progress(3)</span>
                                        <span className='text-green-700'>Compeleted(1)</span>
                                    </div>
                                    {/* Tasks list content - this will scroll if needed */}
                                    <div className="space-y-2">
                                        {/* Add your task items here */}
                                        <div className="p-3 bg-white/10 rounded-lg text-black relative">
                                            <h4 className="font-medium"> Task Title 1</h4>
                                            <p className="text-sm opacity-80">Task Summary here</p>

                                            <div className='absolute top-3 right-3 flex gap-3 '>
                                                <CalendarCheck size={18} />
                                                <SquarePen size={18} />
                                                <Trash2 size={18} />
                                                <ChevronDown size={18} />
                                            </div>
                                        </div>

                                        {/* More tasks... */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NewLook;



