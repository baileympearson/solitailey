/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

import React, { Component, Fragment } from "react";
import styled from "styled-components";

/*************************************************************************/

let HeaderBar = styled.nav`
    background-color: #3a4858;
    padding: 20px 0;
    display: flex;
    justify-content: space-between;
    padding: 5px;
    align-items: center;
`;

let Logo = styled.div`
  color: white;
  font-size: 48px;
  font-family: "Comic Sans MS";
  margin: 8px;
  font-weight: bold;
`;

let NavLink = styled.div`
  color: white;
  font-size: 15px;
  &:hover {
    color: white;
    text-decoration: underline;
  }
`;

let Div = styled.div`
  display : flex;
  align-items: center;
  margin: 5px;
`;


export class Header extends Component {
    constructor(props) {
        super(props);
        this.logout = this.logout.bind(this);
    }

    async logout() {
        await this.props.logout();
        this.props.history.push("/");
    }

    render() {
        if (!this.props.loggedIn) {
            let tmp = <Fragment/>;
            if (this.props.location.pathname !== "/") {
                tmp = <Div>
                    <NavLink to='/login' onClick={() => this.props.history.push("/login")}> Log In </NavLink>
                    <NavLink to='/register' onClick={() => this.props.history.push("/register")}> Register </NavLink>
                </Div>;
            }
            return (
                <HeaderBar>
                    <Logo onClick={() => this.props.history.push("/")}> Solitailey </Logo>
                    {tmp}
                </HeaderBar>
            );
        }

        let gravitar = `${localStorage.getItem("profileImage")}`;

        return (
            <HeaderBar>
                <Logo onClick={() => this.props.history.push("/")}> Solitailey </Logo>
                <Div>
                    <NavLink onClick={() => this.props.history.push("/logout")}> Log Out </NavLink>
                    <NavLink to='/profile'
                             onClick={() => this.props.history.push(`/profile/${localStorage.getItem("username")}`)}>
                        <img src={gravitar} width={60} style={{ margin: "8px" }}/>
                    </NavLink>
                </Div>
            </HeaderBar>
        );
    }
}

