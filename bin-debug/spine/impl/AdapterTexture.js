var spine;
(function (spine) {
    var AdapterTexture = (function (_super) {
        __extends(AdapterTexture, _super);
        function AdapterTexture(bitmapData) {
            _super.call(this, bitmapData.source);
            var texture = new egret.Texture();
            texture.bitmapData = bitmapData;
            this.spriteSheet = new egret.SpriteSheet(texture);
        }
        var d = __define,c=AdapterTexture,p=c.prototype;
        /** NIY */
        p.setFilters = function (minFilter, magFilter) { };
        p.setWraps = function (uWrap, vWrap) { };
        p.dispose = function () { };
        return AdapterTexture;
    }(spine.Texture));
    spine.AdapterTexture = AdapterTexture;
    egret.registerClass(AdapterTexture,'spine.AdapterTexture');
})(spine || (spine = {}));
//# sourceMappingURL=AdapterTexture.js.map