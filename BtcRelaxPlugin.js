/* global http, moment */
function BtcRelaxApi( v_server ,v_tokenKey ) {
    this.server = v_server !== null? v_server: 'shop.btcrelax.xyz';
    this.tokenKey = v_tokenKey  !== null? v_tokenKey: null;
}

BtcRelaxApi.prototype.getRegionTitle = function (pEntry) {
  var reg = pEntry.field('Region');
  var result = '';
  for (var i2 = 0; i2 < reg.length; i2++) {
    var linkedEntry = reg[i2];
    if (result === '') {
      result = linkedEntry.field("RegionTitle");
    } else {
      result = result + " + " + linkedEntry.field("RegionTitle");
    }
  }
  return result;
}

BtcRelaxApi.prototype.getAverageLocation = function(vLocation) {
  var nLat = vLocation.lat;
  var nLng = vLocation.lng;
  var i=1;
  while (vLocation.hasNext) {
    vLocation = vLocation.next;
    nLat = nLat + vLocation.lat;
    nLng = nLng + vLocation.lng;
    i = i +1;
  }
  return {lat:Math.round(nLat/i*1000000)/1000000, lng:Math.round(nLng/i*1000000)/1000000 };
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
  var loc = this.getAverageLocation(pEntry.field("Loc"));
  var auth = pEntry.author;
  var price = pEntry.field('TotalPrice');
  var title = this.getAdvertiseTitle(pEntry);
  var params =  encodeURIComponent('[{"title":"' +title + '","price":' + price +
    ',"location":{"latitude":' + loc.lat + ',"longitude":'  + loc.lng + '}}]');
  var vResult = http().get("https://" + this.server + "/api/Bookmark?action=CreateNewPoint&author=" + auth + "&params=" + params);
  if (vResult.code == 200)
    {
        log(vResult.body);
        var json = JSON.parse(vResult.body);  
        if (json.BookmarkResult === true)
        {
            pEntry.set("isSent",true);
            pEntry.set("BookmarkId", json.BookmarkState.bookmarkId);
            pEntry.set("Status",json.BookmarkState.bookmarkState );
            pEntry.set("Latitude",loc.lat );
            pEntry.set("Longitude",loc.lng );
        } else { pEntry.set("ServerRequest", json.BookmarkError); };  
    } else { message(vResult.code); };
}

BtcRelaxApi.prototype.updatePoint = function (pEntry) {
      var auth = pEntry.author;      
      var vLink = pEntry.field("URLToPhoto");
      var vDescr = pEntry.field("Description");
      var vPointId = pEntry.field("BookmarkId");
      var vQry = "UPDATE `Bookmarks` SET `State` = 'Published', `Link` = '" +
        vLink + "', `Description` = '"+ vDescr + "'  WHERE `idBookmark` = "+ vPointId + ";";
      
      var params =  encodeURIComponent('[{"link":"' +vLink + '","description":"' + vDescr + '"}]');
      var vResult = http().get("https://" + this.server + "/api/Bookmark?action=UpdatePoint&author=" + auth + "&bookmarkId=" + vPointId + "&params=" + params);
      if (vResult.code == 200)
      {
        log(vResult.body);
        var json = JSON.parse(vResult.body);  
        if (json.BookmarkUpdateResult === true)
        {
            pEntry.set("Latitude",json.BookmarkState.bookmarkLatitude );
            pEntry.set("Longitude",json.BookmarkState.bookmarkLongitude );
            pEntry.set("URLToPhoto",json.BookmarkState.bookmarkPhotoLink );
            pEntry.set("Description",json.BookmarkState.bookmarkDescription );
        } else { pEntry.set("ServerRequest", json.BookmarkUpdateError); };  
      } else { message(vResult.code); };
}

BtcRelaxApi.prototype.setPointState = function (pEntry, pState) {
  log("State:" + pState);
  if (pState==='Preparing') {
       this.updatePoint(pEntry);
    }
  pEntry.set("Status",pState );
}

BtcRelaxApi.prototype.getPointState = function (cEntry) {
  var cId = cEntry.field("bookmarkId");
  var cIsSent = cEntry.field("isSent");
  if (cId !== null && cIsSent === true ) {
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
