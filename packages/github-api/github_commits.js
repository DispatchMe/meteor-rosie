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
}

Github.commitsSinceTag = function (repo, tag) {
  var tags = Github.getTags(repo);
  if (tag == 'latest'){
    tag = tags[0].name;
  }
  console.log("TAG", tag);
  var startId;
  var endId = _.find(tags, function(currentTag) {
    if (startId) {
      return currentTag.commit.sha;
    } else if (currentTag.name == tag) {
      startId = currentTag.commit.sha;
    }
  });
  console.log("start, end", startId, endId);
  var ids = []; 
  Github.commitIterator(repo, function(commit) {
    if (ids.length > 0 || commit.sha == startId) {
      ids.push(commit.sha);
      if (commit.sha == endId)
        return true;
    }
  });
  console.log(ids);
  return ids;
}

Github.commitIterator = function(repo, callback) {
  var iterator = new Github.PageIterator('/repos/' + repo + '/commits');
  while (iterator.goToNextPage()) {
    _.each(iterator.data, function(commit){
      if (callback(commit)) {
        return;
      }
    });
  }
}

/**
 * Go through all of the commits until the previous release based
 * on semver git tags and list out all of the closed issues.
 * @param branch
 * @returns {string}
 */
Github.releaseDescription = function (repo, query) {
  Github.updateEvents(repo);
  var message = '';
  var commitIds;
  if (query.length == 40) {
    commitIds = Github.commitsSinceLastVersion(repo, query); 
  } else {
    commitIds = Github.commitsSinceTag(repo, query);
  }
  if (!commitIds){
    return 'Can\'t find `' + commitHash + '`';
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
