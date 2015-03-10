var REPO = 'dispatchme/meteor-slack-releases';

Tinytest.add('Commits Iterator', function (test) {
  var commitIds = Github.commits({
    repo: REPO, 
    branch: 'master',
    from: 'f267ab9299573f7c3d2fe1f99580c4abddd0d11d',
    to: 'd0f249df7b06f801f42616c091637c25c6a3a070'
  });
  
  test.length(commitIds, 2);
});