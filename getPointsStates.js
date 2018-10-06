function registerPoint(pEntry) {
	var loc = pEntry.field("Loc");
        var nLat,nLng,auth, price;
	var i=0;	
	nLat = Math.round(loc.lat * 1000000) / 1000000;
        nLng = Math.round(loc.lng * 1000000) / 1000000;
	auth = pEntry['author'];
	price = pEntry.field('TotalPrice');
	pEntry.set("ServerRequest","INSERT INTO `Bookmarks` (`CustomPrice`,`IdDroper`,`Latitude`,`Longitude`)" +
		   "VALUES (" + price + ",'" + auth +  "'," +  nLat + "," + nLng + ");" );
}

function getPointState(cEntry) {
var cId = cEntry.field("bookmarkId");
if (cId !== null) {
	var query = "https://fastfen.club/api/Bookmark?action=GetPointState&bookmarkId="+cId+"&author="+cEntry['author'];
	var vResult =http().get(query);
	if (vResult.code === 200)
		{
    			var json=JSON.parse(vResult.body);
			    if (json.BookmarkResult === true)
			    {
				  var vState = json.BookmarkState;
				    if (cId === vState.bookmarkId)
				  {
				      var cState = cEntry.field("Status");	
				      if (cState !== vState.bookmarkState)
				      {cEntry.set("Status",vState.bookmarkState);}
				    };	
			    };
		};
	} else { registerPoint(cEntry); };
};

var cLib = lib();
var entries =cLib.entries();
var count =entries.length;
for (i=0;i<count;i++)
{
  getPointState(entries[i]);
};
