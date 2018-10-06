var clib = lib(); 
var entries = clib.entries();
var count =entries.length;
for(var i=0;i<count;i++)
{
  var vHost = cEntry.field("Hostname");
  var vAPI = new BtcRelaxApi(vHost);
  var v = vAPI.getVersion();
  if (v !== false) { cEntry.set("responce",v); }
}
