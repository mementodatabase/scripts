/* global http, moment */
function BitGanjValidator (vEntry) {
  this.cEntry = vEntry;
  this.isValid = false;
  this.msg = '';
  this.validate();
}

BitGanjValidator.prototype.validate = function() {
  this.isValid = false;
  var curInBox = this.cEntry.field("inBox");
  var vAdvertiseTitle;
  var vTotalPrice = 0;
  var vBookmarkId = this.cEntry.field("BookmarkId");

  for (var i2 = 0; i2 < curInBox.length; i2++) {
    var linkedEntry = curInBox[i2];
    if (i2 === 0) {
      vAdvertiseTitle = linkedEntry.field("ItemTypeName");
    } else {
      vAdvertiseTitle = vAdvertiseTitle + " & " + linkedEntry.field("ItemTypeName");
    };
    vTotalPrice = vTotalPrice + linkedEntry.field("DefaultPrice");
  };

  this.cEntry.set("FrontTitle", vAdvertiseTitle);
  var loc = this.cEntry.field("Loc");
     if (loc!==null)
		{
			var nLat = Math.round(loc.lat * 1000000) / 1000000;
			var nLng = Math.round(loc.lng * 1000000) / 1000000;
			this.cEntry.set("TotalPrice", vTotalPrice);
			this.cEntry.set("Latitude", nLat);
			this.cEntry.set("Longitude", nLng);

			var urlToPic =  this.cEntry.field("PublicURL");
			if (urlToPic === '') {
				this.msg = "Отсутствует ссылка на фотографии";
				this.isValid =false;
		} else {
                var nCmd = null;
                var cReg =  this.cEntry.field("Region");
                var vDescr =  this.cEntry.field("PointDescription");
                var vRegCounts = cReg.length;
                var vRegion = null;
                if (vRegCounts > 0) {
                var regObj = cReg[0];
                vRegion = this.getRegionPath(regObj);
                if (vRegion !== '') {
                     nCmd = '{"type":"AddPoint","inf":{"lat":"' + nLat + '","lng":"' + nLng + '","link":"' + urlToPic + '","advName":"' + vAdvertiseTitle + '","price":"' + vTotalPrice + '","region":"' + vRegion + '","descr":"' + vDescr + '"}}';
                     this.cEntry.set("ServerRequest", nCmd);
                     this.msg = '';
                     this.isValid =true;
					} else {
                      this.msg = "Ошибка определения региона!";
                      this.isValid =false;
                       };
                }; 
            };
		} else
		{
			this.msg = "Некорректно заданы координаты!";
			this.isValid =false;
		}; 
		log(this.msg);
};


BitGanjValidator.prototype.getRegionPath = function(entry) {
  var res;
  res = entry.field("TitleRu");
  var parCnt = entry.field("ParentRegion").length;
  if (parCnt > 0) {
    res = res + ", " + this.getRegionPath(entry.field("ParentRegion")[0]);
  };
  return res;
};
