/* global http, moment */
function BitGanjPubs(v_lib, v_gate) {
  this.gate = v_gate;
  this.clib = v_lib;
 }
 
 BitGanjPubs.prototype.getPub = function(vEntry) {
  var res=false;
  var vPointId=vEntry.field("BookmarkId");
  var vFlib=this.clib;
  var vCPub=vFlib.findByKey(vPointId);
  if (vCPub===null && vPointId>0)
  {
var newPub=new Object();
newPub["BookmarkId"]=vPointId;
newPub["FrontShopTitle"]=vEntry.field("FrontTitle");
newPub["Photos"]=vEntry.field("PublicURL");
var pub=vFlib.create(newPub);
pub.set("Location",vEntry.field("Loc"));
pub.set("Price",vEntry.field("TotalPrice"));
vEntry.set("PublicationEntry",pub);
pub.set("RegionInfo",vEntry.field("Region"));
  var vRequest='{"type":"GetPointState","bookmaarkId":"' + vPointId + '"}';
  pub.set("ServerRequest",vRequest);
  res=pub;
  } else { res=vCPub; };
  return res;
};

BitGanjPubs.prototype.refresh = function(vPub) {
  var res=false;
  var vGate=this.gate;
  res=vGate.call(vPub,'PointsApi.php');  
  return res;
};