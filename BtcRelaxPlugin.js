/* global http, moment */

function BtcRelaxApi( v_server , v_tokenId, v_tokenKey, v_readOnly )
{
    this.server = v_server;
    this.tokenId = v_tokenId;
    this.tokenKey = v_tokenKey;
    this.isReadOnly = v_readOnly;
}


BtcRelaxApi.prototype.prepareEntity = function (vEntry) {
    var nLat = vEntry.field("Latitude");
    var nLng = vEntry.field("Longitude");
    var vAdv = vEntry.field("FrontTitle");
    var vPrice = vEntry.field("TotalPrice");
    var cReg= vEntry.field("Regions");
    var vDescr=vEntry.field("PointDescription");
    var vRegCounts=cReg.length;  
    var vRegion = null;
	var commands = null;
            if(vRegCounts>0)
                {
                    var regObj =cReg[0];
                    vRegion=this.getRegionPath(regObj);
                    log("Region name:"+vRegion);  
					var nUrl = vEntry.field("PublicURL");
					commands =
					'{"type":"AddPoint","inf":{"lat":"' + nLat + '","lng":"' + nLng + '","link":"' + nUrl +
					'","advName":"' + vAdv + '","price":"' + vPrice + '","region":"' + vRegion + '","descr":"' + vDescr + '"}}';    
				};    
    return commands;
};

BtcRelaxApi.prototype.syncEntry = function(vEntry)
{
    var isSent=vEntry.field("isSent");
    if (isSent===false)
   	{
        if (!this.isReadOnly) { this.newEntry(vEntry);};
    }; 
};

BtcRelaxApi.prototype.newEntry = function(vEntry)
{
    var msg=vEntry.field("ServerRequest");
    var callUrl=this.server+'?tokenId='+this.tokenId+'&tokenKey='+this.tokenKey+'&request=addBookmark';
    log("Calling URL:"+callUrl+msg);
    var result=http().get(callUrl+encodeURIComponent(msg));  
    if(result.code==200)
	{
            var json=JSON.parse(result.body);
    	    var rcode=json.code;
            log("Answer result:"+rcode);
            if (rcode === 0)
               {
			    var pointId = json.bookmarkId;
			    if (pointId>0)
    			    {
    					    this.newPublication(vEntry, pointId)
    			    }
    			    else
    			    {
    			           message('Inadequate response from Server while sending!');
    			           log("Entry with URL:"+vEntry.field("PublicURL")+" rejected by server!");
    			    }
        	}
		else
		{
			var rmessage=json.message;
			message("Code:"+rcode+" with message:"+rmessage+" returned while try to insert!");
		};
    };		
};

BtcRelaxApi.prototype.setNewState=function(vPub,vNewState, vOrderId)
{
	switch(vNewState)
	{ case 'Saled':
            vPub.set("FinishDate",moment().toDate());
            vPub.set("OrderId", vOrderId);
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
            message("Bookmark id:"+vPub.field("BookmarkId")+" was preordered");
            vPub.set("OrderId", vOrderId);
            break;
        case 'Preparing':
           message("Bookmark id:"+vPub.field("BookmarkId")+" need for revision!");
	   vPub.set("OrderId", null);
           break;
        case 'Lost':
           vPub.set("FinishDate",moment().toDate());
           message("Bookmark id:"+vPub.field("BookmarkId")+" was lost!");
	   break;
       case 'Finished':
         vPub.set("FinishDate",moment().toDate());
         vPub.set("OrderId", vOrderId);
         break;
       case 'Canceled':
         vPub.set("FinishDate",moment().toDate());
         vPub.set("OrderId", null);
         break;
        default:
         message("Bookmark id:"+vPub.field("BookmarkId")+" has unknown state:"+vNewState);
         break;
	};
	vPub.set("Status",vNewState);	
};

BtcRelaxApi.prototype.getIterateOrders=function()
{
    var clib = lib(); 
    var entries =clib.entries(); 
    var count =entries.length; 
    log("Total orders:"+count);    
    for (i=0;i<count;i++) 
    {         
        var current=entries[i]; 
        this.queryChain(current); 
    };     
};



BtcRelaxApi.prototype.getOrderById = 
function(vOrderId)
{
   log("Getting order Id:"+vOrderId);
   var vResult;
   var vOrderLib=libByName("Orders");
        var entries = vOrderLib.entries();
        var count =entries.length;       
        log("Local library, already has:"+count+" orders.");  
        for(var i=0;i<count;i++)
        {
             var current =entries[i];
             var vCurId =current.field("OrderId");
	           if (vOrderId==vCurId)
	         {
	     	      log("Order with id:"+vOrderId+" already exist!");
		          vResult = current;
		           return vResult;     
	         };
      	};  
        log("Creating new object");
	      var vNewOrder=new Object();
        vNewOrder["OrderId"]=vOrderId;
        	vResult = vOrderLib.create(vNewOrder);
	      log("Order with id:"+vOrderId+" created!");
	return vResult; 
};

