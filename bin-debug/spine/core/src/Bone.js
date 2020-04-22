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
    var Bone = (function () {
        /** @param parent May be null. */
        function Bone(data, skeleton, parent) {
            this.children = new Array();
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.scaleX = 0;
            this.scaleY = 0;
            this.shearX = 0;
            this.shearY = 0;
            this.ax = 0;
            this.ay = 0;
            this.arotation = 0;
            this.ascaleX = 0;
            this.ascaleY = 0;
            this.ashearX = 0;
            this.ashearY = 0;
            this.appliedValid = false;
            this.a = 0;
            this.b = 0;
            this.worldX = 0;
            this.c = 0;
            this.d = 0;
            this.worldY = 0;
            this.sorted = false;
            if (data == null)
                throw new Error("data cannot be null.");
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.skeleton = skeleton;
            this.parent = parent;
            this.setToSetupPose();
        }
        var d = __define,c=Bone,p=c.prototype;
        /** Same as {@link #updateWorldTransform()}. This method exists for Bone to implement {@link Updatable}. */
        p.update = function () {
            this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
        };
        /** Computes the world transform using the parent bone and this bone's local transform. */
        p.updateWorldTransform = function () {
            this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
        };
        /** Computes the world transform using the parent bone and the specified local transform. */
        p.updateWorldTransformWith = function (x, y, rotation, scaleX, scaleY, shearX, shearY) {
            this.ax = x;
            this.ay = y;
            this.arotation = rotation;
            this.ascaleX = scaleX;
            this.ascaleY = scaleY;
            this.ashearX = shearX;
            this.ashearY = shearY;
            this.appliedValid = true;
            var parent = this.parent;
            if (parent == null) {
                var rotationY = rotation + 90 + shearY;
                var la = spine.MathUtils.cosDeg(rotation + shearX) * scaleX;
                var lb = spine.MathUtils.cosDeg(rotationY) * scaleY;
                var lc = spine.MathUtils.sinDeg(rotation + shearX) * scaleX;
                var ld = spine.MathUtils.sinDeg(rotationY) * scaleY;
                var skeleton = this.skeleton;
                if (skeleton.flipX) {
                    x = -x;
                    la = -la;
                    lb = -lb;
                }
                if (skeleton.flipY) {
                    y = -y;
                    lc = -lc;
                    ld = -ld;
                }
                this.a = la;
                this.b = lb;
                this.c = lc;
                this.d = ld;
                this.worldX = x + skeleton.x;
                this.worldY = y + skeleton.y;
                return;
            }
            var pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
            this.worldX = pa * x + pb * y + parent.worldX;
            this.worldY = pc * x + pd * y + parent.worldY;
            switch (this.data.transformMode) {
                case spine.TransformMode.Normal: {
                    var rotationY = rotation + 90 + shearY;
                    var la = spine.MathUtils.cosDeg(rotation + shearX) * scaleX;
                    var lb = spine.MathUtils.cosDeg(rotationY) * scaleY;
                    var lc = spine.MathUtils.sinDeg(rotation + shearX) * scaleX;
                    var ld = spine.MathUtils.sinDeg(rotationY) * scaleY;
                    this.a = pa * la + pb * lc;
                    this.b = pa * lb + pb * ld;
                    this.c = pc * la + pd * lc;
                    this.d = pc * lb + pd * ld;
                    return;
                }
                case spine.TransformMode.OnlyTranslation: {
                    var rotationY = rotation + 90 + shearY;
                    this.a = spine.MathUtils.cosDeg(rotation + shearX) * scaleX;
                    this.b = spine.MathUtils.cosDeg(rotationY) * scaleY;
                    this.c = spine.MathUtils.sinDeg(rotation + shearX) * scaleX;
                    this.d = spine.MathUtils.sinDeg(rotationY) * scaleY;
                    break;
                }
                case spine.TransformMode.NoRotationOrReflection: {
                    var s = pa * pa + pc * pc;
                    var prx = 0;
                    if (s > 0.0001) {
                        s = Math.abs(pa * pd - pb * pc) / s;
                        pb = pc * s;
                        pd = pa * s;
                        prx = Math.atan2(pc, pa) * spine.MathUtils.radDeg;
                    }
                    else {
                        pa = 0;
                        pc = 0;
                        prx = 90 - Math.atan2(pd, pb) * spine.MathUtils.radDeg;
                    }
                    var rx = rotation + shearX - prx;
                    var ry = rotation + shearY - prx + 90;
                    var la = spine.MathUtils.cosDeg(rx) * scaleX;
                    var lb = spine.MathUtils.cosDeg(ry) * scaleY;
                    var lc = spine.MathUtils.sinDeg(rx) * scaleX;
                    var ld = spine.MathUtils.sinDeg(ry) * scaleY;
                    this.a = pa * la - pb * lc;
                    this.b = pa * lb - pb * ld;
                    this.c = pc * la + pd * lc;
                    this.d = pc * lb + pd * ld;
                    break;
                }
                case spine.TransformMode.NoScale:
                case spine.TransformMode.NoScaleOrReflection: {
                    var cos = spine.MathUtils.cosDeg(rotation);
                    var sin = spine.MathUtils.sinDeg(rotation);
                    var za = pa * cos + pb * sin;
                    var zc = pc * cos + pd * sin;
                    var s = Math.sqrt(za * za + zc * zc);
                    if (s > 0.00001)
                        s = 1 / s;
                    za *= s;
                    zc *= s;
                    s = Math.sqrt(za * za + zc * zc);
                    var r = Math.PI / 2 + Math.atan2(zc, za);
                    var zb = Math.cos(r) * s;
                    var zd = Math.sin(r) * s;
                    var la = spine.MathUtils.cosDeg(shearX) * scaleX;
                    var lb = spine.MathUtils.cosDeg(90 + shearY) * scaleY;
                    var lc = spine.MathUtils.sinDeg(shearX) * scaleX;
                    var ld = spine.MathUtils.sinDeg(90 + shearY) * scaleY;
                    this.a = za * la + zb * lc;
                    this.b = za * lb + zb * ld;
                    this.c = zc * la + zd * lc;
                    this.d = zc * lb + zd * ld;
                    if (this.data.transformMode != spine.TransformMode.NoScaleOrReflection ? pa * pd - pb * pc < 0 : this.skeleton.flipX != this.skeleton.flipY) {
                        this.b = -this.b;
                        this.d = -this.d;
                    }
                    return;
                }
            }
            if (this.skeleton.flipX) {
                this.a = -this.a;
                this.b = -this.b;
            }
            if (this.skeleton.flipY) {
                this.c = -this.c;
                this.d = -this.d;
            }
        };
        p.setToSetupPose = function () {
            var data = this.data;
            this.x = data.x;
            this.y = data.y;
            this.rotation = data.rotation;
            this.scaleX = data.scaleX;
            this.scaleY = data.scaleY;
            this.shearX = data.shearX;
            this.shearY = data.shearY;
        };
        p.getWorldRotationX = function () {
            return Math.atan2(this.c, this.a) * spine.MathUtils.radDeg;
        };
        p.getWorldRotationY = function () {
            return Math.atan2(this.d, this.b) * spine.MathUtils.radDeg;
        };
        p.getWorldScaleX = function () {
            return Math.sqrt(this.a * this.a + this.c * this.c);
        };
        p.getWorldScaleY = function () {
            return Math.sqrt(this.b * this.b + this.d * this.d);
        };
        /** Computes the individual applied transform values from the world transform. This can be useful to perform processing using
         * the applied transform after the world transform has been modified directly (eg, by a constraint).
         * <p>
         * Some information is ambiguous in the world transform, such as -1,-1 scale versus 180 rotation. */
        p.updateAppliedTransform = function () {
            this.appliedValid = true;
            var parent = this.parent;
            if (parent == null) {
                this.ax = this.worldX;
                this.ay = this.worldY;
                this.arotation = Math.atan2(this.c, this.a) * spine.MathUtils.radDeg;
                this.ascaleX = Math.sqrt(this.a * this.a + this.c * this.c);
                this.ascaleY = Math.sqrt(this.b * this.b + this.d * this.d);
                this.ashearX = 0;
                this.ashearY = Math.atan2(this.a * this.b + this.c * this.d, this.a * this.d - this.b * this.c) * spine.MathUtils.radDeg;
                return;
            }
            var pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
            var pid = 1 / (pa * pd - pb * pc);
            var dx = this.worldX - parent.worldX, dy = this.worldY - parent.worldY;
            this.ax = (dx * pd * pid - dy * pb * pid);
            this.ay = (dy * pa * pid - dx * pc * pid);
            var ia = pid * pd;
            var id = pid * pa;
            var ib = pid * pb;
            var ic = pid * pc;
            var ra = ia * this.a - ib * this.c;
            var rb = ia * this.b - ib * this.d;
            var rc = id * this.c - ic * this.a;
            var rd = id * this.d - ic * this.b;
            this.ashearX = 0;
            this.ascaleX = Math.sqrt(ra * ra + rc * rc);
            if (this.ascaleX > 0.0001) {
                var det = ra * rd - rb * rc;
                this.ascaleY = det / this.ascaleX;
                this.ashearY = Math.atan2(ra * rb + rc * rd, det) * spine.MathUtils.radDeg;
                this.arotation = Math.atan2(rc, ra) * spine.MathUtils.radDeg;
            }
            else {
                this.ascaleX = 0;
                this.ascaleY = Math.sqrt(rb * rb + rd * rd);
                this.ashearY = 0;
                this.arotation = 90 - Math.atan2(rd, rb) * spine.MathUtils.radDeg;
            }
        };
        p.worldToLocal = function (world) {
            var a = this.a, b = this.b, c = this.c, d = this.d;
            var invDet = 1 / (a * d - b * c);
            var x = world.x - this.worldX, y = world.y - this.worldY;
            world.x = (x * d * invDet - y * b * invDet);
            world.y = (y * a * invDet - x * c * invDet);
            return world;
        };
        p.localToWorld = function (local) {
            var x = local.x, y = local.y;
            local.x = x * this.a + y * this.b + this.worldX;
            local.y = x * this.c + y * this.d + this.worldY;
            return local;
        };
        p.worldToLocalRotation = function (worldRotation) {
            var sin = spine.MathUtils.sinDeg(worldRotation), cos = spine.MathUtils.cosDeg(worldRotation);
            return Math.atan2(this.a * sin - this.c * cos, this.d * cos - this.b * sin) * spine.MathUtils.radDeg;
        };
        p.localToWorldRotation = function (localRotation) {
            var sin = spine.MathUtils.sinDeg(localRotation), cos = spine.MathUtils.cosDeg(localRotation);
            return Math.atan2(cos * this.c + sin * this.d, cos * this.a + sin * this.b) * spine.MathUtils.radDeg;
        };
        p.rotateWorld = function (degrees) {
            var a = this.a, b = this.b, c = this.c, d = this.d;
            var cos = spine.MathUtils.cosDeg(degrees), sin = spine.MathUtils.sinDeg(degrees);
            this.a = cos * a - sin * c;
            this.b = cos * b - sin * d;
            this.c = sin * a + cos * c;
            this.d = sin * b + cos * d;
            this.appliedValid = false;
        };
        return Bone;
    }());
    spine.Bone = Bone;
    egret.registerClass(Bone,'spine.Bone',["spine.Updatable"]);
})(spine || (spine = {}));
//# sourceMappingURL=Bone.js.map