/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

// Necessary modules
import React, { Component, Fragment } from "react";
import { render } from "react-dom";
import { BrowserRouter, Route } from "react-router-dom";

import { Header } from "./components/header";
import { Landing } from "./components/landing";
import { Login } from "./components/login";
import { Register } from "./components/register";
import { Profile } from "./components/profile";
import { Start } from "./components/start";
import { Results } from "./components/results";
import { Game } from "./components/game";
import { Edit } from "./components/edit";
import { Logout } from "./components/logout";
// import { TmpLogin } from "./components/login";

/*************************************************************************/

const defaultUser = {
  username: "",
  first_name: "",
  last_name: "",
  primary_email: "",
  city: "",
  games: []
};

class MyApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
        loggedIn: localStorage.getItem("username") !== null
    };

    this.logout = this.logout.bind(this);
    this.logIn = this.logIn.bind(this);
  }

  async logIn({ username, primary_email }) {
      localStorage.setItem("username", username);
      localStorage.setItem("primaryEmail", primary_email);
      localStorage.setItem("profileImage","/images/no-profile.png");
      this.setState({ loggedIn: true });
  }

  async logout() {
    await fetch(`/v1/session`,{
      method: "DELETE"
    });
    await this.setState( { loggedIn : false });
    localStorage.clear();

    return Promise.resolve();
  }

  render() {
    return (
      <BrowserRouter>
        <Fragment>
          <Route
            path="/"
            render={props =>
              <Header
                loggedIn={this.state.loggedIn}
                logout={this.logout}
                {...props}
              />
            }
          />
          <Route exact path="/" render={props => { console.log(this.state.loggedIn); return <Landing {...props} loggedIn={this.state.loggedIn} />}} />
          <Route
            path="/login"
            render={props => (
              <Login
                {...props}
                logIn={this.logIn}
              />
            )}
          />

          <Route path="/edit" render={ props =>
            <Edit {...props} loggedIn={this.state.loggedIn} login={this.logIn} />
          } />

          <Route
            path="/profile/:username"
            render={props => (
              <Profile {...props} loggedIn={this.state.loggedIn} />
            )}
          />
          <Route path="/start" render={ props => <Start {...props} loggedIn={this.state.loggedIn} /> }  />
          <Route path="/results/:id" render={props => <Results {...props} loggedIn={this.state.loggedIn}/>} />
          <Route path="/game/:id" render={props => <Game {...props} loggedIn={this.state.loggedIn}/>} />
          <Route path="/logout" render={props =>
              <Logout {...props} logOut={this.logout}/>
          }/>
        </Fragment>
      </BrowserRouter>
    );
  }
}

render(<MyApp />, document.getElementById("mainDiv"));
