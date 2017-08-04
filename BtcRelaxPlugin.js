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
}

BtcRelaxApi.prototype.newEntry = function(vEntry)
{
    var msg=vEntry.field("ServerRequest");
    var callUrl=this.server+'?tokenId='+this.tokenId+'&tokenKey='+this.tokenKey+'&action=';
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
}

BtcRelaxApi.prototype.setNewState=function(vPub,vNewState)
{
	switch(vNewState)
	{ case 'Saled':
	  vPub.set("FinishDate",moment().toDate());
	  break;
	  case 'Rejected':
	  vPub.set("FinishDate",moment().toDate());	
		break;
	   case 'Published':
	   vPub.set("StartDate",moment().toDate());
		break;
	   default:
			message("Unknown state!");
			exit();
		break;
	};
	vPub.set("Status",vNewState);	
}

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
}

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
}

BtcRelaxApi.prototype.getPublicationState = function(vPub)
{
    this.prepareRequest(vPub);
    var vRequest = vPub.field("Request");
    var result=http().get(vRequest);
log(result);
    if(result.code==200) {
                var json=JSON.parse(result.body);
    		vPub.set("Response",JSON.stringify(json));
	    	var pointId=vPub.field("BookmarkId");
var state =json.serverState;
                log("Returned status:"+state);
                var oldState = vPub.field('Status');
                if (state !== oldState)
                            {
                            	this.setNewState(vPub,state);
				message("BookmarkId:"+pointId+" changed!");  
                            };
    };
}

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
   var bra=new BtcRelaxApi( vServer + "/PointsApi.php",2,"be55d4034229177ca6f864a87cb630d3", false);
   bra.validateEntries();
   bra.syncEntries();
}

function syncCurrent(vServer)
{
   var bra=new BtcRelaxApi( vServer + "/PointsApi.php",2,"be55d4034229177ca6f864a87cb630d3", false);
   var cE = entry();
   bra.validateEntry(cE);
   bra.syncEntry(cE);
}

function refreshPub(vServer)
{
    var bra=new BtcRelaxApi(  vServer + "/PointsApi.php",2,"be55d4034229177ca6f864a87cb630d3", false);
    var cE = entry();
    bra.getPublicationState(cE);
    
}

function refreshAllPubs(vServer)
{
    var bra=new BtcRelaxApi(  vServer + "/PointsApi.php",2,"be55d4034229177ca6f864a87cb630d3", false);
    var cE = entry();
    bra.getPublicationsStates(cE);
    
}

//refreshAllPubs('https://ua.bitganj.website');
//refreshPub('https://ua.bitganj.website');
//syncCurrent('https://ua.bitganj.website');
//syncAll('https://ua.bitganj.website');
