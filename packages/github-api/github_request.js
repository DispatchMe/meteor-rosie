var apiUrl = 'https://api.github.com';

/**
 * Load results from the github api.
 * @param path
 * @returns {Object} The response.
 */
Github.request = function (path) {
  var url = apiUrl + path;

  var result = HTTP.get(url, {
    headers: {
      Authorization: 'token ' + Meteor.settings.public.GITHUB_TOKEN,
      'User-Agent': 'rosie-slack-robot'
    }
  });

  var remaining = +result.headers['x-ratelimit-remaining'];

  var log = ['Remaining', remaining, 'Request:', url];
  if (result.data.length) {
    log.push('count');
    log.push(result.data.length);
  }
  console.log.apply(this, log);

  if (remaining < 2) {
    throw 'Close to rate limit, only ' + remaining + ' remaining';
  }

  return result;
};

// Parse the Github Link HTTP header used for pageination
var parseLinkHeader = function (header) {
  if (!header || header.length == 0) {
    throw new Error('input must not be of zero length');
  }

  // Split parts by comma
  var parts = header.split(',');
  var links = {};
  // Parse each part into a named link
  _.each(parts, function (p) {
    var section = p.split(';');
    if (section.length != 2) {
      throw new Error('section could not be split on ";"');
    }
    var url = section[0].replace(/<(.*)>/, '$1').trim();
    var name = section[1].replace(/rel="(.*)"/, '$1').trim();
    links[name] = url;
  });

  return links;
};

/**
 * A helper to iterate through github pages.
 * @param path
 * @constructor
 */
var PageIterator = Github.PageIterator = function (path) {
  this._path = path;

  // Start off before the first page
  this.pageIndex = 0;

  this.hasNextPage = true;
};

PageIterator.prototype._load = function (index) {
  var path = this._path + (this._path.indexOf('?') < 0 ? '?' : '&')
    + 'per_page=100&page=' + index;

  var response = Github.request(path);

  this.data = response.data;

  var linkHeader = response.headers['link'];
  if (linkHeader) {
    var links = parseLinkHeader(linkHeader);
    this.hasNextPage = !!links.next;  
  } else {
    this.hasNextPage = false;
  }
  
  this.pageIndex = index;
};

/**
 * Load the next page of data.
 * @returns {Boolean} True if there is a next page.
 */
PageIterator.prototype.goToNextPage = function () {
  if (!this.hasNextPage) return false;
  var hasNextPage = this.hasNextPage;
  this._load(this.pageIndex + 1);
  return hasNextPage;
};
