/**
The data source for obtaining information from discogs.com.
@param {string} apiKey - Consumer key.
@param {string} apiSecret - Consumer secret. 
@param {string} type - One of release, master, artist.
Consumer key and Consumer secret can be obtained by this link : https://www.discogs.com/settings/developers
More info about Discogs API see here: https://www.discogs.com/developers
@example 
var discogs = new Discogs("Consumer key" ,"Consumer secret" , "release" );
var r = discogs.search(query);
result( r , function(id) { return discogs.extra(id);});
*/
function Discogs (apiKey , apiSecret, type) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.type = type;
}


/**
Issue a search query to Discogs database.
@param {string} query - Search query.
*/
Discogs.prototype.search = function(query) {
  var result = http().get("https://api.discogs.com/database/search?q=" + encodeURIComponent(query) + "&key=" + this.apiKey + "&secret=" + this.apiSecret + "&type=" + this.type);
  var json = JSON.parse(result.body);
  return json.results;  
}

/**
Issue a search query to Discogs database.
@param {string} code - Search barcodes.
*/
Discogs.prototype.barcode = function(code) {
  var result = http().get("https://api.discogs.com/database/search?barcode=" + encodeURIComponent(code) + "&key=" + this.apiKey + "&secret=" + this.apiSecret + "&type=" + this.type);
  var json = JSON.parse(result.body);
  return json.results;  
}

/**
@param {string} id - The resource identifier.
*/
Discogs.prototype.extra = function(id) {
    var resultJson = http().get("https://api.discogs.com/" + this.type + "s/" + id + "?key=" + this.apiKey + "&secret=" + this.apiSecret);
    var result = JSON.parse(resultJson.body); 
    if (result.images !== undefined) 
        result['images'] = result.images.map(function(e) { return e.uri; }).join(); 
    if (result.videos !== undefined) 
        result['videos'] = result.videos.map(function(e) { return e.uri; }).join();     
    if (result.artists !== undefined)
        result['artists'] = result.artists.map(function(e) { return e.name; }).join();   
    if (result.tracklist !== undefined)  
        result['tracklist'] = result.tracklist.map(function(e) { return e.position + ". " + e.title + " " + e.duration; }).join("\n");     
    if (result.styles !== undefined)  
        result['styles'] = result.styles.join();     
    if (result.genres !== undefined)
        result['genres'] = result.genres.join();        
    return result;
}
