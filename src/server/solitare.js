/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

const { updateState } = require("../shared");

let shuffleCards = (includeJokers = false) => {
  /* Return an array of 52 cards (if jokers is false, 54 otherwise). Carefully follow the instructions in the README */
  let cards = [];
  ["spades", "clubs", "hearts", "diamonds"].forEach(suit => {
    ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"].forEach(
      value => {
        cards.push({ suit: suit, value: value });
      }
    );
  });
  // Add in jokers here
  if (includeJokers) {
    /*...*/
  }
  // Now shuffle
  let deck = [];
  while (cards.length > 0) {
    // Find a random number between 0 and cards.length - 1
    const index = Math.floor(Math.random() * cards.length);
    deck.push(cards[index]);
    cards.splice(index, 1);
  }
  return deck;
};

let initialState = () => {
  /* Use the above function.  Generate and return an initial state for a game */
  let state = {
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
    discard: []
  };

  // Get the shuffled deck and distribute it to the players
  const deck = shuffleCards(false);
  // Setup the piles
  for (let i = 1; i <= 7; ++i) {
    let card = deck.splice(0, 1)[0];
    card.up = true;
    state[`pile${i}`].push(card);
    for (let j = i + 1; j <= 7; ++j) {
      card = deck.splice(0, 1)[0];
      card.up = false;
      state[`pile${j}`].push(card);
    }
  }
  // Finally, get the draw right
  state.draw = deck.map(card => {
    card.up = false;
    return card;
  });
  return state;
};

const filterGameForProfile = game => ({
  active: game.active,
  score: game.score,
  won: game.won,
  id: game._id,
  game: "klondyke",
  start: game.start,
  state: game.state,
  moves: game.moves,
  winner: game.winner
});

const filterMoveForResults = move => ({
  ...move
});

const validateColors = (newTopCard, bottomCard) => {
  if (newTopCard.suit === 'hearts' || newTopCard.suit === 'diamonds')
    return bottomCard.suit === 'spades' || bottomCard.suit === 'clubs';

  return bottomCard.suit === 'hearts' || bottomCard.suit === 'diamonds';
};

const validateDraw = (move, state) => {
  if (move.src !== 'draw')
    return false;
  if (move.dest !== 'discard')
    return false;

  // TODO : hard coded in for only draw count of 1, but must be flexible
  if (move.cards.length > 1)
    return false;
  // TODO : should we check that it's face down as well ( this goes for all i guess?)

  let cardEquality = (cardA, cardB) => {
    return cardA.value === cardB.value && cardA.suit === cardB.suit && cardA.up === cardB.up;
  };
  return move.cards.length === 0 || cardEquality(move.cards[0],state.draw[state.draw.length - 1]);
};

let pileSuits = {
  stack1 : 'spades',
  stack2 : 'clubs',
  stack3 : 'hearts',
  stack4 : 'diamonds'
};

let orderingOfCards = ['ace','2','3','4','5','6','7','8','9','10','jack','queen','king'];

const validateDiscard = (move, state) => {
  if (move.src !== 'discard')
    return false;

  // no matter where we are putting a card, we can only move a single card from
  // the discard
  if (move.cards.length !== 1)
    return false;

  let card = move.cards[0];
  // are we putting a new card onto one of the piles or stacks?
  if (/stack/.test(move.dest)){

    // if (card.suit !== pileSuits[move.dest])
    //   return false;

    let destPile = state[move.dest];
    if (destPile.length === 0)
      return card.value === 'ace';

    let indexNew = orderingOfCards.indexOf(card.value);
    let indexPile = orderingOfCards.indexOf(destPile[destPile.length - 1].value);

    return indexNew === indexPile + 1 && card.suit === destPile[destPile.length - 1].suit;
  } else if (/pile/.test(move.dest)){
    let destPile = state[move.dest];
    if (destPile.length === 0)
      return card.value === 'king';

    let topCard = destPile[destPile.length - 1];

    let indexNew = orderingOfCards.indexOf(card.value);
    let indexPile = orderingOfCards.indexOf(destPile[destPile.length - 1].value);

    return validateColors(card,topCard) && indexNew === indexPile - 1;
  }
  return false;
};

const validatePile = (move, state) => {
  if (!/pile/.test(move.src))
    return false;

  if (/pile/.test(move.dest)){
    let pile = state[move.dest];
    let bottomCard = move.cards[0];

    if (pile.length === 0)
      return bottomCard.value === 'king';

    let indexNew = orderingOfCards.indexOf(bottomCard.value);
    let indexPile = orderingOfCards.indexOf(pile[pile.length - 1].value);

    return validateColors(bottomCard,pile[pile.length - 1]) && indexNew === indexPile - 1;

  } else if (/stack/.test(move.dest)){
    // can only put one card on the stacks at a time
    if (move.cards.length !== 1)
      return false;

    let moveCard = move.cards[0];
    let pile = state[move.dest];

    // if (moveCard.suit !== pileSuits[move.dest])
    //   return false;

    if (pile.length === 0)
      return moveCard.value === 'ace';

    let indexNew = orderingOfCards.indexOf(moveCard.value);
    let indexPile = orderingOfCards.indexOf(pile[pile.length - 1].value);

    return indexNew === indexPile + 1 && moveCard.suit === pile[pile.length - 1].suit;
  }

  return false;   // can only move cards onto the piles or the stacks
};

// const updateState = (state,move) => {
//   if (move.src === 'draw' && move.cards.length === 0){
//     state.draw = state.discard.slice().reverse();
//     state.draw.forEach(card => card.up = false );
//     state.discard = [];
//   } else {
//     state[move.src] = state[move.src].slice(0,state[move.src].length - move.cards.length);
//     state[move.dest] = state[move.dest].concat(move.cards);
//
//     if (move.dest === 'discard')
//       state[move.dest][state[move.dest].length-1].up = true;
//
//     if (/pile/.test(move.src) && state[move.src].length > 0)
//       state[move.src][state[move.src].length-1].up = true;
//   }
//   return state;
// };

const validateMove = (move, state) => {
  let error = { error : 'invalid move' };
  let validMove = false;

  if (move.src === 'draw')
    validMove = validateDraw(move,state);
  else if (move.src === 'discard')
    validMove = validateDiscard(move,state);
  else if (/pile/.test(move.src))
    validMove = validatePile(move,state);
  else if (/stack/.test(move.src))
    return error;

  if (!validMove){
    return error;
  }

  // if (move.src === 'draw' && move.cards.length === 0){
  //   state.draw = state.discard.slice().reverse();
  //   state.draw.forEach(card => card.up = false );
  //   state.discard = [];
  // } else {
  //   state[move.src] = state[move.src].slice(0,state[move.src].length - move.cards.length);
  //   state[move.dest] = state[move.dest].concat(move.cards);
  //
  //   if (move.dest === 'discard')
  //     state[move.dest][state[move.dest].length-1].up = true;
  //
  //   if (/pile/.test(move.src) && state[move.src].length > 0)
  //     state[move.src][state[move.src].length-1].up = true;
  //
  // }

  state = updateState(state,move);

  return state;
};

module.exports = {
  initialState: initialState,
  filterGameForProfile: filterGameForProfile,
  filterMoveForResults: filterMoveForResults,
  validateMove: validateMove
};
