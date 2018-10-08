/* global http, moment */
function BtcRelaxApi( v_server ,v_tokenKey ) {
    this.server = v_server !== null? v_server: 'fastfen.club';
    this.tokenKey = v_tokenKey  !== null? v_tokenKey: null;
}

BtcRelaxApi.prototype.getVersion = function() {
  result = http().get("https://" + this.server + "/api/GetVer");
  if (result.code == 200) {
     var vGetVerResult = JSON.parse(result.body);
     return vGetVerResult.Core;
  }
}

BtcRelaxApi.prototype.getAdvertiseTitle =  function (pEntry) {
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

BtcRelaxApi.prototype.registerPoint = function (pEntry) {
  var loc = pEntry.field("Loc");
  var nLat, nLng, auth, price, title;
  var i = 0;
  nLat = Math.round(loc.lat * 1000000) / 1000000;
  nLng = Math.round(loc.lng * 1000000) / 1000000;
  auth = pEntry.author;
  price = pEntry.field('TotalPrice');
  title = this.getAdvertiseTitle(pEntry);
  pEntry.set("ServerRequest", "INSERT INTO `Bookmarks` (`AdvertiseTitle`,`CustomPrice`,`IdDroper`,`Latitude`,`Longitude`)" +
    "VALUES ( '" + title + "'," + price + ",'" + auth + "'," + nLat + "," + nLng + "); SELECT LAST_INSERT_ID();");
}

BtcRelaxApi.prototype.setPointState = function (pEntry, pState) {
  log("State:" + pState);
  if (pState==='Preparing') {
      var vLink = pEntry.field("URLToPhoto");
      var vDescr = pEntry.field("Description");
      var vPointId = pEntry.field("BookmarkId");
      var vQry = "UPDATE `Bookmarks` SET `State` = 'Published', `Link` = '" +
        vLink + "', `Description` = '"+ vDescr + "'  WHERE `idBookmark` = "+ vPointId + ";";
      pEntry.set("ServerRequest",vQry );
    }
  pEntry.set("Status",pState );
}

BtcRelaxApi.prototype.getPointState = function (cEntry) {
  var cId = cEntry.field("bookmarkId");
  if (cId !== null) {
    var query = "https://" + this.server + "/api/Bookmark?action=GetPointState&bookmarkId=" + cId + "&author=" + cEntry.author;
    var vResult = http().get(query);
    if (vResult.code === 200) {
      var json = JSON.parse(vResult.body);
      if (json.BookmarkResult === true) {
        var vState = json.BookmarkState;
        if (cId === vState.bookmarkId) {
            this.setPointState(cEntry,vState.bookmarkState);
        }
      }
    }
  } else {
    this.registerPoint(cEntry);
  }
}