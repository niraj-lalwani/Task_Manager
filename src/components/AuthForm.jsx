import React from 'react'
import useForm from '../hooks/useForm'
import { Link } from "react-router-dom"
import { FcGoogle } from "react-icons/fc";
import { loginWithGoogle } from '../firebase/auth';
import { useAuth } from '../context/AuthContext';


const AuthForm = ({ onSubmit, title }) => {


    const [formData, setFormData, handleOnChange] = useForm({
        email: "",
        password: ""
    })


    const { setUserData } = useAuth();


    return (
        <>
            <>
                <div className='top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] border rounded-lg shadow-md absolute p-4 sm:p-6 md:p-8 w-[90%] sm:w-[390px]'>
                    {/* <h1 className='text-4xl font-semibold text-center'><span className='text-blue-600'>Task</span> Manager</h1> */}


                    <form className='w-full flex flex-col gap-4'
                        onSubmit={
                            (e) => {
                                e.preventDefault();
                                onSubmit(formData);
                            }}
                    >
                        <p className='font-semibold text-2xl'>Sign <span className='text-blue-500'> {title} </span></p>

                        <div className='inputBox'>
                            <label htmlFor="email" className='label'>Email</label>
                            <input type="email" name='email' value={formData.email} onChange={handleOnChange} placeholder='Enter Your Email' className='input' />
                        </div>

                        <div className='inputBox'>
                            <label htmlFor="password" className='label'>Password</label>
                            <input type="password" name='password' value={formData.password} onChange={handleOnChange} placeholder='Enter Your Password' className='input' />
                        </div>

                        <button className='px-4 py-1 bg-blue-500 text-white rounded-md cursor-pointer'>Sign {title}</button>

                        <div className="flex items-center gap-2">

                            <span className="border-t border-gray-400 w-full h-0 mt-1"></span>
                            <p className='text-center text-sm text-gray-400'>or</p>
                            <span className="border-t border-gray-400 w-full h-0 mt-1"></span>
                        </div>
                    </form>
                    <div className='w-full mt-3'>

                        <button
                            className='w-full px-4 py-1 border border-gray-500 text-gray-900 rounded-md flex items-center gap-2 justify-center cursor-pointer text-sm'
                            onClick={async () => {
                                try {

                                    const { uid, googleAccessToken } = await loginWithGoogle();
                                    setUserData(uid)
                                    localStorage.setItem("accessToken", googleAccessToken)
                                } catch (err) {
                                    console.log('err: ', err);
                                }
                            }}
                        > <FcGoogle className='text-lg' /> Continue With Google</button>

                    </div>
                    {
                        title == "Up" ?
                            <p className="text-gray-400 text-xs">Already have an account? <Link to="/signin" className="text-blue-500 underline text-sm">Sign In</Link>  </p> :
                            <p className="text-gray-400 text-xs">Don't have an account? <Link to="/signup" className="text-blue-500 underline text-sm">Sign Up</Link>  </p>

                    }
                </div>
            </>
        </>
    )
}

export default AuthForm
// Test Branch Comment
