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
  calendarRef = React.createRef();

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
      infoModalDescription: "",
      deleteModal: false,
      eventToDelete: null
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
                userId: item.userId,
                id: item.id,
                title: item.comment,
                start: item.startsAt,
                end: item.endsAt,
                allDay: true
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
          startsAt: moment(this.state.startDate.date).format(),
          endsAt: moment(args.date)
            .add(1, "days")
            .format(),
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
              let calendarEvent = {
                userId: response.data.userId,
                id: response.data.id,
                title: response.data.comment,
                start: moment(response.data.startsAt).format(),
                end: moment(response.data.endsAt).format(),
                allDay: true
              };

              let events = this.state.events;
              events.push(calendarEvent);

              this.calendarRef.current.getApi().addEvent(calendarEvent);
              this.calendarRef.current.getApi().refetchEvents();

              this.setState({
                events,
                infoModalTitle: "Dyzur zmieniony",
                infoModalDescription: "Dyżur został zmieniony pomyślnie."
              });

              this.toggleInfoModal();
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

  eventClick = args => {
    this.setState({ eventToDelete: args.event });
    console.log(args.event);
    this.toggleDeleteModal();
  };

  eventChange = info => {
    let event = this.state.events.find(
      x => x.id === parseInt(info.event.id, 10)
    );

    if (!store.auth.isHeadmaster()) {
      if (parseInt(store.auth.user.primarysid, 10) !== event.userId) {
        this.setState({
          infoModalTitle: "Błąd",
          infoModalDescription: "Nie możesz edytować nie swoich dyżurów."
        });
        this.toggleInfoModal();

        info.revert();

        return;
      }
    }

    let newEvent = {
      startsAt: moment(info.event.start).format(),
      endsAt: moment(info.event.end).format(),
      userId: event.userId,
      id: parseInt(info.event.id, 10),
      comment: info.event.title
    };

    axios
      .put("Scheduler", newEvent)
      .then(response => {
        this.setState({
          infoModalTitle: "Dyzur zmieniony",
          infoModalDescription: "Dyżur został zmieniony pomyślnie."
        });
        this.toggleInfoModal();
      })
      .catch(err => {
        this.setState({
          infoModalTitle: "Zmiana nieudana",
          infoModalDescription:
            "Dyżur nie został zmieniony. Coś poszło nie tak."
        });
        this.toggleInfoModal();
        info.revert();
      });
  };

  render() {
    return (
      <div>
        {this.pickUserModal()}
        {this.infoModal()}
        {this.deleteModal()}
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
              ref={this.calendarRef}
              defaultView="dayGridMonth"
              plugins={[dayGridPlugin, interactionPlugin]}
              events={this.state.events}
              dateClick={this.dateClicked}
              eventClick={this.eventClick}
              editable={true}
              eventResize={this.eventChange}
              eventResizableFromStart={true}
              eventDrop={this.eventChange}
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
          if (store.auth.isHeadmaster()) {
            this.setState({
              wardUsers: response.data[0],
              pickedUser: response.data[0][0],
              creatingEventState: 0
            });

            this.togglePickUserModal();
          } else {
            this.setState({
              wardUsers: response.data[0],
              pickedUser: response.data[0].find(
                x => x.id === parseInt(store.auth.user.primarysid)
              ),
              creatingEventState: 1,
              infoModalTitle: "Wybierz Okres",
              infoModalDescription: "Wybierz datę początku i końca wydarzenia."
            });
            this.toggleInfoModal();
          }
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
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  toggleDeleteModal = () => {
    this.setState({ deleteModal: !this.state.deleteModal });
  };

  deleteEvent = () => {
    axios
      .delete("Scheduler/" + this.state.eventToDelete.id)
      .then(response => {
        let events = this.state.events;

        events.slice(
          events.findIndex(
            event => event.id === parseInt(this.state.eventToDelete.id, 10)
          )
        );

        this.state.eventToDelete.remove();
        this.calendarRef.current.getApi().refetchEvents();

        this.setState({
          events,
          infoModalTitle: "Usuwanie dyżuru",
          infoModalDescription: "Dyżur został usunięty."
        });
        this.toggleDeleteModal();
        this.toggleInfoModal();
      })
      .catch(err => {
        console.log(err);
        this.setState({
          infoModalTitle: "Usuwanie dyżuru",
          infoModalDescription: "Coś poszło nie tak."
        });
        this.toggleDeleteModal();
        this.toggleInfoModal();
      });
  };

  deleteModal() {
    return (
      <Modal isOpen={this.state.deleteModal}>
        <ModalHeader>Usuwanie dyżuru</ModalHeader>
        <ModalBody>
          <Label>Czy chcesz usunąć wybrany dyżur?</Label>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.toggleDeleteModal}>
            Anuluj
          </Button>
          <Button color="danger" onClick={this.deleteEvent}>
            Usuń
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default withRouter(UserCalendarPanel);
