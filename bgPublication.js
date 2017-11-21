/* global http, moment */
function BitGanjPubs(v_lib, v_gate) {
  this.gate = v_gate;
  this.lib = v_lib;
 }
 
 BitGanjPubs.prototype.getPub = function(vEntry) {
  var res=false;
  var vPointId=vEntry.field("BookmarkId");
  vat vFlib=this.lib;
  var vCPub=vFlib.findByKey(vPointId);
  if (vCPub===null)
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
    res=pub;
  } else { res=vCPub; };
  return res;
}