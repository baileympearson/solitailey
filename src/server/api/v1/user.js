/* Copyright G. Hemingway @2018 - All rights reserved */
"use strict";

const Joi = require("joi");
const { filterGameForProfile } = require("../../solitare");
const { validPassword } = require("../../../shared");

const request = require("request");

const getGithubRepos = (username, accessToken) => {
    return new Promise((resolve, reject) => {
        const url = `https://api.github.com/users/${username}`;
        request.get(
            {
                url: url,
                headers: {
                    "User-Agent": "request",
                    Authorization: `token ${accessToken}`
                }
            },
            (err, res, body) => {
                if (err) reject(err);
                else resolve(JSON.parse(body));
            }
        );
    });
};

module.exports = app => {
  /**
   * Create a new user
   *
   * @param {req.body.username} Display name of the new user
   * @param {req.body.first_name} First name of the user - optional
   * @param {req.body.last_name} Last name of the user - optional
   * @param {req.body.city} City user lives in - optional
   * @param {req.body.primary_email} Email address of the user
   * @param {req.body.password} Password for the user
   * @return {201, {username,primary_email}} Return username and others
   */
  app.post("/v1/user", function(req, res) {
	  console.log(req.body);
    // Schema for user info validation
    let schema = Joi.object().keys({
      username: Joi.string()
        .lowercase()
        .alphanum()
        .min(3)
        .max(32)
        .required(),
      first_name: Joi.string().allow(""),
      last_name: Joi.string().allow(""),
	    primary_email: Joi.string().email(),
      city: Joi.string().default("")
    });
    // Validate user input
    Joi.validate(
      req.body,
      schema,
      { stripUnknown: true },
      async (err, data) => {
        if (err) {
          const message = err.details[0].message;
          console.log(`User.create validation failure: ${message}`);
          res.status(400).send({ error: message });
        } else {

		/* 
          let userData = await getGithubRepos(req.session.user.login, req.session.user.token);
          data.primary_email = userData.email;
		console.log(userData);
		*/
          // Try to create the user
          let user = new app.models.User(data);

		  console.log('******************** user created?');
          try {
            await user.save();
		  console.log('******************** user saved ?');

            req.session.user._id = user._id;
		  console.log(req.session.user);

		  console.log('******************** us???');

            // Send the happy response back
            res.status(201).send({
              username: data.username,
              primary_email: data.primary_email
            });
          } catch (err) {
		  console.log("ERROR", err);
            // Error if username is already in use
            if (err.code === 11000) {
              if (err.message.indexOf("username_1") !== -1)
                res.status(400).send({ error: "username already in use" });
              if (err.message.indexOf("primary_email_1") !== -1)
                res.status(400).send({ error: "email address already in use" });
            }
            // Something else in the username failed
            else res.status(400).send({ error: "invalid username" });
          }
        }
      }
    );
  });

  /**
   * See if user exists
   *
   * @param {req.params.username} Username of the user to query for
   * @return {200 || 404}
   */
  app.head("/v1/user/:username", async (req, res) => {
    let user = await app.models.User.findOne({
      username: req.params.username.toLowerCase()
    });
    if (!user)
      res.status(404).send({ error: `unknown user: ${req.params.username}` });
    else res.status(200).end();
  });

  /**
   * Fetch user information
   *
   * @param {req.params.username} Username of the user to query for
   * @return {200, {username, primary_email, first_name, last_name, city, games[...]}}
   */
  app.get("/v1/user/:username", async (req, res) => {
    let user = await app.models.User.findOne({
      username: req.params.username.toLowerCase()
    })
      .populate("games")
      .exec();

    if (!user)
      res.status(404).send({ error: `unknown user: ${req.params.username}` });
    else {
      // Filter games data for only profile related info
      const filteredGames = user.games.map(game => filterGameForProfile(game));
      res.status(200).send({
        username: user.username,
        primary_email: user.primary_email,
        first_name: user.first_name,
        last_name: user.last_name,
        city: user.city,
        games: filteredGames
      });
    }
  });

  /**
   * Update a user's profile information
   *
   * @param {req.body.first_name} First name of the user - optional
   * @param {req.body.last_name} Last name of the user - optional
   * @param {req.body.city} City user lives in - optional
   * @return {204, no body content} Return status only
   */
  app.put("/v1/user", (req, res) => {
    if (!req.session.user) {
      res.status(401).send({ error: "unauthorized" });
    } else {
      let schema = Joi.object().keys({
        first_name: Joi.string().allow(""),
        last_name: Joi.string().allow(""),
        city: Joi.string().allow(""),
        primary_email : Joi.string().email().allow("")
      });
      Joi.validate(
        req.body,
        schema,
        { stripUnknown: true },
        async (err, data) => {
          if (err) {
            const message = err.details[0].message;
            console.log(`User.update validation failure: ${message}`);
            res.status(400).send({ error: message });
          } else {
            const query = { username: req.session.user.login };
            try {
              await app.models.User.findOneAndUpdate(
                query,
                { $set: data },
                { new: true }
              );
              res.status(204).end();
            } catch (err) {
              console.log(
                `User.update logged-in user not found: ${req.session.user.id}`
              );
              res.status(500).end();
            }
          }
        }
      );
    }
  });
};
