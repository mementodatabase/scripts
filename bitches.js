function refreshBitches()
{
         var clib = lib(); 
         var entries = clib.entries();
         var count =entries.length;       
         for(var i=0;i<count;i++)
             {
                  var cEnt =entries[i];
                  refreshBitch(cEnt);    
             }
}

function refreshBitch(bitch)
{         
    if (bitch === null) { var cEntry = entry(); refreshBitch(cEntry); }
    else { bitch.set('Website',bitch.field('baseUrl')) }
}
