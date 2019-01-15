/* Copyright G. Hemingway, @2018 */
"use strict";

const validPassword = password => {
  if (!password || password.length < 8) {
    return { error: "Password length must be > 7" };
  } else if (!password.match(/[0-9]/i)) {
    return { error: `"password" must contain at least one numeric character` };
  } else if (!password.match(/[a-z]/)) {
    return { error: `"password" must contain at least one lowercase character` };
  } else if (!password.match(/\@|\!|\#|\$|\%|\^/i)) {
    return { error: `"password" must contain at least one of: @, !, #, $, % or ^` };
  } else if (!password.match(/[A-Z]/)) {
    return {
      error: `"password" must contain at least one uppercase character`
    };
  }
  return undefined;
};

const validUsername = username => {
  if (!username || username.length <= 2 || username.length >= 16) {
    return { error: "Username length must be > 2 and < 16" };
  } else if (!username.match(/^[a-z0-9]+$/i)) {
    return { error: "Username must be alphanumeric" };
  }
  return undefined;
};

const last = array => {
  return array[array.length - 1];
};

const updateState = (state,move) => {
  if (move.src === 'draw' && move.cards.length === 0){
    state.draw = state.discard.slice().reverse();
    state.draw.forEach(card => card.up = false );
    state.discard = [];
  } else {
    state[move.src] = state[move.src].slice(0,state[move.src].length - move.cards.length);
    state[move.dest] = state[move.dest].concat(move.cards);

    if (move.dest === 'discard')
      state[move.dest][state[move.dest].length-1].up = true;

    if (/pile/.test(move.src) && state[move.src].length > 0)
      state[move.src][state[move.src].length-1].up = true;
  }
  return state;
};

module.exports = {
  validPassword: validPassword,
  validUsername: validUsername,
  last : last,
  updateState : updateState
};
