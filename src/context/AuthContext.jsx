import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import auth from "../firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
const AuthContext = createContext()


const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(false)
    const [isLoading, setIsLoading] = useState(true);
    const [isLoogedIn, setIsLoogedIn] = useState(false);
    const [firebaseUserObj, setFirebaseUserObj] = useState({})


    const setUserData = async (uid) => {
        const docRef = doc(db, "users", uid)
        const userDoc = await getDoc(docRef);
        const userData = userDoc.data();
        setUser({ ...userData, uid });
        setIsLoogedIn(true);
        if (user?.role === "user") {
            navigate('/user-dashboard')
        } else if (user.role === 'admin') {
            navigate('/admin-dashboard')
        }

    }


    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                localStorage.setItem("uid", currentUser.uid);
                setFirebaseUserObj(currentUser)
            } else {
                setIsLoogedIn(false);
                setUser(null);
            }
            setIsLoading(false);
        })

        return () => unsub();
    }, []);

    useEffect(() => {
        if (localStorage.getItem("uid")) {
            setUserData(localStorage.getItem("uid"));
        }
    }, [])


    return <AuthContext.Provider value={{ user, isLoading, setUserData, isLoogedIn, firebaseUserObj }}>
        {children}
    </AuthContext.Provider>
}


export const useAuth = () => useContext(AuthContext);
export default AuthProvider