/**
 * Find all the commits until the previous version, based on semver git tags.
 * @param commitHash
 */
Github.commitsSinceLastVersion = function (repo, commitHash) {
  var tagsIds =  Github.getTags(repo).map(function(tag){
    return tag.commit.sha;
  });
  var ids = [];
  var commitIndex;
  Github.commitIterator(repo, function(commit){
    ids.push(commit.sha)
    commitIndex = ids.indexOf(commitHash);
    if (commitIndex == -1) {
      if (tagsIds[0] == commit.sha){
        tagsIds.shift();
      }
    }
    return commitIndex > -1 && tagsIds[0] == commit.sha;
  });
  ids.splice(0, commitIndex);
  if (commitIndex == -1){
    return null;
  }
  return ids;
};

Github.commitIterator = function(repo, callback) {
  var iterator = new Github.PageIterator('/repos/' + repo + '/commits');
  var stopIteration = false;
  while (iterator.goToNextPage() && !stopIteration) {
    _.each(iterator.data, function(commit){
      if (!stopIteration) {
        stopIteration = callback(commit);
      };
    });
  }
}

/**
 * Go through all of the commits until the previous release based
 * on semver git tags and list out all of the closed issues.
 * @param branch
 * @returns {string}
 */
Github.releaseDescription = function (repo, commitHash) {
  Github.updateEvents(repo);
  var message = '';
  var commitIds = Github.commitsSinceLastVersion(repo, commitHash);
  if (!commitIds){
    return 'Can\'t find commit `' + commitHash + '`';
  }
  if (commitIds.length == 0) {
    return 'Nothing found';
  }
  var events = Github.Events.find({
    commit_id: {$in: commitIds},
    event: 'closed'
  }).fetch();
  if (events.length == 0) {
    return 'Nothing found';
  }
  _.each(events, function (event) {
    message += '<' + event.issue.title + '<' + event.issue.html_url + '|#' +
    event.issue.number + '> ' + event.actor.login + '\n';
  });  
  return message;
};
