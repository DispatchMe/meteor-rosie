Github.Events = new Meteor.Collection('github-events');

/**
 * Update the github events collection.
 */
Github.updateEvents = function (repo) {
  var iterator = new Github.PageIterator('/repos/' + repo + '/issues/events');

  while (iterator.goToNextPage()) {
    // Stop iterating when we hit an event we have already cached.
    var events = iterator.data;

    // TODO insert these all into the Github.Events collection
    // then break when we hit an event we have already cached.
  }
};
