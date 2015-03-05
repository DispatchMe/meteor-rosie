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

  events = {
    open: function () {
      console.log('Slack: open');
      _.each(loginHooks, function (hook) {
        hook();
      });
    },
    message: function (message) {
      _.each(messageHooks, function (hook) {
        hook(message);
      });
    },
    error: function (error) {
      console.error('Slack Error: %s', error);
    }
  };
  
  for (var e in events) {
    client.on(e, Meteor.bindEnvironment(events[e]));  
  }
  
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
