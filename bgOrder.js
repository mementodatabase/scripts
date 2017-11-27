/* global http, moment */
function BitGanjOrders(v_lib, v_gate) {
  this.gate = v_gate;
  this.clib = v_lib;
 }

BitGanjOrders.prototype.getOrder = function(vEntry) {
  var res=false;
  var vOrderId=vEntry.field("OrderId");
  var vFlib=this.clib;
  var vCPub=vFlib.findByKey(vOrderId);
  if (vCPub===null && vOrderId>0)
  {
    var newOrder=new Object();
    newOrder["OrderId"]=vOrderId;
    var order=vFlib.create(newOrder);
    order.set("PublicationEntry",vEntry);
    res=order;
  } else { res=vCPub; };
  return res;
};
