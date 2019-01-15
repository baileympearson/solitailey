/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

import React, { Component, Fragment } from "react";
import styled from "styled-components";

import {format} from "date-fns";

import {  SecondaryButton } from "./shared";

import { Wrapper } from "./login-auth";

/*************************************************************************/

let Container = styled.div`
  display : flex;
  justify-content: center;
`;

let StyledTable = styled.table`
  display : flex;
  justify-content: center;
  width: 900px;
  flex-direction : column;
`;

let Tr = styled.tr`
  display : flex;
  justify-content: space-around;
  width: 100%;
`;

let Td = styled.td`
  margin: 10px;
  padding: 10px;
`;

let P = styled.p`
  text-align : right;
`;


let Info = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 20px;
`;

let InfoDiv = styled.div`
  margin: 10px;
`;

let Button = styled(SecondaryButton)`
  font-size : 16px;
  width: 20%;
`;

let InfoBlock = ({username,first_name,last_name,primary_email,city}) => {
  return <Info>
    <img src={localStorage.getItem('profileImage')} alt="profile picture" style={{"width" : "200px", height : "200px"}}/>
    <InfoDiv>
      <P> Username:</P>
      <P> First Name:</P>
      <P> Last Name:</P>
      <P> City:</P>
      <P> Email:</P>
    </InfoDiv>
    <InfoDiv>
      <p> {username} </p>
      <p> {first_name} </p>
      <p> {last_name}</p>
      <p> {city}</p>
      <p> {primary_email}</p>
    </InfoDiv>
  </Info>;
};

let Table = props => {
  let rows = props.games.map((game, index) => {
    let date = new Date(game.start);
    const url = game.active
      ? `/game/${game.id}`
      : `/results/${game.id}`;
    return (
      <Tr key={index}>
        <Td><a href={url}>{game.active ? "Active" : "Complete"}</a></Td>
        <Td>{ format(date,"M/D/YY")}</Td>
        <Td> {game.moves} </Td>
        <Td> {game.score} </Td>
        <Td> {game.game} </Td>
      </Tr>
    );
  });
  return (
    <StyledTable>
      <thead>
        <Tr>
          <Td> Status</Td>
          <Td> Start Date</Td>
          <Td> Number of Moves</Td>
          <Td> Score</Td>
          <Td> Game Type</Td>
        </Tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </StyledTable>
  );
};

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: this.props.match.params.username,
      email : "",
      city : "",
      first_name : "",
      last_name : "",
      games : []
    };

    this.newGame = this.newGame.bind(this);
  }

  componentDidMount() {
    fetch(`/v1/user/${this.state.username}`)
      .then(data => data.json())
      .then(data => this.setState({ ...data }))
  }

  newGame() {
    this.props.history.push('/start');
  }

  render() {
    let startGameLink = <div/>;
    let editProfile = <div/>;

    if (this.props.loggedIn && this.state.username === localStorage.getItem('username')) {
      editProfile = <Container><Button onClick={() => this.props.history.push('/edit')}> Edit </Button></Container>;
      startGameLink = <Container><Button onClick={this.newGame}> New Game </Button></Container>;
    }

    return (
      <Fragment>
        <Container >
          <InfoBlock {...this.state}/>
        </Container>
        {startGameLink}
        {editProfile}
        <Container>
            {
              this.state.games.length > 0 ?  <Table games={this.state.games}/> : <div> You don't have any games yet! </div>
            }
        </Container>
      </Fragment>
    );
  }
}

const Wrapped = Wrapper(Profile);

export { Wrapped as Profile };