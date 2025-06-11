
import React from "react";
import AuthForm from "../components/AuthForm";
import { registerWithEmailAndPassword } from "../firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {

  const navigate = useNavigate();

  const {setUserData} = useAuth();

  const handleOnSubmit = async (formData) => {
    try {
      const uid = await registerWithEmailAndPassword(formData.email, formData.password);
      await setUserData(uid)

      

    } catch (err) {
      console.log(err);
    }
  }


  return (
    <AuthForm title={"Up"} onSubmit={handleOnSubmit} />
  )

}

export default Signup;