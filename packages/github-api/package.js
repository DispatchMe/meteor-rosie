Package.describe({
  summary: 'Github api helpers.'
});

Package.onUse(function (api) {
  api.addFiles([
    'github.js', 'github_request.js',
    'github_commits.js', 'github_events.js',
    'github_tags.js'
  ], 'server');

  api.export(['Github', 'Fiber'], 'server');
});
