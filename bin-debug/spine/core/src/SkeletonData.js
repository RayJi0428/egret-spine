/******************************************************************************
 * Spine Runtimes Software License v2.5
 *
 * Copyright (c) 2013-2016, Esoteric Software
 * All rights reserved.
 *
 * You are granted a perpetual, non-exclusive, non-sublicensable, and
 * non-transferable license to use, install, execute, and perform the Spine
 * Runtimes software and derivative works solely for personal or internal
 * use. Without the written permission of Esoteric Software (see Section 2 of
 * the Spine Software License Agreement), you may not (a) modify, translate,
 * adapt, or develop new applications using the Spine Runtimes or otherwise
 * create derivative works or improvements of the Spine Runtimes or (b) remove,
 * delete, alter, or obscure any trademarks or any copyright, trademark, patent,
 * or other intellectual property or proprietary rights notices on or in the
 * Software, including any copy thereof. Redistributions in binary or source
 * form must include this license and terms.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL ESOTERIC SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS INTERRUPTION, OR LOSS OF
 * USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
var spine;
(function (spine) {
    var SkeletonData = (function () {
        function SkeletonData() {
            this.bones = new Array(); // Ordered parents first.
            this.slots = new Array(); // Setup pose draw order.
            this.skins = new Array();
            this.events = new Array();
            this.animations = new Array();
            this.ikConstraints = new Array();
            this.transformConstraints = new Array();
            this.pathConstraints = new Array();
            // Nonessential
            this.fps = 0;
        }
        var d = __define,c=SkeletonData,p=c.prototype;
        p.findBone = function (boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                if (bone.name == boneName)
                    return bone;
            }
            return null;
        };
        p.findBoneIndex = function (boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                if (bones[i].name == boneName)
                    return i;
            return -1;
        };
        p.findSlot = function (slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) {
                var slot = slots[i];
                if (slot.name == slotName)
                    return slot;
            }
            return null;
        };
        p.findSlotIndex = function (slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++)
                if (slots[i].name == slotName)
                    return i;
            return -1;
        };
        p.findSkin = function (skinName) {
            if (skinName == null)
                throw new Error("skinName cannot be null.");
            var skins = this.skins;
            for (var i = 0, n = skins.length; i < n; i++) {
                var skin = skins[i];
                if (skin.name == skinName)
                    return skin;
            }
            return null;
        };
        p.findEvent = function (eventDataName) {
            if (eventDataName == null)
                throw new Error("eventDataName cannot be null.");
            var events = this.events;
            for (var i = 0, n = events.length; i < n; i++) {
                var event_1 = events[i];
                if (event_1.name == eventDataName)
                    return event_1;
            }
            return null;
        };
        p.findAnimation = function (animationName) {
            if (animationName == null)
                throw new Error("animationName cannot be null.");
            var animations = this.animations;
            for (var i = 0, n = animations.length; i < n; i++) {
                var animation = animations[i];
                if (animation.name == animationName)
                    return animation;
            }
            return null;
        };
        p.findIkConstraint = function (constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            var ikConstraints = this.ikConstraints;
            for (var i = 0, n = ikConstraints.length; i < n; i++) {
                var constraint = ikConstraints[i];
                if (constraint.name == constraintName)
                    return constraint;
            }
            return null;
        };
        p.findTransformConstraint = function (constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            var transformConstraints = this.transformConstraints;
            for (var i = 0, n = transformConstraints.length; i < n; i++) {
                var constraint = transformConstraints[i];
                if (constraint.name == constraintName)
                    return constraint;
            }
            return null;
        };
        p.findPathConstraint = function (constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            var pathConstraints = this.pathConstraints;
            for (var i = 0, n = pathConstraints.length; i < n; i++) {
                var constraint = pathConstraints[i];
                if (constraint.name == constraintName)
                    return constraint;
            }
            return null;
        };
        p.findPathConstraintIndex = function (pathConstraintName) {
            if (pathConstraintName == null)
                throw new Error("pathConstraintName cannot be null.");
            var pathConstraints = this.pathConstraints;
            for (var i = 0, n = pathConstraints.length; i < n; i++)
                if (pathConstraints[i].name == pathConstraintName)
                    return i;
            return -1;
        };
        return SkeletonData;
    }());
    spine.SkeletonData = SkeletonData;
    egret.registerClass(SkeletonData,'spine.SkeletonData');
})(spine || (spine = {}));
//# sourceMappingURL=SkeletonData.js.map