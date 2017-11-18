function syncAll(vToken) 
{ 
   var vCl=lib();
   var vEa=vCl.entries();
   var vEcount=vEa.length;
   for(var i=0; i<vEcount; ++i)
     {
	    var vCe=vEa[i];
     syncCurrent(vCe);
     var vMsg="Processed:"+(i+1)+" of "+ vEcount +" items";
     };
};
 
function syncCurrent(vEntry, vToken) 
{
    var vVR =validate(vEntry);
    
};

var vToken=arg("Token");
syncAll(vToken);