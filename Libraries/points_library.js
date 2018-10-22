var cLib = lib();
var entries =cLib.entries();
var count =entries.length;
var vAPI = new BtcRelaxApi("shop.bitganj.website");
for (i=0;i<count;i++)
{
  var cEntry = entries[i];
  vAPI.getPointState(cEntry);
};
var vResultMsg = 'Registered:' + vAPI.registered + '\n Saled:' + vAPI.saled + '\n Catched:' + vAPI.catched;
message(vResultMsg);
