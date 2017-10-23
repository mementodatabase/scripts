function prepareUpdateRequest(vEntry)
{
  var cEntry;
  if (vEntry!==undefined)
  {
     cEntry=vEntry;
  }
  else
  {
     cEntry=entry();
  };

  var mU=cEntry.field("APItoken");
  var vO=cEntry.field("UpdateId");
  if (vO>0)
  {
    cEntry.set("ServerRequest",mU+'getUpdates?offset='+vO);
  }
  else
  {
 cEntry.set("ServerRequest",mU+'getUpdates');
  };    
};


function getUpdateInfo(vEntry)
{
var vRequest = vEntry.field("ServerRequest");
var result=http().get(vRequest);
if(result.code===200) {
   var json=JSON.parse(result.body);
   vEntry.set("ServerResponse",JSON.stringify(json));
   var state =json.ok;
   if (state===true)
   { 
   var vUList=json.result;
   for (var UInfo in vUList)
    {
       var uI=vUList[UInfo];
       var vLast=vEntry.field("UpdateId");
       if (vLast!==uI.update_id)
       {
       processUpdateInfo(vEntry,uI);
       };
    };
   };
  };
};

function processUpdateInfo(vEntry, vUpdateInfo)
{
    var vUId = vUpdateInfo.update_id;
    var vHLib = libByName("TelegramUpdates");
    var vUInfo = new Object();
    if (vUpdateInfo.message !== undefined) 
    {
     vUInfo["UpdateType"]="Message";
    };
    vUInfo["UpdateId"]=vUId;
    var nUI=vHLib.create(vUInfo);
    nUI.set("TelegramBot",vEntry);
    vEntry.set("UpdateId",vUId);
};


var vC=entry();
prepareUpdateRequest(vC);
getUpdateInfo(vC);