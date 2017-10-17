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
    cEntry.set("ServerRequest",mU+'getUpdates&offset='+vO);
  }
  else
  {
    cEntry.set("ServerRequest",mU+'getUpdates');
  };    
}

function getUpdateInfo(vEntry)
{
    var vRequest = vEntry.field("ServerRequest");
    var result=http().get(vRequest);
    if(result.code===200) {
                var json=JSON.parse(result.body);
                var state =json.ok;
                if (state===true)
                {
                    vEntry.set("ServerResponse",JSON.stringify(json));            
                    
                }
                else
                {
                    message('Error while get updates!');
                };
    };
}