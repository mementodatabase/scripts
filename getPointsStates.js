function getAdvertiseTitle(pEntry) {
  var inbox = pEntry.field('InBox');
  var result = '';
  for (var i2 = 0; i2 < inbox.length; i2++) {
    var linkedEntry = inbox[i2];
    if (result === '') {
      result = linkedEntry.field("ItemTypeName");
    } else {
      result = result + " + " + linkedEntry.field("ItemTypeName");
    }
  }
  return result;
}


function registerPoint(pEntry) {
  var loc = pEntry.field("Loc");
  var nLat, nLng, auth, price, title;
  var i = 0;
  nLat = Math.round(loc.lat * 1000000) / 1000000;
  nLng = Math.round(loc.lng * 1000000) / 1000000;
  auth = pEntry.author;
  price = pEntry.field('TotalPrice');
  title = getAdvertiseTitle(pEntry);
  pEntry.set("ServerRequest", "INSERT INTO `Bookmarks` (`AdvertiseTitle`,`CustomPrice`,`IdDroper`,`Latitude`,`Longitude`)" +
    "VALUES ( '" + title + "'," + price + ",'" + auth + "'," + nLat + "," + nLng + "); SELECT LAST_INSERT_ID();");
}

function setPointState(pEntry, pState) {
  if (pState==='Preparing') {
    var vLink = pEntry.field("URLToPhoto");
    var vDescr = pEntry.field("Description");
    var vPointId = pEntry.field("BookmarkId");
    var vQry = "UPDATE `Bookmarks` SET `State` = 'Published', `Link` = '" +
        vLink + "', `Description` = '"+ vDescr + "'  WHERE `idBookmark` = "+ vPointId + ";";
  }
  cEntry.set("Status",pState );
}


function getPointState(cEntry) {
  var cId = cEntry.field("bookmarkId");
  if (cId !== null) {
    var query = "https://fastfen.club/api/Bookmark?action=GetPointState&bookmarkId=" + cId + "&author=" + cEntry.author;
    var vResult = http().get(query);
    if (vResult.code === 200) {
      var json = JSON.parse(vResult.body);
      if (json.BookmarkResult === true) {
        var vState = json.BookmarkState;
        if (cId === vState.bookmarkId) {
          var cState = cEntry.field("Status");
          if (cState !== vState.bookmarkState) {
            setPointState(cEntry,vState.bookmarkState);
            
          }
        }
      }
    }
  } else {
    registerPoint(cEntry);
  }
}

var cLib = lib();
var entries = cLib.entries();
var count = entries.length;
for (i = 0; i < count; i++) {
  getPointState(entries[i]);
}