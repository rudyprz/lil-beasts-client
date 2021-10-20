import React from "react";
import { Link } from "react-router-dom";
import {useHistory} from 'react-router-dom';

const Header = (props) => {

    const history = useHistory();

    const onLogoutHandle = () => {
        props.onLogout();
        localStorage.removeItem("token");
        history.push('/')
    };

    return (
        <header>
            <div className="bg-gray-50 max-w-7xl shadow-md rounded-xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center py-6 md:space-x-10">
                    <Link to="/">
                        <div className="flex items-center transition duration-500 ease-in-out transform hover:scale-110">
                            <img className="h-8 w-auto mr-2 sm:h-10" src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg" alt="LilBeasts" />
                            <span className="text-2xl font-medium text-indigo-600">Lil's Beasts</span>
                        </div>
                    </Link>
                    {
                        props.isLogged || localStorage.getItem("token") ? (
                            <button className="transition duration-500 ease-in-out text-lg py-2 px-6 rounded-xl text-white bg-red-600 hover:bg-indigo-600 transform hover:scale-110" onClick={onLogoutHandle}>Logout</button>
                        ) : (
                            <Link to="/login">
                                <button className="transition duration-500 ease-in-out text-lg py-2 px-6 rounded-xl text-white bg-indigo-600 hover:bg-blue-700 transform hover:scale-110">Staff Login</button>
                            </Link>
                        )
                    }
                </div>
            </div>
        </header>
    )
}

export default Header