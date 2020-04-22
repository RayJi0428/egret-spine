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
    var IntSet = (function () {
        function IntSet() {
            this.array = new Array();
        }
        var d = __define,c=IntSet,p=c.prototype;
        p.add = function (value) {
            var contains = this.contains(value);
            this.array[value | 0] = value | 0;
            return !contains;
        };
        p.contains = function (value) {
            return this.array[value | 0] != undefined;
        };
        p.remove = function (value) {
            this.array[value | 0] = undefined;
        };
        p.clear = function () {
            this.array.length = 0;
        };
        return IntSet;
    }());
    spine.IntSet = IntSet;
    egret.registerClass(IntSet,'spine.IntSet');
    var Color = (function () {
        function Color(r, g, b, a) {
            if (r === void 0) { r = 0; }
            if (g === void 0) { g = 0; }
            if (b === void 0) { b = 0; }
            if (a === void 0) { a = 0; }
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        var d = __define,c=Color,p=c.prototype;
        p.set = function (r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
            this.clamp();
            return this;
        };
        p.setFromColor = function (c) {
            this.r = c.r;
            this.g = c.g;
            this.b = c.b;
            this.a = c.a;
            return this;
        };
        p.setFromString = function (hex) {
            hex = hex.charAt(0) == '#' ? hex.substr(1) : hex;
            this.r = parseInt(hex.substr(0, 2), 16) / 255.0;
            this.g = parseInt(hex.substr(2, 2), 16) / 255.0;
            this.b = parseInt(hex.substr(4, 2), 16) / 255.0;
            this.a = (hex.length != 8 ? 255 : parseInt(hex.substr(6, 2), 16)) / 255.0;
            return this;
        };
        p.add = function (r, g, b, a) {
            this.r += r;
            this.g += g;
            this.b += b;
            this.a += a;
            this.clamp();
            return this;
        };
        p.clamp = function () {
            if (this.r < 0)
                this.r = 0;
            else if (this.r > 1)
                this.r = 1;
            if (this.g < 0)
                this.g = 0;
            else if (this.g > 1)
                this.g = 1;
            if (this.b < 0)
                this.b = 0;
            else if (this.b > 1)
                this.b = 1;
            if (this.a < 0)
                this.a = 0;
            else if (this.a > 1)
                this.a = 1;
            return this;
        };
        Color.WHITE = new Color(1, 1, 1, 1);
        Color.RED = new Color(1, 0, 0, 1);
        Color.GREEN = new Color(0, 1, 0, 1);
        Color.BLUE = new Color(0, 0, 1, 1);
        Color.MAGENTA = new Color(1, 0, 1, 1);
        return Color;
    }());
    spine.Color = Color;
    egret.registerClass(Color,'spine.Color');
    var MathUtils = (function () {
        function MathUtils() {
        }
        var d = __define,c=MathUtils,p=c.prototype;
        MathUtils.clamp = function (value, min, max) {
            if (value < min)
                return min;
            if (value > max)
                return max;
            return value;
        };
        MathUtils.cosDeg = function (degrees) {
            return Math.cos(degrees * MathUtils.degRad);
        };
        MathUtils.sinDeg = function (degrees) {
            return Math.sin(degrees * MathUtils.degRad);
        };
        MathUtils.signum = function (value) {
            return value > 0 ? 1 : value < 0 ? -1 : 0;
        };
        MathUtils.toInt = function (x) {
            return x > 0 ? Math.floor(x) : Math.ceil(x);
        };
        MathUtils.cbrt = function (x) {
            var y = Math.pow(Math.abs(x), 1 / 3);
            return x < 0 ? -y : y;
        };
        MathUtils.PI = 3.1415927;
        MathUtils.PI2 = MathUtils.PI * 2;
        MathUtils.radiansToDegrees = 180 / MathUtils.PI;
        MathUtils.radDeg = MathUtils.radiansToDegrees;
        MathUtils.degreesToRadians = MathUtils.PI / 180;
        MathUtils.degRad = MathUtils.degreesToRadians;
        return MathUtils;
    }());
    spine.MathUtils = MathUtils;
    egret.registerClass(MathUtils,'spine.MathUtils');
    var Utils = (function () {
        function Utils() {
        }
        var d = __define,c=Utils,p=c.prototype;
        Utils.arrayCopy = function (source, sourceStart, dest, destStart, numElements) {
            for (var i = sourceStart, j = destStart; i < sourceStart + numElements; i++, j++) {
                dest[j] = source[i];
            }
        };
        Utils.setArraySize = function (array, size, value) {
            if (value === void 0) { value = 0; }
            var oldSize = array.length;
            if (oldSize == size)
                return array;
            array.length = size;
            if (oldSize < size) {
                for (var i = oldSize; i < size; i++)
                    array[i] = value;
            }
            return array;
        };
        Utils.ensureArrayCapacity = function (array, size, value) {
            if (value === void 0) { value = 0; }
            if (array.length >= size)
                return array;
            return Utils.setArraySize(array, size, value);
        };
        Utils.newArray = function (size, defaultValue) {
            var array = new Array(size);
            for (var i = 0; i < size; i++)
                array[i] = defaultValue;
            return array;
        };
        Utils.newFloatArray = function (size) {
            if (Utils.SUPPORTS_TYPED_ARRAYS) {
                return new Float32Array(size);
            }
            else {
                var array = new Array(size);
                for (var i = 0; i < array.length; i++)
                    array[i] = 0;
                return array;
            }
        };
        Utils.newShortArray = function (size) {
            if (Utils.SUPPORTS_TYPED_ARRAYS) {
                return new Int16Array(size);
            }
            else {
                var array = new Array(size);
                for (var i = 0; i < array.length; i++)
                    array[i] = 0;
                return array;
            }
        };
        Utils.toFloatArray = function (array) {
            return Utils.SUPPORTS_TYPED_ARRAYS ? new Float32Array(array) : array;
        };
        Utils.SUPPORTS_TYPED_ARRAYS = typeof (Float32Array) !== "undefined";
        return Utils;
    }());
    spine.Utils = Utils;
    egret.registerClass(Utils,'spine.Utils');
    var DebugUtils = (function () {
        function DebugUtils() {
        }
        var d = __define,c=DebugUtils,p=c.prototype;
        DebugUtils.logBones = function (skeleton) {
            for (var i = 0; i < skeleton.bones.length; i++) {
                var bone = skeleton.bones[i];
                console.log(bone.data.name + ", " + bone.a + ", " + bone.b + ", " + bone.c + ", " + bone.d + ", " + bone.worldX + ", " + bone.worldY);
            }
        };
        return DebugUtils;
    }());
    spine.DebugUtils = DebugUtils;
    egret.registerClass(DebugUtils,'spine.DebugUtils');
    var Pool = (function () {
        function Pool(instantiator) {
            this.items = new Array();
            this.instantiator = instantiator;
        }
        var d = __define,c=Pool,p=c.prototype;
        p.obtain = function () {
            return this.items.length > 0 ? this.items.pop() : this.instantiator();
        };
        p.free = function (item) {
            if (item.reset)
                item.reset();
            this.items.push(item);
        };
        p.freeAll = function (items) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].reset)
                    items[i].reset();
                this.items[i] = items[i];
            }
        };
        p.clear = function () {
            this.items.length = 0;
        };
        return Pool;
    }());
    spine.Pool = Pool;
    egret.registerClass(Pool,'spine.Pool');
    var Vector2 = (function () {
        function Vector2(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        var d = __define,c=Vector2,p=c.prototype;
        p.set = function (x, y) {
            this.x = x;
            this.y = y;
            return this;
        };
        p.length = function () {
            var x = this.x;
            var y = this.y;
            return Math.sqrt(x * x + y * y);
        };
        p.normalize = function () {
            var len = this.length();
            if (len != 0) {
                this.x /= len;
                this.y /= len;
            }
            return this;
        };
        return Vector2;
    }());
    spine.Vector2 = Vector2;
    egret.registerClass(Vector2,'spine.Vector2');
    var TimeKeeper = (function () {
        function TimeKeeper() {
            this.maxDelta = 0.064;
            this.framesPerSecond = 0;
            this.delta = 0;
            this.totalTime = 0;
            this.lastTime = Date.now() / 1000;
            this.frameCount = 0;
            this.frameTime = 0;
        }
        var d = __define,c=TimeKeeper,p=c.prototype;
        p.update = function () {
            var now = Date.now() / 1000;
            this.delta = now - this.lastTime;
            this.frameTime += this.delta;
            this.totalTime += this.delta;
            if (this.delta > this.maxDelta)
                this.delta = this.maxDelta;
            this.lastTime = now;
            this.frameCount++;
            if (this.frameTime > 1) {
                this.framesPerSecond = this.frameCount / this.frameTime;
                this.frameTime = 0;
                this.frameCount = 0;
            }
        };
        return TimeKeeper;
    }());
    spine.TimeKeeper = TimeKeeper;
    egret.registerClass(TimeKeeper,'spine.TimeKeeper');
    var WindowedMean = (function () {
        function WindowedMean(windowSize) {
            if (windowSize === void 0) { windowSize = 32; }
            this.addedValues = 0;
            this.lastValue = 0;
            this.mean = 0;
            this.dirty = true;
            this.values = new Array(windowSize);
        }
        var d = __define,c=WindowedMean,p=c.prototype;
        p.hasEnoughData = function () {
            return this.addedValues >= this.values.length;
        };
        p.addValue = function (value) {
            if (this.addedValues < this.values.length)
                this.addedValues++;
            this.values[this.lastValue++] = value;
            if (this.lastValue > this.values.length - 1)
                this.lastValue = 0;
            this.dirty = true;
        };
        p.getMean = function () {
            if (this.hasEnoughData()) {
                if (this.dirty) {
                    var mean = 0;
                    for (var i = 0; i < this.values.length; i++) {
                        mean += this.values[i];
                    }
                    this.mean = mean / this.values.length;
                    this.dirty = false;
                }
                return this.mean;
            }
            else {
                return 0;
            }
        };
        return WindowedMean;
    }());
    spine.WindowedMean = WindowedMean;
    egret.registerClass(WindowedMean,'spine.WindowedMean');
})(spine || (spine = {}));
//# sourceMappingURL=Utils.js.map