import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";

// components
import LoginPanel from "./components/LoginPanel";
import UserPanel from "./components/UserPanel";
import store from "./store";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    let currentToken = localStorage.getItem("token");

    if (currentToken === "undefined" || currentToken === "null") {
      localStorage.removeItem("token");
      return;
    }

    if (currentToken !== undefined && currentToken !== null) {
      store.auth.authenticate(currentToken);
    }
  }

  render() {
    return (
      <div>
        <Router>
          <h1 className="text-center logo">
            <Link to="/" style={{ textDecoration: "none", color: "black" }}>
              <span className="font-weight-bold">
                <span style={{ color: "#a8323a" }}>Medi</span>
                App
              </span>
            </Link>
          </h1>
          <div>
            <Switch>
              <PrivateUserPanelRoute path="/user-panel">
                <UserPanel />
              </PrivateUserPanelRoute>
              <Route path="/">
                <LoginPanel />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}

function PrivateUserPanelRoute({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        store.auth.isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}
