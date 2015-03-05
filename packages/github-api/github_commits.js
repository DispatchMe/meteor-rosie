/**
 * Find all the commits until the previous version, based on semver git tags.
 * @param commitHash
 */
Github.commitsSinceLastVersion = function (commitHash) {

};

/**
 * Go through all of the commits until the previous release based
 * on semver git tags and list out all of the closed issues.
 * @param branch
 * @returns {string}
 */
Github.releaseDescription = function (repo, commitHash) {
  //Github.updateEvents(repo);

  var message = '';

  // TODO remove ex. message for testing and
  // make all the hard stuff below work :)
  for (var i = 0; i < 6; i++)
    message += '<Vocabulary / i18n / l10n Discussion <https://github.com/DispatchMe/meteor-mobile/issues/67|#67> TrevorSayre' + '\n';

  //var commitIds = Github.commitsSinceLastVersion(commitHash);
  //
  //Github.Events.find({
  //  commit_id: {$in: commitIds},
  //  event: 'closed'
  //}).forEach(function (event) {
  //  message += '<' + event.issue.title + '<' + event.issue.html_url + '|#' +
  //  event.issue.number + '> ' + event.actor.login + '\n';
  //});

  return message;
};
