import React from 'react'
import useForm from '../hooks/useForm'
import { X, Plus, RotateCcw, Save, Sparkles, Clock, CheckSquare } from 'lucide-react'

const TaskForm = ({ type, initialState, onSubmit, onCloseClick }) => {
    // Ensure initialState has a status that maps to checkbox logic
    const initialStatus = initialState.status === 'completed' ? 'completed' : 'pending';
    const initialFormData = { ...initialState, status: initialStatus };

    const [formData, setFormData, handleOnChange] = useForm(initialFormData);

    const handleStatusChange = (e) => {
        const newStatus = e.target.checked ? 'completed' : 'pending';
        setFormData(prevData => ({
            ...prevData,
            status: newStatus
        }));
    };

    return (
        <>
            <div className='fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm z-50 p-4'>
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className='w-full max-w-2xl relative'>
                    <form className='bg-white/90 backdrop-blur-xl rounded-3xl border border-purple-200/50 shadow-2xl shadow-purple-100/20 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar'> {/* Added custom-scrollbar class here */}

                        {/* Header Section with Gradient */}
                        <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 p-8 pb-12">
                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={onCloseClick}
                                className='absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 text-white/90 hover:text-white group'
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>

                            {/* Title */}
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    {type === "add" ? (
                                        <Plus size={24} className="text-white" />
                                    ) : (
                                        <Save size={24} className="text-white" />
                                    )}
                                </div>
                                <div>
                                    <h2 className='text-3xl font-bold text-white'>
                                        {type === "add" ? "Create New Task" : "Edit Task"}
                                    </h2>
                                    <p className="text-purple-100 mt-1">
                                        {type === "add" ? "Add a new task to your workflow" : "Update your task details"}
                                    </p>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-4 right-16 opacity-20">
                                <Sparkles size={16} className="text-white animate-pulse" />
                            </div>
                            <div className="absolute bottom-4 left-8 opacity-10">
                                <Sparkles size={12} className="text-white animate-pulse delay-1000" />
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="p-3 sm:p-6 md:p-8 space-y-5 md:space-y-8">
                            {/* Title and Status Row */}
                            <div className='space-y-2'>
                                <label htmlFor="task-title" className='text-sm font-semibold text-purple-800 flex items-center gap-2'>
                                    Task Title
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="task-title"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleOnChange}
                                    placeholder='Enter your task title...'
                                    className='w-full px-4 py-3 rounded-xl border border-purple-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 placeholder-purple-400'
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className='space-y-2'>
                                <label htmlFor="task-description" className='text-sm font-semibold text-purple-800'>Description</label>
                                <div className="relative">
                                    <textarea
                                        id="task-description"
                                        rows={4}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleOnChange}
                                        placeholder='Describe your task in detail...'
                                        className='w-full px-4 py-3 rounded-xl border border-purple-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 resize-none placeholder-purple-400'
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-purple-400">
                                        {formData.description?.length || 0} characters
                                    </div>
                                </div>
                            </div>
                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                <div className='space-y-2'>
                                    <label htmlFor="task-status" className='text-sm font-semibold text-purple-800 flex items-center gap-2'>
                                        Status
                                    </label>
                                    {/* Checkbox for status */}
                                    <div className="flex items-center h-[50px] px-4 rounded-xl border border-purple-200 bg-white/70 backdrop-blur-sm">
                                        <input
                                            id="task-status"
                                            type="checkbox"
                                            name="status"
                                            checked={formData.status === 'completed'}
                                            onChange={handleStatusChange}
                                            className='h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500'
                                        />
                                        <label htmlFor="task-status" className="ml-3 text-base text-purple-800 flex items-center gap-2">
                                            {formData.status === 'completed' ? (
                                                <>
                                                    <CheckSquare size={18} className="text-green-600" /> Completed
                                                </>
                                            ) : (
                                                <>
                                                    <Clock size={18} className="text-orange-500" /> Pending
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className='space-y-2'>
                                    <label htmlFor="task-summary" className='text-sm font-semibold text-purple-800'>Summary</label>
                                    <input
                                        id="task-summary"
                                        type="text"
                                        name="summary"
                                        value={formData.summary}
                                        onChange={handleOnChange}
                                        placeholder='Brief summary of your task...'
                                        className='w-full px-4 py-3 rounded-xl border border-purple-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 placeholder-purple-400'
                                    />
                                </div>
                            </div>

                            {/* Date Time Fields */}
                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                <div className='space-y-2'>
                                    <label htmlFor="start-datetime" className='text-sm font-semibold text-purple-800'>Start Date & Time</label>
                                    <input
                                        id="start-datetime"
                                        type="datetime-local"
                                        name="startDateTime"
                                        value={formData.startDateTime}
                                        onChange={handleOnChange}
                                        className='w-full px-4 py-3 rounded-xl border border-purple-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <label htmlFor="end-datetime" className='text-sm font-semibold text-purple-800'>End Date & Time</label>
                                    <input
                                        id="end-datetime"
                                        type="datetime-local"
                                        name="endDateTime"
                                        value={formData.endDateTime}
                                        onChange={handleOnChange}
                                        className='w-full px-4 py-3 rounded-xl border border-purple-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200'
                                    />
                                </div>
                            </div>


                        </div>

                        {/* Action Buttons */}
                        <div className="px-8 pb-8">
                            <div className='flex flex-col sm:flex-row gap-4 sm:justify-between'>
                                <button
                                    type="submit"
                                    className='group relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-semibold flex items-center justify-center gap-3 order-1 sm:order-none'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onSubmit(formData);
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    {type === "add" ? (
                                        <>
                                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                            Create Task
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Update Task
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className='group bg-white hover:bg-purple-50 text-purple-700 hover:text-purple-800 px-8 py-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] font-semibold flex items-center justify-center gap-3 order-2 sm:order-none'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFormData(initialFormData);
                                    }}
                                >
                                    <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                    Reset Form
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

        </>
    )
}

export default TaskForm