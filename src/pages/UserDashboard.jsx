import React, { useEffect, useState } from 'react'
import { FcCalendar } from "react-icons/fc";
import { useAuth } from '../context/AuthContext'
import { Plus, SquarePen, Trash2, CalendarDays, CalendarCheck } from 'lucide-react';
import TaskForm from '../components/TaskForm';
import { createTask, deleteTask, getUserTask, updateTask, getUserUnsyncedTasks, } from '../firebase/firestore';
import { toast } from 'react-toastify';

const UserDashboard = () => {
    const { user, } = useAuth();

    const [taskForm, setTaskForm] = useState({
        type: "",
        initialState: {},
        show: false,
    })
    const [userTasks, setUserTasks] = useState([]);
    const [unsyncedTasks, setUnsyncedTasks] = useState([]);

    const getUserTaskList = async () => {
        const taskList = await getUserTask(user.uid);
        setUserTasks(taskList);
    }

    var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"]
    const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

    const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
    const API_KEY = import.meta.env.VITE_API_KEY;

    const getUnsyncTask = async () => {
        const result = await getUserUnsyncedTasks(user.uid);
        console.log('result: ', result);
        setUnsyncedTasks(result)
    }
    const handleSyncWithGoogle = async (unsyncedTasks) => {

        if (unsyncedTasks.length === 0) {
            toast.info("All tasks are already synced!");
            return;
        }

        const gapi = window.gapi;

        await new Promise((resolve) => gapi.load('client', resolve));

        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
        });

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: async (tokenResponse) => {
                gapi.client.setToken(tokenResponse);

                try {


                    const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                    for (const task of unsyncedTasks) {
                        const event = {
                            title: task.title || 'Untitled Task',
                            summary: task.summary || 'Untitled Task',
                            description: task.description || '',
                            start: {
                                dateTime: new Date(task.startDateTime).toISOString(),
                                timeZone: localTimeZone,
                            },
                            end: {
                                dateTime: new Date(task.endDateTime).toISOString(),
                                timeZone: localTimeZone,
                            },
                        };

                        console.log('event: ', event);
                        try {
                            const request = await gapi.client.calendar.events.insert({
                                calendarId: 'primary',
                                resource: event,
                            });
                            const googleEventId = request.result.id;

                            await updateTask({
                                ...task,
                                googleEventId,
                                linkedWithGoogleCalendar: true,
                            });

                        } catch (eventErr) {
                            console.error("Failed to sync task:", task.title, eventErr);
                        }
                    }

                    toast.success("Tasks synced with Google Calendar!");
                    await getUserTaskList(); // Refresh tasks in UI
                    await getUnsyncTask();

                } catch (err) {
                    console.error("Error syncing with Google:", err);
                    toast.error("Failed to sync tasks with Google Calendar.");
                }
            },
        });

        tokenClient.requestAccessToken();
    };
    const handleAddTask = async (taskData) => {
        try {
            await createTask(taskData, user.uid);
            getUserTaskList();
            getUnsyncTask();
            toast.success("Task Added Successfully");
            setTaskForm({ ...taskForm, show: false });
        } catch (error) {
            toast.error("Task Not Added. Something went Wrong...");
            console.log("Error", error)
        }
    }

    const updateGoogleCalendarEvent = async (task) => {
        if (!task.linkedWithGoogleCalendar) {
            return false;
        }

        const gapi = window.gapi;

        const updatedEvent = {
            title: task.title,
            summary: task.summary,
            description: task.description,
            start: {
                dateTime: new Date(task.startDateTime).toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
                dateTime: new Date(task.endDateTime).toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
        };

        try {
            const response = await gapi.client.calendar.events.update({
                calendarId: 'primary',
                eventId: task.googleEventId,
                resource: updatedEvent,
            });

            console.log('Event updated:', response.result);
            toast.success('Google Calendar event updated!');
        } catch (error) {
            console.error('Failed to update event:', error);
            toast.error('Failed to update event in Google Calendar.');
        }
    };

    const handleEditTask = async (updatedTaskData) => {
        try {
            await updateTask(updatedTaskData);
            await updateGoogleCalendarEvent(updatedTaskData)
            getUserTaskList();
            toast.success("Task Updated Successfully");
            setTaskForm({ ...taskForm, show: false });
        } catch (error) {
            toast.error("Task Not Updated. Something went Wrong...");
            console.log("Error", error)
        }
    }

    const deleteGoogleCalendarEvent = async (googleEventId) => {
        const gapi = window.gapi;

        try {
            await gapi.client.calendar.events.delete({
                calendarId: 'primary',
                eventId: googleEventId,
            });

            console.log('Event deleted');
            toast.success('Google Calendar event deleted!');
        } catch (error) {
            console.error('Failed to delete event:', error);
            toast.error('Failed to delete Google Calendar event.');
        }
    };

    const handleDeleteTask = async (taskId, linkedWithGoogleCalendar, googleEventId) => {
        try {
            await deleteTask(taskId);

            if (linkedWithGoogleCalendar && googleEventId) {
                await deleteGoogleCalendarEvent(googleEventId);
            }
            getUserTaskList();
            toast.success("Task Deleted Successfully");
        } catch (error) {
            toast.error("Task Not Deleted. Something went Wrong...");
            console.log("Error", error)
        }
    }

    useEffect(() => {
        getUserTaskList();


        getUnsyncTask()
    }, []);

    return (
        <>
            {/* Header Section */}
            <div className='hidden sm:block w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5'>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between sm:items-center">
                    <button
                        className="button bg-black  border border-black flex items-center justify-center gap-2 text-sm sm:text-base py-2 px-3 sm:px-4 order-2 sm:order-1"
                        onClick={async () => {
                            await handleSyncWithGoogle(unsyncedTasks)
                        }}
                    >
                        {unsyncedTasks.length > 0 ?
                            <CalendarDays size={20} /> :
                            <CalendarCheck size={20} />
                        }
                        <span className="hidden xs:inline">Sync With Google</span>
                        <span className="xs:hidden">Sync</span>
                    </button>

                    <button
                        className='button bg-blue-500 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base py-2 px-3 sm:px-4 order-1 sm:order-2'
                        onClick={() => {
                            setTaskForm({
                                initialState: { title: "", description: "", status: "pending", summary: "", startDateTime: "", endDateTime: "" },
                                type: 'add',
                                onSubmit: handleAddTask,
                                show: true,
                            })
                        }}
                    >
                        Add Task <Plus size={16} className="sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            {/* Tasks Grid */}
            <div className='w-full px-4 sm:px-6 lg:px-8 pb-6 mt-5 sm:mt-0'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'>
                    {userTasks?.map(({ title, description, status, id, summary, startDateTime, endDateTime, linkedWithGoogleCalendar, googleEventId }, index) => {
                        return (
                            <div key={id} className='p-3 sm:p-4 rounded-md border border-gray-400 shadow-sm relative bg-white'>
                                {/* Task Content */}
                                <div className="space-y-2 pr-16 sm:pr-20">
                                    <p className='text-xs sm:text-sm break-words'>
                                        <span className='font-semibold'>Title: </span>
                                        <span className="break-all">{title}</span>
                                    </p>
                                    <p className='text-xs sm:text-sm'>
                                        <span className='font-semibold'>Status: </span>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${status === 'completed' ? 'bg-green-100 text-green-800' :
                                            status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {status}
                                        </span>
                                    </p>
                                    {summary && (
                                        <p className='text-xs sm:text-sm break-words'>
                                            <span className='font-semibold'>Summary: </span>
                                            <span className="break-all">{summary}</span>
                                        </p>
                                    )}
                                    <p className='text-xs sm:text-sm break-words'>
                                        <span className='font-semibold'>Description: </span>
                                        <span className="break-all">{description}</span>
                                    </p>
                                    {startDateTime && (
                                        <p className='text-xs sm:text-sm'>
                                            <span className='font-semibold'>Start: </span>
                                            <span className="break-all">{new Date(startDateTime).toLocaleString()}</span>
                                        </p>
                                    )}
                                    {endDateTime && (
                                        <p className='text-xs sm:text-sm'>
                                            <span className='font-semibold'>End: </span>
                                            <span className="break-all">{new Date(endDateTime).toLocaleString()}</span>
                                        </p>
                                    )}
                                    <div className='text-xs sm:text-sm flex items-center gap-2 flex-wrap'>
                                        <span className='font-semibold'>Calendar: </span>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${linkedWithGoogleCalendar ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {linkedWithGoogleCalendar ? "Linked" : "Not Linked"}
                                        </span>
                                        {!linkedWithGoogleCalendar && (
                                            <span
                                                onClick={async () => {
                                                    await handleSyncWithGoogle([{ title, description, status, id, summary, startDateTime, endDateTime, linkedWithGoogleCalendar, googleEventId }])
                                                }}
                                                className='cursor-pointer hover:scale-110 transition-transform'
                                            >
                                                <FcCalendar className='text-lg sm:text-xl' />
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className='absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-2'>
                                    <span
                                        className='cursor-pointer hover:text-blue-500 p-1 hover:bg-blue-50 rounded transition-colors'
                                        onClick={() => {
                                            setTaskForm({
                                                type: "edit",
                                                initialState: {
                                                    title, status, description, id, startDateTime, endDateTime, linkedWithGoogleCalendar, googleEventId, summary
                                                },
                                                onSubmit: handleEditTask,
                                                show: true,
                                            })
                                        }}
                                    >
                                        <SquarePen size={16} className="sm:w-5 sm:h-5" />
                                    </span>
                                    <span
                                        className='cursor-pointer hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors'
                                        onClick={() => handleDeleteTask(id, linkedWithGoogleCalendar, googleEventId)}
                                    >
                                        <Trash2 size={16} className="sm:w-5 sm:h-5" />
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Empty State */}
                {userTasks?.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No tasks found</p>
                        <p className="text-gray-400 text-sm mt-2">Create your first task to get started</p>
                    </div>
                )}
            </div>

            {/* Task Form Modal */}
            {taskForm.show && (
                <TaskForm
                    initialState={taskForm.initialState}
                    type={taskForm.type}
                    onSubmit={taskForm.onSubmit}
                    onCloseClick={() => {
                        setTaskForm({ ...taskForm, show: false });
                    }}
                />
            )}


            {/* Fab Buttons */}
            <div className='flex flex-col gap-2 absolute bottom-5 right-5 block sm:hidden'>
                <button
                    className=" p-3 syncBtn text-white rounded-full border-blue-800"
                    onClick={async () => {
                        await handleSyncWithGoogle(unsyncedTasks)
                    }}
                >
                    {unsyncedTasks.length > 0 ?
                        <CalendarDays size={20} /> :
                        <CalendarCheck size={20} />
                    }
                </button>

                <button
                    className='bg-blue-500 rounded-full p-3 text-white text-xl'
                    onClick={() => {
                        setTaskForm({
                            initialState: { title: "", description: "", status: "pending", summary: "", startDateTime: "", endDateTime: "" },
                            type: 'add',
                            onSubmit: handleAddTask,
                            show: true,
                        })
                    }}
                >
                    <Plus size={20} className="sm:w-5 sm:h-5" />
                </button>
            </div>
        </>
    )
}

export default UserDashboard