/* Copyright G. Hemingway, @2018 */
"use strict";

let path = require("path"),
  fs = require("fs"),
  http = require("http"),
  https = require("https"),
  express = require("express"),
  bodyParser = require("body-parser"),
  logger = require("morgan"),
  redis = require('redis'),
  session = require("express-session"),
  RedisStore = require('connect-redis')(session),
  mongoose = require("mongoose"),
  envConfig = require("simple-env-config"),
  cors = require('cors'),
	setenv = require('setenv');

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "dev";

/**********************************************************************************************************/

const setupServer = async () => {
  // Get the app config
  let tmp = await envConfig("./config/config.json", env);

  let conf = env === "production" ? tmp.production : tmp;
  const port = process.env.PORT ? process.env.PORT : conf.port;

  setenv.set('GITHUB_CLIENT_ID', conf.github_sso.client_id);
  setenv.set('GITHUB_CLIENT_SECRET', conf.github_sso.client_secret);

  let app = express();
  if (env !== "test") app.use(logger("dev"));
  app.engine("pug", require("pug").__express);
  app.set("views", __dirname);
  app.use(express.static(path.join(__dirname, "../../public")));

  const redisOptions = {
    HOST : conf.redis.host,
    PORT : conf.redis.port,
  };

  app.store = session({
    name: "session",
    store : new RedisStore(redisOptions),
    secret: "grahamcardrules",
    resave: false,
    saveUninitialized: false,
    cookie: {
      path: "/"
    }
  });

  app.use(app.store);
  // app.use(cors());

  // Finish with the body parser
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // Connect to MongoDB
  try {
    // console.log("Connecting to MongoDB");
    mongoose.set("useFindAnyModify", false); // New deprecation warnings
    mongoose.set("useCreateIndex", true); // New deprecation warnings
    await mongoose.connect(conf.mongodb, {
      useNewUrlParser: true, // New deprecation warnings
    });
    console.log(`MongoDB connected: ${conf.mongodb}`);
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }

// Establish connection to Redis
  app.redisClient = redis.createClient(redisOptions.PORT,redisOptions.HOST);
  app.redisClient
    .on("ready", () => {
      console.log("\tRedis Connected.");
    })
    .on("error", () => {
      console.log("Not able to connect to Redis.");
      process.exit(-1);
    });


  // Import our Data Models
  app.models = {
    Game: require("./models/game"),
    Move: require("./models/move"),
    User: require("./models/user")
  };

  // Import our routes
  require("./api")(app);

  // Give them the SPA base page
  app.get("*", (req, res) => {
    const user = req.session.user;
    console.log(`Loading app for: ${user ? user.username : "nobody!"}`);
    let preloadedState = user
      ? {
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          primary_email: user.primary_email,
          city: user.city,
          games: user.games
        }
      : {};
    preloadedState = JSON.stringify(preloadedState).replace(/</g, "\\u003c");
    res.render("base.pug", {
      state: preloadedState
    });
  });

  // Run the server itself
  let server;
  if (env === "production") {
    const options = {
      key: fs.readFileSync(conf.security.keyPath),
      cert: fs.readFileSync(conf.security.certPath)
    };
    // Listen for HTTPS requests
    server = https.createServer(options, app).listen(port, () => {
      console.log(`Secure Assignment 5 listening on: ${server.address().port}`);
    });
    // Redirect HTTP to HTTPS
    http
      .createServer((req, res) => {
        const location = `https://${req.headers.host}${req.url}`;
        console.log(`Redirect to: ${location}`);
        res.writeHead(302, { Location: location });
        res.end();
      })
      .listen(80, () => {
        console.log(`Assignment 5 listening on 80 for HTTPS redirect`);
      });
  } else {
    server = app.listen(port, () => {
      console.log(`Assignment 5 ${env} listening on: ${server.address().port}`);
    });
  }
};

/**********************************************************************************************************/

// Run the server
setupServer();
