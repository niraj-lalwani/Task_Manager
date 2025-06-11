import { useState } from "react"
const useForm = (initialState) => {
    const [data, setData] = useState(initialState);
    console.log('data: ', data);
    const handleOnChange = (e) => {
        const { name, value } = e.target;
        console.log('value: ', value);
        setData({
            ...data,
            [name]: value
        })

    }

    return [data, setData, handleOnChange];
}

export default useForm;