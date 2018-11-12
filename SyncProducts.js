function SyncProducts(pServer) {
  var cLib = lib();
  if (pServer === null) {
    pServer = "shop.bitganj.website";
  }
  ;
  var entries = cLib.entries();
  var count = entries.length;
  for (i = 0; i < count; i++) {
    var cEntry = entries[i];
    cEntry.set("Owner", cEntry.author);
  }
  ;
  var vResultMsg = 'Products synced!';
  message(vResultMsg);
}