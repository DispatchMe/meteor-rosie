Rosie = {};

var HELP_MESSAGE = 'Type "release notes [commithash]" and rosie will list all' +
  ' of the closed github issues since the last release';

Rosie.start = function () {
  // XXX, not for v1
  // Setup github commit hooks based on CHANNEL_PROJECTS
  // and whenever code is pushed to the configured branches
  // automatically post the release notes to that channel.
};

/**
 * Process message from slack.
 * Right now only respond to the help and the release notes message.
 * @param message
 */
Rosie.processMessage = function (message) {
  var type = message.type,
    channel = Slack.client.getChannelGroupOrDMByID(message.channel) || {},
    user = Slack.client.getUserByID(message.user) || {};

  var channelName = (channel.is_channel ? '#' : '') + channel.name;

  console.log("Received: %s %s @%s %s '%s'", type, channelName, user.name, message.ts, message.text);

  if (type === 'message') {
    if (message.text.indexOf('help') > -1) return channel.send(HELP_MESSAGE);

    if (message.text.indexOf('release notes ') > -1) {
      // XXX allow the message to pass in the project to use.
      var repo = Object.keys(Meteor.settings['CHANNEL_PROJECTS'][channelName])[0];

      // The commit hash will be passed in
      // Ex. "release notes 078678912009912f18799a27add06a3f9966033c"
      var commitHash = message.text.split(/(.*)release\ notes\ /)[2]
      channel.postMessage({
        username: 'rosie-the-release-robot',
        icon_url: 'https://s3-us-west-2.amazonaws.com/slack-files2/avatars/2015-02-21/3799878733_5a928450e7107b46437f_72.jpg',
        text: Github.releaseDescription(repo, commitHash)
      });

    }
  }
};
Github.Events.remove({});
Slack.onLogin(Rosie.start);
Slack.onMessage(Rosie.processMessage);
Slack.login(Meteor.settings.SLACK_TOKEN);
