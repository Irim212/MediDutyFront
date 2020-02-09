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
import moment from "moment";

class UserCalendarPanel extends React.Component {
  _isMounted = false;
  calendarComponentRef = React.createRef();

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
      },
      infoModal: false,
      creatingEventState: 0,
      startDate: null,
      infoModalTitle: "",
      infoModalDescription: ""
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
            events: response.data.map(item => {
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
    if (this.state.creatingEventState === 1) {
      this.setState({ creatingEventState: 2, startDate: args });
    } else if (this.state.creatingEventState === 2) {
      this.setState({ creatingEventState: 0 });

      if (moment(this.state.startDate.date).isSameOrBefore(args.date)) {
        let newEvent = {
          startsAt: moment(this.state.startDate.date)
            .add(1, "days")
            .toDate(),
          endsAt: moment(args.date)
            .add(1, "days")
            .toDate(),
          userId: this.state.pickedUser.id,
          comment:
            this.state.pickedUser.firstName +
            " " +
            this.state.pickedUser.lastName
        };

        axios
          .post("Scheduler", newEvent)
          .then(response => {
            if (!this._isMounted) {
              return;
            }

            if (response.status === 201) {
              let newEvent = {
                id: response.data.id,
                userId: response.data.userId,
                title: response.data.comment,
                start: response.data.startsAt,
                end: response.data.endsAt
              };

              let events = this.state.events;
              events.push(newEvent);

              this.setState({ events });
            }
          })
          .catch(() => {});
      } else {
        this.setState({
          infoModalTitle: "Nieprawidłowy przedział",
          infoModalDescription:
            "Data końca musi być później lub tego samego dnia co data początku. Rozpocznij od nowa."
        });
        this.toggleInfoModal();
      }
    }
  };

  selected = args => {
    console.log(args);
  };

  render() {
    return (
      <div>
        {this.pickUserModal()}
        {this.infoModal()}
        <div>
          <div className="calendar-container">
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
              allDay={true}
            />
          </div>
        </div>
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
            pickedUser: response.data[0][0],
            creatingEventState: 0
          });

          this.togglePickUserModal();
        }
      })
      .catch(() => {});
  };

  togglePickUserModal = () => {
    this.setState({ pickUserModal: !this.state.pickUserModal });
  };

  pickUser = () => {
    this.setState({
      creatingEventState: 1,
      infoModalTitle: "Wybierz Okres",
      infoModalDescription: "Wybierz datę początku i końca wydarzenia."
    });
    this.togglePickUserModal();
    this.toggleInfoModal();
  };

  handleChange = event => {
    this.setState({ pickedUser: this.state.wardUsers[event.target.value] });
  };

  selectIndex = () => {
    return this.state.wardUsers.indexOf(this.state.pickedUser);
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
                    value={this.selectIndex()}
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

  toggleInfoModal = () => {
    this.setState({ infoModal: !this.state.infoModal });
  };

  infoModal() {
    return (
      <Modal isOpen={this.state.infoModal}>
        <ModalHeader>{this.state.infoModalTitle}</ModalHeader>
        <ModalBody>
          <Label>{this.state.infoModalDescription}</Label>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.toggleInfoModal}>
            Kontynuuj
          </Button>{" "}
        </ModalFooter>
      </Modal>
    );
  }
}

export default withRouter(UserCalendarPanel);
