var clib = lib(); 
var entries = clib.entries();
for(var i=0;i<entries.length;i++)
{
  var cEntry = entries[i];
  var vHost = cEntry.field("Hostname");
  var vAPI = new BtcRelaxApi(vHost);
  var v = vAPI.getVersion();
  if (v !== false) { cEntry.set("responce",v); }
}
