
import React from "react";
import AuthForm from "../components/AuthForm";
import { loginWithEmailAndPassword } from "../firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const Signin = () => {

    const navigate = useNavigate();
    const { user,setUserData } = useAuth();
    const handleOnSubmit = async (formData) => {
        try {
            const uid = await loginWithEmailAndPassword(formData.email, formData.password);
            setUserData(uid)
        } catch (err) {
            console.log(err);
        }

    }


    return (
        <AuthForm title={"In"} onSubmit={handleOnSubmit} />
    )

}

export default Signin;