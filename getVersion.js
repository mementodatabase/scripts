function getVersionByEntry(cEntry)
{
  var vHost = cEntry.field("Hostname");
  var vAPI = new BtcRelaxApi(vHost);
  var v = vAPI.getVersion();
  if (v !== false) { cEntry.set("responce",json.Core); };
};

var clib = lib(); 
var entries = clib.entries();
var count =entries.length;
for(var i=0;i<count;i++)
{
  getVersionByEntry(entries[i]);
}; 
