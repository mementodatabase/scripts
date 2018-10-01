var cEntry=entry();
var vReq = cEntry.field("request");
var result = http().get(vReq);
var json = JSON.parse(result.body);
cEntry.set("responce",json.Core);
