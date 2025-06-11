import { db } from "./config";
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

export const createTask = async (task, userId) => {
    console.log('task: ', task);

    const startDate = new Date(task.startDateTime);
    const endDate = new Date(task.endDateTime);

    await addDoc(collection(db, "tasks"), {
        ...task,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        linkedWithGoogleCalendar: false,
        userId
    });
}

export const getUserTask = async (userId) => {
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}


export const updateTask = async (updatedData) => {
    const taskRef = doc(db, "tasks", updatedData.id);
    const { title, description, status, summary, linkedWithGoogleCalendar, startDateTime, endDateTime } = updatedData;
    await updateDoc(taskRef, {
        title, description, status, summary, linkedWithGoogleCalendar, startDateTime, endDateTime
    })
}


export const deleteTask = async (taskId) => {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
};


export const getUserList = async () => {
    const userSnap = await getDocs(collection(db, "users"));



    const usersWithTasks = await Promise.all(
        userSnap.docs.map(async (doc) => {
            const userData = doc.data();
            const uid = doc.id;


            // Query tasks for this user
            const taskQuery = query(
                collection(db, "tasks"),
                where("userId", "==", uid)
            );
            const taskSnap = await getDocs(taskQuery);

            return {
                ...userData,
                uid,
                totalTasks: taskSnap.size,
            };
        })
    );

    return usersWithTasks;
};


export const getUserUnsyncedTasks = async (uid) => {
    const q = query(
        collection(db, "tasks"),
        where("userId", "==", uid),
        where("linkedWithGoogleCalendar", "==", false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};