import React from 'react'
import useForm from '../hooks/useForm'
import { X } from 'lucide-react'












const TaskForm = ({ type, initialState, onSubmit, onCloseClick }) => {


    const [formData, setFormData, handleOnChange] = useForm(initialState);

    return (
        <>
            <div className='h-screen w-screen flex justify-center items-center bg-[#0000009f]  absolute top-0 left-0'>

                <form className='w-[500px] flex flex-col gap-7 p-7 rounded-md border shadow-lg bg-white relative'>
                    <span onClick={onCloseClick} className='cursor-pointer absolute top-5 right-5'>
                        <X strokeWidth={1.25} />
                    </span>
                    <p className='text-2xl font-semibold'> <span className="text-blue-500"> {type == "add" ? "ADD" : "EDIT"}</span> TASK</p>

                    <div className='flex flex-col gap-4'>
                        <div className='inputBox'>
                            <label className='label'>Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleOnChange} placeholder='Enter Task Title' className='input' />
                        </div>
                        <div className='inputBox'>
                            <label className='label'>Status</label>
                            <select name="status" value={formData.status} onChange={handleOnChange} className='input' >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="compeleted">Compeleted</option>
                            </select>
                        </div>
                        <div className='inputBox'>
                            <label className='label'>Description</label>
                            <textarea rows={3} name="description" value={formData.description} onChange={handleOnChange} placeholder='Enter Task Description' className='input' />
                        </div>
                    </div>

                    <div className='flex justify-between'>
                        <button className='button bg-blue-500'
                            onClick={(e) => {
                                e.preventDefault();
                                onSubmit(formData);
                            }}
                        >{type == "add" ? "Add" : "Edit"} Task
                        </button>
                        <button className='button !text-black bg-white border-2' onClick={(e) => {
                            e.preventDefault();
                            setFormData({title:"",status:"pending",description:""})
                        }}>Reset</button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default TaskForm