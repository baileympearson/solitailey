/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

import React, { Fragment, Component } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { style } from "./style";
import { SecondaryButton } from "./shared";

/*************************************************************************/

let LoginBlock = styled.div`
  display : flex;
  flex-direction: column;
`;

let StyledLogo = styled.h1`
  font-size : 60px;
  color     : ${style.primary_color};
  margin    : 0;
  margin-left : 4px;
`;


export class Landing extends Component {
  constructor(props) {
    super(props);

    if (this.props.loggedIn)
        return this.props.history.push(`/profile/${localStorage.getItem("username")}`);

    // nothing to do here
  }

  async login() {
      if (this.props.loggedIn)
          return this.props.history.push(`/profile/${localStorage.getItem("username")}`);

      // guess you're not logged in
      document.location = "/v1/auth/login";
  }

  render() {
    let style = {
      position    : 'absolute',
      marginLeft  : '15%',
      marginTop   :   '380px'
    };
    return (
      <div style={style}>
        <StyledLogo > Solitailey </StyledLogo>

        <LoginBlock>
          <SecondaryButton onClick={this.login.bind(this)}> Login with Github </SecondaryButton>
          <SecondaryButton onClick={this.login.bind(this)}> Register with Github </SecondaryButton>
        </LoginBlock>
      </div>
    );
  }
}
