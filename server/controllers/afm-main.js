"use strict";
const conf = require("./../conf");
const helper = require("./../helpers");

let apps = [];

module.exports = function (wss, ws) {

    return {
        getRunnables: function (req) {
            let allowedAppsArray = helper.getAllowedAppsArray(conf.mockApps);
            const min = 1;
            const max = allowedAppsArray.length;
            apps = helper.getRandomItemsFromArray(allowedAppsArray, max);
            ws.send(helper.formatRes(req, "success", { runnables: apps }));
        },

        //afm-main/detail   @todo add logic here
        getDetail: function (req, id) {
            ws.send(helper.formatRes(req, "success",
                {
                    "id": id,
                    "version": helper.getRandomNumber(0, 3) + "." + helper.getRandomNumber(1, 10) + "." + helper.getRandomNumber(1, 99),
                    "width": 90,
                    "height": 90,
                    "name": id,
                    "description": 'detail desc about app',
                    "shortname": id,
                    "author": 'John Doe'
                }
            ));
        },

        //afm-main/start  @todo add app-start logic here
        startApp: function (req, appToLaunch) {
            ws.send(helper.formatRes(req, "success",
                {
                    runid: helper.getRandomNumber(0, 9999)
                }
            ));
        },

        //afm-main/once @todo add logic here
        startAppOnce: function (req, appToLaunch) {
            ws.send(helper.formatRes(req, "success",
                {
                    runid: helper.getRandomNumber(0, 9999)
                }
            ));
        },

        launchApp: function (req, appId) { //afm-main/start && //afm-main/once
            let appToLaunch = apps.filter(function (app) {
                return appId == app.id;
            })[0];

            if (appToLaunch) {
                if (appToLaunch.isRunning) {
                    this.startAppOnce(req, appToLaunch);
                } else {
                    appToLaunch.isRunning = true;
                    this.startApp(req, appToLaunch);
                }
            } else {
                this.getRunnables(req);
            }
        },

        uninstallApp: function (req, appId) { //afm-main/uninstall
            let idx = apps.findIndex(function (app) {
                return appId == app.id;
            });
            if (idx != -1)
                apps.splice(idx, 1);
            ws.send(helper.formatRes(req, "success", {}));
        }
    };

};