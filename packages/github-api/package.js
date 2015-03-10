Package.describe({
  name: 'dispatch:github-api',
  summary: 'Github api helpers.'
});

Package.onUse(function (api) {
  api.use('http', 'server');
  
  api.addFiles([
    'github.js', 'github_request.js',
    'github_commits.js', 'github_events.js',
    'github_tags.js'
  ], 'server');

  api.export('Github', 'server');
});

Package.onTest(function (api) {
  api.use([
  	'tinytest',
    'dispatch:github-api'
  ], 'server');

  api.addFiles([
    'github_test.js'
  ], 'server');
});