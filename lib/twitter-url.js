var URL_REG = /https?:\/\/twitter\.com\/([^\/]+)\/status\/([^\/]+)/;
var URL_TPL = 'https://twitter.com/{0}/status/{1}';

function urlToId(url) {
  var parts = url.match(URL_REG);
  if (!parts || !parts[0]) return null;
  return parts[1] + ':' + parts[2];
}

function idToUrl(id) {
  var parts = id.split(':');
  return URL_TPL
    .replace(/\{0\}/, parts[0])
    .replace(/\{1\}/, parts[1]);
}

module.exports = {
  urlToId: urlToId,
  idToUrl: idToUrl
};
