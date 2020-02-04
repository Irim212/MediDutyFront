import React from "react";
import { Navbar, Nav, NavItem, NavLink } from "reactstrap";

import store from "./../store";
import { withRouter } from "react-router-dom";

class UserPanelNavBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = { links: [] };
  }

  componentDidMount() {
    let links = [];

    if (!store.auth.isAdministrator()) {
      links.push({
        path: "/user-panel/events",
        content: "Dyżury",
        active: true
      });

      links.push(this.props.history.push("/user-panel/calendar"));
    }

    if (store.auth.isAdministrator()) {
      links.push({
        path: "/user-panel/edit-users",
        content: "Edytuj użytkowników",
        active: true
      });

      this.props.history.push("/user-panel/edit-users");
    }

    links.push({
      content: "Wyloguj",
      callback: this.logout
    });

    this.setState({ links });
  }

  logout = () => {
    store.auth.logout();
    this.props.history.push("/");
  };

  render() {
    return (
      <div className="user-nav">
        <Navbar color="light" light expand="md">
          <Nav className="mr-auto" navbar>
            {this.state.links.map((link, i) => {
              if (link.path !== undefined) {
                return (
                  <NavItem key={i}>
                    <NavLink href={link.path} active={link.active}>
                      {link.content}
                    </NavLink>
                  </NavItem>
                );
              } else {
                return (
                  <NavItem key={i}>
                    <NavLink
                      onClick={link.callback}
                      style={{ cursor: "pointer" }}
                    >
                      {link.content}
                    </NavLink>
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
