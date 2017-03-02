"use strict";
const helper = require("./../helpers");

module.exports = function (wss, ws) {

  return {
    //agl-identity-agent/login
    login: function (account) {
        helper.currentAccountMocked = {
        username: account.username,
        language: account.language
      };

      wss.clients.forEach(function each(client) {
        if (client !== ws)
          client.send(
              helper.formatRes({
                type: "logged-in",
                data: {
                  account: helper.currentAccountMocked
                }
              })
          );
      });
    },

    //agl-identity-agent/logout
    logout: function () {
        helper.currentAccountMocked = null;
      wss.clients.forEach(function each(client) {
        if (client !== ws)
          client.send(
              helper.formatRes({
                type: "logged-out",
                data: helper.currentAccountMocked
              })
          );
      });
    }
  };

};