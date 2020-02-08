import React from "react";
import { Navbar, Nav, NavItem } from "reactstrap";

import store from "./../store";
import { withRouter, NavLink as NavigationLink } from "react-router-dom";

class UserPanelNavBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = { links: [] };
  }

  componentDidMount() {
    let links = [];

    if (!store.auth.isAdministrator()) {
      links.push({
        path: "/user-panel/calendar",
        content: "Dyżury"
      });

      this.props.history.push("/user-panel/calendar");
    }

    if (store.auth.isAdministrator() || store.auth.isHeadmaster()) {
      links.push({
        path: "/user-panel/add-user",
        content: "Dodaj użytkownika"
      });

      links.push({
        path: "/user-panel/edit-users",
        content: "Edytuj użytkowników"
      });
    }

    if (store.auth.isAdministrator()) {
      links.push({
        path: "/user-panel/add-hospital",
        content: "Dodaj szpital"
      });

      links.push({
        path: "/user-panel/edit-hospitals",
        content: "Edytuj szpitale"
      });
    }

    links.push({
      content: "Wyloguj",
      callback: this.logout
    });

    this.setState({ links });
  }

  logout = event => {
    event.preventDefault();
    store.auth.logout();
    this.props.history.push("/");
  };

  render() {
    return (
      <div className="user-nav">
        <Navbar light expand="md">
          <Nav className="mr-auto" navbar>
            {this.state.links.map((link, i) => {
              if (link.path !== undefined) {
                return (
                  <NavItem key={i}>
                    <NavigationLink
                      to={link.path}
                      activeClassName="active-nav"
                      className="nav-item"
                    >
                      {link.content}
                    </NavigationLink>
                  </NavItem>
                );
              } else {
                return (
                  <NavItem key={i}>
                    <NavigationLink
                      to=""
                      onClick={link.callback}
                      style={{ cursor: "pointer" }}
                      className="nav-item"
                    >
                      {link.content}
                    </NavigationLink>
                  </NavItem>
                );
              }
            })}
          </Nav>
        </Navbar>
      </div>
    );
  }
}

export default withRouter(UserPanelNavBar);
