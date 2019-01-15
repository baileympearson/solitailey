/* Copyright G. Hemingway @2018 - All rights reserved */
"use strict";

const crypto = require("crypto");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/***************** User Model *******************/

let User = new Schema({
  username: { type: String, required: true, index: { unique: true } },
  primary_email: { type: String, default: "" },
  first_name: { type: String, default: "" },
  last_name: { type: String, default: "" },
  city: { type: String, default: "" },
  games: [{ type: Schema.Types.ObjectId, ref: "Game" }]
});

User.pre("save", function(next) {
  // Sanitize strings
  this.username = this.username.toLowerCase();
  this.primary_email = this.primary_email.toLowerCase();
  this.first_name = this.first_name.replace(/<(?:.|\n)*?>/gm, "");
  this.last_name = this.last_name.replace(/<(?:.|\n)*?>/gm, "");
  this.city = this.city.replace(/<(?:.|\n)*?>/gm, "");
  next();
});

module.exports = mongoose.model("User", User);
