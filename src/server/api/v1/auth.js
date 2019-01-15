/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

const request = require("request");

const ghConfig = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    scope: "user"
};

module.exports = app => {
    const checkState = (goodState, state) => {
        return new Promise((resolve, reject) => {
            if (goodState !== state) {
                reject({
                    error:
                        "Invalid state - Log out and in again before linking with Github."
                });
            } else resolve();
        });
    };

    const checkCode = code => {
        return new Promise((resolve, reject) => {
            request.post(
                {
                    url: `https://github.com/login/oauth/access_token`,
                    headers: {
                        "User-Agent": "request",
                        Accept: "application/json"
                    },
                    formData: {
                        client_id: ghConfig.client_id,
                        client_secret: ghConfig.client_secret,
                        code: code
                    }
                },
                (err, res, body) => {
                    if (err) reject(err);
                    if (body.error) reject(body);
                    else resolve(JSON.parse(body));
                }
            );
        });
    };

    const checkGithubInfo = accessToken => {
        return new Promise((resolve, reject) => {
            request.get(
                {
                    url: "https://api.github.com/user",
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

    // Any attempt to login redirects to Github SSO auth
    app.get("/v1/auth/login", (req, res) => {
        console.log("/login");
        // Redirect to Github login with client_id, state and scope
        req.session.state = Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substr(0, 10);
        const ghPath =
            `https://github.com/login/oauth/authorize?` +
            `scope=${ghConfig.scope}&` +
            `client_id=${ghConfig.client_id}&` +
            `state=${req.session.state}`;
        console.log(`Sending users to: ${ghPath}`);
        // res.status(205).send({ redirectUri : ghPath });
        // res.status(401).send( { redirectURI : ghPath });
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.redirect(ghPath);
    });

    app.get("/v1/auth/github", async (req, res) => {
        // Must have a temp code from GH
        if (!req.query.code)
            return res.status(400).send({ error: "Code field required" });
        // Must have state token too
        if (!req.query.state)
            return res.status(400).send({ error: "State field required" });
        // Validate state
        try {
            // Is this a valid GH response
            await checkState(req.session.state, req.query.state);
            // Convert code to token and scope
            const { access_token } = await checkCode(req.query.code);

            // Get GH username
            const { login } = await checkGithubInfo(access_token);

            // Save the login and token to the session for future use
            req.session.user = { login: login, token: access_token };

            // query database for user information
            let user = await app.models.User.findOne( { username : login });

            // if user doesn't exist, create user
            if (!user) {
                user = new app.models.User( { username : login } );
                await user.save();
            }

            req.session.user._id = user._id;

            // redirect to a login component
            res.redirect(`/login?username=${login}&primary_email=${user.primary_email}`);
        } catch (err) {
            console.log(err);
            // Send user to error page explaining what happened
            res.status(400).send(err);
        }
    });

};
