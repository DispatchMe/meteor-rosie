Github.commitIterator = function (repo, callback) {
  var iterator = new Github.PageIterator('/repos/' + repo + '/commits');
  while (iterator.goToNextPage()) {
    _.each(iterator.data, function (commit) {
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
 * @param [options.branch] The branch to search.
 * Defaults to the default branch (usually master).
 * @param [options.from] The oldest commit or tag to include (inclusive).
 * Defaults to the first commit.
 * @param [options.to] The newest commit or tag to include (inclusive).
 * Defaults to the latest commit.
 * @returns {Object} An object dict of the commits. sha -> commit.
 */
Github.commits = function (options) {
  var tags = Github.getTags(options.repo);

  // The newest commit sha to include.
  var startAtSha = shaForQuery(options.to, tags);

  // The oldest commit sha to include.
  var endAtSha = shaForQuery(options.from, tags);

  var commits = {};

  var commitBaseUrl = '/repos/' + options.repo + '/commits';
  if (options.branch) commitBaseUrl += '?sha=' + options.branch;

  var commitIterator = new Github.PageIterator(commitBaseUrl);

  // If from is not found, start at the newest commit.
  var started = !startAtSha;

  // Iterate through each commit -- from the most recent to the oldest.
  while (commitIterator.goToNextPage()) {
    for (var i = 0; i < commitIterator.data.length; i++) {
      var commit = commitIterator.data[i];

      if (!started && commit.sha === startAtSha) started = true;
      if (started) commits[commit.sha] = commit;

      if (endAtSha && commit.sha === endAtSha) return commits;
    }
  }

  return commits;
};

/**
 * Build a release message by going through the latest commits
 * on a branch and finding the referenced issues.
 * @param options
 * @param options.repo The repo to search. Ex. dispatchme/meteor-slack-releases
 * @param [options.branch] The branch to search.
 * Defaults to the default branch (usually master).
 * @param [options.from] The oldest commit or tag to include (inclusive).
 * Defaults to the first commit.
 * @param [options.to] The newest commit or tag to include (inclusive).
 * Defaults to the latest commit.
 * @returns {String}
 */
Github.releaseDescription = function (options) {
  Github.updateEvents(options.repo);

  var message = '';

  var commits = Github.commits(options);
  if (_.isEmpty(commits))
    return 'Can\'t find any commits';

  // Find issues referenced from the commits in the range.
  var events = Github.Events.find({
      commit_id: {$in: _.keys(commits)},
      issue: {$exists: true},
      // Ignore pull request issues
      'issue.pull_request': {$exists: false}
    },
    // Sort earliest to latest, so it picks up the reference from the commit
    // rather than the reference from the PR commit.
    {sort: {created_at: 1}}
  ).fetch();

  if (events.length == 0)
    return 'No events found.';

  events = _.uniq(events, false, function (event) {
    return event.issue.id;
  });

  _.sortBy(events, 'created_at').forEach(function (evt) {
    var commit = commits[evt.commit_id];
    var issue = evt.issue;

    // Prefix the message with matching callout labels.
    var labels = _.pluck(evt.issue.labels, 'name');
    var calloutLabels = _.intersection(Meteor.settings.CALLOUT_LABELS, labels);
    if (calloutLabels.length > 0) {
      message += '*[' + calloutLabels.join('][') + '] ';
    }

    // Add the issue title, a link, and the commit author to the message
    message += issue.title + ' <' + issue.html_url + '|#' +
    issue.number + '> ' + commit.author.login;

    if (calloutLabels.length) message += '*';

    message += '\n';
  });

  return message;
};
