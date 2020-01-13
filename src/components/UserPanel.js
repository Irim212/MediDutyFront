import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import '../App.css';
import { Button } from 'reactstrap';

import store from '../store';

import {
    useHistory
} from "react-router-dom";

export default function UserPanel() {

    const history = useHistory();

    function logout(event) {
        event.preventDefault();
        store.auth.logout();
        history.push('/');
    }

    return <div>
      <h1 className="text-center"><span className="font-weight-bold"><span style={{color: "#a8323a"}}>Medi</span>App</span></h1>
      <h2 className="text-center mb-lg-5">Panel</h2>
      <div className="logout-button">
        <Button className="btn-lg btn-dark btn-block" onClick={logout}>Wyloguj się</Button>
      </div>
      
      <div className="calendar-container">
        <FullCalendar defaultView="dayGridMonth" plugins={[dayGridPlugin]}/>
      </div>
    </div>
  }