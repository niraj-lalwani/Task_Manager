import React from 'react'
import useForm from '../hooks/useForm'
import { X } from 'lucide-react'

const TaskForm = ({ type, initialState, onSubmit, onCloseClick }) => {
    const [formData, setFormData, handleOnChange] = useForm(initialState);

    return (
        <>
            <div className='h-full w-screen flex justify-center items-center bg-[#0000009f] absolute top-0 left-0 p-4'>
                <form className='w-full max-w-[500px] flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 md:p-7 rounded-md border shadow-lg bg-white relative max-h-[90vh] overflow-y-auto'>
                    <span onClick={onCloseClick} className='cursor-pointer absolute top-3 right-3 sm:top-4 sm:right-4 md:top-5 md:right-5 z-10 p-1 hover:bg-gray-100 rounded-full'>
                        <X strokeWidth={1.25} size={20} />
                    </span>

                    <div className='pr-8 sm:pr-10'>
                        <p className='text-lg sm:text-xl md:text-2xl font-semibold break-words'>
                            <span className="text-blue-500">{type === "add" ? "ADD" : "EDIT"}</span> TASK
                        </p>
                    </div>

                    <div className='flex flex-col gap-3 sm:gap-4'>
                        {/* Title and Status Row */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                            <div className='inputBox'>
                                <label className='label text-sm sm:text-base'>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleOnChange}
                                    placeholder='Enter Task Title'
                                    className='input w-full text-sm sm:text-base'
                                />
                            </div>
                            <div className='inputBox'>
                                <label className='label text-sm sm:text-base'>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleOnChange}
                                    className='input w-full text-sm sm:text-base'
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className='inputBox'>
                            <label className='label text-sm sm:text-base'>Summary</label>
                            <input
                                type="text"
                                name="summary"
                                value={formData.summary}
                                onChange={handleOnChange}
                                placeholder='Enter Task Summary'
                                className='input w-full text-sm sm:text-base'
                            />
                        </div>

                        {/* Date Time Fields */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                            <div className='inputBox'>
                                <label className='label text-sm sm:text-base'>Start Date-Time</label>
                                <input
                                    type="datetime-local"
                                    name="startDateTime"
                                    value={formData.startDateTime}
                                    onChange={handleOnChange}
                                    className='input w-full text-sm sm:text-base'
                                />
                            </div>
                            <div className='inputBox'>
                                <label className='label text-sm sm:text-base'>End Date-Time</label>
                                <input
                                    type="datetime-local"
                                    name="endDateTime"
                                    value={formData.endDateTime}
                                    onChange={handleOnChange}
                                    className='input w-full text-sm sm:text-base'
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className='inputBox'>
                            <label className='label text-sm sm:text-base'>Description</label>
                            <textarea
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleOnChange}
                                placeholder='Enter Task Description'
                                className='input w-full text-sm sm:text-base resize-none'
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between pt-2'>
                        <button
                            className='button bg-blue-500 w-full sm:w-auto order-1 sm:order-none text-sm sm:text-base py-2 px-4'
                            onClick={(e) => {
                                e.preventDefault();
                                onSubmit(formData);
                            }}
                        >
                            {type === "add" ? "Add" : "Edit"} Task
                        </button>
                        <button
                            className='button !text-black bg-white border-2 w-full sm:w-auto order-2 sm:order-none text-sm sm:text-base py-2 px-4'
                            onClick={(e) => {
                                e.preventDefault();
                                setFormData({ title: "", status: "pending", description: "", startDateTime: "", endDateTime: "", summary: "" })
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default TaskForm