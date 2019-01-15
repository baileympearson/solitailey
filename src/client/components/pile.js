/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

/*************************************************************************/

const CardImg = styled.img`
  position: absolute;
  height: auto;
  width: 100%;
`;

export const Card = ({ card, top, left, onClick }) => {
  const style = { left: `${left}%`, top: `${top}%`};
  if (card === 'blank'){
    return <CardImg onClick={onClick} style={style} src={'/images/white.png'}/>;
  }
  const source = card.up
    ? `/images/${card.value}_of_${card.suit}.png`
    : "/images/face_down.jpg";
  const id = `${card.suit}:${card.value}`;
  return <CardImg id={id} onClick={onClick} style={style} src={source} />;
};

/*************************************************************************/

const PileBase = styled.div`
  margin: 5px;
  position: relative;
  display: inline-block;
  border: dashed 2px #808080;
  border-radius: 5px;
  width: 12%;
`;

const PileFrame = styled.div`
  margin-top: 140%;
`;

export const Pile = ({ cards, spacing, horizontal, up, onClick, pile }) => {
  let customOnClick = (ev,i) => {
    ev.target.index = i;
    ev.target["pile"] = pile;
    onClick(ev);
  };
  if (cards.length === 0) {
    return (<PileBase>
      {/*<button  onClick={(ev) => customOnClick(ev,0)}/>*/}
      <PileFrame />
      <Card
        card={'blank'}
        up={up}
        top={0}
        left={0}
        onClick={ev => customOnClick(ev,0)}
      />
    </PileBase>);
  }
  const children = cards.map((card, i) => {
    let top = horizontal ? 0 : i * spacing;
    let left = horizontal ? i * spacing : 0;
    return (
      <Card
        key={i}
        card={card}
        up={up}
        top={top}
        left={left}
        onClick={ev => customOnClick(ev,i)}
      />
    );
  });
  return (
    <PileBase>
      <PileFrame />
      {children}
    </PileBase>
  );
};

Pile.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func,
  horizontal: PropTypes.bool,
  spacing: PropTypes.number,
  maxCards: PropTypes.number,
  top: PropTypes.number,
  left: PropTypes.number
};
Pile.defaultProps = {
  horizontal: false, // Layout horizontal?
  spacing: 12 // In percent
};
