/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

import React, { Component, Fragment } from "react";

// import { FormParent, FormLabel, FormInput } from "./components";
import { ContainerBody, Grid, FormLabel, FormInput, FormBlock, Notify, SubmitButton } from "./shared";
import queryString from 'query-string';

/*************************************************************************/

export class Register extends Component {
  constructor(props) {
    super(props);

    const values = queryString.parse(props.location.search);

    // not the best way to do this i'd bet but removes the username
    // from the query string
    history.pushState({}, document.title, values.username);

    this.state = {
      username : values.username,
      first_name : "",
      last_name : "",
      primary_email : "",
      city : "",
      error : ""
    };

    this.register = this.register.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(ev) {
    this.setState( { [ev.target.name] : ev.target.value, error : ""} );
  }

  register(ev){
    ev.preventDefault();

    fetch('/v1/user',{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body : JSON.stringify(this.state)
    }).then( res => {
      if (res.ok){
          res.json()
            .then(user => {
                console.log(user);
              this.props.login(this.state);
              return user;
            })
            .then(user => this.props.history.push(`/profile/${user.username}`));
      } else {
        res.json().then(error => this.setState(error));
        // this.setState({ error : `count not register user`});
      }
    }).catch( err => console.log(err));

  }

  render() {
    return (
      <ContainerBody>
        <Grid>

            <div/>
            <FormBlock>
                <div> {"give us some more information about you!"} </div>
            </FormBlock>
            <div/>

          <Notify> {this.state.error} </Notify>
          <div/>
          <div/>

          <div/>
          <FormBlock>
            <FormLabel> First Name: </FormLabel>
            <FormInput type="text"
                       onChange={this.onChange}
                       name="first_name"
                       value={this.state.first_name}/>
          </FormBlock>
          <div/>

          <div/>
          <FormBlock>
            <FormLabel> Last Name: </FormLabel>
            <FormInput type="text"
                       onChange={this.onChange}
                       name="last_name"
                       value={this.state.last_name}/>
          </FormBlock>
          <div/>

          <div/>
          <FormBlock>
            <FormLabel> Email: </FormLabel>
            <FormInput type="text"
                       onChange={this.onChange}
                       name="primary_email"
                       value={this.state.primary_email}/>
          </FormBlock>
          <div></div>

          <div></div>
          <FormBlock>
            <FormLabel> City: </FormLabel>
            <FormInput type="text"
                       onChange={this.onChange}
                       name="city"
                       value={this.state.city}/>
          </FormBlock>
          <div></div>


          <div></div>
          <FormBlock>
            <FormLabel/>
            <SubmitButton onClick={this.register}> Register </SubmitButton>
          </FormBlock>
          <div></div>

        </Grid>
      </ContainerBody>
    );
  }
}
