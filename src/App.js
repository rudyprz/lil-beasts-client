import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import React, {useState} from "react";

import Header from './components/Header'
import Home from './components/Home'
import Login from './components/Login'
import Admin from './components/Admin'

function App() {
  const [isLogged, setIsLogged] = useState(false);

  const onLogout = () =>{
    setIsLogged(false);
  }
  const onLogin = () =>{
    setIsLogged(true);
  }

  return (
    <div className="App h-screen">
      <Router>
        <Header isLogged={isLogged} onLogout={onLogout} />
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/login">
            <Login onLogin={onLogin}/>
          </Route>
          <Route path="/admin">
            <Admin />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
