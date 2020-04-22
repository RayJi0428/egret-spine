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
    var TransformConstraint = (function () {
        function TransformConstraint(data, skeleton) {
            this.rotateMix = 0;
            this.translateMix = 0;
            this.scaleMix = 0;
            this.shearMix = 0;
            this.temp = new spine.Vector2();
            if (data == null)
                throw new Error("data cannot be null.");
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.rotateMix = data.rotateMix;
            this.translateMix = data.translateMix;
            this.scaleMix = data.scaleMix;
            this.shearMix = data.shearMix;
            this.bones = new Array();
            for (var i = 0; i < data.bones.length; i++)
                this.bones.push(skeleton.findBone(data.bones[i].name));
            this.target = skeleton.findBone(data.target.name);
        }
        var d = __define,c=TransformConstraint,p=c.prototype;
        p.apply = function () {
            this.update();
        };
        p.update = function () {
            if (this.data.local) {
                if (this.data.relative)
                    this.applyRelativeLocal();
                else
                    this.applyAbsoluteLocal();
            }
            else {
                if (this.data.relative)
                    this.applyRelativeWorld();
                else
                    this.applyAbsoluteWorld();
            }
        };
        p.applyAbsoluteWorld = function () {
            var rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
            var target = this.target;
            var ta = target.a, tb = target.b, tc = target.c, td = target.d;
            var degRadReflect = ta * td - tb * tc > 0 ? spine.MathUtils.degRad : -spine.MathUtils.degRad;
            var offsetRotation = this.data.offsetRotation * degRadReflect;
            var offsetShearY = this.data.offsetShearY * degRadReflect;
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                var modified = false;
                if (rotateMix != 0) {
                    var a = bone.a, b = bone.b, c = bone.c, d = bone.d;
                    var r = Math.atan2(tc, ta) - Math.atan2(c, a) + offsetRotation;
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r *= rotateMix;
                    var cos = Math.cos(r), sin = Math.sin(r);
                    bone.a = cos * a - sin * c;
                    bone.b = cos * b - sin * d;
                    bone.c = sin * a + cos * c;
                    bone.d = sin * b + cos * d;
                    modified = true;
                }
                if (translateMix != 0) {
                    var temp = this.temp;
                    target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
                    bone.worldX += (temp.x - bone.worldX) * translateMix;
                    bone.worldY += (temp.y - bone.worldY) * translateMix;
                    modified = true;
                }
                if (scaleMix > 0) {
                    var s = Math.sqrt(bone.a * bone.a + bone.c * bone.c);
                    var ts = Math.sqrt(ta * ta + tc * tc);
                    if (s > 0.00001)
                        s = (s + (ts - s + this.data.offsetScaleX) * scaleMix) / s;
                    bone.a *= s;
                    bone.c *= s;
                    s = Math.sqrt(bone.b * bone.b + bone.d * bone.d);
                    ts = Math.sqrt(tb * tb + td * td);
                    if (s > 0.00001)
                        s = (s + (ts - s + this.data.offsetScaleY) * scaleMix) / s;
                    bone.b *= s;
                    bone.d *= s;
                    modified = true;
                }
                if (shearMix > 0) {
                    var b = bone.b, d = bone.d;
                    var by = Math.atan2(d, b);
                    var r = Math.atan2(td, tb) - Math.atan2(tc, ta) - (by - Math.atan2(bone.c, bone.a));
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r = by + (r + offsetShearY) * shearMix;
                    var s = Math.sqrt(b * b + d * d);
                    bone.b = Math.cos(r) * s;
                    bone.d = Math.sin(r) * s;
                    modified = true;
                }
                if (modified)
                    bone.appliedValid = false;
            }
        };
        p.applyRelativeWorld = function () {
            var rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
            var target = this.target;
            var ta = target.a, tb = target.b, tc = target.c, td = target.d;
            var degRadReflect = ta * td - tb * tc > 0 ? spine.MathUtils.degRad : -spine.MathUtils.degRad;
            var offsetRotation = this.data.offsetRotation * degRadReflect, offsetShearY = this.data.offsetShearY * degRadReflect;
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                var modified = false;
                if (rotateMix != 0) {
                    var a = bone.a, b = bone.b, c = bone.c, d = bone.d;
                    var r = Math.atan2(tc, ta) + offsetRotation;
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r *= rotateMix;
                    var cos = Math.cos(r), sin = Math.sin(r);
                    bone.a = cos * a - sin * c;
                    bone.b = cos * b - sin * d;
                    bone.c = sin * a + cos * c;
                    bone.d = sin * b + cos * d;
                    modified = true;
                }
                if (translateMix != 0) {
                    var temp = this.temp;
                    target.localToWorld(temp.set(this.data.offsetX, this.data.offsetY));
                    bone.worldX += temp.x * translateMix;
                    bone.worldY += temp.y * translateMix;
                    modified = true;
                }
                if (scaleMix > 0) {
                    var s = (Math.sqrt(ta * ta + tc * tc) - 1 + this.data.offsetScaleX) * scaleMix + 1;
                    bone.a *= s;
                    bone.c *= s;
                    s = (Math.sqrt(tb * tb + td * td) - 1 + this.data.offsetScaleY) * scaleMix + 1;
                    bone.b *= s;
                    bone.d *= s;
                    modified = true;
                }
                if (shearMix > 0) {
                    var r = Math.atan2(td, tb) - Math.atan2(tc, ta);
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    var b = bone.b, d = bone.d;
                    r = Math.atan2(d, b) + (r - spine.MathUtils.PI / 2 + offsetShearY) * shearMix;
                    var s = Math.sqrt(b * b + d * d);
                    bone.b = Math.cos(r) * s;
                    bone.d = Math.sin(r) * s;
                    modified = true;
                }
                if (modified)
                    bone.appliedValid = false;
            }
        };
        p.applyAbsoluteLocal = function () {
            var rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
            var target = this.target;
            if (!target.appliedValid)
                target.updateAppliedTransform();
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                if (!bone.appliedValid)
                    bone.updateAppliedTransform();
                var rotation = bone.arotation;
                if (rotateMix != 0) {
                    var r = target.arotation - rotation + this.data.offsetRotation;
                    r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
                    rotation += r * rotateMix;
                }
                var x = bone.ax, y = bone.ay;
                if (translateMix != 0) {
                    x += (target.ax - x + this.data.offsetX) * translateMix;
                    y += (target.ay - y + this.data.offsetY) * translateMix;
                }
                var scaleX = bone.ascaleX, scaleY = bone.ascaleY;
                if (scaleMix > 0) {
                    if (scaleX > 0.00001)
                        scaleX = (scaleX + (target.ascaleX - scaleX + this.data.offsetScaleX) * scaleMix) / scaleX;
                    if (scaleY > 0.00001)
                        scaleY = (scaleY + (target.ascaleY - scaleY + this.data.offsetScaleY) * scaleMix) / scaleY;
                }
                var shearY = bone.ashearY;
                if (shearMix > 0) {
                    var r = target.ashearY - shearY + this.data.offsetShearY;
                    r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
                    bone.shearY += r * shearMix;
                }
                bone.updateWorldTransformWith(x, y, rotation, scaleX, scaleY, bone.ashearX, shearY);
            }
        };
        p.applyRelativeLocal = function () {
            var rotateMix = this.rotateMix, translateMix = this.translateMix, scaleMix = this.scaleMix, shearMix = this.shearMix;
            var target = this.target;
            if (!target.appliedValid)
                target.updateAppliedTransform();
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) {
                var bone = bones[i];
                if (!bone.appliedValid)
                    bone.updateAppliedTransform();
                var rotation = bone.arotation;
                if (rotateMix != 0)
                    rotation += (target.arotation + this.data.offsetRotation) * rotateMix;
                var x = bone.ax, y = bone.ay;
                if (translateMix != 0) {
                    x += (target.ax + this.data.offsetX) * translateMix;
                    y += (target.ay + this.data.offsetY) * translateMix;
                }
                var scaleX = bone.ascaleX, scaleY = bone.ascaleY;
                if (scaleMix > 0) {
                    if (scaleX > 0.00001)
                        scaleX *= ((target.ascaleX - 1 + this.data.offsetScaleX) * scaleMix) + 1;
                    if (scaleY > 0.00001)
                        scaleY *= ((target.ascaleY - 1 + this.data.offsetScaleY) * scaleMix) + 1;
                }
                var shearY = bone.ashearY;
                if (shearMix > 0)
                    shearY += (target.ashearY + this.data.offsetShearY) * shearMix;
                bone.updateWorldTransformWith(x, y, rotation, scaleX, scaleY, bone.ashearX, shearY);
            }
        };
        p.getOrder = function () {
            return this.data.order;
        };
        return TransformConstraint;
    }());
    spine.TransformConstraint = TransformConstraint;
    egret.registerClass(TransformConstraint,'spine.TransformConstraint',["spine.Constraint","spine.Updatable"]);
})(spine || (spine = {}));
//# sourceMappingURL=TransformConstraint.js.map