/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

import React, { Component} from "react";

import { ContainerBody, Grid, FormLabel, FormInput, FormBlock, Notify, SecondaryButton } from "./shared";

/*************************************************************************/

export class Edit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username : localStorage.getItem("username"),
      first_name : "",
      last_name : "",
      city : "",
      primary_email : "",
      error : ""
    };

    this.updateProfile = this.updateProfile.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(ev) {
    this.setState( { [ev.target.name] : ev.target.value, error : ""} );
  }

  componentDidMount() {
    fetch(`/v1/user/${this.state.username}`).then(data => data.json())
      .then(data => {
        this.setState( {
          city          :   data.city,
          first_name    :   data.first_name,
          last_name     :   data.last_name,
          primary_email : data.primary_email
        });
      }
    )
  }

  async updateProfile(){
    try{
      let res = await fetch(`/v1/user`,{
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
        body : JSON.stringify(this.state)
      });

        if (res.status === 204)
          this.setState( { error: "successfully updated profile."});
        else
            this.setState( { error: "could not update profile."});
    } catch (err) {
        this.setState( { error: "could not update profile."});
    }
  }

  render() {
    return (
      <ContainerBody>
        <Grid>

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
            <div/>

          <div/>
          <FormBlock>
            <FormLabel> City: </FormLabel>
            <FormInput type="text"
                       onChange={this.onChange}
                       name="city"
                       value={this.state.city}/>
          </FormBlock>
          <div/>

          <div/>
          <FormBlock>
            <FormLabel/>
            <SecondaryButton onClick={this.updateProfile}> Update </SecondaryButton>
          </FormBlock>
          <div/>

        </Grid>
      </ContainerBody>
    );
  }
}