import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import '../App.css';
import { Button } from 'reactstrap';
import axios from 'axios';

import store from '../store';
import { withRouter } from 'react-router-dom';

class UserPanel extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      events: [

      ]
    }
  }

  componentDidMount = () => {
    axios.get(store.API + '/Scheduler/userId/' + store.auth.user.primarysid,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + store.auth.token
        }
      })
      .then(response => {
        if (response.status === 200) {
          this.setState({
            events: response.data.map(item => {
              let newItem = {
                title: item[0].comment,
                start: item[0].startsAt,
                end: item[0].endsAt
              }

              return newItem;
            })
          })

          console.log(this.state.events);
        }
      }).catch(error => {
        console.log(error);
      })
  }

  logout = (event) => {
    event.preventDefault();
    store.auth.logout();
    this.props.history.push('/');
  }

  render() {
    return <div>
      <h2 className="text-center mb-lg-5">Panel</h2>
      <div className="logout-button">
        <Button className="btn-lg btn-dark btn-block" onClick={this.logout}>Wyloguj się</Button>
      </div>

      <div className="calendar-container">
        <FullCalendar defaultView="dayGridMonth" plugins={[dayGridPlugin]} events={this.state.events}/>
      </div>
    </div>
  }
}

export default withRouter(UserPanel);