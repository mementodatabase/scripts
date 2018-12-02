/* global http, moment */
function BtcRelaxApi(v_server, v_tokenKey) {
  this.server = v_server !== undefined ? v_server : 'shop.btcrelax.xyz';
  this.tokenKey = v_tokenKey !== null ? v_tokenKey : null;
  this.registered = 0;
  this.saled = 0;
  this.catched = 0;
}

BtcRelaxApi.prototype.setNewState = function (pEntry) {
  var vNewState = arg('NewState');
  var vPointId = pEntry.field("BookmarkId");
  var auth = pEntry.author;
  var qry = "https://" + this.server + "/api/Bookmark?action=SetNewState&author=" + auth + "&bookmarkId=" + vPointId + "&state=" + vNewState;
  log(qry);
  var vResult = http().get(qry);
  if (vResult.code == 200) {
    var json = JSON.parse(vResult.body);
    if (json.BookmarkResult === true) {
      this.setPointState(pEntry, json.BookmarkState.bookmarkState);
      pEntry.set("ServerError", "");
      pEntry.set("isError", false);
    } else { pEntry.set("ServerError", json.BookmarkError); pEntry.set("isError", true); };
  } else { message(vResult.code); };
}


BtcRelaxApi.prototype.getRegionTitle = function (pEntry) {
  var cReg = pEntry.field("Region");
  var vRegCounts = cReg.length; var vRegion = null;
  if (vRegCounts > 0) { vRegion = this.getRegionPath(cReg[0]); };
  return vRegion;
}

BtcRelaxApi.prototype.getRegionPath = function (pEntry) {
  var res; res = pEntry.field("RegionTitle");
  var parCnt = pEntry.field("ParentRegion").length;
  if (parCnt > 0) { res = res + ", " + this.getRegionPath(pEntry.field("ParentRegion")[0]); };
  return res;
}

BtcRelaxApi.prototype.getAverageLocation = function (vLocation) {
  var nLat = vLocation.lat; var nLng = vLocation.lng; var i = 1;
  while (vLocation.hasNext) {
    vLocation = vLocation.next;
    nLat = nLat + vLocation.lat;
    nLng = nLng + vLocation.lng;
    i = i + 1;
  }
  return { lat: Math.round(nLat / i * 1000000) / 1000000, lng: Math.round(nLng / i * 1000000) / 1000000 };
}

BtcRelaxApi.prototype.getVersion = function () {
  result = http().get("https://" + this.server + "/api/GetVer");
  if (result.code == 200) {
    var vGetVerResult = JSON.parse(result.body);
    return vGetVerResult.Core;
  }
}

BtcRelaxApi.prototype.getAdvertiseTitle = function (pEntry) {
  var inbox = pEntry.field('InBox'); var result = '';
  for (var i2 = 0; i2 < inbox.length; i2++) {
    var linkedEntry = inbox[i2];
    if (result === '') { result = linkedEntry.field("ItemTypeName"); }
    else { result = result + " + " + linkedEntry.field("ItemTypeName"); }
  }
  return result;
}

BtcRelaxApi.prototype.registerPoint = function (pEntry) {
  var vLocation = pEntry.field("Loc");
  var cId = pEntry.field("bookmarkId");
  var cIsSent = pEntry.field("isSent");
  if (cId === null && cIsSent === false) {
    if (vLocation !== null) {
      var loc = this.getAverageLocation(vLocation);
      var auth = pEntry.author;
      if (auth !== null) {
        var price = pEntry.field('TotalPrice');
        var title = this.getAdvertiseTitle(pEntry);
        var params = encodeURIComponent('[{"title":"' + title + '","price":' + price +
          ',"location":{"latitude":' + loc.lat + ',"longitude":' + loc.lng + '}}]');
        var vURI = "https://" + this.server + "/api/Bookmark?action=CreateNewPoint&author=" + auth + "&params=" + params;
        log(vURI);
        var vResult = http().get(vURI);
        if (vResult.code == 200) {
          log(vResult.body);
          var json = JSON.parse(vResult.body);
          if (json.BookmarkResult === true) {
              pEntry.set("isSent", true);
              pEntry.set("BookmarkId", json.BookmarkState.bookmarkId);
              pEntry.set("Status", json.BookmarkState.bookmarkState);
              pEntry.set("Latitude", loc.lat);
              pEntry.set("Longitude", loc.lng);
              pEntry.set("ServerError", "");
              pEntry.set("isError", false);
              this.registered = this.registered + 1;
            } else { pEntry.set("ServerError", json.BookmarkError); pEntry.set("isError", true); };
        } else { pEntry.set("ServerError", "As a result of call:" + vResult.code ); pEntry.set("isError", true); };
      } else { pEntry.set("ServerError", "Upload library to cloud before register points at server!"); pEntry.set("isError", true); };
    } else { pEntry.set("ServerError", "Location is not set. Set location before sync!"); pEntry.set("isError", true); };
  } else { pEntry.set("ServerError", "Point already registered!"); pEntry.set("isError", true); };
}

