import { useState } from "react"
 const useForm = (initialState) =>{
    const [data,setData] = useState(initialState);
    const handleOnChange = (e) =>{
        const {name,value} = e.target;
        setData({
            ...data,
            [name]:value
        })

    }

    return [data,setData,handleOnChange];
}

export default useForm;