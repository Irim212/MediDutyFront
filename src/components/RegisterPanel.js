import React from 'react';
import '../App.css';
import axios from 'axios';

import { Button, Form, FormGroup, Label, Input }
  from 'reactstrap';

import store from '../store';
import { withRouter } from 'react-router-dom';

class RegisterPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      isLoading: false
    };
  }

  handleChange = (field, event) => {
    switch (field) {
      case 'firstName': this.setState({ firstName: event.target.value }); break;
      case 'lastName': this.setState({ lastName: event.target.value }); break;
      case 'email': this.setState({ email: event.target.value }); break;
      case 'password': this.setState({ password: event.target.value }); break;
      default: break;
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();

    this.setState({ isLoading: true });

    axios.post(store.API + '/Register?email=' + this.state.email + '&password=' + this.state.password
      + "&firstName=" + this.state.firstName + "&lastName=" + this.state.lastName,
      {
        'Content-Type': 'application/json'
      })
      .then(response => {
        if (response.status === 201) {
          this.setState({ isLoading: false });
          this.props.history.push('/');
        }
      }).catch(error => {
        this.setState({ isLoading: false });
        console.log(error);
      })
  }

  render() {
    return <Form className="login-form" onSubmit={this.handleSubmit}>
      <h1 className="text-center"><span className="font-weight-bold"><span style={{ color: "#a8323a" }}>Medi</span>App</span></h1>
      <h2 className="text-center mb-lg-5">Załóż konto</h2>

      <FormGroup>
        <Label>Imię</Label>
        <Input type="text" placeholder="Imię" value={this.state.firstName} onChange={e => this.handleChange('firstName', e)} />
      </FormGroup>

      <FormGroup>
        <Label>Nazwisko</Label>
        <Input type="text" placeholder="Nazwisko" value={this.state.lastName} onChange={e => this.handleChange('lastName', e)} />
      </FormGroup>

      <FormGroup>
        <Label>Email</Label>
        <Input type="email" placeholder="Adres E-mail" value={this.state.email} onChange={e => this.handleChange('email', e)} />
      </FormGroup>

      <FormGroup>
        <Label>Hasło</Label>
        <Input type="password" placeholder="Hasło" value={this.state.password} onChange={e => this.handleChange('password', e)} />
      </FormGroup>

      <Button className="btn-lg btn-dark btn-block" type="submit" disabled={this.state.isLoading}>Załóż konto</Button>
    </Form>
  }
}

export default withRouter(RegisterPanel);