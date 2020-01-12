import React, { useState } from 'react';
import axios from 'axios';
import Cookie from 'js-cookie'
import './App.css';
import { Button, Form, FormGroup, Label, Input }
  from 'reactstrap';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
    useHistory
  } from "react-router-dom";

const auth = {
  isAuthenticated: false,
  token: null,
  authenticate(token) {
    auth.isAuthenticated = true;
    auth.token = token;
    Cookie.set('token', token);
  },
  logout() {
    auth.isAuthenticated = false;
    auth.token = null;
    Cookie.set('token', null);
  }
}

const API = 'http://localhost:5000/api';

function App(props) {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/register">
            <Register />
          </Route>
          <PrivateRoute path="/panel">
            <Panel />
          </PrivateRoute>
          <Route path="/">
            <Login />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const history = useHistory();

  function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    
    axios.post(API + '/Login?email=' + email + '&password=' + password,
    {
      'Content-Type': 'application/json'
    })
    .then(response => {
      if(response.status === 200) {
        auth.authenticate(response.data);
        setLoading(false);
        history.push('/panel');
      }
    }).catch(error => {
      console.log(error);
      setLoading(false);
    })
  }

  return <Form className="login-form" onSubmit={handleSubmit}>
      <h1 className="text-center"><span className="font-weight-bold"><span style={{color: "#a8323a"}}>Medi</span>App</span></h1>
      <h2 className="text-center mb-lg-5">Zaloguj się</h2>
      
      <FormGroup>
        <Label>Email</Label>
        <Input type="email" placeholder="Adres E-mail" value={email} onChange={e => setEmail(e.target.value)}/>
      </FormGroup>

      <FormGroup>
        <Label>Hasło</Label>
        <Input type="password" placeholder="Hasło" value={password} onChange={e => setPassword(e.target.value)}/>
      </FormGroup>

      <Button className="btn-lg btn-dark btn-block" type="submit" disabled={isLoading}>Zaloguj się</Button>
      
      <div className="text-center mt-3">
        Nie masz konta? Załóż je <a href="/register" className="text-center">tutaj</a>.
      </div>
    </Form>
}

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);

  const history = useHistory();

  function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    axios.post(API + '/Register?email=' + email + '&password=' + password
    + "&firstName=" + firstName + "&lastName=" + lastName,
    {
      'Content-Type': 'application/json'
    })
    .then(response => {
      if(response.status === 201) {
        setLoading(false);
        history.push('/');
      }
    }).catch(error => {
      setLoading(false);
      console.log(error);
    })
  }

  return <Form className="login-form" onSubmit={handleSubmit}>
      <h1 className="text-center"><span className="font-weight-bold"><span style={{color: "#a8323a"}}>Medi</span>App</span></h1>
      <h2 className="text-center mb-lg-5">Załóż konto</h2>
      
      <FormGroup>
        <Label>Imię</Label>
        <Input type="text" placeholder="Imię" value={firstName} onChange={e => setFirstName(e.target.value)}/>
      </FormGroup>

      <FormGroup>
        <Label>Nazwisko</Label>
        <Input type="text" placeholder="Nazwisko" value={lastName} onChange={e => setLastName(e.target.value)}/>
      </FormGroup>

      <FormGroup>
        <Label>Email</Label>
        <Input type="email" placeholder="Adres E-mail" value={email} onChange={e => setEmail(e.target.value)}/>
      </FormGroup>

      <FormGroup>
        <Label>Hasło</Label>
        <Input type="password" placeholder="Hasło" value={password} onChange={e => setPassword(e.target.value)}/>
      </FormGroup>

      <Button className="btn-lg btn-dark btn-block" type="submit" disabled={isLoading}>Załóż konto</Button>
    </Form>
}

function PrivateRoute({ children, ...rest}) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

function Panel() {
  return <div>
    <h1 className="text-center"><span className="font-weight-bold"><span style={{color: "#a8323a"}}>Medi</span>App</span></h1>
    <h2 className="text-center mb-lg-5">Panel</h2>
  </div>
}

export default App;