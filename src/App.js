import React from 'react';
import './App.css';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
  } from "react-router-dom";

// components
import LoginPanel from './components/LoginPanel';
import RegisterPanel from './components/RegisterPanel';
import UserPanel from './components/UserPanel';
import store from './store';

 export default class App extends React.Component {

  constructor(props) {
    super(props);
    let currentToken = localStorage.getItem('token');

    if(currentToken !== 'undefined' && currentToken !== 'null') {
      store.auth.authenticate(currentToken);
    }
  }

  render() {

    return (
      <Router>
        <div>
          <Switch>
            <Route path="/register">
              <RegisterPanel />
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

function PrivateRoute({ children, ...rest}) {
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