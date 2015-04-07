Github.Events = new Meteor.Collection('github-events');

/**
 * Update the github events collection.
 */
Github.updateEvents = function (repo) {
  var iterator = new Github.PageIterator('/repos/' + repo + '/issues/events');

  var newEventCount = 0;

  var logNewEvents = function () {
    console.log('Github: cached', newEventCount, 'new events for', repo);
  };

  while (iterator.goToNextPage()) {
    for (var i = 0; i < iterator.data.length; i++) {
      var githubEvent = iterator.data[i];
      githubEvent._id = githubEvent.id;
      githubEvent.repo = repo;

      var result = Github.Events.upsert(githubEvent.id, githubEvent);

      // Stop iterating when we hit an event we have already cached.
      if (!result.insertedId) return logNewEvents();

      newEventCount++;
    }

    logNewEvents();
  }
};
