Github.commitIterator = function(repo, callback) {
  var iterator = new Github.PageIterator('/repos/' + repo + '/commits');
  while (iterator.goToNextPage()) {
    _.each(iterator.data, function(commit){
      if (callback(commit)) {
        return;
      }
    });
  }
};

// If the query is a commit hash, return that.
// Otherwise assume it is a tag and lookup the commit hash for the tag.
var shaForQuery = function (query, tags) {
  if (!query || !query.length) return null;

  if (query.length === 40) return query;

  var shaForTag = null;

  tags.some(function (tag) {
    if (tag.name === query) {
      shaForTag = tag.commit.sha;
      return true;
    }
  });

  return shaForTag;
};

/**
 * Get the commits on the branch after the commit hash or tag.
 * @param options
 * @param options.repo The repo to search. Ex. dispatchme/meteor-slack-releases
 * @param [options.branch] The branch to search. Defaults to master.
 * @param [options.from] The oldest commit or tag to include (inclusive).
 * If nothing is passed, it will include the first commit.
 * @param [options.to] The newest commit or tag to include (inclusive).
 * If nothing is passed, it will include the latest commit.
 * @returns {Array.<String>} The commit shas.
 */
Github.commits = function (options) {
  var tags = Github.getTags(options.repo);

  // TODO
  options.branch = options.branch || 'master';

  // The newest commit sha to include.
  var startAtSha = shaForQuery(options.to, tags);

  // The oldest commit sha to include.
  var endAtSha = shaForQuery(options.from, tags);

  var shaList = [];
  var commitIterator = new Github.PageIterator('/repos/' + options.repo + '/commits');

  // If from is not found, start at the newest commit.
  var start = !startAtSha;

  // Iterate through each commit -- from the most recent to the oldest.
  while (commitIterator.goToNextPage()) {
    for (var i = 0; i < commitIterator.data.length; i++) {
      var sha = commitIterator.data[i].sha;

      if (!start && sha === startAtSha) start = true;
      if (start) shaList.push(sha);

      if (endAtSha && sha === endAtSha) break;
    }
  }

  return shaList;
}

/**
 * Build a release message by going through the latest commits
 * on a branch and finding the closed issues.
 * @param options
 * @param options.repo The repo to search. Ex. dispatchme/meteor-slack-releases
 * @param [options.branch] The branch to search. Defaults to master.
 * @param [options.from] The oldest commit or tag to include (inclusive).
 * If nothing is passed, it will include the first commit.
 * @param [options.to] The newest commit or tag to include (inclusive).
 * If nothing is passed, it will include the latest commit.
 * @returns {String}
 */
Github.releaseDescription = function (options) {
  Github.updateEvents(options.repo);

  var message = '';

  var commitIds = Github.commits(options);
  if (!commitIds.length)
    return 'Can\'t find any commits';

  var events = Github.Events.find({
    commit_id: {$in: commitIds},
    event: 'closed'
  }).fetch();

  if (events.length == 0)
    return 'No events found.';

  events.forEach(function (evt) {
    var issue = evt.issue;
    message += issue.title + ' <' + issue.html_url + '|#' +
      issue.number + '> ' + evt.actor.login + '\n';
  });
  
  return message;
};
