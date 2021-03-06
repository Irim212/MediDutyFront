import React from "react";
import "../App.css";

import store from "../store";
import { withRouter, Switch, Route } from "react-router-dom";
import UserPanelNavBar from "./UserPanelNavBar";
import UserCalendar from "./UserCalendarPanel";
import EditUserPanel from "./EditUsersPanel";
import AddUserPanel from "./AddUserPanel";
import AddHospitalPanel from "./AddHospitalPanel";
import EditHospitalsPanel from "./EditHospitalsPanel";

class UserPanel extends React.Component {
  logout = event => {
    event.preventDefault();
    store.auth.logout();
    this.props.history.push("/");
  };

  render() {
    return (
      <div>
        <UserPanelNavBar />
        <div>
          <Switch>
            <Route path="/user-panel/calendar">
              <UserCalendar />
            </Route>
            <Route path="/user-panel/add-user">
              <AddUserPanel />
            </Route>
            <Route path="/user-panel/edit-users">
              <EditUserPanel />
            </Route>
            <Route path="/user-panel/add-hospital">
              <AddHospitalPanel />
            </Route>
            <Route path="/user-panel/edit-hospitals">
              <EditHospitalsPanel />
            </Route>
          </Switch>
        </div>
      </div>
    );
  }
}

export default withRouter(UserPanel);
