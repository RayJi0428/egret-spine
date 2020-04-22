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
    var Animation = (function () {
        function Animation(name, timelines, duration) {
            if (name == null)
                throw new Error("name cannot be null.");
            if (timelines == null)
                throw new Error("timelines cannot be null.");
            this.name = name;
            this.timelines = timelines;
            this.duration = duration;
        }
        var d = __define,c=Animation,p=c.prototype;
        p.apply = function (skeleton, lastTime, time, loop, events, alpha, pose, direction) {
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            if (loop && this.duration != 0) {
                time %= this.duration;
                if (lastTime > 0)
                    lastTime %= this.duration;
            }
            var timelines = this.timelines;
            for (var i = 0, n = timelines.length; i < n; i++)
                timelines[i].apply(skeleton, lastTime, time, events, alpha, pose, direction);
        };
        Animation.binarySearch = function (values, target, step) {
            if (step === void 0) { step = 1; }
            var low = 0;
            var high = values.length / step - 2;
            if (high == 0)
                return step;
            var current = high >>> 1;
            while (true) {
                if (values[(current + 1) * step] <= target)
                    low = current + 1;
                else
                    high = current;
                if (low == high)
                    return (low + 1) * step;
                current = (low + high) >>> 1;
            }
        };
        Animation.linearSearch = function (values, target, step) {
            for (var i = 0, last = values.length - step; i <= last; i += step)
                if (values[i] > target)
                    return i;
            return -1;
        };
        return Animation;
    }());
    spine.Animation = Animation;
    egret.registerClass(Animation,'spine.Animation');
    (function (MixPose) {
        MixPose[MixPose["setup"] = 0] = "setup";
        MixPose[MixPose["current"] = 1] = "current";
        MixPose[MixPose["currentLayered"] = 2] = "currentLayered";
    })(spine.MixPose || (spine.MixPose = {}));
    var MixPose = spine.MixPose;
    (function (MixDirection) {
        MixDirection[MixDirection["in"] = 0] = "in";
        MixDirection[MixDirection["out"] = 1] = "out";
    })(spine.MixDirection || (spine.MixDirection = {}));
    var MixDirection = spine.MixDirection;
    (function (TimelineType) {
        TimelineType[TimelineType["rotate"] = 0] = "rotate";
        TimelineType[TimelineType["translate"] = 1] = "translate";
        TimelineType[TimelineType["scale"] = 2] = "scale";
        TimelineType[TimelineType["shear"] = 3] = "shear";
        TimelineType[TimelineType["attachment"] = 4] = "attachment";
        TimelineType[TimelineType["color"] = 5] = "color";
        TimelineType[TimelineType["deform"] = 6] = "deform";
        TimelineType[TimelineType["event"] = 7] = "event";
        TimelineType[TimelineType["drawOrder"] = 8] = "drawOrder";
        TimelineType[TimelineType["ikConstraint"] = 9] = "ikConstraint";
        TimelineType[TimelineType["transformConstraint"] = 10] = "transformConstraint";
        TimelineType[TimelineType["pathConstraintPosition"] = 11] = "pathConstraintPosition";
        TimelineType[TimelineType["pathConstraintSpacing"] = 12] = "pathConstraintSpacing";
        TimelineType[TimelineType["pathConstraintMix"] = 13] = "pathConstraintMix";
        TimelineType[TimelineType["twoColor"] = 14] = "twoColor";
    })(spine.TimelineType || (spine.TimelineType = {}));
    var TimelineType = spine.TimelineType;
    var CurveTimeline = (function () {
        function CurveTimeline(frameCount) {
            if (frameCount <= 0)
                throw new Error("frameCount must be > 0: " + frameCount);
            this.curves = spine.Utils.newFloatArray((frameCount - 1) * CurveTimeline.BEZIER_SIZE);
        }
        var d = __define,c=CurveTimeline,p=c.prototype;
        p.getFrameCount = function () {
            return this.curves.length / CurveTimeline.BEZIER_SIZE + 1;
        };
        p.setLinear = function (frameIndex) {
            this.curves[frameIndex * CurveTimeline.BEZIER_SIZE] = CurveTimeline.LINEAR;
        };
        p.setStepped = function (frameIndex) {
            this.curves[frameIndex * CurveTimeline.BEZIER_SIZE] = CurveTimeline.STEPPED;
        };
        p.getCurveType = function (frameIndex) {
            var index = frameIndex * CurveTimeline.BEZIER_SIZE;
            if (index == this.curves.length)
                return CurveTimeline.LINEAR;
            var type = this.curves[index];
            if (type == CurveTimeline.LINEAR)
                return CurveTimeline.LINEAR;
            if (type == CurveTimeline.STEPPED)
                return CurveTimeline.STEPPED;
            return CurveTimeline.BEZIER;
        };
        /** Sets the control handle positions for an interpolation bezier curve used to transition from this keyframe to the next.
         * cx1 and cx2 are from 0 to 1, representing the percent of time between the two keyframes. cy1 and cy2 are the percent of
         * the difference between the keyframe's values. */
        p.setCurve = function (frameIndex, cx1, cy1, cx2, cy2) {
            var tmpx = (-cx1 * 2 + cx2) * 0.03, tmpy = (-cy1 * 2 + cy2) * 0.03;
            var dddfx = ((cx1 - cx2) * 3 + 1) * 0.006, dddfy = ((cy1 - cy2) * 3 + 1) * 0.006;
            var ddfx = tmpx * 2 + dddfx, ddfy = tmpy * 2 + dddfy;
            var dfx = cx1 * 0.3 + tmpx + dddfx * 0.16666667, dfy = cy1 * 0.3 + tmpy + dddfy * 0.16666667;
            var i = frameIndex * CurveTimeline.BEZIER_SIZE;
            var curves = this.curves;
            curves[i++] = CurveTimeline.BEZIER;
            var x = dfx, y = dfy;
            for (var n = i + CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
                curves[i] = x;
                curves[i + 1] = y;
                dfx += ddfx;
                dfy += ddfy;
                ddfx += dddfx;
                ddfy += dddfy;
                x += dfx;
                y += dfy;
            }
        };
        p.getCurvePercent = function (frameIndex, percent) {
            percent = spine.MathUtils.clamp(percent, 0, 1);
            var curves = this.curves;
            var i = frameIndex * CurveTimeline.BEZIER_SIZE;
            var type = curves[i];
            if (type == CurveTimeline.LINEAR)
                return percent;
            if (type == CurveTimeline.STEPPED)
                return 0;
            i++;
            var x = 0;
            for (var start = i, n = i + CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
                x = curves[i];
                if (x >= percent) {
                    var prevX = void 0, prevY = void 0;
                    if (i == start) {
                        prevX = 0;
                        prevY = 0;
                    }
                    else {
                        prevX = curves[i - 2];
                        prevY = curves[i - 1];
                    }
                    return prevY + (curves[i + 1] - prevY) * (percent - prevX) / (x - prevX);
                }
            }
            var y = curves[i - 1];
            return y + (1 - y) * (percent - x) / (1 - x); // Last point is 1,1.
        };
        CurveTimeline.LINEAR = 0;
        CurveTimeline.STEPPED = 1;
        CurveTimeline.BEZIER = 2;
        CurveTimeline.BEZIER_SIZE = 10 * 2 - 1;
        return CurveTimeline;
    }());
    spine.CurveTimeline = CurveTimeline;
    egret.registerClass(CurveTimeline,'spine.CurveTimeline',["spine.Timeline"]);
    var RotateTimeline = (function (_super) {
        __extends(RotateTimeline, _super);
        function RotateTimeline(frameCount) {
            _super.call(this, frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount << 1);
        }
        var d = __define,c=RotateTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return (TimelineType.rotate << 24) + this.boneIndex;
        };
        /** Sets the time and angle of the specified keyframe. */
        p.setFrame = function (frameIndex, time, degrees) {
            frameIndex <<= 1;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + RotateTimeline.ROTATION] = degrees;
        };
        p.apply = function (skeleton, lastTime, time, events, alpha, pose, direction) {
            var frames = this.frames;
            var bone = skeleton.bones[this.boneIndex];
            if (time < frames[0]) {
                switch (pose) {
                    case MixPose.setup:
                        bone.rotation = bone.data.rotation;
                        return;
                    case MixPose.current:
                        var r_1 = bone.data.rotation - bone.rotation;
                        r_1 -= (16384 - ((16384.499999999996 - r_1 / 360) | 0)) * 360;
                        bone.rotation += r_1 * alpha;
                }
                return;
            }
            if (time >= frames[frames.length - RotateTimeline.ENTRIES]) {
                if (pose == MixPose.setup)
                    bone.rotation = bone.data.rotation + frames[frames.length + RotateTimeline.PREV_ROTATION] * alpha;
                else {
                    var r_2 = bone.data.rotation + frames[frames.length + RotateTimeline.PREV_ROTATION] - bone.rotation;
                    r_2 -= (16384 - ((16384.499999999996 - r_2 / 360) | 0)) * 360; // Wrap within -180 and 180.
                    bone.rotation += r_2 * alpha;
                }
                return;
            }
            // Interpolate between the previous frame and the current frame.
            var frame = Animation.binarySearch(frames, time, RotateTimeline.ENTRIES);
            var prevRotation = frames[frame + RotateTimeline.PREV_ROTATION];
            var frameTime = frames[frame];
            var percent = this.getCurvePercent((frame >> 1) - 1, 1 - (time - frameTime) / (frames[frame + RotateTimeline.PREV_TIME] - frameTime));
            var r = frames[frame + RotateTimeline.ROTATION] - prevRotation;
            r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
            r = prevRotation + r * percent;
            if (pose == MixPose.setup) {
                r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
                bone.rotation = bone.data.rotation + r * alpha;
            }
            else {
                r = bone.data.rotation + r - bone.rotation;
                r -= (16384 - ((16384.499999999996 - r / 360) | 0)) * 360;
                bone.rotation += r * alpha;
            }
        };
        RotateTimeline.ENTRIES = 2;
        RotateTimeline.PREV_TIME = -2;
        RotateTimeline.PREV_ROTATION = -1;
        RotateTimeline.ROTATION = 1;
        return RotateTimeline;
    }(CurveTimeline));
    spine.RotateTimeline = RotateTimeline;
    egret.registerClass(RotateTimeline,'spine.RotateTimeline');
    var TranslateTimeline = (function (_super) {
        __extends(TranslateTimeline, _super);
        function TranslateTimeline(frameCount) {
            _super.call(this, frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount * TranslateTimeline.ENTRIES);
        }
        var d = __define,c=TranslateTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return (TimelineType.translate << 24) + this.boneIndex;
        };
        /** Sets the time and value of the specified keyframe. */
        p.setFrame = function (frameIndex, time, x, y) {
            frameIndex *= TranslateTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + TranslateTimeline.X] = x;
            this.frames[frameIndex + TranslateTimeline.Y] = y;
        };
        p.apply = function (skeleton, lastTime, time, events, alpha, pose, direction) {
            var frames = this.frames;
            var bone = skeleton.bones[this.boneIndex];
            if (time < frames[0]) {
                switch (pose) {
                    case MixPose.setup:
                        bone.x = bone.data.x;
                        bone.y = bone.data.y;
                        return;
                    case MixPose.current:
                        bone.x += (bone.data.x - bone.x) * alpha;
                        bone.y += (bone.data.y - bone.y) * alpha;
                }
                return;
            }
            var x = 0, y = 0;
            if (time >= frames[frames.length - TranslateTimeline.ENTRIES]) {
                x = frames[frames.length + TranslateTimeline.PREV_X];
                y = frames[frames.length + TranslateTimeline.PREV_Y];
            }
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, TranslateTimeline.ENTRIES);
                x = frames[frame + TranslateTimeline.PREV_X];
                y = frames[frame + TranslateTimeline.PREV_Y];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / TranslateTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + TranslateTimeline.PREV_TIME] - frameTime));
                x += (frames[frame + TranslateTimeline.X] - x) * percent;
                y += (frames[frame + TranslateTimeline.Y] - y) * percent;
            }
            if (pose == MixPose.setup) {
                bone.x = bone.data.x + x * alpha;
                bone.y = bone.data.y + y * alpha;
            }
            else {
                bone.x += (bone.data.x + x - bone.x) * alpha;
                bone.y += (bone.data.y + y - bone.y) * alpha;
            }
        };
        TranslateTimeline.ENTRIES = 3;
        TranslateTimeline.PREV_TIME = -3;
        TranslateTimeline.PREV_X = -2;
        TranslateTimeline.PREV_Y = -1;
        TranslateTimeline.X = 1;
        TranslateTimeline.Y = 2;
        return TranslateTimeline;
    }(CurveTimeline));
    spine.TranslateTimeline = TranslateTimeline;
    egret.registerClass(TranslateTimeline,'spine.TranslateTimeline');
    var ScaleTimeline = (function (_super) {
        __extends(ScaleTimeline, _super);
        function ScaleTimeline(frameCount) {
            _super.call(this, frameCount);
        }
        var d = __define,c=ScaleTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return (TimelineType.scale << 24) + this.boneIndex;
        };
        p.apply = function (skeleton, lastTime, time, events, alpha, pose, direction) {
            var frames = this.frames;
            var bone = skeleton.bones[this.boneIndex];
            if (time < frames[0]) {
                switch (pose) {
                    case MixPose.setup:
                        bone.scaleX = bone.data.scaleX;
                        bone.scaleY = bone.data.scaleY;
                        return;
                    case MixPose.current:
                        bone.scaleX += (bone.data.scaleX - bone.scaleX) * alpha;
                        bone.scaleY += (bone.data.scaleY - bone.scaleY) * alpha;
                }
                return;
            }
            var x = 0, y = 0;
            if (time >= frames[frames.length - ScaleTimeline.ENTRIES]) {
                x = frames[frames.length + ScaleTimeline.PREV_X] * bone.data.scaleX;
                y = frames[frames.length + ScaleTimeline.PREV_Y] * bone.data.scaleY;
            }
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, ScaleTimeline.ENTRIES);
                x = frames[frame + ScaleTimeline.PREV_X];
                y = frames[frame + ScaleTimeline.PREV_Y];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / ScaleTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + ScaleTimeline.PREV_TIME] - frameTime));
                x = (x + (frames[frame + ScaleTimeline.X] - x) * percent) * bone.data.scaleX;
                y = (y + (frames[frame + ScaleTimeline.Y] - y) * percent) * bone.data.scaleY;
            }
            if (alpha == 1) {
                bone.scaleX = x;
                bone.scaleY = y;
            }
            else {
                var bx = 0, by = 0;
                if (pose == MixPose.setup) {
                    bx = bone.data.scaleX;
                    by = bone.data.scaleY;
                }
                else {
                    bx = bone.scaleX;
                    by = bone.scaleY;
                }
                // Mixing out uses sign of setup or current pose, else use sign of key.
                if (direction == MixDirection.out) {
                    x = Math.abs(x) * spine.MathUtils.signum(bx);
                    y = Math.abs(y) * spine.MathUtils.signum(by);
                }
                else {
                    bx = Math.abs(bx) * spine.MathUtils.signum(x);
                    by = Math.abs(by) * spine.MathUtils.signum(y);
                }
                bone.scaleX = bx + (x - bx) * alpha;
                bone.scaleY = by + (y - by) * alpha;
            }
        };
        return ScaleTimeline;
    }(TranslateTimeline));
    spine.ScaleTimeline = ScaleTimeline;
    egret.registerClass(ScaleTimeline,'spine.ScaleTimeline');
    var ShearTimeline = (function (_super) {
        __extends(ShearTimeline, _super);
        function ShearTimeline(frameCount) {
            _super.call(this, frameCount);
        }
        var d = __define,c=ShearTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return (TimelineType.shear << 24) + this.boneIndex;
        };
        p.apply = function (skeleton, lastTime, time, events, alpha, pose, direction) {
            var frames = this.frames;
            var bone = skeleton.bones[this.boneIndex];
            if (time < frames[0]) {
                switch (pose) {
                    case MixPose.setup:
                        bone.shearX = bone.data.shearX;
                        bone.shearY = bone.data.shearY;
                        return;
                    case MixPose.current:
                        bone.shearX += (bone.data.shearX - bone.shearX) * alpha;
                        bone.shearY += (bone.data.shearY - bone.shearY) * alpha;
                }
                return;
            }
            var x = 0, y = 0;
            if (time >= frames[frames.length - ShearTimeline.ENTRIES]) {
                x = frames[frames.length + ShearTimeline.PREV_X];
                y = frames[frames.length + ShearTimeline.PREV_Y];
            }
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, ShearTimeline.ENTRIES);
                x = frames[frame + ShearTimeline.PREV_X];
                y = frames[frame + ShearTimeline.PREV_Y];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / ShearTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + ShearTimeline.PREV_TIME] - frameTime));
                x = x + (frames[frame + ShearTimeline.X] - x) * percent;
                y = y + (frames[frame + ShearTimeline.Y] - y) * percent;
            }
            if (pose == MixPose.setup) {
                bone.shearX = bone.data.shearX + x * alpha;
                bone.shearY = bone.data.shearY + y * alpha;
            }
            else {
                bone.shearX += (bone.data.shearX + x - bone.shearX) * alpha;
                bone.shearY += (bone.data.shearY + y - bone.shearY) * alpha;
            }
        };
        return ShearTimeline;
    }(TranslateTimeline));
    spine.ShearTimeline = ShearTimeline;
    egret.registerClass(ShearTimeline,'spine.ShearTimeline');
    var ColorTimeline = (function (_super) {
        __extends(ColorTimeline, _super);
        function ColorTimeline(frameCount) {
            _super.call(this, frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount * ColorTimeline.ENTRIES);
        }
        var d = __define,c=ColorTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return (TimelineType.color << 24) + this.slotIndex;
        };
        /** Sets the time and value of the specified keyframe. */
        p.setFrame = function (frameIndex, time, r, g, b, a) {
            frameIndex *= ColorTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + ColorTimeline.R] = r;
            this.frames[frameIndex + ColorTimeline.G] = g;
            this.frames[frameIndex + ColorTimeline.B] = b;
            this.frames[frameIndex + ColorTimeline.A] = a;
        };
        p.apply = function (skeleton, lastTime, time, events, alpha, pose, direction) {
            var slot = skeleton.slots[this.slotIndex];
            var frames = this.frames;
            if (time < frames[0]) {
                switch (pose) {
                    case MixPose.setup:
                        slot.color.setFromColor(slot.data.color);
                        return;
                    case MixPose.current:
                        var color = slot.color, setup = slot.data.color;
                        color.add((setup.r - color.r) * alpha, (setup.g - color.g) * alpha, (setup.b - color.b) * alpha, (setup.a - color.a) * alpha);
                }
                return;
            }
            var r = 0, g = 0, b = 0, a = 0;
            if (time >= frames[frames.length - ColorTimeline.ENTRIES]) {
                var i = frames.length;
                r = frames[i + ColorTimeline.PREV_R];
                g = frames[i + ColorTimeline.PREV_G];
                b = frames[i + ColorTimeline.PREV_B];
                a = frames[i + ColorTimeline.PREV_A];
            }
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, ColorTimeline.ENTRIES);
                r = frames[frame + ColorTimeline.PREV_R];
                g = frames[frame + ColorTimeline.PREV_G];
                b = frames[frame + ColorTimeline.PREV_B];
                a = frames[frame + ColorTimeline.PREV_A];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / ColorTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + ColorTimeline.PREV_TIME] - frameTime));
                r += (frames[frame + ColorTimeline.R] - r) * percent;
                g += (frames[frame + ColorTimeline.G] - g) * percent;
                b += (frames[frame + ColorTimeline.B] - b) * percent;
                a += (frames[frame + ColorTimeline.A] - a) * percent;
            }
            if (alpha == 1)
                slot.color.set(r, g, b, a);
            else {
                var color = slot.color;
                if (pose == MixPose.setup)
                    color.setFromColor(slot.data.color);
                color.add((r - color.r) * alpha, (g - color.g) * alpha, (b - color.b) * alpha, (a - color.a) * alpha);
            }
        };
        ColorTimeline.ENTRIES = 5;
        ColorTimeline.PREV_TIME = -5;
        ColorTimeline.PREV_R = -4;
        ColorTimeline.PREV_G = -3;
        ColorTimeline.PREV_B = -2;
        ColorTimeline.PREV_A = -1;
        ColorTimeline.R = 1;
        ColorTimeline.G = 2;
        ColorTimeline.B = 3;
        ColorTimeline.A = 4;
        return ColorTimeline;
    }(CurveTimeline));
    spine.ColorTimeline = ColorTimeline;
    egret.registerClass(ColorTimeline,'spine.ColorTimeline');
    var TwoColorTimeline = (function (_super) {
        __extends(TwoColorTimeline, _super);
        function TwoColorTimeline(frameCount) {
            _super.call(this, frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount * TwoColorTimeline.ENTRIES);
        }
        var d = __define,c=TwoColorTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return (TimelineType.twoColor << 24) + this.slotIndex;
        };
        /** Sets the time and value of the specified keyframe. */
        p.setFrame = function (frameIndex, time, r, g, b, a, r2, g2, b2) {
            frameIndex *= TwoColorTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + TwoColorTimeline.R] = r;
            this.frames[frameIndex + TwoColorTimeline.G] = g;
            this.frames[frameIndex + TwoColorTimeline.B] = b;
            this.frames[frameIndex + TwoColorTimeline.A] = a;
            this.frames[frameIndex + TwoColorTimeline.R2] = r2;
            this.frames[frameIndex + TwoColorTimeline.G2] = g2;
            this.frames[frameIndex + TwoColorTimeline.B2] = b2;
        };
        p.apply = function (skeleton, lastTime, time, events, alpha, pose, direction) {
            var slot = skeleton.slots[this.slotIndex];
            var frames = this.frames;
            if (time < frames[0]) {
                switch (pose) {
                    case MixPose.setup:
                        slot.color.setFromColor(slot.data.color);
                        slot.darkColor.setFromColor(slot.data.darkColor);
                        return;
                    case MixPose.current:
                        var light = slot.color, dark = slot.darkColor, setupLight = slot.data.color, setupDark = slot.data.darkColor;
                        light.add((setupLight.r - light.r) * alpha, (setupLight.g - light.g) * alpha, (setupLight.b - light.b) * alpha, (setupLight.a - light.a) * alpha);
                        dark.add((setupDark.r - dark.r) * alpha, (setupDark.g - dark.g) * alpha, (setupDark.b - dark.b) * alpha, 0);
                }
                return;
            }
            var r = 0, g = 0, b = 0, a = 0, r2 = 0, g2 = 0, b2 = 0;
            if (time >= frames[frames.length - TwoColorTimeline.ENTRIES]) {
                var i = frames.length;
                r = frames[i + TwoColorTimeline.PREV_R];
                g = frames[i + TwoColorTimeline.PREV_G];
                b = frames[i + TwoColorTimeline.PREV_B];
                a = frames[i + TwoColorTimeline.PREV_A];
                r2 = frames[i + TwoColorTimeline.PREV_R2];
                g2 = frames[i + TwoColorTimeline.PREV_G2];
                b2 = frames[i + TwoColorTimeline.PREV_B2];
            }
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, TwoColorTimeline.ENTRIES);
                r = frames[frame + TwoColorTimeline.PREV_R];
                g = frames[frame + TwoColorTimeline.PREV_G];
                b = frames[frame + TwoColorTimeline.PREV_B];
                a = frames[frame + TwoColorTimeline.PREV_A];
                r2 = frames[frame + TwoColorTimeline.PREV_R2];
                g2 = frames[frame + TwoColorTimeline.PREV_G2];
                b2 = frames[frame + TwoColorTimeline.PREV_B2];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / TwoColorTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + TwoColorTimeline.PREV_TIME] - frameTime));
                r += (frames[frame + TwoColorTimeline.R] - r) * percent;
                g += (frames[frame + TwoColorTimeline.G] - g) * percent;
                b += (frames[frame + TwoColorTimeline.B] - b) * percent;
                a += (frames[frame + TwoColorTimeline.A] - a) * percent;
                r2 += (frames[frame + TwoColorTimeline.R2] - r2) * percent;
                g2 += (frames[frame + TwoColorTimeline.G2] - g2) * percent;
                b2 += (frames[frame + TwoColorTimeline.B2] - b2) * percent;
            }
            if (alpha == 1) {
                slot.color.set(r, g, b, a);
                slot.darkColor.set(r2, g2, b2, 1);
            }
            else {
                var light = slot.color, dark = slot.darkColor;
                if (pose == MixPose.setup) {
                    light.setFromColor(slot.data.color);
                    dark.setFromColor(slot.data.darkColor);
                }
                light.add((r - light.r) * alpha, (g - light.g) * alpha, (b - light.b) * alpha, (a - light.a) * alpha);
                dark.add((r2 - dark.r) * alpha, (g2 - dark.g) * alpha, (b2 - dark.b) * alpha, 0);
            }
        };
        TwoColorTimeline.ENTRIES = 8;
        TwoColorTimeline.PREV_TIME = -8;
        TwoColorTimeline.PREV_R = -7;
        TwoColorTimeline.PREV_G = -6;
        TwoColorTimeline.PREV_B = -5;
        TwoColorTimeline.PREV_A = -4;
        TwoColorTimeline.PREV_R2 = -3;
        TwoColorTimeline.PREV_G2 = -2;
        TwoColorTimeline.PREV_B2 = -1;
        TwoColorTimeline.R = 1;
        TwoColorTimeline.G = 2;
        TwoColorTimeline.B = 3;
        TwoColorTimeline.A = 4;
        TwoColorTimeline.R2 = 5;
        TwoColorTimeline.G2 = 6;
        TwoColorTimeline.B2 = 7;
        return TwoColorTimeline;
    }(CurveTimeline));
    spine.TwoColorTimeline = TwoColorTimeline;
    egret.registerClass(TwoColorTimeline,'spine.TwoColorTimeline');
    var AttachmentTimeline = (function () {
        function AttachmentTimeline(frameCount) {
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.attachmentNames = new Array(frameCount);
        }
        var d = __define,c=AttachmentTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return (TimelineType.attachment << 24) + this.slotIndex;
        };
        p.getFrameCount = function () {
            return this.frames.length;
        };
        /** Sets the time and value of the specified keyframe. */
        p.setFrame = function (frameIndex, time, attachmentName) {
            this.frames[frameIndex] = time;
            this.attachmentNames[frameIndex] = attachmentName;
        };
        p.apply = function (skeleton, lastTime, time, events, alpha, pose, direction) {
            var slot = skeleton.slots[this.slotIndex];
            if (direction == MixDirection.out && pose == MixPose.setup) {
                var attachmentName_1 = slot.data.attachmentName;
                slot.setAttachment(attachmentName_1 == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName_1));
                return;
            }
            var frames = this.frames;
            if (time < frames[0]) {
                if (pose == MixPose.setup) {
                    var attachmentName_2 = slot.data.attachmentName;
                    slot.setAttachment(attachmentName_2 == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName_2));
                }
                return;
            }
            var frameIndex = 0;
            if (time >= frames[frames.length - 1])
                frameIndex = frames.length - 1;
            else
                frameIndex = Animation.binarySearch(frames, time, 1) - 1;
            var attachmentName = this.attachmentNames[frameIndex];
            skeleton.slots[this.slotIndex]
                .setAttachment(attachmentName == null ? null : skeleton.getAttachment(this.slotIndex, attachmentName));
        };
        return AttachmentTimeline;
    }());
    spine.AttachmentTimeline = AttachmentTimeline;
    egret.registerClass(AttachmentTimeline,'spine.AttachmentTimeline',["spine.Timeline"]);
    var DeformTimeline = (function (_super) {
        __extends(DeformTimeline, _super);
        function DeformTimeline(frameCount) {
            _super.call(this, frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.frameVertices = new Array(frameCount);
        }
        var d = __define,c=DeformTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return (TimelineType.deform << 27) + +this.attachment.id + this.slotIndex;
        };
        /** Sets the time of the specified keyframe. */
        p.setFrame = function (frameIndex, time, vertices) {
            this.frames[frameIndex] = time;
            this.frameVertices[frameIndex] = vertices;
        };
        p.apply = function (skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
            var slot = skeleton.slots[this.slotIndex];
            var slotAttachment = slot.getAttachment();
            if (!(slotAttachment instanceof spine.VertexAttachment) || !slotAttachment.applyDeform(this.attachment))
                return;
            var verticesArray = slot.attachmentVertices;
            var frameVertices = this.frameVertices;
            var vertexCount = frameVertices[0].length;
            if (verticesArray.length != vertexCount && pose != MixPose.setup)
                alpha = 1; // Don't mix from uninitialized slot vertices.
            var vertices = spine.Utils.setArraySize(verticesArray, vertexCount);
            var frames = this.frames;
            if (time < frames[0]) {
                switch (pose) {
                    case MixPose.setup:
                        verticesArray.length = 0;
                        return;
                    case MixPose.current:
                        alpha = 1 - alpha;
                        for (var i = 0; i < vertexCount; i++)
                            vertices[i] *= alpha;
                }
                return;
            }
            if (time >= frames[frames.length - 1]) {
                var lastVertices = frameVertices[frames.length - 1];
                if (alpha == 1) {
                    spine.Utils.arrayCopy(lastVertices, 0, vertices, 0, vertexCount);
                }
                else if (pose == MixPose.setup) {
                    var vertexAttachment = slotAttachment;
                    if (vertexAttachment.bones == null) {
                        // Unweighted vertex positions, with alpha.
                        var setupVertices = vertexAttachment.vertices;
                        for (var i = 0; i < vertexCount; i++) {
                            var setup = setupVertices[i];
                            vertices[i] = setup + (lastVertices[i] - setup) * alpha;
                        }
                    }
                    else {
                        // Weighted deform offsets, with alpha.
                        for (var i = 0; i < vertexCount; i++)
                            vertices[i] = lastVertices[i] * alpha;
                    }
                }
                else {
                    for (var i = 0; i < vertexCount; i++)
                        vertices[i] += (lastVertices[i] - vertices[i]) * alpha;
                }
                return;
            }
            // Interpolate between the previous frame and the current frame.
            var frame = Animation.binarySearch(frames, time);
            var prevVertices = frameVertices[frame - 1];
            var nextVertices = frameVertices[frame];
            var frameTime = frames[frame];
            var percent = this.getCurvePercent(frame - 1, 1 - (time - frameTime) / (frames[frame - 1] - frameTime));
            if (alpha == 1) {
                for (var i = 0; i < vertexCount; i++) {
                    var prev = prevVertices[i];
                    vertices[i] = prev + (nextVertices[i] - prev) * percent;
                }
            }
            else if (pose == MixPose.setup) {
                var vertexAttachment = slotAttachment;
                if (vertexAttachment.bones == null) {
                    // Unweighted vertex positions, with alpha.
                    var setupVertices = vertexAttachment.vertices;
                    for (var i = 0; i < vertexCount; i++) {
                        var prev = prevVertices[i], setup = setupVertices[i];
                        vertices[i] = setup + (prev + (nextVertices[i] - prev) * percent - setup) * alpha;
                    }
                }
                else {
                    // Weighted deform offsets, with alpha.
                    for (var i = 0; i < vertexCount; i++) {
                        var prev = prevVertices[i];
                        vertices[i] = (prev + (nextVertices[i] - prev) * percent) * alpha;
                    }
                }
            }
            else {
                // Vertex positions or deform offsets, with alpha.
                for (var i = 0; i < vertexCount; i++) {
                    var prev = prevVertices[i];
                    vertices[i] += (prev + (nextVertices[i] - prev) * percent - vertices[i]) * alpha;
                }
            }
        };
        return DeformTimeline;
    }(CurveTimeline));
    spine.DeformTimeline = DeformTimeline;
    egret.registerClass(DeformTimeline,'spine.DeformTimeline');
    var EventTimeline = (function () {
        function EventTimeline(frameCount) {
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.events = new Array(frameCount);
        }
        var d = __define,c=EventTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return TimelineType.event << 24;
        };
        p.getFrameCount = function () {
            return this.frames.length;
        };
        /** Sets the time of the specified keyframe. */
        p.setFrame = function (frameIndex, event) {
            this.frames[frameIndex] = event.time;
            this.events[frameIndex] = event;
        };
        /** Fires events for frames > lastTime and <= time. */
        p.apply = function (skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
            if (firedEvents == null)
                return;
            var frames = this.frames;
            var frameCount = this.frames.length;
            if (lastTime > time) {
                this.apply(skeleton, lastTime, Number.MAX_VALUE, firedEvents, alpha, pose, direction);
                lastTime = -1;
            }
            else if (lastTime >= frames[frameCount - 1])
                return;
            if (time < frames[0])
                return; // Time is before first frame.
            var frame = 0;
            if (lastTime < frames[0])
                frame = 0;
            else {
                frame = Animation.binarySearch(frames, lastTime);
                var frameTime = frames[frame];
                while (frame > 0) {
                    if (frames[frame - 1] != frameTime)
                        break;
                    frame--;
                }
            }
            for (; frame < frameCount && time >= frames[frame]; frame++)
                firedEvents.push(this.events[frame]);
        };
        return EventTimeline;
    }());
    spine.EventTimeline = EventTimeline;
    egret.registerClass(EventTimeline,'spine.EventTimeline',["spine.Timeline"]);
    var DrawOrderTimeline = (function () {
        function DrawOrderTimeline(frameCount) {
            this.frames = spine.Utils.newFloatArray(frameCount);
            this.drawOrders = new Array(frameCount);
        }
        var d = __define,c=DrawOrderTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return TimelineType.drawOrder << 24;
        };
        p.getFrameCount = function () {
            return this.frames.length;
        };
        /** Sets the time of the specified keyframe.
         * @param drawOrder May be null to use bind pose draw order. */
        p.setFrame = function (frameIndex, time, drawOrder) {
            this.frames[frameIndex] = time;
            this.drawOrders[frameIndex] = drawOrder;
        };
        p.apply = function (skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
            var drawOrder = skeleton.drawOrder;
            var slots = skeleton.slots;
            if (direction == MixDirection.out && pose == MixPose.setup) {
                spine.Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
                return;
            }
            var frames = this.frames;
            if (time < frames[0]) {
                if (pose == MixPose.setup)
                    spine.Utils.arrayCopy(skeleton.slots, 0, skeleton.drawOrder, 0, skeleton.slots.length);
                return;
            }
            var frame = 0;
            if (time >= frames[frames.length - 1])
                frame = frames.length - 1;
            else
                frame = Animation.binarySearch(frames, time) - 1;
            var drawOrderToSetupIndex = this.drawOrders[frame];
            if (drawOrderToSetupIndex == null)
                spine.Utils.arrayCopy(slots, 0, drawOrder, 0, slots.length);
            else {
                for (var i = 0, n = drawOrderToSetupIndex.length; i < n; i++)
                    drawOrder[i] = slots[drawOrderToSetupIndex[i]];
            }
        };
        return DrawOrderTimeline;
    }());
    spine.DrawOrderTimeline = DrawOrderTimeline;
    egret.registerClass(DrawOrderTimeline,'spine.DrawOrderTimeline',["spine.Timeline"]);
    var IkConstraintTimeline = (function (_super) {
        __extends(IkConstraintTimeline, _super);
        function IkConstraintTimeline(frameCount) {
            _super.call(this, frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount * IkConstraintTimeline.ENTRIES);
        }
        var d = __define,c=IkConstraintTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return (TimelineType.ikConstraint << 24) + this.ikConstraintIndex;
        };
        /** Sets the time, mix and bend direction of the specified keyframe. */
        p.setFrame = function (frameIndex, time, mix, bendDirection) {
            frameIndex *= IkConstraintTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + IkConstraintTimeline.MIX] = mix;
            this.frames[frameIndex + IkConstraintTimeline.BEND_DIRECTION] = bendDirection;
        };
        p.apply = function (skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
            var frames = this.frames;
            var constraint = skeleton.ikConstraints[this.ikConstraintIndex];
            if (time < frames[0]) {
                switch (pose) {
                    case MixPose.setup:
                        constraint.mix = constraint.data.mix;
                        constraint.bendDirection = constraint.data.bendDirection;
                        return;
                    case MixPose.current:
                        constraint.mix += (constraint.data.mix - constraint.mix) * alpha;
                        constraint.bendDirection = constraint.data.bendDirection;
                }
                return;
            }
            if (time >= frames[frames.length - IkConstraintTimeline.ENTRIES]) {
                if (pose == MixPose.setup) {
                    constraint.mix = constraint.data.mix + (frames[frames.length + IkConstraintTimeline.PREV_MIX] - constraint.data.mix) * alpha;
                    constraint.bendDirection = direction == MixDirection.out ? constraint.data.bendDirection
                        : frames[frames.length + IkConstraintTimeline.PREV_BEND_DIRECTION];
                }
                else {
                    constraint.mix += (frames[frames.length + IkConstraintTimeline.PREV_MIX] - constraint.mix) * alpha;
                    if (direction == MixDirection.in)
                        constraint.bendDirection = frames[frames.length + IkConstraintTimeline.PREV_BEND_DIRECTION];
                }
                return;
            }
            // Interpolate between the previous frame and the current frame.
            var frame = Animation.binarySearch(frames, time, IkConstraintTimeline.ENTRIES);
            var mix = frames[frame + IkConstraintTimeline.PREV_MIX];
            var frameTime = frames[frame];
            var percent = this.getCurvePercent(frame / IkConstraintTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + IkConstraintTimeline.PREV_TIME] - frameTime));
            if (pose == MixPose.setup) {
                constraint.mix = constraint.data.mix + (mix + (frames[frame + IkConstraintTimeline.MIX] - mix) * percent - constraint.data.mix) * alpha;
                constraint.bendDirection = direction == MixDirection.out ? constraint.data.bendDirection : frames[frame + IkConstraintTimeline.PREV_BEND_DIRECTION];
            }
            else {
                constraint.mix += (mix + (frames[frame + IkConstraintTimeline.MIX] - mix) * percent - constraint.mix) * alpha;
                if (direction == MixDirection.in)
                    constraint.bendDirection = frames[frame + IkConstraintTimeline.PREV_BEND_DIRECTION];
            }
        };
        IkConstraintTimeline.ENTRIES = 3;
        IkConstraintTimeline.PREV_TIME = -3;
        IkConstraintTimeline.PREV_MIX = -2;
        IkConstraintTimeline.PREV_BEND_DIRECTION = -1;
        IkConstraintTimeline.MIX = 1;
        IkConstraintTimeline.BEND_DIRECTION = 2;
        return IkConstraintTimeline;
    }(CurveTimeline));
    spine.IkConstraintTimeline = IkConstraintTimeline;
    egret.registerClass(IkConstraintTimeline,'spine.IkConstraintTimeline');
    var TransformConstraintTimeline = (function (_super) {
        __extends(TransformConstraintTimeline, _super);
        function TransformConstraintTimeline(frameCount) {
            _super.call(this, frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount * TransformConstraintTimeline.ENTRIES);
        }
        var d = __define,c=TransformConstraintTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return (TimelineType.transformConstraint << 24) + this.transformConstraintIndex;
        };
        /** Sets the time and mixes of the specified keyframe. */
        p.setFrame = function (frameIndex, time, rotateMix, translateMix, scaleMix, shearMix) {
            frameIndex *= TransformConstraintTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + TransformConstraintTimeline.ROTATE] = rotateMix;
            this.frames[frameIndex + TransformConstraintTimeline.TRANSLATE] = translateMix;
            this.frames[frameIndex + TransformConstraintTimeline.SCALE] = scaleMix;
            this.frames[frameIndex + TransformConstraintTimeline.SHEAR] = shearMix;
        };
        p.apply = function (skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
            var frames = this.frames;
            var constraint = skeleton.transformConstraints[this.transformConstraintIndex];
            if (time < frames[0]) {
                var data = constraint.data;
                switch (pose) {
                    case MixPose.setup:
                        constraint.rotateMix = data.rotateMix;
                        constraint.translateMix = data.translateMix;
                        constraint.scaleMix = data.scaleMix;
                        constraint.shearMix = data.shearMix;
                        return;
                    case MixPose.current:
                        constraint.rotateMix += (data.rotateMix - constraint.rotateMix) * alpha;
                        constraint.translateMix += (data.translateMix - constraint.translateMix) * alpha;
                        constraint.scaleMix += (data.scaleMix - constraint.scaleMix) * alpha;
                        constraint.shearMix += (data.shearMix - constraint.shearMix) * alpha;
                }
                return;
            }
            var rotate = 0, translate = 0, scale = 0, shear = 0;
            if (time >= frames[frames.length - TransformConstraintTimeline.ENTRIES]) {
                var i = frames.length;
                rotate = frames[i + TransformConstraintTimeline.PREV_ROTATE];
                translate = frames[i + TransformConstraintTimeline.PREV_TRANSLATE];
                scale = frames[i + TransformConstraintTimeline.PREV_SCALE];
                shear = frames[i + TransformConstraintTimeline.PREV_SHEAR];
            }
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, TransformConstraintTimeline.ENTRIES);
                rotate = frames[frame + TransformConstraintTimeline.PREV_ROTATE];
                translate = frames[frame + TransformConstraintTimeline.PREV_TRANSLATE];
                scale = frames[frame + TransformConstraintTimeline.PREV_SCALE];
                shear = frames[frame + TransformConstraintTimeline.PREV_SHEAR];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / TransformConstraintTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + TransformConstraintTimeline.PREV_TIME] - frameTime));
                rotate += (frames[frame + TransformConstraintTimeline.ROTATE] - rotate) * percent;
                translate += (frames[frame + TransformConstraintTimeline.TRANSLATE] - translate) * percent;
                scale += (frames[frame + TransformConstraintTimeline.SCALE] - scale) * percent;
                shear += (frames[frame + TransformConstraintTimeline.SHEAR] - shear) * percent;
            }
            if (pose == MixPose.setup) {
                var data = constraint.data;
                constraint.rotateMix = data.rotateMix + (rotate - data.rotateMix) * alpha;
                constraint.translateMix = data.translateMix + (translate - data.translateMix) * alpha;
                constraint.scaleMix = data.scaleMix + (scale - data.scaleMix) * alpha;
                constraint.shearMix = data.shearMix + (shear - data.shearMix) * alpha;
            }
            else {
                constraint.rotateMix += (rotate - constraint.rotateMix) * alpha;
                constraint.translateMix += (translate - constraint.translateMix) * alpha;
                constraint.scaleMix += (scale - constraint.scaleMix) * alpha;
                constraint.shearMix += (shear - constraint.shearMix) * alpha;
            }
        };
        TransformConstraintTimeline.ENTRIES = 5;
        TransformConstraintTimeline.PREV_TIME = -5;
        TransformConstraintTimeline.PREV_ROTATE = -4;
        TransformConstraintTimeline.PREV_TRANSLATE = -3;
        TransformConstraintTimeline.PREV_SCALE = -2;
        TransformConstraintTimeline.PREV_SHEAR = -1;
        TransformConstraintTimeline.ROTATE = 1;
        TransformConstraintTimeline.TRANSLATE = 2;
        TransformConstraintTimeline.SCALE = 3;
        TransformConstraintTimeline.SHEAR = 4;
        return TransformConstraintTimeline;
    }(CurveTimeline));
    spine.TransformConstraintTimeline = TransformConstraintTimeline;
    egret.registerClass(TransformConstraintTimeline,'spine.TransformConstraintTimeline');
    var PathConstraintPositionTimeline = (function (_super) {
        __extends(PathConstraintPositionTimeline, _super);
        function PathConstraintPositionTimeline(frameCount) {
            _super.call(this, frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount * PathConstraintPositionTimeline.ENTRIES);
        }
        var d = __define,c=PathConstraintPositionTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return (TimelineType.pathConstraintPosition << 24) + this.pathConstraintIndex;
        };
        /** Sets the time and value of the specified keyframe. */
        p.setFrame = function (frameIndex, time, value) {
            frameIndex *= PathConstraintPositionTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + PathConstraintPositionTimeline.VALUE] = value;
        };
        p.apply = function (skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
            var frames = this.frames;
            var constraint = skeleton.pathConstraints[this.pathConstraintIndex];
            if (time < frames[0]) {
                switch (pose) {
                    case MixPose.setup:
                        constraint.position = constraint.data.position;
                        return;
                    case MixPose.current:
                        constraint.position += (constraint.data.position - constraint.position) * alpha;
                }
                return;
            }
            var position = 0;
            if (time >= frames[frames.length - PathConstraintPositionTimeline.ENTRIES])
                position = frames[frames.length + PathConstraintPositionTimeline.PREV_VALUE];
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, PathConstraintPositionTimeline.ENTRIES);
                position = frames[frame + PathConstraintPositionTimeline.PREV_VALUE];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / PathConstraintPositionTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + PathConstraintPositionTimeline.PREV_TIME] - frameTime));
                position += (frames[frame + PathConstraintPositionTimeline.VALUE] - position) * percent;
            }
            if (pose == MixPose.setup)
                constraint.position = constraint.data.position + (position - constraint.data.position) * alpha;
            else
                constraint.position += (position - constraint.position) * alpha;
        };
        PathConstraintPositionTimeline.ENTRIES = 2;
        PathConstraintPositionTimeline.PREV_TIME = -2;
        PathConstraintPositionTimeline.PREV_VALUE = -1;
        PathConstraintPositionTimeline.VALUE = 1;
        return PathConstraintPositionTimeline;
    }(CurveTimeline));
    spine.PathConstraintPositionTimeline = PathConstraintPositionTimeline;
    egret.registerClass(PathConstraintPositionTimeline,'spine.PathConstraintPositionTimeline');
    var PathConstraintSpacingTimeline = (function (_super) {
        __extends(PathConstraintSpacingTimeline, _super);
        function PathConstraintSpacingTimeline(frameCount) {
            _super.call(this, frameCount);
        }
        var d = __define,c=PathConstraintSpacingTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return (TimelineType.pathConstraintSpacing << 24) + this.pathConstraintIndex;
        };
        p.apply = function (skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
            var frames = this.frames;
            var constraint = skeleton.pathConstraints[this.pathConstraintIndex];
            if (time < frames[0]) {
                switch (pose) {
                    case MixPose.setup:
                        constraint.spacing = constraint.data.spacing;
                        return;
                    case MixPose.current:
                        constraint.spacing += (constraint.data.spacing - constraint.spacing) * alpha;
                }
                return;
            }
            var spacing = 0;
            if (time >= frames[frames.length - PathConstraintSpacingTimeline.ENTRIES])
                spacing = frames[frames.length + PathConstraintSpacingTimeline.PREV_VALUE];
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, PathConstraintSpacingTimeline.ENTRIES);
                spacing = frames[frame + PathConstraintSpacingTimeline.PREV_VALUE];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / PathConstraintSpacingTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + PathConstraintSpacingTimeline.PREV_TIME] - frameTime));
                spacing += (frames[frame + PathConstraintSpacingTimeline.VALUE] - spacing) * percent;
            }
            if (pose == MixPose.setup)
                constraint.spacing = constraint.data.spacing + (spacing - constraint.data.spacing) * alpha;
            else
                constraint.spacing += (spacing - constraint.spacing) * alpha;
        };
        return PathConstraintSpacingTimeline;
    }(PathConstraintPositionTimeline));
    spine.PathConstraintSpacingTimeline = PathConstraintSpacingTimeline;
    egret.registerClass(PathConstraintSpacingTimeline,'spine.PathConstraintSpacingTimeline');
    var PathConstraintMixTimeline = (function (_super) {
        __extends(PathConstraintMixTimeline, _super);
        function PathConstraintMixTimeline(frameCount) {
            _super.call(this, frameCount);
            this.frames = spine.Utils.newFloatArray(frameCount * PathConstraintMixTimeline.ENTRIES);
        }
        var d = __define,c=PathConstraintMixTimeline,p=c.prototype;
        p.getPropertyId = function () {
            return (TimelineType.pathConstraintMix << 24) + this.pathConstraintIndex;
        };
        /** Sets the time and mixes of the specified keyframe. */
        p.setFrame = function (frameIndex, time, rotateMix, translateMix) {
            frameIndex *= PathConstraintMixTimeline.ENTRIES;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + PathConstraintMixTimeline.ROTATE] = rotateMix;
            this.frames[frameIndex + PathConstraintMixTimeline.TRANSLATE] = translateMix;
        };
        p.apply = function (skeleton, lastTime, time, firedEvents, alpha, pose, direction) {
            var frames = this.frames;
            var constraint = skeleton.pathConstraints[this.pathConstraintIndex];
            if (time < frames[0]) {
                switch (pose) {
                    case MixPose.setup:
                        constraint.rotateMix = constraint.data.rotateMix;
                        constraint.translateMix = constraint.data.translateMix;
                        return;
                    case MixPose.current:
                        constraint.rotateMix += (constraint.data.rotateMix - constraint.rotateMix) * alpha;
                        constraint.translateMix += (constraint.data.translateMix - constraint.translateMix) * alpha;
                }
                return;
            }
            var rotate = 0, translate = 0;
            if (time >= frames[frames.length - PathConstraintMixTimeline.ENTRIES]) {
                rotate = frames[frames.length + PathConstraintMixTimeline.PREV_ROTATE];
                translate = frames[frames.length + PathConstraintMixTimeline.PREV_TRANSLATE];
            }
            else {
                // Interpolate between the previous frame and the current frame.
                var frame = Animation.binarySearch(frames, time, PathConstraintMixTimeline.ENTRIES);
                rotate = frames[frame + PathConstraintMixTimeline.PREV_ROTATE];
                translate = frames[frame + PathConstraintMixTimeline.PREV_TRANSLATE];
                var frameTime = frames[frame];
                var percent = this.getCurvePercent(frame / PathConstraintMixTimeline.ENTRIES - 1, 1 - (time - frameTime) / (frames[frame + PathConstraintMixTimeline.PREV_TIME] - frameTime));
                rotate += (frames[frame + PathConstraintMixTimeline.ROTATE] - rotate) * percent;
                translate += (frames[frame + PathConstraintMixTimeline.TRANSLATE] - translate) * percent;
            }
            if (pose == MixPose.setup) {
                constraint.rotateMix = constraint.data.rotateMix + (rotate - constraint.data.rotateMix) * alpha;
                constraint.translateMix = constraint.data.translateMix + (translate - constraint.data.translateMix) * alpha;
            }
            else {
                constraint.rotateMix += (rotate - constraint.rotateMix) * alpha;
                constraint.translateMix += (translate - constraint.translateMix) * alpha;
            }
        };
        PathConstraintMixTimeline.ENTRIES = 3;
        PathConstraintMixTimeline.PREV_TIME = -3;
        PathConstraintMixTimeline.PREV_ROTATE = -2;
        PathConstraintMixTimeline.PREV_TRANSLATE = -1;
        PathConstraintMixTimeline.ROTATE = 1;
        PathConstraintMixTimeline.TRANSLATE = 2;
        return PathConstraintMixTimeline;
    }(CurveTimeline));
    spine.PathConstraintMixTimeline = PathConstraintMixTimeline;
    egret.registerClass(PathConstraintMixTimeline,'spine.PathConstraintMixTimeline');
})(spine || (spine = {}));
//# sourceMappingURL=Animation.js.map