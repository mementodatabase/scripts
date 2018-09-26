
function getRegionPath(entry)
{
   var res;
   res =entry.field("RegionTitle");
   var parCnt=entry.field("ParentRegion").length;
   if(parCnt>0)
   {
      res=res+", "+getRegionPath(entry.field("ParentRegion")[0]);
   }; 
   return res;
};

var vEntry = entry();
var curInBox =vEntry.field("inBox");
var vAdvertiseTitle;
for(var i2=0;i2<curInBox.length;i2++)
{ var linkedEntry=curInBox[i2];
  if(i2===0) {vAdvertiseTitle=linkedEntry.field("ItemTypeName");}
  else
  {vAdvertiseTitle=vAdvertiseTitle+" & "+linkedEntry.field("ItemTypeName");}
};
var loc = vEntry.field("Location");
var nLat = Math.round(loc.lat * 1000000) / 1000000;
var nLng = Math.round(loc.lng * 1000000) / 1000000;
vEntry.set("ServerRequest","INSERT INTO `Bookmarks` (`State`, `AdvertiseTitle`, `RegionTitle`, `CustomPrice`,
`IdDroper`, `Latitude`, `Longitude`, `Link`, `Description`) 
VALUES ('Published','"+vAdvertiseTitle+"', '"+getRegionPath(vEntry.field("RegionTitle")[0])+"',
"+vEntry.field("TotalPrice")+", 'god_producer_2018',"+nLat+","+nLng+",'"
+vEntry.field("URLToPhoto")+"','"+vEntry.field("Description")+"')");
