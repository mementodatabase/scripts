/* global http, moment */
function BitGanjPubs(v_lib, v_gate) {
  this.gate = v_gate;
  this.clib = v_lib;
 }
 
 BitGanjPubs.prototype.getPub = function(vEntry) {
  var res=false;
  var vPointId=vEntry.field("BookmarkId");
  if (vPointId>0)
  {
  	var vCPub=this.findByKey(vPointId);
  	if (vCPub===false)
  	{
		var newPub=new Object();
		newPub["BookmarkId"]=vPointId;
		newPub["FrontShopTitle"]=vEntry.field("FrontTitle");
		newPub["Photos"]=vEntry.field("PublicURL");
   var pub=this.clib.create(newPub);
		pub.set("Location",vEntry.field("Loc"));
		pub.set("Price",vEntry.field("TotalPrice"));
		vEntry.set("PublicationEntry",pub);
		pub.set("RegionInfo",vEntry.field("Region"));
   this.refresh(pub);
		res=pub;
  	} else { res=vCPub; };
  };
  return res;
};

BitGanjPubs.prototype.refresh = function(vPub) {
  var res=false;
  var vGate=this.gate;
  res=vGate.call(vPub,'PointsApi.php');  
  if (res===true)
   {
     res=this.UpdateState(vPub);
   };
  return res;
};

BitGanjPubs.prototype.findByKey=function(vKeyId){
  res=false;
  var ves=this.clib.entries();
  for(var i=0;i<ves.length;i++)
  {
    var ve=ves[i];
    if(vKeyId==ve.field("BookmarkId"))
    {
       res=ve;
       break;
    };
  };
  return res;
};


BitGanjPubs.prototype.UpdateState = function(vPub) {
  var res=false;
  var json = JSON.parse(vPub.field("ServerResponse"));
  var vOldState=vPub.field("Status");
  var vState =json.serverState;
  if (vOldState!==vState)
  {
     log('New status:'+vState);
     switch(vState)
	    { 
      case 'Saled':
            vPub.set("FinishDate",moment().toDate());
            vPub.set("OrderId", json.OrderId);
            break;
	     case 'Rejected':
            vPub.set("FinishDate",moment().toDate());	
            vPub.set("OrderId", null);
            break;
	     case 'Published':
            vPub.set("StartDate",moment().toDate());
            vPub.set("OrderId", null);
            break;
      case 'PreOrdered':
           vPub.set("OrderId", json.OrderId);
           break;
      case 'Preparing':
 	   vPub.set("OrderId", null);
           break;
      case 'Lost':
           vPub.set("FinishDate",moment().toDate());
	   break;
      case 'Finished':
           vPub.set("FinishDate",moment().toDate());
           vPub.set("OrderId", json.OrderId);
           break;
      case 'Canceled':
           vPub.set("FinishDate",moment().toDate());
           vPub.set("OrderId", null);
           break;
      case 'Checking':
           vPub.set("OrderId", null);
           break;
      default:
         message("Bookmark id:"+vPub.field("BookmarkId")+" has unknown state:"+vState);
         break;
	     };
    vPub.set("Status",vState); 
    res=true;
  };
  return res;
};
