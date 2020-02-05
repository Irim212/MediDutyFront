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
import store from "./../store";

class AddHospitalPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hospital: {
        name: "",
        street: "",
        city: "",
        zip: "",
        district: store.districts[0]
      },
      isLoading: false,
      modalOpened: false,
      modalHeader: "",
      modalDescription: ""
    };
  }

  handleChange = (field, event) => {
    if (["name", "street", "city", "zip", "district"].includes(field)) {
      let hospital = this.state.hospital;
      hospital[field] = event.target.value;
      this.setState({ hospital });
    }
  };

  toggleModal = () => {
    this.setState({ modalOpened: !this.state.modalOpened });
  };

  handleSubmit = event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    let searchParams = new URLSearchParams();
    searchParams.append("name", this.state.hospital.name);
    searchParams.append("street", this.state.hospital.street);
    searchParams.append("city", this.state.hospital.city);
    searchParams.append("zip", this.state.hospital.zip);
    searchParams.append("district", this.state.hospital.district);

    axios
      .post("Hospitals?" + searchParams.toString())
      .then(response => {
        if (response.status === 201) {
          this.setState({
            isLoading: false,
            modalHeader: "Szpital dodany",
            modalDescription:
              "Szpital " +
              this.state.hospital.name +
              " zostało dodany pomyślnie",
            hospital: {
              name: "",
              street: "",
              city: "",
              zip: "",
              district: ""
            }
          });

          this.toggleModal();
        }
      })
      .catch(() => {
        this.setState({
          isLoading: false,
          modalHeader: "Szpital nie został dodany",
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
        <Form className="form" onSubmit={this.handleSubmit}>
          <h2 className="text-center mb-lg-5">Dodaj szpital</h2>

          <FormGroup>
            <Label>Nazwa szpitala</Label>
            <Input
              type="text"
              placeholder="Nazwa"
              value={this.state.hospital.name}
              onChange={e => this.handleChange("name", e)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Ulica</Label>
            <Input
              type="text"
              placeholder="Ulica"
              value={this.state.hospital.street}
              onChange={e => this.handleChange("street", e)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Miasto</Label>
            <Input
              type="text"
              placeholder="Miasto"
              value={this.state.hospital.city}
              onChange={e => this.handleChange("city", e)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Kod pocztowy</Label>
            <Input
              type="text"
              placeholder="Kod pocztowy"
              value={this.state.hospital.zip}
              onChange={e => this.handleChange("zip", e)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Województwo</Label>
            <Input
              type="select"
              name="select"
              value={this.state.hospital.district}
              onChange={e => this.handleChange("district", e)}
            >
              {store.districts.map((item, i) => {
                return <option key={i}>{item}</option>;
              })}
            </Input>
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

export default withRouter(AddHospitalPanel);
