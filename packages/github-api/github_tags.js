/**
 * Get the github tags collection.
 */
Github.getTags = function (repo) {
  var iterator = new Github.PageIterator('/repos/' + repo + '/tags');
  var tags = [];
  while (iterator.goToNextPage()) {
    tags = tags.concat(iterator.data);
  }
  return tags;
};
