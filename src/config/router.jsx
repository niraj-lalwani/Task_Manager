import Signup from "../pages/Signup";
import CheckAuth from "../components/CheckAuth";

import React from "react";
import Signin from "../pages/Signin";
import NewLook from "../pages/NewLook";

import UserDashboard from "../pages/UserDashboard";
import AdminDashboard from "../pages/AdminDashboard";

const router = [
    {
        path: "/",
        element: <CheckAuth />,
        children: [
            {
                path: '/user-dashboard',
                element: <UserDashboard />
            },
            {
                path: '/admin-dashboard',
                element: <AdminDashboard />
            },
            {
                path: "/signup",
                element: <Signup />
            },
            {
                path: "/signin",
                element: <Signin />
            },
            {
                path: "/new-look",
                element: <NewLook />
            },
        ]
    }
]

export default router;