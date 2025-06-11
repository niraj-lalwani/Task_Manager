import './App.css'
import { useEffect } from 'react';
import React from 'react'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import router from './config/router';
import { messaging } from './firebase/config';
import { getToken } from 'firebase/messaging';
function App() {


  async function requestPermission(){
    const permission = await Notification.requestPermission();
    if(permission == "granted"){
      //Generate the Token
      const token = await getToken(messaging,{vapidKey:"BAwNodCeGn1auuMxXVhP3L9V_QlQxEiYrKg-Fwbwa4am7ZYadHKt7k4i-ey6eVgvdEuQgUhtFjP7rYToZZX4t8I"});
      console.log('token: ', token);
      console.log("Token Generated")
      // messaging.app()
    }else if(permission == "denied"){
      alert("you denied for the notification");
    }
  }


  useEffect(()=>{
    requestPermission()
  },[]);


  const browserRouter = createBrowserRouter(router)

  return <>
    <RouterProvider router={browserRouter} />
    <ToastContainer />
  </>


}

export default App