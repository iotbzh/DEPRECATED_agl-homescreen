"use strict";

module.exports = {
  debug: true,
  port: 5000,
  token: 'secret_jwt_token',
  mockApps: [
    { id: 'hvac', isRunning: false},
    { id: 'navigation', isRunning: false},
    { id: 'phone', isRunning: false, authRequired: true},
    { id: 'radio', isRunning: false},
    { id: 'multimedia', isRunning: false},
    { id: 'connectivity', isRunning: false},
    { id: 'dashboard', isRunning: false},
    { id: 'settings', isRunning: false, authRequired: true},
    { id: 'point', isRunning: false, authRequired: true}
  ]
};
