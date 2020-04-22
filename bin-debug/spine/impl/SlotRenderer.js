var spine;
(function (spine) {
    var SlotRenderer = (function (_super) {
        __extends(SlotRenderer, _super);
        function SlotRenderer() {
            _super.apply(this, arguments);
            this.colored = false;
        }
        var d = __define,c=SlotRenderer,p=c.prototype;
        p.renderSlot = function (slot, skeleton, colored) {
            var bone = slot.bone;
            var attachment = slot.getAttachment();
            var matrix = this.matrix;
            // update transform.
            matrix.a = bone.a;
            matrix.b = bone.c;
            matrix.c = bone.b;
            matrix.d = bone.d;
            matrix.tx = bone.worldX;
            matrix.ty = bone.worldY;
            this.matrix = matrix;
            if (slot.data.blendMode == spine.BlendMode.Additive) {
                this.blendMode = egret.BlendMode.ADD;
            }
            else {
                this.blendMode = egret.BlendMode.NORMAL;
            }
            // update color.
            if (attachment) {
                var r = skeleton.color.r * slot.color.r * attachment.color.r;
                var g = skeleton.color.g * slot.color.g * attachment.color.g;
                var b = skeleton.color.b * slot.color.b * attachment.color.b;
                this.alpha = skeleton.color.a * slot.color.a * attachment.color.a;
                this.colored = colored || (r & g & b) !== 1;
                if (this.colored) {
                    if (!this.colorFilter) {
                        this.colorFilter = new egret.ColorMatrixFilter();
                    }
                    this.colorFilter.matrix[0] = r;
                    this.colorFilter.matrix[6] = g;
                    this.colorFilter.matrix[13] = b;
                    if (!this.filters) {
                        this.filters = [this.colorFilter];
                    }
                }
                else {
                    this.filters = null;
                }
            }
            // only RegionAttachment is supported.
            if (attachment instanceof spine.RegionAttachment) {
                var region = attachment.region;
                var currentName = this.currentSprite ? this.currentSprite.name : '';
                var regionName = region ? region.name : '';
                this.visible = true;
                // attachment changed.
                if (currentName != regionName) {
                    if (this.currentSprite) {
                        this.currentSprite.visible = false;
                        this.currentSprite = null;
                    }
                    if (region) {
                        this.currentSprite = this.getChildByName(regionName) ||
                            this.createSprite(attachment, region);
                        this.currentSprite.visible = true;
                    }
                }
            }
            else {
                this.visible = false;
            }
        };
        p.createSprite = function (attachment, region) {
            var sheet = region.texture.spriteSheet;
            var texture = sheet.getTexture(region.name) || region.rotate
                ? sheet.createTexture(region.name, region.x, region.y, region.height, region.width, region.offsetX, region.offsetY, region.originalHeight, region.originalWidth)
                : sheet.createTexture(region.name, region.x, region.y, region.width, region.height, region.offsetX, region.offsetY, region.originalWidth, region.originalHeight);
            var sprite = new egret.Bitmap(texture);
            sprite.name = region.name;
            sprite.x = attachment.x;
            sprite.y = attachment.y;
            sprite.anchorOffsetX = 0.5 * sprite.width;
            sprite.anchorOffsetY = 0.5 * sprite.height;
            sprite.scaleX = attachment.scaleX * (attachment.width / region.width);
            sprite.scaleY = -attachment.scaleY * (attachment.height / region.height);
            sprite.rotation = attachment.rotation;
            if (region.rotate) {
                sprite.rotation -= 90;
            }
            this.addChild(sprite);
            return sprite;
        };
        return SlotRenderer;
    }(egret.DisplayObjectContainer));
    spine.SlotRenderer = SlotRenderer;
    egret.registerClass(SlotRenderer,'spine.SlotRenderer');
})(spine || (spine = {}));
//# sourceMappingURL=SlotRenderer.js.map