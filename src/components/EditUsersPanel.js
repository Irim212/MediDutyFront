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
  FormText
} from "reactstrap";

import axios from "axios";
import store from "../store";

class EditUsersPanel extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      users: [],
      roles: [],
      modalOpened: false,
      tempUser: {
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        userRoles: [],
        checkedRoles: [],
        wardId: -1
      },
      infoToggleModal: "",
      infoModalOpened: false,
      isLoading: false
    };
  }

  componentDidMount() {
    this._isMounted = true;

    axios
      .get("Roles")
      .then(response => {
        if (!this._isMounted) {
          return;
        }
        if (response.status === 200) {
          this.setState({
            roles: response.data,
            checkedRoles: response.data.map(() => true)
          });
        }
      })
      .catch(() => {});

    axios
      .get("Users")
      .then(response => {
        if (!this._isMounted) {
          return;
        }

        if (response.status === 200) {
          this.setState({ users: response.data });

          this.updateUserHospitals();
        }
      })
      .catch(() => {});
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  elementClicked = element => {
    let user = { ...this.state.users[element] };

    let tempChecked = this.state.roles.map(role => {
      return user.userRoles.some(userRole => {
        return userRole.roleId === role.id;
      });
    });

    user.password = "";

    this.setState({
      tempUser: user,
      checkedRoles: tempChecked
    });
    this.toggleModal();
  };

  toggleModal = () => {
    this.setState({ modalOpened: !this.state.modalOpened });
  };

  handleChange = (field, event) => {
    let tempUser = { ...this.state.tempUser };

    if (["firstName", "lastName", "email", "password"].includes(field)) {
      tempUser[field] = event.target.value;
    }

    if (field === "ward") {
      tempUser.wardId = tempUser.hospital.wards.find(
        x => x.type === store.wards.indexOf(event.target.value)
      ).id;
    }

    this.setState({ tempUser });
  };

  onRoleChange = i => {
    let checkedRoles = this.state.checkedRoles;
    checkedRoles[i] = !checkedRoles[i];

    this.setState({ checkedRoles });
  };

  deleteUser = () => {
    this.setState({ isLoading: true });

    axios
      .delete("Users/" + this.state.tempUser.id)
      .then(response => {
        if (response.status === 200) {
          let users = this.state.users;

          users = users.filter(x => x.id !== this.state.tempUser.id);

          this.setState({
            users: users,
            modalInfoDescription:
              "Użytkownik " + this.state.tempUser.email + " został usunięty."
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
            "Użytkownik nie został usunięty. Coś poszło nie tak."
        });
        this.toggleModal();
        this.infoToggleModal();
      });
  };

  updateUser = () => {
    let user = this.state.tempUser;
    let checkedRoles = this.state.checkedRoles;
    this.setState({ isLoading: true });

    user.userRoles = user.userRoles.filter(item => {
      return checkedRoles[item.roleId - 1];
    });

    checkedRoles.forEach((checkedRole, checkedRoleIndex) => {
      if (checkedRole) {
        let userRoles = user.userRoles;

        if (
          !userRoles.some(userRole => {
            return userRole.roleId === checkedRoleIndex + 1;
          })
        ) {
          user.userRoles.push({
            userId: user.id,
            roleId: checkedRoleIndex + 1
          });
        }
      }
    });

    axios
      .put("Users", user)
      .then(response => {
        if (response.status === 200) {
          let users = this.state.users;
          let index = users.findIndex(x => x.id === user.id);
          users[index] = user;
          delete users[index]["password"];

          this.setState({
            users: users,
            modalInfoDescription:
              "Użytkownik " + this.state.tempUser.email + " został zmieniony.",
            isLoading: false
          });
        }

        this.toggleModal();
        this.infoToggleModal();
      })
      .catch(() => {
        this.setState({
          isLoading: false,
          modalInfoDescription:
            "Użytkownik nie został zmieniony. Coś poszło nie tak."
        });
        this.toggleModal();
        this.infoToggleModal();
      });
  };

  infoToggleModal = () => {
    this.setState({ infoModalOpened: !this.state.infoModalOpened });
  };

  updateUserHospitals = () => {
    let users = this.state.users;

    users.forEach((user, index) => {
      axios
        .get("Hospitals/wardId/" + user.wardId)
        .then(response => {
          if (!this._isMounted) {
            return;
          }

          if (response.status === 200) {
            let currentUsers = this.state.users;
            let userIndex = currentUsers.findIndex(x => x.id === user.id);
            currentUsers[userIndex].hospital = response.data[0];
            this.setState({ users: currentUsers });
          }

          this.updateuserWard(user);
        })
        .catch(err => {
          console.log(err);
        });
    });
  };

  updateuserWard = user => {
    axios
      .get("Wards/" + user.hospital.id)
      .then(response => {
        if (!this._isMounted) {
          return;
        }

        if (response.status === 200) {
          let currentUsers = this.state.users;
          let userIndex = currentUsers.findIndex(x => x.id === user.id);
          currentUsers[userIndex].hospital.wards = response.data[0];
          this.setState({ users: currentUsers });
        }
      })
      .catch(() => {});
  };

  getWardForUser = user => {
    if (user.hospital && user.hospital.wards) {
      let ward = user.hospital.wards.find(x => x.id === user.wardId);

      if (ward) {
        return store.wards[ward.type];
      }
    }

    return "";
  };

  render() {
    return (
      <div>
        {this.infoModal()}
        {this.registerModal()}
        <div className="edit-users">
          <Table size="sm" hover>
            <thead>
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Szpital</th>
                <th>Oddział</th>
              </tr>
            </thead>
            <tbody>
              {this.state.users.map((user, i) => {
                return (
                  <tr
                    key={i}
                    onClick={() => this.elementClicked(i)}
                    style={{ cursor: "pointer" }}
                  >
                    <th scope="row">{i}</th>
                    <th>{user.firstName}</th>
                    <th>{user.lastName}</th>
                    <th>{user.email}</th>
                    {user.hospital && <th>{user.hospital.name}</th>}
                    {user.hospital && user.hospital.wards && (
                      <th>{this.getWardForUser(user)}</th>
                    )}
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
        <ModalHeader toggle={this.infoToggleModal}>
          Edycja użytkownika
        </ModalHeader>
        <ModalBody>{this.state.modalInfoDescription}</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.infoToggleModal}>
            Dalej
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  registerModal = () => {
    return (
      <Modal isOpen={this.state.modalOpened}>
        <ModalHeader toggle={this.toggleModal}>Edytuj użytkownika</ModalHeader>
        <ModalBody>
          <Form className="form" onSubmit={this.handleSubmit}>
            <FormGroup>
              <Label>Imię</Label>
              <Input
                type="text"
                placeholder="Imię"
                value={this.state.tempUser.firstName}
                onChange={e => this.handleChange("firstName", e)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Nazwisko</Label>
              <Input
                type="text"
                placeholder="Nazwisko"
                value={this.state.tempUser.lastName}
                onChange={e => this.handleChange("lastName", e)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Adres E-mail"
                value={this.state.tempUser.email}
                onChange={e => this.handleChange("email", e)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Hasło</Label>
              <Input
                type="password"
                placeholder="Hasło"
                value={this.state.tempUser.password || ""}
                onChange={e => this.handleChange("password", e)}
              />
            </FormGroup>
            {this.state.roles.map((role, i) => {
              return (
                <FormGroup check key={i}>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={this.state.checkedRoles[i]}
                      onChange={() => this.onRoleChange(i)}
                    />
                    {role.name}
                  </Label>
                </FormGroup>
              );
            })}

            <FormGroup>
              <Label>Szpital</Label>

              {this.state.tempUser.hospital && (
                <FormText color="muted">
                  {this.state.tempUser.hospital.name}
                </FormText>
              )}
            </FormGroup>

            {this.state.tempUser.hospital && (
              <FormGroup>
                <Label>Oddział</Label>
                <Input
                  type="select"
                  name="select"
                  value={
                    store.wards[
                      this.state.tempUser.hospital.wards.find(
                        x => x.id === this.state.tempUser.wardId
                      ).type
                    ]
                  }
                  onChange={e => this.handleChange("ward", e)}
                >
                  {this.state.tempUser.hospital.wards.map((item, i) => {
                    return <option key={i}>{store.wards[item.type]}</option>;
                  })}
                </Input>
              </FormGroup>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.toggleModal}>
            Anuluj
          </Button>
          <Button
            color="danger"
            onClick={this.deleteUser}
            disabled={this.state.isLoading}
          >
            Usuń
          </Button>
          <Button
            color="primary"
            type="submit"
            disabled={this.state.isLoading}
            onClick={this.updateUser}
          >
            Zapisz
          </Button>
        </ModalFooter>
      </Modal>
    );
  };
}

export default withRouter(EditUsersPanel);
