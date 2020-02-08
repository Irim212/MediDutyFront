import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "../App.css";

import axios from "axios";
import { withRouter } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  ModalFooter,
  Form,
  FormGroup,
  Input
} from "reactstrap";

import store from "./../store";

class UserCalendarPanel extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      events: [],
      pickUserModal: false,
      selfHospital: null,
      selfWardId: -1,
      wardUsers: [],
      pickedUser: {
        id: -1
      }
    };
  }

  componentDidMount() {
    this._isMounted = true;

    axios
      .get("Scheduler")
      .then(response => {
        if (!this._isMounted) {
          return;
        }

        if (response.status === 200) {
          this.setState({
            events: response.data[0].map(item => {
              let newItem = {
                id: item.id,
                userId: item.userId,
                title: item.comment,
                start: item.startsAt,
                end: item.endsAt
              };

              return newItem;
            })
          });
        }
      })
      .catch(() => {});

    axios
      .get("Wards/userId/" + store.auth.user.primarysid)
      .then(response => {
        if (!this._isMounted) {
          return;
        }
        if (response.status === 200) {
          this.setState({ selfWardId: response.data.id });
        }
      })
      .catch(console.log);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  dateClicked = args => {
    console.log(args);
  };

  selected = args => {
    console.log(args);
  };

  render() {
    return (
      <div className="calendar-container">
        {this.pickUserModal()}
        <div>
          <Row>
            <Col md={3}>
              <Button color="primary" onClick={this.openPickUserModal}>
                Dodaj dyżur
              </Button>
            </Col>
          </Row>
        </div>
        <FullCalendar
          defaultView="dayGridMonth"
          plugins={[dayGridPlugin, interactionPlugin]}
          events={this.state.events}
          dateClick={this.dateClicked}
          select={this.selected}
        />
      </div>
    );
  }

  openPickUserModal = () => {
    if (this.state.selfWardId === -1) {
      return;
    }

    axios
      .get("Users/wardId/" + this.state.selfWardId)
      .then(response => {
        if (!this._isMounted) {
          return;
        }

        if (response.status === 200) {
          this.setState({
            wardUsers: response.data[0],
            pickedUser: response.data[0][0]
          });
          this.togglePickUserModal();
        }
      })
      .catch(() => {});
  };

  togglePickUserModal = () => {
    this.setState({ pickUserModal: !this.state.pickUserModal });
  };

  pickUser = () => {};

  handleChange = event => {
    console.log(this.state.wardUsers[event.target.value]);
    this.setState({ pickedUser: this.state.wardUsers[event.target.value] });
  };

  pickUserModal() {
    return (
      <Modal isOpen={this.state.pickUserModal}>
        <ModalHeader>
          Dobierz lekarza do dyżuru, który próbujesz utworzyć
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              {this.state.wardUsers !== null && (
                <FormGroup>
                  <Label>Lekarz</Label>
                  <Input
                    type="select"
                    name="select"
                    value={this.state.pickedUser}
                    onChange={this.handleChange}
                  >
                    {this.state.wardUsers.map((item, i) => {
                      return (
                        <option key={item.id} value={i}>
                          {item.firstName + " " + item.lastName}
                        </option>
                      );
                    })}
                  </Input>
                </FormGroup>
              )}
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.pickUser}>
            Kontynuuj
          </Button>{" "}
          <Button color="secondary" onClick={this.togglePickUserModal}>
            Anuluj
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default withRouter(UserCalendarPanel);
