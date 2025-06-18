import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FcCalendar } from "react-icons/fc";
import { useAuth } from '../context/AuthContext';
import { Plus, SquarePen, Trash2, CalendarDays, CalendarCheck, Clock, CheckCircle2, PlayCircle, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from '../components/Header'

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
            console.log('error: ', error);
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

    // Helper function to get status icon and styling
    const getStatusDetails = (status) => {
        switch (status) {
            case 'completed':
                return {
                    icon: <CheckCircle2 size={14} />,
                    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100',
                    gradient: 'from-emerald-400 to-emerald-500'
                };
            case 'in-progress':
                return {
                    icon: <PlayCircle size={14} />,
                    className: 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100',
                    gradient: 'from-amber-400 to-amber-500'
                };
            default:
                return {
                    icon: <Clock size={14} />,
                    className: 'bg-purple-50 text-purple-700 border-purple-200 shadow-purple-100',
                    gradient: 'from-purple-400 to-purple-500'
                };
        }
    };

    // ------------------ RENDER ------------------

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-indigo-50 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 to-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-lavender-100/20 to-purple-100/20 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>

            {/* Header Section */}
            <Header />

            {/* Main Content */}
            <div className="relative z-10">
                {/* Desktop Action Bar */}
                <div className='hidden sm:block w-full px-4 sm:px-6 lg:px-8 py-6'>
                    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-purple-200/50 shadow-lg shadow-purple-100/20 p-6">
                        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                            {/* Stats Section */}
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                                        {userTasks.length}
                                    </div>
                                    <div className="text-sm text-purple-600 font-medium">Total Tasks</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                                        {userTasks.filter(task => task.status === 'completed').length}
                                    </div>
                                    <div className="text-sm text-emerald-600 font-medium">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                                        {unsyncedTasks.length}
                                    </div>
                                    <div className="text-sm text-amber-600 font-medium">Unsynced</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    className="cursor-pointer my-second-step group relative bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white flex items-center gap-3 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-medium border border-purple-500/20"
                                    onClick={async () => {
                                        await handleSyncWithGoogle(unsyncedTasks);
                                    }}
                                >
                                    <div className="relative">
                                        {unsyncedTasks.length > 0 ?
                                            <CalendarDays size={20} className="animate-pulse" /> :
                                            <CalendarCheck size={20} />
                                        }
                                        {unsyncedTasks.length > 0 && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                                        )}
                                    </div>
                                    <span>Sync With Google</span>
                                    <Sparkles size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                                </button>

                                <button
                                    className='cursor-pointer my-first-step group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white flex items-center gap-3 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-medium'
                                    onClick={() => {
                                        setTaskForm({
                                            initialState: { title: "", description: "", status: "pending", summary: "", startDateTime: "", endDateTime: "" },
                                            type: 'add',
                                            onSubmit: handleAddTask,
                                            show: true,
                                        });
                                    }}
                                >
                                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                    <span>Add New Task</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks Grid */}
                <div className='w-full px-4 sm:px-6 lg:px-8 pb-6 mt-5 sm:mt-0'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                        {userTasks?.map(({ title, description, status, id, summary, startDateTime, endDateTime, linkedWithGoogleCalendar, googleEventId, googleTaskId }) => {
                            const statusDetails = getStatusDetails(status);
                            return (
                                <div key={id} className='group relative bg-white/80 backdrop-blur-md rounded-2xl border border-purple-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden'>
                                    {/* Status Indicator Bar */}
                                    <div className={`h-1 w-full bg-gradient-to-r ${statusDetails.gradient}`}></div>

                                    {/* Card Content */}
                                    <div className="p-5">
                                        {/* Title and Actions Row */}
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-lg text-purple-900 truncate pr-2 group-hover:text-purple-700 transition-colors">
                                                {title}
                                            </h3>
                                            <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300'>
                                                <button
                                                    className='p-2 hover:bg-purple-100 rounded-lg transition-all duration-200 hover:scale-110 text-purple-600 cursor-pointer'
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
                                                    <SquarePen size={16} />
                                                </button>
                                                <button
                                                    className='p-2 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110 text-red-500 cursor-pointer'
                                                    onClick={() => handleDeleteTask(id, linkedWithGoogleCalendar, googleEventId, googleTaskId)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="mb-4">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusDetails.className} shadow-sm`}>
                                                {statusDetails.icon}
                                                {status}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-3 text-sm">
                                            {summary && (
                                                <div>
                                                    <span className='font-semibold text-purple-800 block mb-1'>Summary</span>
                                                    <p className="text-purple-700 leading-relaxed">{summary}</p>
                                                </div>
                                            )}

                                            <div>
                                                <span className='font-semibold text-purple-800 block mb-1'>Description</span>
                                                <p className="text-purple-700 leading-relaxed">{description}</p>
                                            </div>

                                            {/* Dates */}
                                            {(startDateTime || endDateTime) && (
                                                <div className="bg-purple-50/50 rounded-lg p-3 space-y-2">
                                                    {startDateTime && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={14} className="text-purple-600" />
                                                            <span className="text-xs text-purple-600 font-medium">Start:</span>
                                                            <span className="text-xs text-purple-700">{new Date(startDateTime).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                    {endDateTime && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={14} className="text-purple-600" />
                                                            <span className="text-xs text-purple-600 font-medium">End:</span>
                                                            <span className="text-xs text-purple-700">{new Date(endDateTime).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Calendar Integration */}
                                            <div className="flex items-center justify-between pt-2 border-t border-purple-100">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${linkedWithGoogleCalendar
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}>
                                                        {linkedWithGoogleCalendar ? "✓ Synced" : "⚠ Not Synced"}
                                                    </span>
                                                </div>

                                                {!linkedWithGoogleCalendar && (
                                                    <button
                                                        onClick={async () => {
                                                            await handleSyncWithGoogle([{ title, description, status, id, summary, startDateTime, endDateTime, linkedWithGoogleCalendar, googleEventId, googleTaskId }]);
                                                        }}
                                                        className='p-2 hover:bg-purple-100 rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer'
                                                    >
                                                        <FcCalendar className='text-lg' />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {userTasks?.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                                <Plus size={32} className="text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-purple-800 mb-2">No tasks yet</h3>
                            <p className="text-purple-600 mb-6 max-w-md mx-auto">Create your first task to get started with organizing your workflow and boosting productivity.</p>
                            <button
                                className='cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium'
                                onClick={() => {
                                    setTaskForm({
                                        initialState: { title: "", description: "", status: "pending", summary: "", startDateTime: "", endDateTime: "" },
                                        type: 'add',
                                        onSubmit: handleAddTask,
                                        show: true,
                                    });
                                }}
                            >
                                Create Your First Task
                            </button>
                        </div>
                    )}
                </div>
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

            {/* Mobile Floating Buttons */}
            {!taskForm.show && (
                <div className='flex flex-col gap-4 fixed bottom-6 right-6 sm:hidden z-50'>
                    <button
                        className={`group relative p-4 text-white rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 ${unsyncedTasks.length > 0 && "animate-pulse"}`}
                        onClick={async () => {
                            await handleSyncWithGoogle(unsyncedTasks);
                        }}
                    >
                        {unsyncedTasks.length > 0 ?
                            <CalendarDays size={22} /> :
                            <CalendarCheck size={22} />
                        }
                        {unsyncedTasks.length > 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">{unsyncedTasks.length}</span>
                            </div>
                        )}
                    </button>

                    <button
                        className='my-fourth-step group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-full p-4 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110'
                        onClick={() => {
                            setTaskForm({
                                initialState: { title: "", description: "", status: "pending", summary: "", startDateTime: "", endDateTime: "" },
                                type: 'add',
                                onSubmit: handleAddTask,
                                show: true,
                            });
                        }}
                    >
                        <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
            )}

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
        </div>
    );
};

export default UserDashboard;