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
    var Skeleton = (function () {
        function Skeleton(data) {
            this._updateCache = new Array();
            this.updateCacheReset = new Array();
            this.time = 0;
            this.flipX = false;
            this.flipY = false;
            this.x = 0;
            this.y = 0;
            if (data == null)
                throw new Error("data cannot be null.");
            this.data = data;
            this.bones = new Array();
            for (var i = 0; i < data.bones.length; i++) {
                var boneData = data.bones[i];
                var bone = void 0;
                if (boneData.parent == null)
                    bone = new spine.Bone(boneData, this, null);
                else {
                    var parent_1 = this.bones[boneData.parent.index];
                    bone = new spine.Bone(boneData, this, parent_1);
                    parent_1.children.push(bone);
                }
                this.bones.push(bone);
            }
            this.slots = new Array();
            this.drawOrder = new Array();
            for (var i = 0; i < data.slots.length; i++) {
                var slotData = data.slots[i];
                var bone = this.bones[slotData.boneData.index];
                var slot = new spine.Slot(slotData, bone);
                this.slots.push(slot);
                this.drawOrder.push(slot);
            }
            this.ikConstraints = new Array();
            for (var i = 0; i < data.ikConstraints.length; i++) {
                var ikConstraintData = data.ikConstraints[i];
                this.ikConstraints.push(new spine.IkConstraint(ikConstraintData, this));
            }
            this.transformConstraints = new Array();
            for (var i = 0; i < data.transformConstraints.length; i++) {
                var transformConstraintData = data.transformConstraints[i];
                this.transformConstraints.push(new spine.TransformConstraint(transformConstraintData, this));
            }
            this.pathConstraints = new Array();
            for (var i = 0; i < data.pathConstraints.length; i++) {
                var pathConstraintData = data.pathConstraints[i];
                this.pathConstraints.push(new spine.PathConstraint(pathConstraintData, this));
            }
            this.color = new spine.Color(1, 1, 1, 1);
            this.updateCache();
        }
        var d = __define,c=Skeleton,p=c.prototype;
        p.updateCache = function () {
            var updateCache = this._updateCache;
            updateCache.length = 0;
            this.updateCacheReset.length = 0;
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                bones[i].sorted = false;
            // IK first, lowest hierarchy depth first.
            var ikConstraints = this.ikConstraints;
            var transformConstraints = this.transformConstraints;
            var pathConstraints = this.pathConstraints;
            var ikCount = ikConstraints.length, transformCount = transformConstraints.length, pathCount = pathConstraints.length;
            var constraintCount = ikCount + transformCount + pathCount;
            outer: for (var i = 0; i < constraintCount; i++) {
                for (var ii = 0; ii < ikCount; ii++) {
                    var constraint = ikConstraints[ii];
                    if (constraint.data.order == i) {
                        this.sortIkConstraint(constraint);
                        continue outer;
                    }
                }
                for (var ii = 0; ii < transformCount; ii++) {
                    var constraint = transformConstraints[ii];
                    if (constraint.data.order == i) {
                        this.sortTransformConstraint(constraint);
                        continue outer;
                    }
                }
                for (var ii = 0; ii < pathCount; ii++) {
                    var constraint = pathConstraints[ii];
                    if (constraint.data.order == i) {
                        this.sortPathConstraint(constraint);
                        continue outer;
                    }
                }
            }
            for (var i = 0, n = bones.length; i < n; i++)
                this.sortBone(bones[i]);
        };
        p.sortIkConstraint = function (constraint) {
            var target = constraint.target;
            this.sortBone(target);
            var constrained = constraint.bones;
            var parent = constrained[0];
            this.sortBone(parent);
            if (constrained.length > 1) {
                var child = constrained[constrained.length - 1];
                if (!(this._updateCache.indexOf(child) > -1))
                    this.updateCacheReset.push(child);
            }
            this._updateCache.push(constraint);
            this.sortReset(parent.children);
            constrained[constrained.length - 1].sorted = true;
        };
        p.sortPathConstraint = function (constraint) {
            var slot = constraint.target;
            var slotIndex = slot.data.index;
            var slotBone = slot.bone;
            if (this.skin != null)
                this.sortPathConstraintAttachment(this.skin, slotIndex, slotBone);
            if (this.data.defaultSkin != null && this.data.defaultSkin != this.skin)
                this.sortPathConstraintAttachment(this.data.defaultSkin, slotIndex, slotBone);
            for (var i = 0, n = this.data.skins.length; i < n; i++)
                this.sortPathConstraintAttachment(this.data.skins[i], slotIndex, slotBone);
            var attachment = slot.getAttachment();
            if (attachment instanceof spine.PathAttachment)
                this.sortPathConstraintAttachmentWith(attachment, slotBone);
            var constrained = constraint.bones;
            var boneCount = constrained.length;
            for (var i = 0; i < boneCount; i++)
                this.sortBone(constrained[i]);
            this._updateCache.push(constraint);
            for (var i = 0; i < boneCount; i++)
                this.sortReset(constrained[i].children);
            for (var i = 0; i < boneCount; i++)
                constrained[i].sorted = true;
        };
        p.sortTransformConstraint = function (constraint) {
            this.sortBone(constraint.target);
            var constrained = constraint.bones;
            var boneCount = constrained.length;
            if (constraint.data.local) {
                for (var i = 0; i < boneCount; i++) {
                    var child = constrained[i];
                    this.sortBone(child.parent);
                    if (!(this._updateCache.indexOf(child) > -1))
                        this.updateCacheReset.push(child);
                }
            }
            else {
                for (var i = 0; i < boneCount; i++) {
                    this.sortBone(constrained[i]);
                }
            }
            this._updateCache.push(constraint);
            for (var ii = 0; ii < boneCount; ii++)
                this.sortReset(constrained[ii].children);
            for (var ii = 0; ii < boneCount; ii++)
                constrained[ii].sorted = true;
        };
        p.sortPathConstraintAttachment = function (skin, slotIndex, slotBone) {
            var attachments = skin.attachments[slotIndex];
            if (!attachments)
                return;
            for (var key in attachments) {
                this.sortPathConstraintAttachmentWith(attachments[key], slotBone);
            }
        };
        p.sortPathConstraintAttachmentWith = function (attachment, slotBone) {
            if (!(attachment instanceof spine.PathAttachment))
                return;
            var pathBones = attachment.bones;
            if (pathBones == null)
                this.sortBone(slotBone);
            else {
                var bones = this.bones;
                var i = 0;
                while (i < pathBones.length) {
                    var boneCount = pathBones[i++];
                    for (var n = i + boneCount; i < n; i++) {
                        var boneIndex = pathBones[i];
                        this.sortBone(bones[boneIndex]);
                    }
                }
            }
        };
        p.sortBone = function (bone) {
            if (bone.sorted)
                return;
            var parent = bone.parent;
            if (parent != null)
                this.sortBone(parent);
            bone.sorted = true;
            this._updateCache.push(bone);
        };
        p.sortReset = function (bones) {
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                if (bone.sorted)
                    this.sortReset(bone.children);
                bone.sorted = false;
            }
        };
        /** Updates the world transform for each bone and applies constraints. */
        p.updateWorldTransform = function () {
            var updateCacheReset = this.updateCacheReset;
            for (var i = 0, n = updateCacheReset.length; i < n; i++) {
                var bone = updateCacheReset[i];
                bone.ax = bone.x;
                bone.ay = bone.y;
                bone.arotation = bone.rotation;
                bone.ascaleX = bone.scaleX;
                bone.ascaleY = bone.scaleY;
                bone.ashearX = bone.shearX;
                bone.ashearY = bone.shearY;
                bone.appliedValid = true;
            }
            var updateCache = this._updateCache;
            for (var i = 0, n = updateCache.length; i < n; i++)
                updateCache[i].update();
        };
        /** Sets the bones, constraints, and slots to their setup pose values. */
        p.setToSetupPose = function () {
            this.setBonesToSetupPose();
            this.setSlotsToSetupPose();
        };
        /** Sets the bones and constraints to their setup pose values. */
        p.setBonesToSetupPose = function () {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                bones[i].setToSetupPose();
            var ikConstraints = this.ikConstraints;
            for (var i = 0, n = ikConstraints.length; i < n; i++) {
                var constraint = ikConstraints[i];
                constraint.bendDirection = constraint.data.bendDirection;
                constraint.mix = constraint.data.mix;
            }
            var transformConstraints = this.transformConstraints;
            for (var i = 0, n = transformConstraints.length; i < n; i++) {
                var constraint = transformConstraints[i];
                var data = constraint.data;
                constraint.rotateMix = data.rotateMix;
                constraint.translateMix = data.translateMix;
                constraint.scaleMix = data.scaleMix;
                constraint.shearMix = data.shearMix;
            }
            var pathConstraints = this.pathConstraints;
            for (var i = 0, n = pathConstraints.length; i < n; i++) {
                var constraint = pathConstraints[i];
                var data = constraint.data;
                constraint.position = data.position;
                constraint.spacing = data.spacing;
                constraint.rotateMix = data.rotateMix;
                constraint.translateMix = data.translateMix;
            }
        };
        p.setSlotsToSetupPose = function () {
            var slots = this.slots;
            spine.Utils.arrayCopy(slots, 0, this.drawOrder, 0, slots.length);
            for (var i = 0, n = slots.length; i < n; i++)
                slots[i].setToSetupPose();
        };
        /** @return May return null. */
        p.getRootBone = function () {
            if (this.bones.length == 0)
                return null;
            return this.bones[0];
        };
        /** @return May be null. */
        p.findBone = function (boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                if (bone.data.name == boneName)
                    return bone;
            }
            return null;
        };
        /** @return -1 if the bone was not found. */
        p.findBoneIndex = function (boneName) {
            if (boneName == null)
                throw new Error("boneName cannot be null.");
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++)
                if (bones[i].data.name == boneName)
                    return i;
            return -1;
        };
        /** @return May be null. */
        p.findSlot = function (slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) {
                var slot = slots[i];
                if (slot.data.name == slotName)
                    return slot;
            }
            return null;
        };
        /** @return -1 if the bone was not found. */
        p.findSlotIndex = function (slotName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++)
                if (slots[i].data.name == slotName)
                    return i;
            return -1;
        };
        /** Sets a skin by name.
         * @see #setSkin(Skin) */
        p.setSkinByName = function (skinName) {
            var skin = this.data.findSkin(skinName);
            if (skin == null)
                throw new Error("Skin not found: " + skinName);
            this.setSkin(skin);
        };
        /** Sets the skin used to look up attachments before looking in the {@link SkeletonData#getDefaultSkin() default skin}.
         * Attachments from the new skin are attached if the corresponding attachment from the old skin was attached. If there was no
         * old skin, each slot's setup mode attachment is attached from the new skin.
         * @param newSkin May be null. */
        p.setSkin = function (newSkin) {
            if (newSkin != null) {
                if (this.skin != null)
                    newSkin.attachAll(this, this.skin);
                else {
                    var slots = this.slots;
                    for (var i = 0, n = slots.length; i < n; i++) {
                        var slot = slots[i];
                        var name_1 = slot.data.attachmentName;
                        if (name_1 != null) {
                            var attachment = newSkin.getAttachment(i, name_1);
                            if (attachment != null)
                                slot.setAttachment(attachment);
                        }
                    }
                }
            }
            this.skin = newSkin;
        };
        /** @return May be null. */
        p.getAttachmentByName = function (slotName, attachmentName) {
            return this.getAttachment(this.data.findSlotIndex(slotName), attachmentName);
        };
        /** @return May be null. */
        p.getAttachment = function (slotIndex, attachmentName) {
            if (attachmentName == null)
                throw new Error("attachmentName cannot be null.");
            if (this.skin != null) {
                var attachment = this.skin.getAttachment(slotIndex, attachmentName);
                if (attachment != null)
                    return attachment;
            }
            if (this.data.defaultSkin != null)
                return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
            return null;
        };
        /** @param attachmentName May be null. */
        p.setAttachment = function (slotName, attachmentName) {
            if (slotName == null)
                throw new Error("slotName cannot be null.");
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) {
                var slot = slots[i];
                if (slot.data.name == slotName) {
                    var attachment = null;
                    if (attachmentName != null) {
                        attachment = this.getAttachment(i, attachmentName);
                        if (attachment == null)
                            throw new Error("Attachment not found: " + attachmentName + ", for slot: " + slotName);
                    }
                    slot.setAttachment(attachment);
                    return;
                }
            }
            throw new Error("Slot not found: " + slotName);
        };
        /** @return May be null. */
        p.findIkConstraint = function (constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            var ikConstraints = this.ikConstraints;
            for (var i = 0, n = ikConstraints.length; i < n; i++) {
                var ikConstraint = ikConstraints[i];
                if (ikConstraint.data.name == constraintName)
                    return ikConstraint;
            }
            return null;
        };
        /** @return May be null. */
        p.findTransformConstraint = function (constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            var transformConstraints = this.transformConstraints;
            for (var i = 0, n = transformConstraints.length; i < n; i++) {
                var constraint = transformConstraints[i];
                if (constraint.data.name == constraintName)
                    return constraint;
            }
            return null;
        };
        /** @return May be null. */
        p.findPathConstraint = function (constraintName) {
            if (constraintName == null)
                throw new Error("constraintName cannot be null.");
            var pathConstraints = this.pathConstraints;
            for (var i = 0, n = pathConstraints.length; i < n; i++) {
                var constraint = pathConstraints[i];
                if (constraint.data.name == constraintName)
                    return constraint;
            }
            return null;
        };
        /** Returns the axis aligned bounding box (AABB) of the region and mesh attachments for the current pose.
         * @param offset The distance from the skeleton origin to the bottom left corner of the AABB.
         * @param size The width and height of the AABB.
         * @param temp Working memory */
        p.getBounds = function (offset, size, temp) {
            if (offset == null)
                throw new Error("offset cannot be null.");
            if (size == null)
                throw new Error("size cannot be null.");
            var drawOrder = this.drawOrder;
            var minX = Number.POSITIVE_INFINITY, minY = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
            for (var i = 0, n = drawOrder.length; i < n; i++) {
                var slot = drawOrder[i];
                var verticesLength = 0;
                var vertices = null;
                var attachment = slot.getAttachment();
                if (attachment instanceof spine.RegionAttachment) {
                    verticesLength = 8;
                    vertices = spine.Utils.setArraySize(temp, verticesLength, 0);
                    attachment.computeWorldVertices(slot.bone, vertices, 0, 2);
                }
                else if (attachment instanceof spine.MeshAttachment) {
                    var mesh = attachment;
                    verticesLength = mesh.worldVerticesLength;
                    vertices = spine.Utils.setArraySize(temp, verticesLength, 0);
                    mesh.computeWorldVertices(slot, 0, verticesLength, vertices, 0, 2);
                }
                if (vertices != null) {
                    for (var ii = 0, nn = vertices.length; ii < nn; ii += 2) {
                        var x = vertices[ii], y = vertices[ii + 1];
                        minX = Math.min(minX, x);
                        minY = Math.min(minY, y);
                        maxX = Math.max(maxX, x);
                        maxY = Math.max(maxY, y);
                    }
                }
            }
            offset.set(minX, minY);
            size.set(maxX - minX, maxY - minY);
        };
        p.update = function (delta) {
            this.time += delta;
        };
        return Skeleton;
    }());
    spine.Skeleton = Skeleton;
    egret.registerClass(Skeleton,'spine.Skeleton');
})(spine || (spine = {}));
//# sourceMappingURL=Skeleton.js.map