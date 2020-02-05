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

import { withRouter } from "react-router-dom";

class AdduserPanel extends React.Component {
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

    let searchParams = new URLSearchParams();
    searchParams.append("email", this.state.email);
    searchParams.append("password", this.state.password);
    searchParams.append("firstName", this.state.firstName);
    searchParams.append("lastName", this.state.lastName);

    axios
      .post("Register?" + searchParams.toString())
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
      .catch(err => {
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
          <h2 className="text-center mb-lg-5">Dodaj użytkownika</h2>

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
            Dodaj
          </Button>
        </Form>
      </div>
    );
  }
}

export default withRouter(AdduserPanel);
