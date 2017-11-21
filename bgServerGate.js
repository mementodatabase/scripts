/* global http, moment */
function BitGanjGate(v_server, v_tokenId, v_tokenKey) {
  this.server = v_server;
  this.tokenId = v_tokenId;
  this.tokenKey = v_tokenKey;
}

BitGanjGate.prototype.call = function(vEntry, vService) {
  var res = true;
  var msg = vEntry.field("ServerRequest");
  if (msg=='')
    {
     msg=vEntry.field("AutoRequest");
     };
  var callUrl = this.server + "/" + vService + '?tokenId=' + this.tokenId + '&tokenKey=' + this.tokenKey + '&action=';
  log("Calling URL:" + callUrl + msg);
  var result = http().get(callUrl + encodeURIComponent(msg));
  if (result.code == 200) {
    var json = JSON.parse(result.body);
    vEntry.set("ServerResponse", JSON.stringify(json));
    vEntry.set("CallDate",moment().toDate());
    var rcode = json.code;
    if (rcode === 0) {
    	res = true;  
    } else {
        res = false;
      };
  };
  return res;
}