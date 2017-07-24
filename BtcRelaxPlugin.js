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
    var ServerState=vEntry.field("ServerStatus");
    if (isSent==false)
	{
        if (!this.isReadOnly) { this.newEntry(vEntry);};
    } else{ this.getEntryState(vEntry) };    
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
                log("Catched:"+json.body);
               if (json.bookmarkId !== undefined)
               {
			var pointId = json.bookmarkId;
			    if (pointId>0)
			    {
						vEntry.set("isSent",true);
				vEntry.set("BookmarkId",pointId);
			    };
        };
    };		
}

BtcRelaxApi.prototype.getEntryState = function(vEntry)
{
		var pointId=vEntry.field("BookmarkId");
		if (pointId>0)
		 {
		     var msg = '{"type":"GetPointState","bookmarkId":"' + pointId + '"}'; 
                     var callUrl=this.server+'?tokenId='+this.tokenId+'&tokenKey='+this.tokenKey+'&action=';
                     vEntry.set("ServerRequest",callUrl+encodeURIComponent(msg));
                     var result=http().get(callUrl+encodeURIComponent(msg));  
                     if(result.code==200) {
                            var json=JSON.parse(result.body);
                            var state =json.serverState;
                             vEntry.set("ServerStatus",state);
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
            log("Name:"+AdvertiseTitle+":TotalPrice:"+vTotalPrice);  
            var urlToPic = vEntry.field("PublicURL");
            log("URL:"+urlToPic);
            if (urlToPic===''){ log("Url not found");}
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
                    vEntry.set("ServerStatus","Ready");
                    vEntry.set("BookmarkId",0);
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

function syncAll(vSrever)
{
   var bra=new BtcRelaxApi( vSrever + "/PointsApi.php",2,"be55d4034229177ca6f864a87cb630d3", false);
   bra.validateEntries();
   bra.syncEntries();
}

function syncCurrent(vSrever)
{
   var bra=new BtcRelaxApi( vSrever + "/PointsApi.php",2,"be55d4034229177ca6f864a87cb630d3", false);
   var cE = entry();
   bra.validateEntry(cE);
   bra.syncEntry(cE);
}
