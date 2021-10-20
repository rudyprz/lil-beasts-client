import React, {useState, useEffect} from "react";
import Axios from "axios";

import io from "socket.io-client";

const socket = io.connect('http://localhost:4000');

const Home = () => {

    const [animals, setAnimals] = useState([]);
        
    useEffect(()=>{
        const fetchData = async () => {
            const result = await Axios.get("http://localhost:4000/api/getAnimals");
            console.log(result.data.result);
            setAnimals(result.data.result);
        }
        fetchData();
    },[setAnimals]);

    useEffect(() => {
        socket.on("changeAnimals", (data) => {
          setAnimals(data);
        });
      }, []);

    return (
        <div className="text-center mt-6">
            <h2 className="text-4xl font-medium tracking-wider text-indigo-600">Welcome to Lil's Beasts Shelter</h2>
            <p className="text-2xl mt-4 tracking-wider text-indigo-600">These cuties are waiting for you!</p>
            <div className="grid grid-cols-1 gap-6 p-10 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {
                    animals.map(item => (
                        <div className="transition duration-1000 ease-in-out transform hover:scale-110 p-6 w-11/12 mx-auto bg-white rounded-xl shadow-md space-x-4 flex items-center justify-center" key={item.animal_id}>
                            <div>
                                <img className="max-w-md max-h-72 rounded-xl" src={item.image_url} alt="" />
                                <div className="text-xl font-medium text-blue-600 mt-4">Meet {item.name}!</div>
                                <div className="mt-4 flex justify-center">
                                    <p className="mr-4 text-gray-500">Type: {item.type_name}</p>
                                    <p className="text-gray-500">Sex: {item.sex}</p>
                                    <p className="ml-4 text-gray-500">Age: {item.age ? item.age : "Unknown"}</p>
                                </div>
                                <div className="mt-4">
                                    <p className="text-indigo-600">Current Vet: {item.vet_name}</p>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Home