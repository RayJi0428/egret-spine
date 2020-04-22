var spine;
(function (spine) {
    /**
     *
     */
    var SkeletonRenderer = (function (_super) {
        __extends(SkeletonRenderer, _super);
        /**
         *
         */
        function SkeletonRenderer(skeletonData) {
            _super.call(this);
            this.slotRenderers = [];
            this.colored = false;
            this.stateData = new spine.AnimationStateData(skeletonData);
            this.state = new spine.AnimationState(this.stateData);
            this.skeleton = new spine.Skeleton(skeletonData);
            this.skeleton.updateWorldTransform();
            for (var _i = 0, _a = this.skeleton.slots; _i < _a.length; _i++) {
                var slot = _a[_i];
                var renderer = new spine.SlotRenderer();
                renderer.name = slot.data.name;
                this.slotRenderers.push(renderer);
                this.addChild(renderer);
                renderer.renderSlot(slot, this.skeleton, this.colored);
                this.colored = renderer.colored;
            }
        }
        var d = __define,c=SkeletonRenderer,p=c.prototype;
        p.update = function (dt) {
            this.state.update(dt);
            this.state.apply(this.skeleton);
            this.skeleton.updateWorldTransform();
            var drawOrder = this.skeleton.drawOrder;
            var slots = this.skeleton.slots;
            for (var i = 0; i < drawOrder.length; i++) {
                var slot = drawOrder[i].data.index;
                this.setChildIndex(this.slotRenderers[slot], i);
            }
            for (var i = 0; i < slots.length; i++) {
                var renderer = this.slotRenderers[i];
                renderer.renderSlot(slots[i], this.skeleton, this.colored);
                this.colored = renderer.colored;
            }
        };
        return SkeletonRenderer;
    }(egret.DisplayObjectContainer));
    spine.SkeletonRenderer = SkeletonRenderer;
    egret.registerClass(SkeletonRenderer,'spine.SkeletonRenderer');
})(spine || (spine = {}));
//# sourceMappingURL=SkeletonRenderer.js.map