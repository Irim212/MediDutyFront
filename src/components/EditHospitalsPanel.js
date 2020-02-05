import { withRouter } from "react-router-dom";
import React from "react";
import "./../App.css";
import {
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  Form,
  FormGroup,
  Col,
  Row
} from "reactstrap";

import axios from "axios";
import store from "./../store";

class EditHospitalsPanel extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      hospitals: [],
      modalOpened: false,
      tempHospital: {
        id: "",
        name: "",
        street: "",
        city: "",
        zip: "",
        district: store.districts[0],
        wards: [],
        ward: store.wards[0],
        readonlyWards: []
      },
      infoToggleModal: "",
      infoModalOpened: false,
      isLoading: false
    };
  }

  componentDidMount() {
    this._isMounted = true;

    axios
      .get("Hospitals")
      .then(response => {
        if (response.status === 200) {
          if (!this._isMounted) {
            return;
          }

          this.setState({ hospitals: response.data });
        }
      })
      .catch(() => {});
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  elementClicked = element => {
    axios
      .get("Wards/" + this.state.hospitals[element].id)
      .then(response => {
        let tempHospital = this.state.hospitals[element];
        tempHospital.wards = response.data[0];
        tempHospital.readonlyWards = response.data[0];

        this.updateCurrentWard(tempHospital);
        this.setState({ tempHospital });
        this.toggleModal();
      })
      .catch(err => {});
  };

  toggleModal = () => {
    this.setState({ modalOpened: !this.state.modalOpened });
  };

  handleChange = (field, event) => {
    let tempHospital = this.state.tempHospital;

    if (["name", "street", "city", "zip", "district", "ward"].includes(field)) {
      tempHospital[field] = event.target.value;
    }

    this.setState({ tempHospital });
  };

  updateHospital = () => {
    let hospital = this.state.tempHospital;
    this.setState({ isLoading: true });

    axios
      .put("Hospitals", hospital)
      .then(response => {
        if (response.status === 200) {
          let hospitals = this.state.hospitals;
          let index = hospitals.indexOf(x => x.id === hospital.id);
          hospitals[index] = hospital;

          this.state.tempHospital.wards
            .filter(
              newWard =>
                !this.state.tempHospital.readonlyWards.some(
                  readonlyWard => readonlyWard.type === newWard
                )
            )
            .forEach(newWard => {
              axios
                .post("Wards", newWard)
                .then(response => {})
                .catch(err => {});
            });

          this.setState({
            hospitals,
            modalInfoDescription:
              "Szpital " + this.state.tempUser.name + " został zmieniony.",
            isLoading: false
          });
        }

        this.toggleModal();
        this.infoToggleModal();
      })
      .catch(error => {
        this.setState({
          isLoading: false,
          modalInfoDescription:
            "Szpital nie został zmieniony. Coś poszło nie tak."
        });
        this.toggleModal();
        this.infoToggleModal();
        console.log(error);
      });
  };

  deleteHospital = () => {
    this.setState({ isLoading: true });

    axios
      .delete("Hospitals/" + this.state.tempHospital.id)
      .then(response => {
        if (response.status === 200) {
          let hospitals = this.state.hospitals;

          hospitals = hospitals.filter(
            x => x.id !== this.state.tempHospital.id
          );

          this.setState({
            hospitals,
            modalInfoDescription:
              "Szpital " + this.state.tempHospital.name + " został usunięty."
          });
        }

        this.setState({ isLoading: false });
        this.toggleModal();
        this.infoToggleModal();
      })
      .catch(() => {
        this.setState({
          isLoading: false,
          modalInfoDescription:
            "Szpital nie został usunięty. Coś poszło nie tak."
        });
        this.toggleModal();
        this.infoToggleModal();
      });
  };

  infoToggleModal = () => {
    this.setState({ infoModalOpened: !this.state.infoModalOpened });
  };

  render() {
    return (
      <div>
        {this.editHospitalModal()}
        {this.infoModal()}
        <div className="edit-hospitals">
          <Table size="sm" hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Nazwa</th>
                <th>Ulica</th>
                <th>Miasto</th>
                <th>Kod pocztowy</th>
                <th>Województwo</th>
              </tr>
            </thead>
            <tbody>
              {this.state.hospitals.map((hospital, i) => {
                return (
                  <tr
                    key={i}
                    onClick={() => this.elementClicked(i)}
                    style={{ cursor: "pointer" }}
                  >
                    <th scope="row">{i}</th>
                    <th>{hospital.name}</th>
                    <th>{hospital.street}</th>
                    <th>{hospital.city}</th>
                    <th>{hospital.zip}</th>
                    <th>{hospital.district}</th>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    );
  }

  infoModal = () => {
    return (
      <Modal isOpen={this.state.infoModalOpened} onClick={this.infoToggleModal}>
        <ModalHeader toggle={this.infoToggleModal}>Edycja szpitala</ModalHeader>
        <ModalBody>{this.state.modalInfoDescription}</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.infoToggleModal}>
            Dalej
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  removeWard = index => {
    let tempHospital = this.state.tempHospital;

    if (tempHospital.wards.length <= 1) {
      this.setState({
        modalInfoDescription:
          "Każdy szpital musi miec przynajmniej jeden oddział."
      });
      this.infoToggleModal();
    } else {
      tempHospital.wards.splice(index, 1);

      this.updateCurrentWard(tempHospital);

      this.setState({ tempHospital });
    }
  };

  addWard = () => {
    let tempHospital = this.state.tempHospital;

    tempHospital.wards.push({
      type: store.wards.indexOf(tempHospital.ward),
      hospitalId: tempHospital.id
    });

    this.updateCurrentWard(tempHospital);

    this.setState({ tempHospital });
  };

  updateCurrentWard = tempHospital => {
    let firstWard = store.wards.filter(
      (ward, i) =>
        tempHospital.wards === undefined ||
        !tempHospital.wards.length ||
        !tempHospital.wards.some(hospitalWard => hospitalWard.type === i)
    )[0];

    tempHospital.ward = firstWard;
  };

  editHospitalModal = () => {
    return (
      <Modal isOpen={this.state.modalOpened}>
        <ModalHeader toggle={this.toggleModal}>Edytuj szpital</ModalHeader>
        <ModalBody>
          <Form className="form" onSubmit={this.handleSubmit}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Nazwa szpitala</Label>
                  <Input
                    type="text"
                    placeholder="Nazwa"
                    value={this.state.tempHospital.name}
                    onChange={e => this.handleChange("name", e)}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Ulica</Label>
                  <Input
                    type="text"
                    placeholder="Ulica"
                    value={this.state.tempHospital.street}
                    onChange={e => this.handleChange("street", e)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Miasto</Label>
                  <Input
                    type="text"
                    placeholder="Miasto"
                    value={this.state.tempHospital.city}
                    onChange={e => this.handleChange("city", e)}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Kod pocztowy</Label>
                  <Input
                    type="text"
                    placeholder="Kod pocztowy"
                    value={this.state.tempHospital.zip}
                    onChange={e => this.handleChange("zip", e)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={6}></Col>
              <Col md={6}></Col>
            </Row>

            <FormGroup>
              <Label>Województwo</Label>
              <Input
                type="select"
                name="select"
                value={this.state.tempHospital.district}
                onChange={e => this.handleChange("district", e)}
              >
                {store.districts.map((item, i) => {
                  return <option key={i}>{item}</option>;
                })}
              </Input>
            </FormGroup>
            <Label>Oddziały</Label>
            {this.state.tempHospital.wards === undefined ||
            !this.state.tempHospital.wards.length ? (
              <FormGroup>
                <Label>Brak</Label>
              </FormGroup>
            ) : (
              this.state.tempHospital.wards.map((ward, i) => {
                return (
                  <Row key={i} className="ward-row">
                    <Col md={9}>{store.wards[ward.type]}</Col>
                    <Col md={3}>
                      <Button color="danger" onClick={() => this.removeWard(i)}>
                        Usuń
                      </Button>
                    </Col>
                  </Row>
                );
              })
            )}
            <hr />
            {store.wards.filter(
              (ward, i) =>
                this.state.tempHospital.wards === undefined ||
                !this.state.tempHospital.wards.length ||
                !this.state.tempHospital.wards.some(
                  hospitalWard => hospitalWard.type === i
                )
            ).length ? (
              <Row form>
                <Label>Dodaj oddział</Label>
                <Col md={9}>
                  <Input
                    type="select"
                    name="select"
                    value={this.state.tempHospital.ward}
                    onChange={e => this.handleChange("ward", e)}
                  >
                    {store.wards
                      .filter(
                        (ward, i) =>
                          this.state.tempHospital.wards === undefined ||
                          !this.state.tempHospital.wards.length ||
                          !this.state.tempHospital.wards.some(
                            hospitalWard => hospitalWard.type === i
                          )
                      )
                      .map((item, i) => {
                        return <option key={i}>{item}</option>;
                      })}
                  </Input>
                </Col>
                <Col md={3}>
                  <Button color="primary" onClick={this.addWard}>
                    Dodaj
                  </Button>
                </Col>
              </Row>
            ) : (
              <Label>Nie ma więcej oddziałów</Label>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.toggleModal}>
            Anuluj
          </Button>
          <Button
            color="danger"
            onClick={this.deleteHospital}
            disabled={this.state.isLoading}
          >
            Usuń
          </Button>
          <Button
            color="primary"
            type="submit"
            disabled={this.state.isLoading}
            onClick={this.updateHospital}
          >
            Zapisz
          </Button>
        </ModalFooter>
      </Modal>
    );
  };
}

export default withRouter(EditHospitalsPanel);
