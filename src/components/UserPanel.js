import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import "../App.css";
import { Button } from "reactstrap";
import axios from "axios";

import store from "../store";
import { withRouter } from "react-router-dom";

class UserPanel extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      events: []
    };
  }

  componentDidMount = () => {
    this._isMounted = true;

    axios
      .get("Scheduler/userId/" + store.auth.user.primarysid)
      .then(response => {
        if (response.status === 200 && this._isMounted) {
          this.setState({
            events: response.data[0].map(item => {
              let newItem = {
                title: item.comment,
                start: item.startsAt,
                end: item.endsAt
              };

              return newItem;
            })
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  logout = event => {
    event.preventDefault();
    store.auth.logout();
    this.props.history.push("/");
  };

  render() {
    return (
      <div>
        <h2 className="text-center mb-lg-5">Panel</h2>
        <div className="logout-button">
          <Button className="btn-lg btn-dark btn-block" onClick={this.logout}>
            Wyloguj się
          </Button>
        </div>

        <div className="calendar-container">
          <FullCalendar
            defaultView="dayGridMonth"
            plugins={[dayGridPlugin]}
            events={this.state.events}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(UserPanel);
