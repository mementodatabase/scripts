function BtcRelaxApi(server, token)
{
    this.server = server;
    this.token = token;
}

//BtcRelaxApi.prototype.addNew = function(query) {
//  var result = http().get("https://api.discogs.com/database/search?q=" + encodeURIComponent(query) + "&key=" + this.apiKey + "&secret=" + this.apiSecret + "&type=" + this.type);
//  var json = JSON.parse(result.body);
//  return json.results;  
//}


BtcRelaxApi.prototype.prepareEntity = function(vEntry) {
        var loc = vEntry.field("Loc");
        var nLat = Math.round(loc.lat * 1000000) / 1000000;
        var nLng = Math.round(loc.lng * 1000000) / 1000000;
        var vAdv = "dummyAdv";
        var vPrice = "100";
        var vRegion = "dummyRegion";
        var nUrl = vEntry.field("PublicURL");
        var commands =
                '[{"type":"item_add","inf":{"lat":"' + nLat + '","lng":"' + nLng + '","link":"' + nUrl +
                '","advName":"' + vAdv + '","price":"' + vPrice + '","region":"' + vRegion + '"}}]';
        return commands;
}



