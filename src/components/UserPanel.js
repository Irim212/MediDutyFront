import React from "react";
import "../App.css";

import store from "../store";
import { withRouter, Switch, Route } from "react-router-dom";
import UserPanelNavBar from "./UserPanelNavBar";
import UserCalendar from "./UserCalendarPanel";
import EditUserPanel from "./EditUsersPanel";
import AdduserPanel from "./AddUserPanel";
import AddHospitalPanel from "./AddHospitalPanel";

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
              <AdduserPanel />
            </Route>
            <Route path="/user-panel/edit-users">
              <EditUserPanel />
            </Route>
            <Route path="/user-panel/add-hospital">
              <AddHospitalPanel />
            </Route>
          </Switch>
        </div>
      </div>
    );
  }
}

export default withRouter(UserPanel);
