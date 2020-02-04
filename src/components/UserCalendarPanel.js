import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import "../App.css";

import axios from "axios";
import { withRouter } from "react-router-dom";

class UserCalendarPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = { events: [] };
  }

  componentDidMount() {
    axios
      .get("Scheduler")
      .then(response => {
        if (response.status === 200 && this._isMounted) {
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
      .catch(err => {});
  }

  render() {
    return (
      <div className="calendar-container">
        <FullCalendar
          defaultView="dayGridMonth"
          plugins={[dayGridPlugin]}
          events={this.state.events}
        />
      </div>
    );
  }
}

export default withRouter(UserCalendarPanel);
