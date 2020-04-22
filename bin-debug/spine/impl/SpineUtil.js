var spine;
(function (spine) {
    var SpineUtil = (function () {
        function SpineUtil() {
        }
        var d = __define,c=SpineUtil,p=c.prototype;
        SpineUtil.createSkeletonData = function (jsonData, atlas) {
            var json = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(atlas));
            return json.readSkeletonData(jsonData);
        };
        SpineUtil.createTextureAtlas = function (atlasData, textures) {
            return new spine.TextureAtlas(atlasData, function (file) {
                return new spine.AdapterTexture(textures[file].bitmapData);
            });
        };
        return SpineUtil;
    }());
    spine.SpineUtil = SpineUtil;
    egret.registerClass(SpineUtil,'spine.SpineUtil');
})(spine || (spine = {}));
//# sourceMappingURL=SpineUtil.js.map