import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Plus, SquarePen, Trash2 } from 'lucide-react';
import TaskForm from '../components/TaskForm';
import { createTask, deleteTask, getUserTask, updateTask } from '../firebase/firestore';
import { toast } from 'react-toastify';

const UserDashboard = () => {

    const { user, } = useAuth();

    const [taskForm, setTaskForm] = useState({
        type: "",
        initialState: {},
        show: false,
    })
    const [userTasks, setUserTasks] = useState([]);


    const getUserTaskList = async () => {
        const taskList = await getUserTask(user.uid);
        setUserTasks(taskList);
    }






    var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
    const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

    const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
    const API_KEY = import.meta.env.VITE_API_KEY;


    const handleSyncWithGoogle = async () => {
        const gapi = window.gapi;

        await new Promise((resolve) => {
            gapi.load('client', resolve);
        });

        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
        });

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: async (tokenResponse) => {
                gapi.client.setToken(tokenResponse);

                const now = new Date();
                const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
                const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Use the user's actual time zone

                // --- SIMPLIFIED EVENT OBJECT ---
                const event = {
                    summary: 'Test Event from App', // Required
                    // description: 'This is a test event.', // Optional - remove for test
                    start: {
                        dateTime: now.toISOString(),
                        timeZone: localTimeZone, // Use the user's timezone
                    },
                    end: {
                        dateTime: oneHourLater.toISOString(),
                        timeZone: localTimeZone, // Use the user's timezone
                    },
                    // recurrence: ['RRULE:FREQ=DAILY;COUNT=2'], // Optional - remove for test
                    // attendees: [{ email: 'lpage@example.com' }], // Optional - remove for test
                    // reminders: { useDefault: true }, // Optional - use default or remove
                };

                console.log('Attempting to create event with:', event); // Log the final event object

                try {
                    const request = await gapi.client.calendar.events.insert({
                        calendarId: 'primary',
                        resource: event,
                    });
                    console.log("Event created:", request.result);
                    window.open(request.result.htmlLink, '_blank');
                    toast.success("Event added to Google Calendar!");
                } catch (err) {
                    console.error("Error creating event:", err.result?.error || err); // Log the full error for more details
                    toast.error("Failed to add event to Google Calendar.");
                }
            },
        });

        tokenClient.requestAccessToken();
    };

    const handleAddTask = async (taskData) => {
        try {
            await createTask(taskData, user.uid);
            getUserTaskList();

            toast.success("Task Added Successfully");
            setTaskForm({ ...taskForm, show: false });
        } catch (error) {
            toast.error("Task Not Added. Something went Wrong...");
            console.log("Error", error)
        }
    }

    const handleEditTask = async (updatedTaskData) => {
        try {
            await updateTask(updatedTaskData);
            getUserTaskList();
            toast.success("Task Updated Successfully");
            setTaskForm({ ...taskForm, show: false });
        } catch (error) {
            toast.error("Task Not Updated. Something went Wrong...");
            console.log("Error", error)
        }
    }


    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId);
            getUserTaskList();
            toast.success("Task Deleted Successfully");
        } catch (error) {
            toast.error("Task Not Deleted. Something went Wrong...");
            console.log("Error", error)
        }
    }


    useEffect(() => {
        getUserTaskList();

    }, []);




    return (
        <>
            <div className='w-[90%] mx-auto flex justify-between py-5'>
                <div className='flex gap-3 items-center'>
                    <figure>
                        <img
                            className='h-12 w-12 rounded-full border-1 border-blue-500 p-[1px]'
                            src={"https://lh3.googleusercontent.com/a/ACg8ocIQcz7BIdgKQjOS3sOCwV-C_6n5gPQg0jK4f7sR37nxFAhWkmc=s96-c"}
                            alt="Profile Image" />
                    </figure>
                    <p className='text-2xl font-semibold'>{user?.displayName}</p>
                </div>
                <div>
                    <div className="flex gap-2">

                        <button className="button bg-blue-500" onClick={handleSyncWithGoogle}>Sync With Google</button>
                        <button className='button bg-blue-500 flex items-center gap-3' onClick={
                            () => {
                                setTaskForm({
                                    initialState: { title: "", description: "", status: "pending" },
                                    type: 'add',
                                    onSubmit: handleAddTask,
                                    show: true,
                                })
                            }
                        }>Add Task <Plus /></button>
                    </div>
                </div>
            </div>

            <div className='w-[90%] mx-auto grid grid-cols-3 gap-5 px-3'>
                {
                    userTasks?.map(({ title, description, status, id }, index) => {
                        return <div key={id} className='p-3 rounded-md border border-gray-400 shadow-sm relative'>
                            <p className='text-sm'><span className='font-semibold'>Title: </span>{title}</p>
                            <p className='text-sm'><span className='font-semibold'>Description: </span>{description}</p>
                            <p className='text-sm'><span className='font-semibold'>Status: </span>{status}</p>

                            <div className='absolute top-3 right-3 flex gap-2'>
                                <span className='cursor-pointer hover:text-blue-500' onClick={() => {
                                    setTaskForm({
                                        type: "edit",
                                        initialState: {
                                            title, status, description, id
                                        },
                                        onSubmit: handleEditTask,
                                        show: true,

                                    })
                                }}><SquarePen size={18} /></span>
                                <span className='cursor-pointer hover:text-red-500'
                                    onClick={() => handleDeleteTask(id)}
                                ><Trash2 size={18} /></span>
                            </div>
                        </div>
                    })
                }
            </div>

            {
                taskForm.show && <TaskForm initialState={taskForm.initialState} type={taskForm.type}
                    onSubmit={taskForm.onSubmit}
                    onCloseClick={
                        () => {
                            setTaskForm({ ...taskForm, show: false });
                        }
                    } />
            }
        </>
    )
}

export default UserDashboard