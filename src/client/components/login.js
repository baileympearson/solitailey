/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

import React, { Fragment } from "react";

import queryString from 'query-string';

/*************************************************************************/

export const Login = ({ location, logIn, history }) => {
  const values = queryString.parse(location.search);
  logIn( { username : values.username, primary_email : values.primary_email });
  history.push(`/profile/${values.username}`);
  return <Fragment/>
};

