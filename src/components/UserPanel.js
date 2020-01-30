import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import '../App.css';
import { Button } from 'reactstrap';

import store from '../store';
import { withRouter } from 'react-router-dom';

class UserPanel extends React.Component {

  constructor(props) {
    super(props);
  }

  logout = (event) => {
    event.preventDefault();
    store.auth.logout();
    this.props.history.push('/');
  }

  render() {
    return <div>
      <h1 className="text-center"><span className="font-weight-bold"><span style={{ color: "#a8323a" }}>Medi</span>App</span></h1>
      <h2 className="text-center mb-lg-5">Panel</h2>
      <div className="logout-button">
        <Button className="btn-lg btn-dark btn-block" onClick={this.logout}>Wyloguj się</Button>
      </div>

      <div className="calendar-container">
        <FullCalendar defaultView="dayGridMonth" plugins={[dayGridPlugin]} />
      </div>
    </div>
  }
}

export default withRouter(UserPanel);