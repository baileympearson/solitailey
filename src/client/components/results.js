/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

import React, { Component, Fragment } from "react";
import styled from "styled-components";
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
  
  // &:hover {
  //   background-color : grey;
  // }
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

let InfoBlock = ({ moves, score, active, cards_remaining }) => {
    console.log(moves, score, active, cards_remaining );
  return <Info>
    <InfoDiv>
      <P> Number of Moves:</P>
      <P> Points:</P>
      <P> Cards Remaining: </P>
      <P> Able to Move:</P>
    </InfoDiv>
    <InfoDiv>
      <p> {moves.length} </p>
      <p> {"Not implemented"}</p>
      <p> {cards_remaining}</p>
      <p> { active ? "Yes" : "No"}</p>
    </InfoDiv>
  </Info>;
};

let TableRow = ({move, index}) => {
  return (
    <Tr>
      <Td> {index} </Td>
      <Td> {move.user.username} </Td>
      <Td> {move.src} </Td>
      <Td> {move.dst} </Td>
    </Tr>
  );
};

let Table = ({moves}) => {
  let rows = moves.map((item, index) => <TableRow key={index} move={item} index={index+1}/>);
  return (
    <StyledTable>
      <thead>
      <Tr>
        <Td>Id</Td>
        <Td>Player</Td>
        <Td>Source Pile</Td>
        <Td>Destination Pile</Td>
      </Tr>
      </thead>
      <tbody>
      {rows}
      </tbody>
    </StyledTable>
  );
};

class Results extends Component {
  constructor(props) {
    super(props);

    this.state = {
      game : {},
      gameId : props.match.params.id,
      moves : []
    }
  }

  componentDidMount() {
    fetch(`/v1/game/${this.state.gameId}?moves=`)
    .then(data => data.json())
    .then(data => {
      let val = data.moves.map(item => item._doc);
      this.setState( { moves : val, active : data.active, cards_remaining : data.cards_remaining  });
    })
  }


  render() {
    return (
      <Fragment>
      <Container >
        <InfoBlock {...this.state}/>
      </Container>
      <Container>
        <Table moves={this.state.moves}/>
      </Container>
        </Fragment>
    );
  }
}

let WrappedResults = Wrapper(Results);

export { WrappedResults as Results }