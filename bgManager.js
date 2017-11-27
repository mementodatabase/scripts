/* global http, moment */
function BitGanjApi(v_server, v_tokenId, v_tokenKey) {
  this.gate = new BitGanjGate(v_server, v_tokenId, v_tokenKey);
  if (this.gate!== undefined)
  {
  var pubLib = libByName("FrontShop");
  if (pubLib === null) {
    message('You need to download FrontShop library!');
    exit();
  } else {
    this.Pubs = new BitGanjPubs(pubLib,this.gate);
    var orderLib=libByName("OrdersInfo");
    if (orderLib===null)
    { 
      message('You need to download OrdersInfo library!');
      exit();
    }else {
    this.Orders= new BitGanjOrders(orderLib,this.gate);};
  };
  } else 
  {
      message('You need add library bgServerGate.js!');
      exit();
  };
}

/*BitGanjApi.prototype.validate = function(pEntry) {
  var vRes = false;
  var curInBox = pEntry.field("inBox");
  var vAdvertiseTitle;
  var vTotalPrice = 0;
  var vBookmarkId = pEntry.field("BookmarkId");
  if (vBookmarkId>0)
    {
      pEntry.set("State",'Prepared');
    };
  for (var i2 = 0; i2 < curInBox.length; i2++) {
    var linkedEntry = curInBox[i2];
    if (i2 === 0) {
      vAdvertiseTitle = linkedEntry.field("ItemTypeName");
    } else {
      vAdvertiseTitle = vAdvertiseTitle + " & " + linkedEntry.field("ItemTypeName");
    };
    vTotalPrice = vTotalPrice + linkedEntry.field("DefaultPrice");
  };

  pEntry.set("FrontTitle", vAdvertiseTitle);
  var loc = pEntry.field("Loc");
  var nLat = Math.round(loc.lat * 1000000) / 1000000;
  var nLng = Math.round(loc.lng * 1000000) / 1000000;
  pEntry.set("TotalPrice", vTotalPrice);
  pEntry.set("Latitude", nLat);
  pEntry.set("Longitude", nLng);

  var urlToPic = pEntry.field("PublicURL");
  if (urlToPic === '') {
    vRes = "Url for name:" + AdvertiseTitle + " and total price:" + vTotalPrice + " not found";
  } else {
    var nCmd = null;
    var cReg = pEntry.field("Region");
    var vDescr = pEntry.field("PointDescription");
    var vRegCounts = cReg.length;
    var vRegion = null;
    if (vRegCounts > 0) {
      var regObj = cReg[0];
      vRegion = this.getRegionPath(regObj);
      if (vRegion !== null) {
        nCmd = '{"type":"AddPoint","inf":{"lat":"' + nLat + '","lng":"' + nLng + '","link":"' + urlToPic + '","advName":"' + vAdvertiseTitle + '","price":"' + vTotalPrice + '","region":"' + vRegion + '","descr":"' + vDescr + '"}}';
        pEntry.set("ServerRequest", nCmd);
        vRes=true;
      } else {
        vRes = "Region name error";
      };
    };
  };
  return vRes;
}



BitGanjApi.prototype.getRegionPath = function(entry) {
  var res;
  res = entry.field("TitleRu");
  var parCnt = entry.field("ParentRegion").length;
  if (parCnt > 0) {
    res = res + ", " + this.getRegionPath(entry.field("ParentRegion")[0]);
  };
  return res;
};


BitGanjApi.prototype.newEntry = function(vEntry) {
  var res = true;
  var msg = vEntry.field("ServerRequest");
  var callUrl = this.server + "/PointsApi.php" + '?tokenId=' + this.tokenId + '&tokenKey=' + this.tokenKey + '&action=';
  log("Calling URL:" + callUrl + msg);
  var result = http().get(callUrl + encodeURIComponent(msg));
  if (result.code == 200) {
    var json = JSON.parse(result.body);
    vEntry.set("ServerResponse", JSON.stringify(json));
    vEntry.set("CallDate",moment().toDate());
    var rcode = json.code;
    if (rcode === 0) {
      var pointId = json.bookmarkId;
      if (pointId > 0) {
        vEntry.set("BookmarkId", pointId);
        var newPub = this.newPublication(vEntry);
      } else {
        res = "Entry with URL:" + vEntry.field("PublicURL") + " rejected by server!";
      };
    } else {
      res = json.message;
    };
  };
  return res;
};

BitGanjApi.prototype.newPublication = function(vEntry) {
  var res = true;
  var vPointId=vEntry.field("BookmarkId"); 
  var vFlib=this.frontLib;
  var vRpub= vFlib.findByKey(vPointId);
  if (vRpub===null)
    {
      var newPub = new Object();
      newPub["BookmarkId"] = vPointId;
      newPub["FrontShopTitle"] = vEntry.field("FrontTitle");
      newPub["Photos"] = vEntry.field("PublicURL");
      var pub = vFlib.create(newPub);
    pub.set("Location", vEntry.field("Loc"));
    pub.set("Price", vEntry.field("TotalPrice"));
    vEntry.set("PublicationEntry", pub);
    pub.set("RegionInfo", vEntry.field("Region"));
  };
};
*/

function syncAll(vServer, vTokenId, vTokenKey) {
  var vCl = lib();
  var vEa = vCl.entries();
  var vEcount = vEa.length;
  for (var i = 0; i < vEcount; i++) {
    var vCe = vEa[i];
    syncCurrent(vServer, vTokenId, vTokenKey, vCe);
    var vMsg = "Processed:" + (i + 1) + " of " + vEcount + " items";
  };
};

function syncCurrent(vServer, vTokenId, vTokenKey, vEntry) {
  var bga = new BitGanjApi(vServer, vTokenId, vTokenKey);
  var bgv = new BitGanjValidator(vEntry); 
  vEntry.set("isValid",bgv.isValid);   
  if (bgv.isValid !== true) {
    vEntry.set("ValidationMessage",bgv.msg);
    message(bgv.msg );
  } else {
      var vPub=bga.Pubs.getPub(vEntry);
      if (vPub!==false)
       {
         var vRefreshRes=bga.Pubs.refresh(vPub) 
         vEntry.set("State",vPub.field("Status"));
      
       };
    };
};


var vTokenId = arg("TokenId");
var vTokenKey = arg("TokenKey");
//var vEntry=entry();
//syncCurrent("https://ua.bitganj.website", vTokenId, vTokenKey,vEntry);
