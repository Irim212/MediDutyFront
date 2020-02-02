import { withRouter } from "react-router-dom";
import React from "react";
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
  FormGroup
} from "reactstrap";

import axios from "axios";
import store from "./store";

class EditUsers extends React.Component {
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
        isLoading: false,
        infoToggleModal: "",
        infoModalOpened: false
      }
    };
  }

  componentDidMount() {
    axios
      .get(store.API + "/Roles", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.auth.token}`
        }
      })
      .then(response => {
        if (response.status === 200) {
          this.setState({
            roles: response.data,
            checkedRoles: response.data.map(() => true)
          });
        }
      })
      .catch(error => {
        console.log(error);
      });

    axios
      .get(store.API + "/Users", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.auth.token}`
        }
      })
      .then(response => {
        if (response.status === 200) {
          this.setState({ users: response.data });
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  elementClicked = element => {
    let user = this.state.users[element];

    let tempChecked = this.state.roles.map(role => {
      return user.userRoles.some(userRole => {
        return userRole.roleId === role.id;
      });
    });

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
    let tempUser = this.state.tempUser;

    if (["firstName", "lastName", "email", "password"].includes(field)) {
      tempUser[field] = event.target.value;
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
      .delete(store.API + "/Users/" + this.state.tempUser.id, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.auth.token}`
        }
      })
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
      .catch(error => {
        console.log(error);
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
      .put(store.API + "/Users", user, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.auth.token}`
        }
      })
      .then(response => {
        if (response.status === 200) {
          let users = this.state.users;
          let index = users.indexOf(x => (x.id = user.id));
          users[index] = user;

          this.setState({
            users: users,
            modalInfoDescription:
              "Użytkownik " + this.state.tempUser.email + " został zmieniony."
          });
        }

        this.setState({ isLoading: false });
        this.toggleModal();
        this.infoToggleModal();
      })
      .catch(error => {
        console.log(error);
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

  render() {
    return (
      <div>
        <Modal
          isOpen={this.state.infoModalOpened}
          onClick={this.infoToggleModal}
        >
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
        <Modal isOpen={this.state.modalOpened}>
          <ModalHeader toggle={this.toggleModal}>
            Edytuj użytkownika
          </ModalHeader>
          <ModalBody>
            <Form className="login-form" onSubmit={this.handleSubmit}>
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
        <Table size="sm" hover>
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
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
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default withRouter(EditUsers);
