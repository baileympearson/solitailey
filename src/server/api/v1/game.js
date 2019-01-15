/* Copyright G. Hemingway @2018 - All rights reserved */
"use strict";

let Joi = require("joi");
const _ = require("underscore");
const {
  initialState,
  filterGameForProfile,
  filterMoveForResults,
  validateMove
} = require("../../solitare");

module.exports = app => {
  /**
   * Create a new game
   *
   * @param {req.body.game} Type of game to be played
   * @param {req.body.color} Color of cards
   * @param {req.body.draw} Number of cards to draw
   * @return {201 with { id: ID of new game }}
   */
  app.post("/v1/game", (req, res) => {
    if (!req.session.user) {
      res.status(401).send({ error: "unauthorized" });
    } else {
      // Schema for user info validation
      let schema = Joi.object().keys({
        game: Joi.string()
          .lowercase()
          .required(),
        color: Joi.string()
          .lowercase()
          .required(),
        draw: Joi.any()
      });
      // Validate user input
      Joi.validate(
        req.body,
        schema,
        { stripUnknown: true },
        async (err, data) => {
          if (err) {
            const message = err.details[0].message;
            console.log(`Game.create validation failure: ${message}`);
            res.status(400).send({ error: message });
          } else {
            console.log(req.session.user);
            // Set up the new game
            let newGame = {
              owner: req.session.user._id,
              active: true,
              cards_remaining: 52,
              color: data.color,
              game: data.game,
              score: 0,
              start: Date.now(),
              winner: "",
              state: []
            };
            switch (data.draw) {
              case "Draw 1":
                newGame.drawCount = 1;
                break;
              case "Draw 3":
                newGame.drawCount = 3;
                break;
              default:
                newGame.drawCount = 1;
            }
            // Generate a new initial game state
            newGame.state = initialState();
            let game = new app.models.Game(newGame);
            try {
              await game.save();
              const query = { $push: { games: game._id } };
              // Save game to user's document too
              await app.models.User.findByIdAndUpdate(
                req.session.user._id,
                query
              );
              res.status(201).send({ id: game._id, game : JSON.stringify(game) });
            } catch (err) {
              console.log(`Game.create save failure: ${err}`);
              res.status(400).send({ error: "failure creating game" });
              // TODO: Much more error management needs to happen here
            }
          }
        }
      );
    }
  });

  /**
   * Fetch game information
   *
   * @param (req.params.id} Id of game to fetch
   * @return {200} Game information
   */
  app.get("/v1/game/:id", async (req, res) => {
    try {
      let cacheToken = `GAMEID:${req.params.id}`;

      app.redisClient.get(cacheToken, async (err, reply) => {
        let game;
        if (!reply)
            game = await app.models.Game.findById(req.params.id);
        else
            game = JSON.parse(reply);

        if (!game) {
          res.status(404).send({ error: `unknown game: ${req.params.id}` });
        } else {
          // mongoose doesn't return the game state as JSON, redis does
          // convert state to json if necessary
          const state = !reply ? game.state.toJSON() : game.state;

          let results = filterGameForProfile(game);
          results.start = Date.parse(results.start);
          results.cards_remaining =
            52 -
            (state.stack1.length +
              state.stack2.length +
              state.stack3.length +
              state.stack4.length);

          // Do we need to grab the moves
          if (req.query.moves === "") {
            const moves = await app.models.Move.find({ game: req.params.id }).populate('user','username');
            state.moves = moves.map(move => filterMoveForResults(move));
          }

          res.status(200).send(_.extend(results, state));
        }
      });
    } catch (err) {
      console.log(`Game.get failure: ${err}`);
      res.status(404).send({ error: `unknown game: ${req.params.id}` });
    }
  });

  /**
   * Request a game move
   *
   * @param (req.params.id} Id of game to play move on
   * @param (req.body) Move to be executed
   * @return {200 || 400 } New game state || error with move
   */
  app.put("/v1/game/:id", async (req, res) => {
    if (!req.session.user){
      res.status(401).send( { error : 'unauthorized' } );
    } else {
      let cacheToken = `GAMEID:${req.params.id}`;

      app.redisClient.get(cacheToken,async (err,reply) => {
        try {
          let game = reply ? JSON.parse(reply) : await app.models.Game.findById( req.params.id );

          if (req.session.user._id !== String(game.owner))
            res.status(401).send({ error: "unauthorized" });
          else {
            let newState = validateMove(req.body.move,game.state);
            if (newState.error)
              res.status(501).send({ error: newState.error });
            else{
              game.state = newState;

              game.moves++;

              app.models.Game.updateOne({ _id : game._id}, { state : newState, moves: game.moves } ).exec();
              let move = new app.models.Move({ user : req.session.user._id,
                                              game : game._id,
                                              cards : req.body.move.cards,
                                              src   : req.body.move.src,
                                              dst  : req.body.move.dest,
                                              date  : Date.now()
              });
              move.save();

              // TODO : optimize aspects of the game stored in cache
              app.redisClient.set(cacheToken,JSON.stringify(game), 'EX', 60 * 60);
              res.status(201).send( JSON.stringify(newState));
            }
          }
        } catch (err) {
          res.sendStatus(500);
        }
      });
    }
  });
};
