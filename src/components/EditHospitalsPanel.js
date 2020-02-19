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
  Row,
  PaginationItem,
  PaginationLink,
  Pagination
} from "reactstrap";

import axios from "axios";
import store from "./../store";

class EditHospitalsPanel extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      pagination: {
        pageCount: 0,
        pageNo: 0,
        pageSize: 1,
        totalRecordsCount: 0
      },
      search: {
        phrase: "",
        actualPhrase: ""
      },
      hospitals: [],
      modalOpened: false,
      tempHospital: {
        id: "",
        name: "",
        street: "",
        city: "",
        zip: "",
        district: store.districts[0],
        wards: []
      },
      ward: store.wards[0],
      readonlyWards: [],
      infoToggleModal: "",
      infoModalOpened: false,
      isLoading: false
    };
  }

  componentDidMount() {
    this._isMounted = true;

    this.fetchHospitalsPage(1);
  }

  fetchHospitalsPage = pageNo => {
    let config = {
      headers: {
        "Paging-PageNo": pageNo,
        "Paging-PageSize": this.state.pagination.pageSize
      }
    };

    axios
      .get("Hospitals/search/" + this.state.search.actualPhrase, config)
      .then(response => {
        if (response.status === 200) {
          if (!this._isMounted) {
            return;
          }

          let pagination = {
            pageCount: parseInt(response.headers["paging-pagecount"], 10),
            pageNo: parseInt(response.headers["paging-pageno"], 10),
            pageSize: parseInt(response.headers["paging-pagesize"], 10),
            totalRecordsCount: parseInt(
              response.headers["paging-totalrecordscount"],
              10
            )
          };

          this.setState({ hospitals: response.data, pagination });
        }
      })
      .catch(() => {});
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  elementClicked = element => {
    axios
      .get("Wards/" + this.state.hospitals[element].id)
      .then(response => {
        let hospital = { ...this.state.hospitals[element] };
        hospital.wards = response.data[0];
        let readonlyWards = Array.from(response.data[0]);

        this.updateCurrentWard(hospital);

        this.setState({
          tempHospital: hospital,
          readonlyWards
        });
        this.toggleModal();
      })
      .catch(err => {});
  };

  toggleModal = () => {
    this.setState({ modalOpened: !this.state.modalOpened });
  };

  handleChange = (field, event) => {
    let tempHospital = { ...this.state.tempHospital };

    if (["name", "street", "city", "zip", "district", "ward"].includes(field)) {
      tempHospital[field] = event.target.value;
    }

    this.setState({ tempHospital });
  };

  updateHospital = () => {
    let hospital = { ...this.state.tempHospital };
    this.setState({ isLoading: true });

    axios
      .put("Hospitals", hospital)
      .then(response => {
        if (response.status === 200) {
          let hospitals = this.state.hospitals;
          let index = hospitals.findIndex(x => {
            return x.id === hospital.id;
          });
          hospitals[index] = hospital;

          this.state.tempHospital.wards
            .filter(
              newWard =>
                !this.state.readonlyWards.some(
                  readonlyWard => readonlyWard.type === newWard.type
                )
            )
            .forEach(newWard => {
              axios
                .post("Wards", newWard)
                .then(console.log)
                .catch(console.log);
            });

          this.state.readonlyWards
            .filter(
              readonlyWard =>
                this.state.tempHospital.wards.some(
                  x => x.id === readonlyWard.id
                ) === false
            )
            .forEach(wardToDelete => {
              axios
                .delete("Wards/" + wardToDelete.id)
                .then(console.log)
                .catch(console.log);
            });

          this.setState({
            hospitals,
            modalInfoDescription:
              "Szpital " + this.state.tempHospital.name + " został zmieniony.",
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

          this.fetchHospitalsPage(1);
        }

        this.setState({ isLoading: false });
        this.toggleModal();
        this.infoToggleModal();
      })
      .catch(err => {
        console.log(err);
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

  changeSearchPhrase = event => {
    let search = {
      phrase: event.target.value
    };

    this.setState({ search });

    if (this._searchTimeout !== undefined) {
      clearTimeout(this._searchTimeout);
      this._searchTimeout = undefined;
    }

    this._searchTimeout = setTimeout(() => {
      let search = this.state.search;
      search.actualPhrase = search.phrase;

      this.setState({ search });
      this.fetchHospitalsPage(1);
      this._searchTimeout = undefined;
    }, 500);
  };

  render() {
    return (
      <div>
        {this.editHospitalModal()}
        {this.infoModal()}
        <div className="edit-hospitals">
          <Form>
            <FormGroup>
              <Input
                type="text"
                placeholder="Wyszukaj szpitale"
                value={this.state.search.phrase}
                onChange={e => this.changeSearchPhrase(e)}
              ></Input>
            </FormGroup>
          </Form>
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
              {this.state.pagination.pageCount > 0 &&
                this.state.hospitals.map((hospital, i) => {
                  return (
                    <tr
                      key={i}
                      onClick={() => this.elementClicked(i)}
                      style={{ cursor: "pointer" }}
                    >
                      <th scope="row"></th>
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
          {this.pagination()}
        </div>
      </div>
    );
  }

  pagination = () => {
    let paginationItems = [];

    let min = Math.max(this.state.pagination.pageNo - 3, 1);
    let max = Math.min(
      this.state.pagination.pageNo + 3,
      this.state.pagination.pageCount
    );

    for (var i = min; i <= max; i++) {
      paginationItems.push(i);
    }

    return (
      <Pagination size="md">
        <PaginationItem>
          <PaginationLink
            first
            disabled={
              this.state.pagination.pageNo === 1 ||
              this._searchTimeout !== undefined ||
              this.state.pagination.pageCount <= 0
            }
            onClick={() => this.fetchHospitalsPage(1)}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            previous
            disabled={
              this.state.pagination.pageNo === 1 ||
              this._searchTimeout !== undefined ||
              this.state.pagination.pageCount <= 0
            }
            onClick={() =>
              this.fetchHospitalsPage(this.state.pagination.pageNo - 1)
            }
          />
        </PaginationItem>
        {paginationItems.map((item, index) => {
          return (
            <PaginationItem
              key={index}
              active={this.state.pagination.pageNo === item}
            >
              <PaginationLink
                disabled={
                  item === this.state.pagination.pageNo ||
                  this._searchTimeout !== undefined ||
                  this.state.pagination.pageCount <= 0
                }
                onClick={() => this.fetchHospitalsPage(item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationLink
            next
            disabled={
              this.state.pagination.pageNo ===
                this.state.pagination.pageCount ||
              this._searchTimeout !== undefined ||
              this.state.pagination.pageCount <= 0
            }
            onClick={() =>
              this.fetchHospitalsPage(this.state.pagination.pageNo + 1)
            }
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            last
            disabled={
              this.state.pagination.pageNo ===
                this.state.pagination.pageCount ||
              this._searchTimeout !== undefined ||
              this.state.pagination.pageCount <= 0
            }
            onClick={() =>
              this.fetchHospitalsPage(this.state.pagination.pageCount)
            }
          />
        </PaginationItem>
      </Pagination>
    );
  };

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
    let tempHospital = { ...this.state.tempHospital };

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
    let tempHospital = { ...this.state.tempHospital };

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
            ).length && (
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
