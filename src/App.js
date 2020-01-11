import React from 'react';
import './App.css';
import { Button, Form, FormGroup, Label, Input }
  from 'reactstrap';



function App() {
  return (
    <Form className="login-form">
      <h1 className="text-center"><span className="font-weight-bold"><span style={{color: "#a8323a"}}>Medi</span>App</span></h1>
      <h2 className="text-center mb-lg-5">Zaloguj się</h2>
      
      <FormGroup>
        <Label>Email</Label>
        <Input type="email" placeholder="Adres E-mail"/>
      </FormGroup>

      <FormGroup>
        <Label>Hasło</Label>
        <Input type="password" placeholder="Hasło"/>
      </FormGroup>

      <Button className="btn-lg btn-dark btn-block">Zaloguj się</Button>

      <div className="text-center mt-3">
        <a href="/forgot-password" className="text-center">Odzyskaj hasło</a>
      </div>
    </Form>
  );
}

export default App;
