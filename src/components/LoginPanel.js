import React from "react";
import "../App.css";
import axios from "axios";

import store from "../store";

import { Button, Form, FormGroup, Label, Input } from "reactstrap";

import { Redirect, withRouter } from "react-router-dom";

class LoginPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      isLoading: false
    };
  }

  handleSubmit = event => {
    event.preventDefault();
    this.setState({ isLoading: true });

    axios
      .post(
        store.API +
          "/Login?email=" +
          this.state.email +
          "&password=" +
          this.state.password,
        {
          "Content-Type": "application/json"
        }
      )
      .then(response => {
        if (response.status === 200) {
          store.auth.authenticate(response.data);
          this.setState({ isLoading: false });
          this.props.history.push("/");
        }
      })
      .catch(error => {
        console.log(error);
        this.setState({ isLoading: false });
      });
  };

  handleChange = (field, event) => {
    switch (field) {
      case "email":
        this.setState({ email: event.target.value });
        break;
      case "password":
        this.setState({ password: event.target.value });
        break;
      default:
        break;
    }
  };

  render() {
    if (store.auth.isAuthenticated) {
      return <Redirect to="/userpanel" />;
    } else {
      return (
        <Form className="login-form" onSubmit={this.handleSubmit}>
          <h2 className="text-center mb-lg-5">Zaloguj się</h2>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Adres E-mail"
              value={this.state.email}
              onChange={e => this.handleChange("email", e)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Hasło</Label>
            <Input
              type="password"
              placeholder="Hasło"
              value={this.state.password}
              onChange={e => this.handleChange("password", e)}
            />
          </FormGroup>

          <Button
            className="btn-lg btn-dark btn-block"
            type="submit"
            disabled={this.state.isLoading}
          >
            Zaloguj się
          </Button>
        </Form>
      );
    }
  }
}

export default withRouter(LoginPanel);