BtcRelaxApi.prototype.newPublication = function(vEntry, vPointId)
{
     var isPubCount = vEntry.field("PublicationEntry").length;
     if(isPubCount===0)
     {
         var pubLib=libByName("Publication");
         var newPub = new Object();
         var vRegionTitle=this.getRegionPath(vEntry.field("Regions")[0]);
         newPub["BookmarkId"]=vPointId;
         newPub["FrontShopTitle"]=vEntry.field("FrontTitle");
         newPub["Photos"]=vEntry.field("PublicURL");
         newPub["RegionTitle"]=vRegionTitle;
         var pub=pubLib.create(newPub);
         pub.set("Location",vEntry.field("Loc"));
         pub.set("Price",vEntry.field("TotalPrice"));
         vEntry.set("PublicationEntry",pub); 
         vEntry.set("isSent",true);
     }
     else
     {
         log("Entry with URL:"+vEntry.field("PublicURL")+" already has publication!");
     }
};

BtcRelaxApi.prototype.prepareRequest = function(vPub)
{
    var pointId=vPub.field("BookmarkId");    
    if (pointId>0)
    {    
         log("Preparing bookmark Id:"+pointId);
	 var msg = '{"type":"GetPointState","bookmarkId":"' + pointId + '"}'; 
         var callUrl=this.server+'?tokenId='+this.tokenId+'&tokenKey='+this.tokenKey+'&action=';
         vPub.set("Request",callUrl+encodeURIComponent(msg));
    }
    else
    {
        message("Error getting state for point id:"+pointId);
    };
};

BtcRelaxApi.prototype.prepareOrderRequest = function(vOrder)
{
    var vOrderId=vOrder.field("OrderId");    
    if ( vOrderId>0)
    {    
         var msg = '{"type":"GetOrderById","OrderId":"' + vOrderId + '"}'; 
         var callUrl=this.server+'?tokenId='+this.tokenId+'&tokenKey='+this.tokenKey+'&action=';
         vOrder.set("Request",callUrl+encodeURIComponent(msg));
    }
    else
    {
        message("Error getting for order id:"+vOrderId);
    };
};

BtcRelaxApi.prototype.getPublicationState = function(vPub)
{
    this.prepareRequest(vPub);
    var vRequest = vPub.field("Request");
    var result=http().get(vRequest);
    if(result.code==200) {
                var json=JSON.parse(result.body);
    		vPub.set("Response",JSON.stringify(json));
	    	var pointId=vPub.field("BookmarkId");
                var state =json.serverState;
                log("Returned status:"+state);	    
                var oldState = vPub.field('Status');
                var orderId = json.OrderId;
                if (orderId>0)
                {
                  log("OrderId:"+orderId);
		              
		              var vOrder = this.getOrderById(orderId);
		              if (vOrder!==undefined)
                  {
                  vOrder.set("PublicationEntry",vPub); 
                  this.getOrderState(vOrder);
                  };
                };
                if (state !== oldState)
                {
                            	this.setNewState(vPub,state, orderId);
				message("BookmarkId:"+pointId+" changed!");  
                };
    };
};

BtcRelaxApi.prototype.getOrderState = function(vOrder)
{
    this.prepareOrderRequest(vOrder);
    var vRequest = vOrder.field("Request");
    var result=http().get(vRequest);
    if(result.code===200) {
                var json=JSON.parse(result.body);
    		vOrder.set("Response",JSON.stringify(json));
                var state =json.serverState;
                var vInvoiceAddress=json.invoiceAddress;
                if (vInvoiceAddress.length>0)
               {
                 vOrder.set("state",state);
                vOrder.set("InvoiceAddress",vInvoiceAddress);
                vOrder.set("Modified",moment().toDate());
                this.queryChain(vOrder);
 };
};
};

BtcRelaxApi.prototype.queryChain = function(vOrder)
{
    
        var vAddr=vOrder.field("InvoiceAddress"); 
        if (vAddr.length>0) 
        { 
            log("Checking order:"+vOrder.field("OrderId"));
	           var req="https://api.smartbit.com.au/v1/blockchain/address/"+vAddr+"?tx=0"; 
            vOrder.set("ChainRequest",req); 
            
        };
    var vRequest = vOrder.field("ChainRequest");
    var result=http().get(vRequest);
    if(result.code===200) {
                var json=JSON.parse(result.body);
    		vOrder.set("ChainResponse",JSON.stringify(json));
                var vSuc =json.success;
                if (vSuc)
		{
			var vAdrInf=json.address;
			var vTotal=vAdrInf.total;
    			var vConfirmed=vAdrInf.confirmed;
    			var vUnconfirmed=vAdrInf.unconfirmed;
			var vBalance=vTotal.balance;
			var vReceived=vTotal.received;			
		        vOrder.set("AddressBalance",vBalance);
	                vOrder.set("Received",vReceived);
	    		vOrder.set("Confirmed", vConfirmed.received);
      			vOrder.set("Unconfirmed",vUnconfirmed.received);          
   			vOrder.set("Modified",moment().toDate());
		};
    };
};


