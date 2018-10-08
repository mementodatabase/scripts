var cLib = lib();
var entries =cLib.entries();
var count =entries.length;
for (i=0;i<count;i++)
{
  var cEntry = entries[i];
  var vAPI = new BtcRelaxApi("shop.ganj.site");
  vAPI.getPointState(cEntry);
}
