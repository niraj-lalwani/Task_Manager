import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import Header from './Header';

const CheckAuth = ({ children }) => {



    const { user, isLoading ,isLoogedIn} = useAuth();
    const { pathname } = useLocation();
    const navigate = useNavigate();


    useEffect(() => {

        if(!isLoogedIn && !pathname.includes("sign")){
            navigate("/signin");
        }


        if(isLoogedIn &&  (pathname.includes('signup') || pathname.includes("signin"))){
         if (user?.role === "user") {
                navigate('/user-dashboard')
            } else {
                navigate('/admin-dashboard')
            }
        }

       

         if (user?.role == "user" && pathname.includes("admin-dashboard")) {
            navigate("/user-dashboard");
        }

        else if (user?.role == "admin" && pathname.includes("user-dashboard")) {
            navigate("/admin-dashboard");
        }

    }, [user])



    if (isLoading) {
        return <><h1>Loading...</h1></>
    }



    return <>
        {user &&
            <Header />
        }
        <Outlet />

    </>
}

export default CheckAuth
