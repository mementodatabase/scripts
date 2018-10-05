function getPointState(cEntry) {
var cId = cEntry.field("bookmarkId");
if (cId !== null) {
	var query = "https://shop.ganj.site/api/Bookmark?action=GetPointState&bookmarkId="+cId+"&author="+cEntry['author'];
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
	};
};

var cLib = lib();
var entries =cLib.entries();
var count =entries.length;
for (i=0;i<count;i++)
{
  var cEntry = entries[i];
  getPointState(cEntry);
};
