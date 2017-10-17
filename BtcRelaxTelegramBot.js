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