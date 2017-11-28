/* global http, moment */
function BitGanjApi(v_server, v_tokenId, v_tokenKey, vForntShopLibName, vOrdersLibName) {
  this.ForntShopLibName = vForntShopLibName;
  this.OrdersLibName = vOrdersLibName;
  this.gate = new BitGanjGate(v_server, v_tokenId, v_tokenKey);
  if (this.gate!== undefined)
  {
  var pubLib = libByName(this.ForntShopLibName);
  if (pubLib === null) {
    message('You need to download '+this.ForntShopLibName+' library!');
    exit();
  } else {
    this.Pubs = new BitGanjPubs(pubLib,this.gate);
    var orderLib=libByName(this.OrdersLibName);
    if (orderLib===null)
    { 
      message('You need to download'+this.OrdersLibName+' library!');
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

function syncAll(vServer, vTokenId, vTokenKey, vForntShopLibName, vOrdersLibName) {
  var vCl = lib();
  var vEa = vCl.entries();
  var vEcount = vEa.length;
  for (var i = 0; i < vEcount; i++) {
    var vCe = vEa[i];
    syncCurrent(vServer, vTokenId, vTokenKey, vCe, vForntShopLibName, vOrdersLibName);
    var vMsg = "Processed:" + (i + 1) + " of " + vEcount + " items";
  };
};

function syncCurrent(vServer, vTokenId, vTokenKey, vEntry, vForntShopLibName, vOrdersLibName) {
  var bga = new BitGanjApi(vServer, vTokenId, vTokenKey, vForntShopLibName, vOrdersLibName);
  var bgv = new BitGanjValidator(vEntry); 
  vEntry.set("isValid",bgv.isValid);   
  if (bgv.isValid !== true) {
    vEntry.set("ValidationMessage",bgv.msg);
    message(bgv.msg );
  } else {
      var vPub=bga.Pubs.getPub(vEntry);
      if (vPub!==false)
       {
         var vBookmarkId=vPub.field("BookmarkId");
         var vRefreshRes=bga.Pubs.refresh(vPub); 
         vEntry.set("State",vPub.field("Status"));
         var vOrderId = vEntry.field("OrderId");
         if (vOrderId>0)
         {
           log("Try to get and refreh order Id:"+vOrderId);
           var vOrder=bga.Orders.getOrder(vPub);
           vEntry.set("OrdersInfo",vOrder);
           var refResult=bga.Orders.refresh(vOrder);
         };
       } else
       {
          var vGate=bga.gate;
          res=vGate.call(vEntry,'PointsApi.php');
          if (res===true)
          {
            var json = JSON.parse(vEntry.field("ServerResponse"));
            var pointId = json.bookmarkId;
            if (pointId>0)
            {
                vEntry.set("BookmarkId",pointId);
            };
          };
       };    
    };
};


var vTokenId = arg("TokenId");
var vTokenKey = arg("TokenKey");
//var vEntry=entry();
//syncCurrent("https://ua.bitganj.website", vTokenId, vTokenKey,vEntry);
