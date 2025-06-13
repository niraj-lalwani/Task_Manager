import React, { useEffect, useState, useRef } from 'react';
import { FcCalendar } from "react-icons/fc";
import { useAuth } from '../context/AuthContext';
import { Plus, SquarePen, Trash2, CalendarDays, CalendarCheck } from 'lucide-react';
import { toast } from 'react-toastify';
// import Joyride from 'react-joyride';

import TaskForm from '../components/TaskForm';
import {
    createTask,
    deleteTask,
    getUserTask,
    getUserUnsyncedTasks,
    updateTask,
} from '../firebase/firestore';

const DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
    "https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest"
];
const SCOPES = "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks";
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_API_KEY;

const UserDashboard = () => {
    const { user } = useAuth();

    const [taskForm, setTaskForm] = useState({ type: '', initialState: {}, show: false });
    const [userTasks, setUserTasks] = useState([]);
    const [unsyncedTasks, setUnsyncedTasks] = useState([]);
    const [runJoyride, setRunJoyride] = useState(true);
    const steps = [
        {
            target: ".my-first-step, .my-fourth-step", // Desktop + Mobile Add Task button
            content: "Click here to add a new task",
        },
        {
            target: ".my-second-step, .my-third-step", // Desktop + Mobile Sync button
            content: "Sync your tasks with Google",
        },

    ];

    const gapiClientLoaded = useRef(false);
    const tokenClient = useRef(null);

    // ------------------ GOOGLE AUTH UTILS ------------------

    const loadGoogleAPIClient = async () => {
        if (gapiClientLoaded.current) return;

        await new Promise(resolve => window.gapi.load('client', resolve));
        await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS
        });

        tokenClient.current = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse) => {
                window.gapi.client.setToken(tokenResponse);
            }
        });

        gapiClientLoaded.current = true;
    };
    const getGoogleAccessToken = async () => {
        await loadGoogleAPIClient();

        const { access_token = "" } = window?.gapi?.client?.getToken() || {};

        // If token exists, resolve immediately
        if (access_token) {
            return Promise.resolve(true);
        }

        // Otherwise, request a new token
        return new Promise((resolve, reject) => {
            tokenClient.current.callback = (tokenResponse) => {
                if (tokenResponse.error) {
                    toast.error("Google auth failed");
                    reject(tokenResponse);
                } else {
                    window.gapi.client.setToken(tokenResponse);
                    resolve(true);
                }
            };

            tokenClient.current.requestAccessToken();
        });
    };


    // ------------------ FIRESTORE TASKS ------------------

    const getUserTaskList = async () => {
        const taskList = await getUserTask(user.uid);
        setUserTasks(taskList);
    };

    const getUnsyncTask = async () => {
        const result = await getUserUnsyncedTasks(user.uid);
        setUnsyncedTasks(result);
    };

    // ------------------ CRUD TASKS ------------------

    const handleAddTask = async (taskData) => {
        try {
            await createTask(taskData, user.uid);
            toast.success("Task Added Successfully");
            await getUserTaskList();
            await getUnsyncTask();
            setTaskForm(prev => ({ ...prev, show: false }));
        } catch (error) {
            toast.error("Failed to add task.");
        }
    };

    const handleEditTask = async (updatedTask) => {
        try {
            await updateTask(updatedTask);

            if (updatedTask.linkedWithGoogleCalendar) {
                await getGoogleAccessToken();

                if (updatedTask.googleEventId) await updateGoogleCalendarEvent(updatedTask);
                if (updatedTask.googleTaskId) await updateGoogleTask(updatedTask);
            }

            toast.success("Task Updated Successfully");
            await getUserTaskList();
            setTaskForm(prev => ({ ...prev, show: false }));
        } catch (error) {
            toast.error("Failed to update task.");
        }
    };

    const handleDeleteTask = async (taskId, linked, googleEventId, googleTaskId) => {
        try {
            await deleteTask(taskId);

            if (linked) {
                await getGoogleAccessToken();
                if (googleEventId) await deleteGoogleCalendarEvent(googleEventId);
                if (googleTaskId) await deleteGoogleTask(googleTaskId);
            }

            toast.success("Task Deleted Successfully");
            await getUserTaskList();
            await getUnsyncTask();
        } catch (error) {
            toast.error("Failed to delete task.");
        }
    };

    // ------------------ SYNC TO GOOGLE ------------------

    const handleSyncWithGoogle = async (tasksToSync) => {
        if (!tasksToSync.length) {
            toast.info("All tasks are already synced!");
            return;
        }

        try {
            await getGoogleAccessToken();
            const gapi = window.gapi;
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            for (const task of tasksToSync) {
                if (task.linkedWithGoogleCalendar) continue;

                const calendarEvent = {
                    summary: task.summary || task.title,
                    description: task.description,
                    start: { dateTime: new Date(task.startDateTime).toISOString(), timeZone },
                    end: { dateTime: new Date(task.endDateTime).toISOString(), timeZone },
                };

                const taskResource = {
                    title: task.title,
                    notes: task.description,
                    due: new Date(task.startDateTime).toISOString(),
                };

                const calendarRes = await gapi.client.calendar.events.insert({ calendarId: 'primary', resource: calendarEvent });
                const tasksRes = await gapi.client.tasks.tasks.insert({ tasklist: "@default", resource: taskResource });

                await updateTask({
                    ...task,
                    linkedWithGoogleCalendar: true,
                    googleEventId: calendarRes.result.id,
                    googleTaskId: tasksRes.result.id,
                });
            }

            toast.success("Tasks synced with Google!");
            await getUserTaskList();
            await getUnsyncTask();
        } catch (err) {
            console.error("Google sync failed", err);
            toast.error("Google sync failed.");
        }
    };

    // ------------------ GOOGLE CALENDAR UTILS ------------------

    const updateGoogleCalendarEvent = async (task) => {
        const gapi = window.gapi;
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        return await gapi.client.calendar.events.update({
            calendarId: 'primary',
            eventId: task.googleEventId,
            resource: {
                summary: task.title,
                description: task.description,
                start: { dateTime: new Date(task.startDateTime).toISOString(), timeZone },
                end: { dateTime: new Date(task.endDateTime).toISOString(), timeZone },
            }
        });
    };

    const updateGoogleTask = async (task) => {
        const gapi = window.gapi;
        console.log('task.googleTaskId: ', task.googleTaskId);
        return await gapi.client.tasks.tasks.patch({
            tasklist: "@default",
            task: task.googleTaskId,
            resource: {
                title: task.title,
                notes: task.description,
                due: new Date(task.startDateTime).toISOString(),
                status: "needsAction"
            }
        });
    };

    const deleteGoogleCalendarEvent = async (eventId) => {
        return await window.gapi.client.calendar.events.delete({ calendarId: 'primary', eventId });
    };

    const deleteGoogleTask = async (taskId) => {
        return await window.gapi.client.tasks.tasks.delete({ tasklist: "@default", task: taskId });
    };

    // ------------------ LIFECYCLE ------------------

    useEffect(() => {
        getUserTaskList();
        getUnsyncTask();
        if (!localStorage.getItem('hasSeenDashboardTour')) setRunJoyride(true);
    }, []);


    const handleJoyrideCallback = (data) => {
        const { status } = data;
        if (["finished", "skipped"].includes(status)) {
            setRunJoyride(false); // End of tour
        }
    }

    // ------------------ RENDER ------------------

    return (

        <>
            {/* Header Section */}
            <div className='hidden sm:block w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5'>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between sm:items-center">
                    <button
                        className="my-second-step button bg-black border border-black flex items-center justify-center gap-2 text-sm sm:text-base py-2 px-3 sm:px-4 order-2 sm:order-1"
                        onClick={async () => {
                            await handleSyncWithGoogle(unsyncedTasks);
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
                        className='my-first-step button bg-blue-500 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base py-2 px-3 sm:px-4 order-1 sm:order-2'
                        onClick={() => {
                            setTaskForm({
                                initialState: { title: "", description: "", status: "pending", summary: "", startDateTime: "", endDateTime: "" },
                                type: 'add',
                                onSubmit: handleAddTask,
                                show: true,
                            });
                        }}
                    >
                        Add Task <Plus size={16} className="sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            {/* Tasks Grid */}
            <div className='w-full px-4 sm:px-6 lg:px-8 pb-6 mt-5 sm:mt-0'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5'>
                    {userTasks?.map(({ title, description, status, id, summary, startDateTime, endDateTime, linkedWithGoogleCalendar, googleEventId, googleTaskId }) => {
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
                                                    alert("Sync With Google")
                                                    // Sync only this specific task
                                                    await handleSyncWithGoogle([{ title, description, status, id, summary, startDateTime, endDateTime, linkedWithGoogleCalendar, googleEventId, googleTaskId }]);
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
                                                    title, status, description, id, startDateTime, endDateTime, linkedWithGoogleCalendar, googleEventId, summary, googleTaskId
                                                },
                                                onSubmit: handleEditTask,
                                                show: true,
                                            });
                                        }}
                                    >
                                        <SquarePen size={16} className="sm:w-5 sm:h-5" />
                                    </span>
                                    <span
                                        className='cursor-pointer hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors'
                                        onClick={() => handleDeleteTask(id, linkedWithGoogleCalendar, googleEventId, googleTaskId)}
                                    >
                                        <Trash2 size={16} className="sm:w-5 sm:h-5" />
                                    </span>
                                </div>
                            </div>
                        );
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


            <div className='my-third-step flex flex-col gap-2 absolute bottom-5 right-5 sm:hidden '>
                <button
                    className={`p-3 syncBtn ${unsyncedTasks.length > 0 && "animation"} text-white rounded-full border-blue-800 my-third-step`}
                    onClick={async () => {
                        await handleSyncWithGoogle(unsyncedTasks);
                    }}
                >
                    {unsyncedTasks.length > 0 ?
                        <CalendarDays size={20} /> :
                        <CalendarCheck size={20} />
                    }
                </button>

                <button
                    className='my-fourth-step bg-blue-500 rounded-full p-3 text-white text-xl'
                    onClick={() => {
                        setTaskForm({
                            initialState: { title: "", description: "", status: "pending", summary: "", startDateTime: "", endDateTime: "" },
                            type: 'add',
                            onSubmit: handleAddTask,
                            show: true,
                        });
                    }}
                >
                    <Plus size={20} className="sm:w-5 sm:h-5" />
                </button>
            </div>

            {/* <Joyride
                steps={steps}
                run={runJoyride}
                continuous
                scrollToFirstStep
                showSkipButton
                showProgress
                styles={{
                    options: {
                        zIndex: 10000,
                    },
                }}
                callback={handleJoyrideCallback}
            /> */}
        </>

    );
};

export default UserDashboard;