BtcRelaxApi.prototype.updatePoint = function (pEntry) {
  var vStateStart = pEntry.field("Status");
  if (vStateStart === 'Preparing') {
    var auth = pEntry.author;
    var vLink = pEntry.field("URLToPhoto");
    var vDescr = pEntry.field("Description");
    var vPointId = pEntry.field("BookmarkId");
    var vRegionTitle = this.getRegionTitle(pEntry);
    var params = encodeURIComponent('[{"region":"' + vRegionTitle + '","link":"' + vLink + '","description":"' + vDescr + '"}]');
    var vRequest = "https://" + this.server + "/api/Bookmark?action=UpdatePoint&author=" + auth + "&bookmarkId=" + vPointId + "&params=" + params;
    log(vRequest);
    var vResult = http().get(vRequest);
    if (vResult.code == 200) {
      log(vResult.body);
      var json = JSON.parse(vResult.body);
      if (json.BookmarkResult === true) {
        pEntry.set("Latitude", json.BookmarkState.bookmarkLatitude);
        pEntry.set("Longitude", json.BookmarkState.bookmarkLongitude);
        pEntry.set("URLToPhoto", json.BookmarkState.bookmarkPhotoLink);
        pEntry.set("Description", json.BookmarkState.bookmarkDescription);
        pEntry.set("ServerError", "");
        pEntry.set("isError", false);
      } else { pEntry.set("ServerError", json.BookmarkError); pEntry.set("isError", true); };
    } else { message(vResult.code); };  
  } else { message("Updating point info allowed only in Prepare state!"); };
}

BtcRelaxApi.prototype.setPointState = function (pEntry, pState) {
  var vStateStart = pEntry.field("Status");
  if (vStateStart !== pState) {
    pEntry.set("Status", pState);
      switch (pState) {
        case 'Saled':
          this.saled = this.saled + 1;
          break;
        case 'Catched':
          this.catched = this.catched + 1;
          break;
        default:
          break;
      };
      var vM = moment();
      pEntry.set("StatusChanged", vM.toDate());
  }
}

BtcRelaxApi.prototype.getPointState = function (pEntry) {
  var cId = pEntry.field("bookmarkId");
  var cIsSent = pEntry.field("isSent");
  if (cId !== null && cIsSent === true) {
    var query = "https://" + this.server + "/api/Bookmark?action=GetPointState&bookmarkId=" + cId + "&author=" + pEntry.author;
    log(query);
    var vResult = http().get(query);    
    if (vResult.code === 200) {
      var json = JSON.parse(vResult.body);
      if (json.BookmarkResult === true) {
        var vState = json.BookmarkState;
        var vEndRaw = vState.bookmarkEndDate;
        var vOrderId = vState.bookmarkOrderId;
        log("OrderId:" + vOrderId);
        if (vOrderId !== undefined) { pEntry.set("OrderId", vOrderId); } else { pEntry.set("OrderId", null); };
        if (vEndRaw !== undefined) {
          var vEndDate = moment(vEndRaw.date).add(7,'hours');
          pEntry.set("EndDate", vEndDate.toDate());
        } else { pEntry.set("EndDate", null); };
        if (cId === vState.bookmarkId) { this.setPointState(pEntry, vState.bookmarkState); pEntry.set("ServerError", ""); pEntry.set("isError", false); }
      } else { pEntry.set("ServerError", json.BookmarkError); pEntry.set("isError", true); }
    }
  }
}

function SyncLibrary(pServer) {
  var cLib = lib();
  if (pServer === null) {pServer = "shop.bitganj.website"; };
  var entries = cLib.entries();
  var count = entries.length;
  var vAPI = new BtcRelaxApi(pServer);
  for (i = 0; i < count; i++) {
    var cEntry = entries[i];
    if (cEntry.field("EndDate") === null) {
      vAPI.getPointState(cEntry);
    };
    message("Process:" + i + " of " + count);
  };
  var vResultMsg = 'Registered:' + vAPI.registered + '\n Saled:' + vAPI.saled + '\n Catched:' + vAPI.catched;
  message(vResultMsg);
}

function SetState(pServer) {
  var vEntry = entry();
    if (pServer === null) {pServer = "shop.bitganj.website"; };
  var vApi = new BtcRelaxApi(pServer);
  vApi.setNewState(vEntry);
}

function UpdatePoint(pServer) {
  var vEntry = entry();
    if (pServer === null) {pServer = "shop.bitganj.website"; };
  var vApi = new BtcRelaxApi(pServer);
  vApi.updatePoint(vEntry);
}


function RegisterPoint(pServer) {
  var vEntry = entry();
  if (pServer === null) {pServer = "shop.bitganj.website"; };
  var vApi = new BtcRelaxApi(pServer);
  vApi.registerPoint(vEntry);
}

function GetState(pServer) {
  var vEntry = entry();
  if (pServer === null) {pServer = "shop.bitganj.website"; };
  var vApi = new BtcRelaxApi(pServer);
  vApi.getPointState(vEntry);
}