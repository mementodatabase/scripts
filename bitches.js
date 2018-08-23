function refreshBitches()
{
         var clib = lib(); 
         var entries = clib.entries();
         var count =entries.length;       
         for(var i=0;i<count;i++)
             {
             var cEnt =entries[i];
             cEnt.set('Website',cEnt.field('galleryUrl'));
             };
}; 
