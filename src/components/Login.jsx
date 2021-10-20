import React, {useState} from "react";
import Axios from "axios";
import {useHistory} from 'react-router-dom';

const Login = (props) => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const history = useHistory();

    const onChangeUsername = (event) => {
        setUsername(event.target.value);
    };

    const onChangePassword = (event) => {
        setPassword(event.target.value);
    };

    const onSubmitHandler = async(event) => {
        event.preventDefault();
        setError("");
        const result = await Axios.post(
            "http://localhost:4000/api/loginStaff",
            {
                user_name: username,
                password: password
            }
        );
        if(result.status === 204){
            setError("Username and/or password not valid");
        } else {
            props.onLogin();
            console.log(result.data.token);
            localStorage.setItem("token", result.data.token);
            history.push('/admin')
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <img
                    className="mx-auto h-12 w-auto"
                    src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                    alt="Workflow"
                    />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-700">Staff Login</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmitHandler}>
                    <input type="hidden" name="remember" defaultValue="true" />
                    <div className="rounded-md shadow-sm">
                        <div>
                            <label className="sr-only">
                            Username
                            </label>
                            <input
                            id="username"
                            name="username"
                            type="username"
                            required
                            className="appearance-none rounded-xl relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Enter your username"
                            onChange={onChangeUsername}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="sr-only">
                            Password
                            </label>
                            <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="appearance-none rounded-xl relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Enter your password"
                            onChange={onChangePassword}
                            />
                        </div>
                    </div>
                    <div>
                        <span className="text-md text-red-600">{error}</span>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login