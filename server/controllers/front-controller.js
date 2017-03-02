"use strict";

module.exports = function (wss, ws, req) {
    const DEBUG = require('../helpers').DEBUG;
    const authController = require('./auth-controller')(wss, ws);
    const afmMainController = require('./afm-main')(wss, ws);
    const aglIdentityController = require('./agl-identity')(wss, ws);
    const hvacController = require('./hvac')(wss, ws);

    if (req && req.length > 2) {
        let enterPoint = req[2].split('/');
        let controller = enterPoint[0];
        let action = enterPoint[1];
        let param = req[3];

        DEBUG('RECV: controller=', controller, ' action=', action);

        switch (controller) {
            case 'auth':
                switch (action) {
                    case 'connect':
                        authController.connect(req);
                        break;
                    default:
                        throw new Error('auth: No such an action');
                }
                break;
            case 'afm-main':
                switch (action) {
                    case 'runnables':
                        afmMainController.getRunnables(req);
                        break;
                    case 'detail':
                        afmMainController.getDetail(req, param.id);
                        break;
                    case 'start':
                        afmMainController.launchApp(req, param.id);
                        break;
                    case 'uninstall':
                        afmMainController.uninstallApp(req, param.id);
                        break;
                    default:
                        throw new Error('afm-main: No such an action ', action);
                }
                break;
            case 'agl-identity':
                switch (action) {
                    case 'login':
                        aglIdentityController.login(req, param.data);
                        break;
                    case 'logout':
                        aglIdentityController.logout(req);
                        break;
                    default:
                        throw new Error('afm-identity: No such an action', action);
                }
                break;
            case 'hvac':
                switch (action) {
                    case 'on':
                        hvacController.turnOn(req);
                        break;
                    case 'off':
                        hvacController.turnOff();
                        break;
                    default:
                        throw new Error('hvac: No such an action', action);
                }
                break;
            default:
                throw new Error('No such a controller');
        }
    } else {
        DEBUG('ERROR req=', req);
        throw new Error("Api is not provided in request");
    }
};
