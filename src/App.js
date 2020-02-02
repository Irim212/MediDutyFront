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
import RegisterPanel from "./components/RegisterPanel";
import UserPanel from "./components/UserPanel";
import AdminPanel from "./components/AdminPanel";
import store from "./store";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    let currentToken = localStorage.getItem("token");

    if (currentToken !== "undefined" && currentToken !== "null") {
      store.auth.authenticate(currentToken);
    }
  }

  render() {
    return (
      <Router>
        <div>
          <h1 className="text-center logo">
            <Link to="/" style={{ textDecoration: "none", color: "black" }}>
              <span className="font-weight-bold">
                <span style={{ color: "#a8323a" }}>Medi</span>
                App
              </span>
            </Link>
          </h1>
          <Switch>
            <Route path="/register">
              <RegisterPanel />
            </Route>
            <Route path="/adminPanel">
              <AdminPanel />
            </Route>
            <PrivateRoute path="/userpanel">
              <UserPanel />
            </PrivateRoute>
            <Route path="/">
              <LoginPanel />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

function PrivateRoute({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        store.auth.isAuthenticated ? (
          !store.auth.isAdministrator() ? (
            children
          ) : (
            <Redirect
              to={{
                pathname: "/adminPanel",
                state: { from: location }
              }}
            />
          )
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
