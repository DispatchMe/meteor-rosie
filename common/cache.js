// Put this in common so we can easily debug
// in the web browser (w/ the autopublish package)
// TODO remove for deployment
Cache = new Mongo.Collection('request-cache');
