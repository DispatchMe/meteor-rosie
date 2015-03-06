/**
 * Update the github events collection.
 */
Github.getTags = function (repo) {
  var iterator = new Github.PageIterator('/repos/' + repo + '/tags');
  var tags = [];
  while (iterator.goToNextPage()) {
    // Stop iterating when we hit an event we have already cached.
    tags = tags.concat(iterator.data);
    // TODO insert these all into the Github.Tags collection
    // then break when we hit an event we have already cached.
  }
  return tags;
};