BtcRelaxApi.prototype.syncEntries = function()
{
	var clib = lib();
	var entries =clib.entries();
	var count =entries.length;
	log("For validate:"+count);
	for (i=0;i<count;i++)
	{
	 log("Entry#"+i);
         var current=entries[i];
         this.syncEntry(current);
	};
};

BtcRelaxApi.prototype.validateEntry = function(vEntry)
{
    var isSent=vEntry.field("isSent");
            //message(entryState);
    if(isSent===false)
        {
            var curInBox =vEntry.field("inBox");
            log(curInBox.length);
            var AdvertiseTitle;
            var vTotalPrice=0;
            for(var i2=0;i2<curInBox.length;i2++)
            {
                var linkedEntry=curInBox[i2];
                if(i2===0)
                    {AdvertiseTitle=linkedEntry.field("ItemTypeName");}
                    else
                    {AdvertiseTitle=AdvertiseTitle+" & "+linkedEntry.field("ItemTypeName");}
                    vTotalPrice=vTotalPrice+linkedEntry.field("DefaultPrice");
            };
            var urlToPic = vEntry.field("PublicURL");
            log("URL:"+urlToPic);
            if (urlToPic==='')
            { message("Url for name:"+AdvertiseTitle+" and total price:"+vTotalPrice+" not found");}
        	else    
            {   vEntry.set("FrontTitle",AdvertiseTitle);  			
                var loc = vEntry.field("Loc");
                var nLat = Math.round(loc.lat * 1000000) / 1000000;
                var nLng = Math.round(loc.lng * 1000000) / 1000000;
                vEntry.set("TotalPrice",vTotalPrice);
                vEntry.set("Latitude",nLat);
                vEntry.set("Longitude",nLng);
                vEntry.set("FrontTitle",AdvertiseTitle);  
                var nCmd=this.prepareEntity(vEntry);
                if (nCmd!=null)
        		{
                            vEntry.set("ServerRequest",nCmd);
        		};
            }; 
        };    
};

BtcRelaxApi.prototype.validateEntries = function()
{
        var clib = lib(); 
	    var entries = clib.entries();
        var count =entries.length;
        log("For validate:"+count);
        for(var i=0;i<count;i++)
            {
            var current =entries[i];
            this.validateEntry(current);
       };  
 };
 
BtcRelaxApi.prototype.getPublicationsStates = function()
 {
         var clib = lib(); 
         var entries = clib.entries();
         var count =entries.length;
         log("For validate:"+count);
         for(var i=0;i<count;i++)
             {
             var current =entries[i];
             this.getPublicationState(current);
             message("Processed:"+i+" of "+count+" items");
         };  
  };

BtcRelaxApi.prototype.getRegionPath = function(entry)
{
   var res;
   res =entry.field("TitleRu");
   var parCnt=entry.field("ParentRegion").length;
   if(parCnt>0)
   {
      res=res+", "+this.getRegionPath(entry.field("ParentRegion")[0]);
   }; 
   return res;
};

function syncAll(vServer)
{
   var bra=new BtcRelaxApi( vServer,2,"be55d4034229177ca6f864a87cb630d3", false);
   bra.validateEntries();
   bra.syncEntries();
};

function syncCurrent(vServer)
{
   var bra=new BtcRelaxApi( vServer,2,"be55d4034229177ca6f864a87cb630d3", false);
   var cE = entry();
   bra.validateEntry(cE);
   bra.syncEntry(cE);
};

function refreshPub(vServer)
{
    var bra=new BtcRelaxApi(  vServer,2,"be55d4034229177ca6f864a87cb630d3", false);
    var cE = entry();
    bra.getPublicationState(cE);
    
};

function refreshAllPubs(vServer)
{
    var bra=new BtcRelaxApi(  vServer,2,"be55d4034229177ca6f864a87cb630d3", false);
    bra.getPublicationsStates();
    bra.getIterateOrders();    
};



function refreshAllOrders(vServer)
{
    var bra=new BtcRelaxApi(  vServer,2,"be55d4034229177ca6f864a87cb630d3", false);
    bra.getIterateOrders();    
};

//refreshAllPubs('https://ua.bitganj.website');
//refreshPub('https://ua.bitganj.website');
//syncCurrent('https://ua.bitganj.website');
//syncAll('https://ua.bitganj.website');
//refreshAllOrders('https://ua.bitganj.website');
