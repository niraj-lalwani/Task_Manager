import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserList, getUserTask } from '../firebase/firestore'

const AdminDashboard = () => {
    const { user } = useAuth()
    const [userList, setUserList] = useState([])


    const [showDetail, setShowDetail] = useState(false)
    const [userTaskList, setUserTaskList] = useState([]);

    const setUsers = async () => {
        try {
            const result = await getUserList()
            setUserList(result)
        } catch (error) {
            console.log('error: ', error)
        }
    }


    const getUserTaskList = async (userId) => {
        
        const taskList = await getUserTask(userId);
        setUserTaskList(taskList);
    }


    useEffect(() => {
        setUsers()
    }, [])
    
    console.log('userList: ', userList);
    return (
        <div className="w-[90%] mx-auto py-6">
            <div className='flex justify-between'>
                <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
                <div>

                    {showDetail &&
                        <button className='button bg-blue-500' onClick={() => setShowDetail(false)}>Back</button>
                    }
                </div>
            </div>

            {
                !showDetail &&
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-100 text-xs text-gray-700 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Total Tasks</th>
                                <th className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {userList.map((user, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{user.totalTasks || 0}</td>
                                    <td className="px-6 py-4 space-x-2 flex gap-3">
                                        <button className="text-blue-600 hover:underline"
                                            onClick={async () => {
                                                await getUserTaskList(user.uid);
                                                setShowDetail(true);
                                            }}
                                        >View</button>
                                        {/* <button className="text-red-600 hover:underline">Delete</button> */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            }

            {
                showDetail &&
                <div className='w-[90%] mx-auto grid grid-cols-3 gap-5 px-3'>
                    {
                        userTaskList?.map(({ title, description, status, id }, index) => {
                            return <div key={id} className='p-3 rounded-md border border-gray-400 shadow-sm relative'>
                                <p className='text-sm'><span className='font-semibold'>Title: </span>{title}</p>
                                <p className='text-sm'><span className='font-semibold'>Description: </span>{description}</p>
                                <p className='text-sm'><span className='font-semibold'>Status: </span>{status}</p>


                            </div>
                        })
                    }
                </div>
            }
        </div>
    )
}

export default AdminDashboard
