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
    _.each(loginHooks, function (hook) {
      hook();
    });
  });

  client.on('message', function () {
    _.each(messageHooks, function (hook) {
      hook();
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
