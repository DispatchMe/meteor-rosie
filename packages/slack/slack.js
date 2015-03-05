var slackClient = Npm.require('slack-client');

var loginHooks = [],
  messageHooks = [];

Slack = {};

/**
 * Login to slack.
 * @param token
 */
Slack.login = function (token) {
  var autoReconnect = true, autoMark = true;
  var client = Slack.client = new slackClient(token, autoReconnect, autoMark);

  client.on('open', function () {
    console.log('Slack: open');
    _.each(loginHooks, function (hook) {
      hook();
    });
  });

  client.on('message', function (message) {
    console.log('Slack: message');
    _.each(messageHooks, function (hook) {
      hook(message);
    });
  });

  client.on('error', function (error) {
    console.error('Error: %s', error);
  });

  client.login();
};

/**
 * Run this hook when slack is connected.
 * @param hook
 */
Slack.onLogin = function (hook) {
  loginHooks.push(hook);
};

Slack.onMessage = function (hook) {
  messageHooks.push(hook);
};
