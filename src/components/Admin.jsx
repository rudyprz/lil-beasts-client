import React, {useState, useEffect, Fragment} from "react";
import { Dialog, Transition } from '@headlessui/react'
import Axios from "axios";
import {useHistory} from 'react-router-dom';

import Uppy from '@uppy/core'
import Tus from '@uppy/tus'
import { DragDrop } from '@uppy/react'
import '@uppy/core/dist/style.css'
import '@uppy/drag-drop/dist/style.css'

import io from "socket.io-client";

const socket = io.connect('http://localhost:4000');


const Admin = () => {
    const [animals, setAnimals] = useState([]);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const [openV, setOpenV] = useState(false);

    const [selectedName, setSelectedName] = useState("");
    const [selectedID, setSelectedID] = useState(null);

    const [types, setTypes] = useState([]);
    const [vets, setVets] = useState([]);

    const [name, setName] = useState("");
    const [type, setType] = useState(null);
    const [typeN, setTypeN] = useState("null");
    const [sex, setSex] = useState("");
    const [age, setAge] = useState(null);
    const [vet, setVet] = useState(null);
    const [vetN, setVetN] = useState("");
    const [imgUrl, setImgUrl] = useState("");

    const [vetV, setVetV] = useState(null);
    const [vetVN, setVetVN] = useState("");

    const[errorForm, setErrorForm] = useState("");

    const history = useHistory();
    
    const onNameChange = (event) => {
        setName(event.target.value);
    }

    const onTypeChange = (event) => {
        console.log(JSON.parse(event.target.value).id);
        setType(JSON.parse(event.target.value).id);
        setTypeN(JSON.parse(event.target.value).name);
    }

    const onSexChange = (event) => {
        setSex(event.target.value);
    }

    const onAgeChange = (event) => {
        setAge(event.target.value);
    }

    const onVetChange = (event) => {
        console.log(JSON.parse(event.target.value).id);
        setVet(JSON.parse(event.target.value).id);
        setVetN(JSON.parse(event.target.value).name);
    }

    const onVetVChange = (event) => {
        console.log(JSON.parse(event.target.value).id);
        setVetV(JSON.parse(event.target.value).id);
        setVetVN(JSON.parse(event.target.value).name);
    }

    const onUrlChange = (url) => {
        console.log(url);
        setImgUrl(url);
    }

    const uppy = new Uppy({
        meta: { type: 'avatar' },
        restrictions: { maxNumberOfFiles: 1 },
        autoProceed: true,
        })
        
        uppy.use(Tus, { endpoint: 'https://tusd.tusdemo.net/files/' })
        
        uppy.on('complete', (result) => {
        const url = result.successful[0].uploadURL
        onUrlChange(url);
    })

    const onSubmitHandle = async() => {
        setErrorForm("");
        if(!name || !type || !sex  || !vet) {
            setErrorForm("Some fields are incomplete. Please verify")
        } else if(!imgUrl){
            setErrorForm("Please upload an image")
        } else {
            const authorizationToken = "Bearer " + localStorage.getItem("token");
            console.log(authorizationToken);
            try {
                const result = await Axios.post(
                    "http://localhost:4000/api/createAnimal",
                    {
                        type_id: type,
                        name: name,
                        image_url: imgUrl,
                        sex: sex,
                        age: age,
                        vet_id: vet
                    },
                    {
                        headers: {
                            authorization: authorizationToken
                        },
                    }
                );
                if(result.status === 200){
                    setSuccess("Animal added successfully");
                    const newArr =[...animals, {
                        type_id: type,
                        name: name,
                        image_url: imgUrl,
                        sex: sex,
                        age: age,
                        vet_id: vet,
                        type_name: typeN,
                        vet_name: vetN
                    }]
                    setAnimals(newArr);
                    setOpen(false);
                    socket.emit("changeAnimals", newArr);
                } 
            } catch (error) {
                setError("There was an error. Please try again later")
                setOpen(false);
            }
        }
    }

    const onOpenVet = async(animal_id, animal_name) => {
        setSelectedID(animal_id);
        setSelectedName(animal_name);
        console.log(animal_id);
        console.log(animal_name);
        setOpenV(true);
    }

    const onChangeVet = async(animal_id) => {
        setSuccess("");
        setError("");
        const authorizationToken = "Bearer " + localStorage.getItem("token");
        try {
            const result = await Axios.put(
                "http://localhost:4000/api/assignVet/" + animal_id,
                {
                    vet_id: vetV
                },
                {
                    headers: {
                        authorization: authorizationToken
                    },
                }
            );
            if(result.status === 200){
                setSuccess("Vet assigned successfully");
                let newArr = animals;
                let objIndex = newArr.findIndex((obj => obj.animal_id === animal_id));
                newArr[objIndex].vet_id = vetV;
                newArr[objIndex].vet_name = vetVN;
                setAnimals(newArr);
                setOpenV(false);
                socket.emit("changeAnimals", newArr);
            } 
        } catch (error) {
            setError("There was an error. Please try again later")
            setOpenV(false);
        }
    }

    const onDeleteHandle = async(animal_id) => {
        setSuccess("");
        setError("");
        const authorizationToken = "Bearer " + localStorage.getItem("token");
        try {
            const result = await Axios.delete(
                "http://localhost:4000/api/deleteAnimal/" + animal_id,
                {
                    headers: {
                        authorization: authorizationToken
                    },
                }
            );
            if(result.status === 200){
                setSuccess("Animal deleted successfully");
                let newArr = animals.filter(item => item.animal_id !== animal_id)
                setAnimals(newArr);
                socket.emit("changeAnimals", newArr);
            } 
        } catch (error) {
            setError(error.response.data)
        }
    };
        
    useEffect(()=>{
        console.log(localStorage.getItem("token"));
        if(!localStorage.getItem("token")){
            console.log("UNAUTHORIZED");
            history.push('/')
        }
        const fetchData = async () => {
            const result = await Axios.get("http://localhost:4000/api/getAnimals");
            console.log(result.data.result);
            setAnimals(result.data.result);
            const restypes = await Axios.get("http://localhost:4000/api/getTypes");
            console.log(restypes.data.result);
            setTypes(restypes.data.result);
            const resvets = await Axios.get("http://localhost:4000/api/getVets");
            console.log(resvets.data.result);
            setVets(resvets.data.result);
        }
        fetchData();
    },[setAnimals, history]);

    return (
        <div className="text-center mt-6">
            <h2 className="text-4xl font-medium tracking-wider text-indigo-600">Welcome Staff!</h2>
            <button className="transition duration-500 ease-in-out text-lg py-2 px-6 rounded-xl text-white bg-blue-600 hover:bg-pink-700 transform hover:scale-110 mt-6" onClick={() => {setOpen(true)}}>Add animal</button>

            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setOpen}>
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                        &#8203;
                    </span>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="">
                                <div className="mt-3 sm:mt-0 sm:ml-4">
                                    <Dialog.Title as="h3" className="text-xl text-center leading-6 font-medium text-indigo-900">
                                    Add an animal
                                    </Dialog.Title>
                                    <div className="mt-2">
                                    <form className="mt-8 space-y-6">
                                        <div className="rounded-md shadow-sm">
                                            <div>
                                                <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                required
                                                className="appearance-none rounded-xl relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                                placeholder="Animal Name"
                                                onChange={onNameChange}
                                                />
                                            </div>
                                            <div className="mt-4">
                                                <select
                                                id="type"
                                                name="type"
                                                type="text"
                                                required
                                                className="appearance-none rounded-xl relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                                onChange={onTypeChange}
                                                >
                                                    <option selected disabled hidden>Select animal type:</option>
                                                    {
                                                        types.map((item) => (
                                                            <option value={JSON.stringify({id:item.type_id, name:item.type_name})} key={item.type_id}>{item.type_name}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                            <div className="mt-4">
                                                <select
                                                id="sex"
                                                name="sex"
                                                type="text"
                                                required
                                                className="appearance-none rounded-xl relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                                onChange={onSexChange}
                                                >
                                                    <option selected disabled hidden>Select animal sex:</option>
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                </select>
                                            </div>
                                            
                                            <div className="mt-4">
                                                <input
                                                id="age"
                                                name="age"
                                                type="number"
                                                className="appearance-none rounded-xl relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                                placeholder="Enter animal age if known"
                                                onChange={onAgeChange}
                                                />
                                            </div>
                                            <div className="mt-4">
                                                <select
                                                id="vet"
                                                name="vet"
                                                type="text"
                                                required
                                                className="appearance-none rounded-xl relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                                onChange={onVetChange}
                                                >
                                                    <option selected disabled hidden>Assign a vet:</option>
                                                    {
                                                        vets.map((item) => (
                                                            <option value={JSON.stringify({id:item.vet_id, name:item.vet_name})} key={item.vet_id}>{item.vet_name}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-md text-gray-500 text-center">Upload a photo of the animal</div>
                                            {imgUrl  && <img className="rounded-xl my-4" src={imgUrl} alt="Current Avatar" />}
                                            <DragDrop
                                                uppy={uppy}
                                                locale={{
                                                strings: {
                                                    dropHereOr: 'Drop here or %{browse}',
                                                    browse: 'browse',
                                                },
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-md text-red-600">{errorForm}</span>
                                        </div>
                                    </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onSubmitHandle}
                            >
                            Add animal
                            </button>
                            <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={() => setOpen(false)}
                            >
                            Cancel
                            </button>
                        </div>
                        </div>
                    </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            <div>
                <span className="text-xs text-green-500">{success}</span>
            </div>
            <div>
                <span className="text-xs text-red-500">{error}</span>
            </div>
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
                                <div>
                                    <button className="transition duration-500 ease-in-out text-lg py-2 px-6 rounded-xl text-white bg-indigo-600 hover:bg-blue-600 transform hover:scale-110 mt-6 mr-4" onClick={() => {onOpenVet(item.animal_id, item.name)}}>Change Vet</button>
                                    <button className="transition duration-500 ease-in-out text-lg py-2 px-6 rounded-xl text-white bg-red-600 hover:bg-red-900 transform hover:scale-110 mt-6 ml-4" onClick={() => {onDeleteHandle(item.animal_id)}}>Delete animal</button>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
            <Transition.Root show={openV} as={Fragment}>
                <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setOpenV}>
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                        &#8203;
                    </span>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="">
                                <div className="mt-3 sm:mt-0 sm:ml-4">
                                    <Dialog.Title as="h3" className="text-xl text-center leading-6 font-medium text-indigo-900">
                                    Assign a Vet for {selectedName}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                    <form className="mt-8 space-y-6">
                                        <div className="rounded-md shadow-sm">                                            
                                            <div className="mt-4">
                                                <select
                                                id="vet"
                                                name="vet"
                                                type="text"
                                                required
                                                className="appearance-none rounded-xl relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                                onChange={onVetVChange}
                                                >
                                                    <option selected disabled hidden>Assign a vet:</option>
                                                    {
                                                        vets.map((item) => (
                                                            <option value={JSON.stringify({id:item.vet_id, name:item.vet_name})} key={item.vet_id}>{item.vet_name}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                    </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={() => {onChangeVet(selectedID)}}
                            >
                            Assign Vet
                            </button>
                            <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={() => setOpenV(false)}
                            >
                            Cancel
                            </button>
                        </div>
                        </div>
                    </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    )
}

export default Admin