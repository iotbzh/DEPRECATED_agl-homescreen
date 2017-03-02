"use strict";
const conf = require("./../conf");
const helper = require("./../helpers");

let apps = [];

module.exports = function (wss, ws) {

    return {
        connect: function (req) {
            var token = helper.getRandomNumber(0, 999999999999);
            var uuid = helper.getRandomNumber(0, 999999999999);
            ws.send(helper.formatRes(
                req,
                "status", {
                    "token": "A New Token and Session Context Was Created"
                }, {
                    status: "success",
                    token: token,
                    uuid: uuid
                }));
        },
    };
};