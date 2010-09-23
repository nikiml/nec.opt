Object.prototype.getElementWidth = function() {
   if (typeof this.clip !== "undefined") {
      return this.clip.width;
   } else {
      if (this.style.pixelWidth) {
         return this.style.pixelWidth;
      } else {
         return this.offsetWidth;
      }
   }
}
Object.prototype.getElementHeight = function() {
   if (typeof this.clip !== "undefined") {
      return this.clip.height;
   } else {
      if (this.style.pixelHeight) {
         return this.style.pixelHeight;
      } else {
         return this.offsetHeight;
      }
   }
}
Object.prototype.setElementHeight = function(h) {
   if (typeof this.clip !== "undefined") {
      this.clip.height = h;
   } else {
      if (this.style.pixelHeight!=undefined) {
         this.style.pixelHeight = h;
      } else {
         this.offsetHeight = h;
      }
   }
}
