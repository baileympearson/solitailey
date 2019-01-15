/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Pile } from "./pile";
import styled from "styled-components";
import { Wrapper } from "./login-auth";

/*************************************************************************/

const CardRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 2em;
`;

const CardRowGap = styled.div`
  flex-grow: 2;
`;

const GameBase = styled.div`
  grid-row: 2;
  grid-column: sb / main;
`;

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      target: undefined,
      startDrag: { x: 0, y: 0 },
      pile1: [],
      pile2: [],
      pile3: [],
      pile4: [],
      pile5: [],
      pile6: [],
      pile7: [],
      stack1: [],
      stack2: [],
      stack3: [],
      stack4: [],
      draw: [],
      discard: [],
      src : "",
      dest : "",
      cards : [],
      status : ""
    };

    this.onClick = this.onClick.bind(this);
    this.validateAndUpdate = this.validateAndUpdate.bind(this);
  }

  componentDidMount() {
    fetch(`/v1/game/${this.props.match.params.id}`)
      .then(res => res.json())
      .then(data => {
        this.setState({
          pile1: data.pile1,
          pile2: data.pile2,
          pile3: data.pile3,
          pile4: data.pile4,
          pile5: data.pile5,
          pile6: data.pile6,
          pile7: data.pile7,
          stack1: data.stack1,
          stack2: data.stack2,
          stack3: data.stack3,
          stack4: data.stack4,
          draw: data.draw,
          discard: data.discard,
          src : "",
          dest : "",
          cards : [],
          status : 'waitFirstClick'
        });
      })
      .catch(err => console.log(err));
  }

  async validateAndUpdate(){
    let move = { src: this.state.src, dest: this.state.dest, cards: this.state.cards };

    let sendMove = () => {
      return fetch(`/v1/game/${this.props.match.params.id}`, {
        method: "PUT",
        body: JSON.stringify({ move: move }),
        credentials: "include",
        headers: {
          "content-type": "application/json"
        }
      });
    };

    try {
      let data = await sendMove();

      data = await data.json();

      data['src'] = '';
      data['dest'] = '';
      data['cards'] = [];
      data['status'] = 'waitFirstClick';

      this.setState(data);
    } catch (err) {
      console.log(err);
      this.setState({ src: "", dest: "", cards: [], status: "waitFirstClick" });
    }
  }

  async onClick(ev) {
    let target = ev.target;

    if (/face_down/.test(target.src) && target.pile !== 'draw')
      return;

    // have we clicked once yet? if yes, go into handler
    if (this.state.status === 'waitFirstClick'){
      if (this.state[target.pile].length === 0 && target.pile !== 'draw')
        return;

      let state = { src : target.pile };
      if (target.pile === 'draw'){
        state['status'] = 'validate';
        state['dest'] = 'discard';

        let length = this.state.draw.length;
        state['cards'] = length === 0 ? [] : [this.state.draw[length - 1]];
      } else {
        state['status'] = 'waitSecondClick';
        state['cards'] = this.state[target.pile].slice(target.index);
      }

      await this.setState( state );
    } else if (this.state.status === 'waitSecondClick'){
      await this.setState({ dest : target.pile, status : 'validate' })
    }

    if (this.state.status === 'validate')
      this.validateAndUpdate();
  }

  render() {
    return (
      <GameBase >
        <CardRow>
          <Pile cards={this.state.stack1} spacing={0} onClick={this.onClick} pile="stack1"/>
          <Pile cards={this.state.stack2} spacing={0} onClick={this.onClick} pile="stack2"/>
          <Pile cards={this.state.stack3} spacing={0} onClick={this.onClick} pile="stack3"/>
          <Pile cards={this.state.stack4} spacing={0} onClick={this.onClick} pile="stack4"/>
          <CardRowGap />
          <Pile cards={this.state.draw} spacing={0} onClick={this.onClick} pile="draw"/>
          <Pile cards={this.state.discard} spacing={0} onClick={this.onClick} pile="discard"/>
        </CardRow>
        <CardRow>
          <Pile cards={this.state.pile1} onClick={this.onClick} pile="pile1"/>
          <Pile cards={this.state.pile2} onClick={this.onClick} pile="pile2"/>
          <Pile cards={this.state.pile3} onClick={this.onClick} pile="pile3"/>
          <Pile cards={this.state.pile4} onClick={this.onClick} pile="pile4"/>
          <Pile cards={this.state.pile5} onClick={this.onClick} pile="pile5"/>
          <Pile cards={this.state.pile6} onClick={this.onClick} pile="pile6"/>
          <Pile cards={this.state.pile7} onClick={this.onClick} pile="pile7"/>
        </CardRow>
      </GameBase>
    );
  }
}

Game.propTypes = {
  match: PropTypes.object.isRequired
};

// must be logged in
const WrappedGame = Wrapper(Game);

export { WrappedGame as Game }
