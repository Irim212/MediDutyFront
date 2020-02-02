import React from "react";
import "../App.css";
import axios from "axios";

import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";

import store from "../store";
import { withRouter } from "react-router-dom";

class RegisterPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      isLoading: false,
      modalOpened: false,
      modalHeader: "",
      modalDescription: ""
    };
  }

  handleChange = (field, event) => {
    if (["firstName", "lastName", "email", "password"].includes(field)) {
      this.setState({ [field]: event.target.value });
    }
  };

  toggleModal = () => {
    this.setState({ modalOpened: !this.state.modalOpened });
  };

  handleSubmit = event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    axios
      .post(
        store.API +
          "/Register?email=" +
          this.state.email +
          "&password=" +
          this.state.password +
          "&firstName=" +
          this.state.firstName +
          "&lastName=" +
          this.state.lastName,
        null,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${store.auth.token}`
          }
        }
      )
      .then(response => {
        if (response.status === 201) {
          this.setState({
            isLoading: false,
            modalHeader: "Konto zostało utworzone",
            modalDescription:
              "Konto " + this.state.email + " zostało pomyślnie utworzone",
            firstName: "",
            lastName: "",
            email: "",
            password: ""
          });

          this.toggleModal();
        }
      })
      .catch(error => {
        this.setState({
          isLoading: false,
          modalHeader: "Konto nie zostało utworzone",
          modalDescription: "Niestety coś poszło nie tak"
        });

        this.toggleModal();
      });
  };

  render() {
    return (
      <div>
        <Modal isOpen={this.state.modalOpened} onClick={this.toggleModal}>
          <ModalHeader toggle={this.toggleModal}>
            {this.state.modalHeader}
          </ModalHeader>
          <ModalBody>{this.state.modalDescription}</ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.toggleModal}>
              Dalej
            </Button>
          </ModalFooter>
        </Modal>
        <Form className="login-form" onSubmit={this.handleSubmit}>
          <h2 className="text-center mb-lg-5">Załóż konto</h2>

          <FormGroup>
            <Label>Imię</Label>
            <Input
              type="text"
              placeholder="Imię"
              value={this.state.firstName}
              onChange={e => this.handleChange("firstName", e)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Nazwisko</Label>
            <Input
              type="text"
              placeholder="Nazwisko"
              value={this.state.lastName}
              onChange={e => this.handleChange("lastName", e)}
            />
          </FormGroup>

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
            Załóż konto
          </Button>
        </Form>
      </div>
    );
  }
}

export default withRouter(RegisterPanel);
