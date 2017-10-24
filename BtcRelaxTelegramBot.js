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
     var vM = vUpdateInfo.message;  
     vUInfo["Text"]=vM.text;  
     var vUF=vM.from;
     var vUsr=getUser(vUF);
     vUsr.set("TelegramBot",vEntry);
    };
    vUInfo["UpdateId"]=vUId;
    var nUI=vHLib.create(vUInfo);
    nUI.set("TelegramBot",vEntry);
    var vRI=JSON.stringify(vUpdateInfo);
    nUI.set("RawUpdateInfo",vRI);
    vEntry.set("UpdateId",vUId);
};

function getUser(vUser)
{
    var vUL=libByName("TelegramUsers");
    var vID=vUser.id;
    var vULE=vUL.entries();
    var isUserExists=false;
    for (i=0;i<vULE.length;i++)
    {
       var vU=vUL[i];
       var cId=vU.UserId;
       log("Exists user id:"+cId);
       if (vID===cId)
       {
          return vU;
          isUserExists=true;
          break;
       };
    };
    if (!isUserExists)
    {
     var nU = new Object();
     nU["UserId"]=vID;
     nU["UserName"]=vUser.username;
     nU["FirstName"]=vUser.first_name;
     nU["LastName"]=vUser.last_name;
     nU["isBot"]=vUser.is_bot;
     var nUE=vUL.create(nU);
     return nUE;
    };
};




var vC=entry();
prepareUpdateRequest(vC);
getUpdateInfo(vC);