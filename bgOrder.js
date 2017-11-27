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

BitGanjOrders.prototype.refresh = function(vOrder) {
  var res=false;
  var vGate=this.gate;
  res=vGate.call(vOrder,'OrdersApi.php');  
  return res;
};

BitGanjOrders.prototype.UpdateState = function(vOrder) {
  var res=false;
  var json = JSON.parse(vOrder.field("ServerResponse"));
  var vOldState=vPub.field("State");
  var vState =json.serverState;
  if (vOldState!==vState)
  {
     log('New status:'+vState+ ' for order id:'+vOrder.field("OrderId"));
     switch(vState)
	    { 
      case 'Canceled':
            vPub.set("FinishDate",moment().toDate());
            break;
	     case 'Finished':
            vPub.set("FinishDate",moment().toDate());	
            break;
	     case 'Paid':
            break;
       case 'WaitForPayment':
            break;
      default:
         message("Order id:"+vOrder.field("OrderId")+" has unknown state:"+vState);
         break;
	     };
    vPub.set("State",vState); 
    res=true;
  };
  return res;
};
