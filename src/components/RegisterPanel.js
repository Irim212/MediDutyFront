import React, { useState } from 'react';
import '../App.css';
import axios from 'axios';

import { Button, Form, FormGroup, Label, Input }
  from 'reactstrap';

  import {
    useHistory
  } from "react-router-dom";

  import store from '../store';

export default function RegisterPanel() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);

  const history = useHistory();

  function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);

    axios.post(store.API + '/Register?email=' + email + '&password=' + password
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