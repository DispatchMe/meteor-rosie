Rosie = {};

var HELP_MESSAGE = 'Type "closed issues [commit|tag]" to list the closed issues ' +
  'after that commit or tag (inclusive).';

Rosie.start = function () {
  // XXX, not for v1
  // Setup github commit hooks based on CHANNEL_PROJECTS
  // and whenever code is pushed to the configured branches
  // automatically post the release notes to that channel.
};

var CHANNEL_REPOS = Meteor.settings['CHANNEL_REPOS'];

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

  var messageText = message && message.text || '';

  if (messageText.indexOf('rosie') > -1) {
    if (messageText.indexOf('help') > -1) return channel.send(HELP_MESSAGE);

    if (messageText.indexOf('closed issues') > -1) {
      // Find the repo -> branche dict for the current channel.
      var reposBranches = CHANNEL_REPOS[channelName];
      if (!reposBranches) return;

      // Lookup the branch for the channel.
      // Right now we just use the first repo.
      // XXX allow the message to pass in the project to use.
      var repo, branch;
      for (repo in reposBranches) {
        branch = reposBranches[repo];
        break;
      }

      var query = messageText.split(/(.*)closed\ issues\ /)[2] || '';

      var releaseText = Github.releaseDescription({ repo: repo, branch: branch, from: query });

      channel.postMessage({
        username: 'rosie',
        icon_url: 'https://s3-us-west-2.amazonaws.com/slack-files2/avatars/2015-02-21/3799878733_5a928450e7107b46437f_72.jpg',
        text: releaseText
      });
    }
  }
};

Slack.onLogin(Rosie.start);
Slack.onMessage(Rosie.processMessage);
Slack.login(Meteor.settings.SLACK_TOKEN);