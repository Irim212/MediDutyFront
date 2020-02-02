import React from "react";
import "../App.css";
import { withRouter, Redirect } from "react-router-dom";

import {
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Nav,
  Dropdown,
  NavItem,
  NavLink
} from "reactstrap";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import RegisterPanel from "./RegisterPanel";
import store from "../store";
import EditUsersPanel from "../EditUsersPanel";

class AdminPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isUserDropdownOpen: false
    };
  }

  toggleUserDropdownOpen = () => {
    this.setState({ isUserDropdownOpen: !this.state.isUserDropdownOpen });
  };

  logout = () => {
    store.auth.logout();
    this.props.history.push("/");
  };

  render() {
    return store.auth.isAdministrator() ? (
      <div className="admin-panel">
        <div className="admin-nav">
          <Nav pills>
            <Dropdown
              nav
              isOpen={this.state.isUserDropdownOpen}
              toggle={this.toggleUserDropdownOpen}
            >
              <DropdownToggle nav caret>
                Użytkownicy
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem href="/adminPanel">
                  Dodaj użytkownika
                </DropdownItem>
                <DropdownItem href="/adminPanel/edit-users">
                  Edytuj użytkowników
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <NavItem>
              <NavLink onClick={this.logout} href="#">
                Wyloguj
              </NavLink>
            </NavItem>
          </Nav>
        </div>
        <Router>
          <div>
            <Switch>
              <Route path="/adminPanel/add-user">
                <RegisterPanel />
              </Route>
              <Route path="/adminPanel/edit-users">
                <EditUsersPanel />
              </Route>
              <Route path="/">
                <Redirect
                  to={{
                    pathname: "/adminPanel/add-user",
                    state: { from: this.props.location }
                  }}
                />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    ) : (
      <Redirect
        to={{
          pathname: "/",
          state: { from: this.props.location }
        }}
      />
    );
  }
}

export default withRouter(AdminPanel);
