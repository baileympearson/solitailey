/* Copyright G. Hemingway, 2018 - All rights reserved */
"use strict";

import React from "react";

const NotLoggedIn = () =>
  <h1> You must be logged in to view this page </h1>;

export const Wrapper = Component => {
  return props => {
    if (!props.loggedIn)
      return <NotLoggedIn/>;
    return <Component {...props}/>;
  };
};

