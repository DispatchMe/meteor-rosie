Github.Events = new Meteor.Collection('github-events');

/**
 * Update the github events collection.
 */
Github.updateEvents = function (repo) {
  var iterator = new Github.PageIterator('/repos/' + repo + '/issues/events');
  var stopIteration = false;
  var newEventCount = 0;
  // Stop iterating when we hit an event we have already cached.
  while (iterator.goToNextPage() && !stopIteration) {  
    _.each(iterator.data, function(e){
      if (Github.Events.findOne({id: e.id}) == null) {
          Github.Events.insert(e);
          newEventCount++;
      } else {
        stopIteration = true;
      }
    });
  }
  console.log("Github: new event count ", newEventCount);
};
