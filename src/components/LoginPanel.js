import React, { useState } from 'react';
import '../App.css';
import axios from 'axios';

import store from '../store';

import { Button, Form, FormGroup, Label, Input }
  from 'reactstrap';

  import {
    Redirect,
    useHistory
  } from "react-router-dom";

export default function LoginPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const history = useHistory();

  function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    
    axios.post(store.API + '/Login?email=' + email + '&password=' + password,
    {
      'Content-Type': 'application/json'
    })
    .then(response => {
      if(response.status === 200) {
        store.auth.authenticate(response.data);
        setLoading(false);
        history.push('/panel');
      }
    }).catch(error => {
      console.log(error);
      setLoading(false);
    })
  }

  if(store.auth.isAuthenticated) {
    return <Redirect to='/userpanel'/>
  }
  else {
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
}