Package.describe({
  summary: 'Wrapper for slack-client.'
});

Npm.depends({
  'slack-client': '1.3.1'
});

Package.onUse(function (api) {
  api.addFiles('slack.js', 'server');
  api.export('Slack', 'server');
});
