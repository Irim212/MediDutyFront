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
import store from "../store";

class AddUserPanel extends React.Component {
  _isMounted = false;

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
      modalDescription: "",
      hospitals: [],
      hospital: "",
      wards: [],
      ward: null
    };
  }

  componentDidMount() {
    this._isMounted = true;

    axios
      .get("Hospitals")
      .then(response => {
        if (!this._isMounted) {
          return;
        }

        if (response.status === 200) {
          this.setState({
            hospitals: response.data,
            hospital: response.data[0]
          });

          this.updateWardsForCurrentHospital(response.data[0]);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  handleChange = (field, event) => {
    if (["firstName", "lastName", "email", "password"].includes(field)) {
      this.setState({ [field]: event.target.value });

      return;
    }

    if (field === "hospital") {
      let hospital = this.state.hospitals.find(
        x => x.name === event.target.value
      );
      this.setState({ hospital });
      this.updateWardsForCurrentHospital(hospital);
    }

    if (field === "ward") {
      let ward = { ...this.state.ward };
      ward.type = store.wards.findIndex(x => x === event.target.value);
      ward.id = this.state.wards.find(x => x.type === ward.type).id;

      this.setState({ ward });
    }
  };

  toggleModal = () => {
    this.setState({ modalOpened: !this.state.modalOpened });
  };

  handleSubmit = event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    let user = {
      email: this.state.email,
      password: this.state.password,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      wardId: this.state.ward.id
    };

    axios
      .post("Register", user)
      .then(response => {
        if (!this._isMounted) {
          return;
        }

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
        console.log(err);
      });
  };

  updateWardsForCurrentHospital = hospital => {
    this.setState({ isLoading: true });

    axios
      .get("Wards/" + hospital.id)
      .then(response => {
        if (!this._isMounted) {
          return;
        }

        if (response.status === 200) {
          this.setState({
            wards: response.data[0],
            ward: response.data[0][0]
          });
        }

        this.setState({ isLoading: false });
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
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
        <Form className="form" onSubmit={this.handleSubmit}>
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

          <FormGroup>
            <Label>Szpital</Label>
            <Input
              type="select"
              name="select"
              value={this.state.hospital.name}
              onChange={e => this.handleChange("hospital", e)}
            >
              {this.state.hospitals.map((item, i) => {
                return <option key={i}>{item.name}</option>;
              })}
            </Input>
          </FormGroup>

          {this.state.ward !== null && (
            <FormGroup>
              <Label>Oddział</Label>
              <Input
                disabled={this.state.isLoading}
                type="select"
                name="select"
                value={store.wards[this.state.ward.type]}
                onChange={e => this.handleChange("ward", e)}
              >
                {this.state.wards.map((item, i) => {
                  return <option key={i}>{store.wards[item.type]}</option>;
                })}
              </Input>
            </FormGroup>
          )}

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

export default withRouter(AddUserPanel);
