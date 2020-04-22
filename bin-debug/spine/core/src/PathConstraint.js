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
    var PathConstraint = (function () {
        function PathConstraint(data, skeleton) {
            this.position = 0;
            this.spacing = 0;
            this.rotateMix = 0;
            this.translateMix = 0;
            this.spaces = new Array();
            this.positions = new Array();
            this.world = new Array();
            this.curves = new Array();
            this.lengths = new Array();
            this.segments = new Array();
            if (data == null)
                throw new Error("data cannot be null.");
            if (skeleton == null)
                throw new Error("skeleton cannot be null.");
            this.data = data;
            this.bones = new Array();
            for (var i = 0, n = data.bones.length; i < n; i++)
                this.bones.push(skeleton.findBone(data.bones[i].name));
            this.target = skeleton.findSlot(data.target.name);
            this.position = data.position;
            this.spacing = data.spacing;
            this.rotateMix = data.rotateMix;
            this.translateMix = data.translateMix;
        }
        var d = __define,c=PathConstraint,p=c.prototype;
        p.apply = function () {
            this.update();
        };
        p.update = function () {
            var attachment = this.target.getAttachment();
            if (!(attachment instanceof spine.PathAttachment))
                return;
            var rotateMix = this.rotateMix, translateMix = this.translateMix;
            var translate = translateMix > 0, rotate = rotateMix > 0;
            if (!translate && !rotate)
                return;
            var data = this.data;
            var spacingMode = data.spacingMode;
            var lengthSpacing = spacingMode == spine.SpacingMode.Length;
            var rotateMode = data.rotateMode;
            var tangents = rotateMode == spine.RotateMode.Tangent, scale = rotateMode == spine.RotateMode.ChainScale;
            var boneCount = this.bones.length, spacesCount = tangents ? boneCount : boneCount + 1;
            var bones = this.bones;
            var spaces = spine.Utils.setArraySize(this.spaces, spacesCount), lengths = null;
            var spacing = this.spacing;
            if (scale || lengthSpacing) {
                if (scale)
                    lengths = spine.Utils.setArraySize(this.lengths, boneCount);
                for (var i = 0, n = spacesCount - 1; i < n;) {
                    var bone = bones[i];
                    var setupLength = bone.data.length, x = setupLength * bone.a, y = setupLength * bone.c;
                    var length_1 = Math.sqrt(x * x + y * y);
                    if (scale)
                        lengths[i] = length_1;
                    spaces[++i] = (lengthSpacing ? setupLength + spacing : spacing) * length_1 / setupLength;
                }
            }
            else {
                for (var i = 1; i < spacesCount; i++)
                    spaces[i] = spacing;
            }
            var positions = this.computeWorldPositions(attachment, spacesCount, tangents, data.positionMode == spine.PositionMode.Percent, spacingMode == spine.SpacingMode.Percent);
            var boneX = positions[0], boneY = positions[1], offsetRotation = data.offsetRotation;
            var tip = false;
            if (offsetRotation == 0)
                tip = rotateMode == spine.RotateMode.Chain;
            else {
                tip = false;
                var p = this.target.bone;
                offsetRotation *= p.a * p.d - p.b * p.c > 0 ? spine.MathUtils.degRad : -spine.MathUtils.degRad;
            }
            for (var i = 0, p = 3; i < boneCount; i++, p += 3) {
                var bone = bones[i];
                bone.worldX += (boneX - bone.worldX) * translateMix;
                bone.worldY += (boneY - bone.worldY) * translateMix;
                var x = positions[p], y = positions[p + 1], dx = x - boneX, dy = y - boneY;
                if (scale) {
                    var length_2 = lengths[i];
                    if (length_2 != 0) {
                        var s = (Math.sqrt(dx * dx + dy * dy) / length_2 - 1) * rotateMix + 1;
                        bone.a *= s;
                        bone.c *= s;
                    }
                }
                boneX = x;
                boneY = y;
                if (rotate) {
                    var a = bone.a, b = bone.b, c = bone.c, d = bone.d, r = 0, cos = 0, sin = 0;
                    if (tangents)
                        r = positions[p - 1];
                    else if (spaces[i + 1] == 0)
                        r = positions[p + 2];
                    else
                        r = Math.atan2(dy, dx);
                    r -= Math.atan2(c, a);
                    if (tip) {
                        cos = Math.cos(r);
                        sin = Math.sin(r);
                        var length_3 = bone.data.length;
                        boneX += (length_3 * (cos * a - sin * c) - dx) * rotateMix;
                        boneY += (length_3 * (sin * a + cos * c) - dy) * rotateMix;
                    }
                    else {
                        r += offsetRotation;
                    }
                    if (r > spine.MathUtils.PI)
                        r -= spine.MathUtils.PI2;
                    else if (r < -spine.MathUtils.PI)
                        r += spine.MathUtils.PI2;
                    r *= rotateMix;
                    cos = Math.cos(r);
                    sin = Math.sin(r);
                    bone.a = cos * a - sin * c;
                    bone.b = cos * b - sin * d;
                    bone.c = sin * a + cos * c;
                    bone.d = sin * b + cos * d;
                }
                bone.appliedValid = false;
            }
        };
        p.computeWorldPositions = function (path, spacesCount, tangents, percentPosition, percentSpacing) {
            var target = this.target;
            var position = this.position;
            var spaces = this.spaces, out = spine.Utils.setArraySize(this.positions, spacesCount * 3 + 2), world = null;
            var closed = path.closed;
            var verticesLength = path.worldVerticesLength, curveCount = verticesLength / 6, prevCurve = PathConstraint.NONE;
            if (!path.constantSpeed) {
                var lengths = path.lengths;
                curveCount -= closed ? 1 : 2;
                var pathLength_1 = lengths[curveCount];
                if (percentPosition)
                    position *= pathLength_1;
                if (percentSpacing) {
                    for (var i = 0; i < spacesCount; i++)
                        spaces[i] *= pathLength_1;
                }
                world = spine.Utils.setArraySize(this.world, 8);
                for (var i = 0, o = 0, curve = 0; i < spacesCount; i++, o += 3) {
                    var space = spaces[i];
                    position += space;
                    var p = position;
                    if (closed) {
                        p %= pathLength_1;
                        if (p < 0)
                            p += pathLength_1;
                        curve = 0;
                    }
                    else if (p < 0) {
                        if (prevCurve != PathConstraint.BEFORE) {
                            prevCurve = PathConstraint.BEFORE;
                            path.computeWorldVertices(target, 2, 4, world, 0, 2);
                        }
                        this.addBeforePosition(p, world, 0, out, o);
                        continue;
                    }
                    else if (p > pathLength_1) {
                        if (prevCurve != PathConstraint.AFTER) {
                            prevCurve = PathConstraint.AFTER;
                            path.computeWorldVertices(target, verticesLength - 6, 4, world, 0, 2);
                        }
                        this.addAfterPosition(p - pathLength_1, world, 0, out, o);
                        continue;
                    }
                    // Determine curve containing position.
                    for (;; curve++) {
                        var length_4 = lengths[curve];
                        if (p > length_4)
                            continue;
                        if (curve == 0)
                            p /= length_4;
                        else {
                            var prev = lengths[curve - 1];
                            p = (p - prev) / (length_4 - prev);
                        }
                        break;
                    }
                    if (curve != prevCurve) {
                        prevCurve = curve;
                        if (closed && curve == curveCount) {
                            path.computeWorldVertices(target, verticesLength - 4, 4, world, 0, 2);
                            path.computeWorldVertices(target, 0, 4, world, 4, 2);
                        }
                        else
                            path.computeWorldVertices(target, curve * 6 + 2, 8, world, 0, 2);
                    }
                    this.addCurvePosition(p, world[0], world[1], world[2], world[3], world[4], world[5], world[6], world[7], out, o, tangents || (i > 0 && space == 0));
                }
                return out;
            }
            // World vertices.
            if (closed) {
                verticesLength += 2;
                world = spine.Utils.setArraySize(this.world, verticesLength);
                path.computeWorldVertices(target, 2, verticesLength - 4, world, 0, 2);
                path.computeWorldVertices(target, 0, 2, world, verticesLength - 4, 2);
                world[verticesLength - 2] = world[0];
                world[verticesLength - 1] = world[1];
            }
            else {
                curveCount--;
                verticesLength -= 4;
                world = spine.Utils.setArraySize(this.world, verticesLength);
                path.computeWorldVertices(target, 2, verticesLength, world, 0, 2);
            }
            // Curve lengths.
            var curves = spine.Utils.setArraySize(this.curves, curveCount);
            var pathLength = 0;
            var x1 = world[0], y1 = world[1], cx1 = 0, cy1 = 0, cx2 = 0, cy2 = 0, x2 = 0, y2 = 0;
            var tmpx = 0, tmpy = 0, dddfx = 0, dddfy = 0, ddfx = 0, ddfy = 0, dfx = 0, dfy = 0;
            for (var i = 0, w = 2; i < curveCount; i++, w += 6) {
                cx1 = world[w];
                cy1 = world[w + 1];
                cx2 = world[w + 2];
                cy2 = world[w + 3];
                x2 = world[w + 4];
                y2 = world[w + 5];
                tmpx = (x1 - cx1 * 2 + cx2) * 0.1875;
                tmpy = (y1 - cy1 * 2 + cy2) * 0.1875;
                dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.09375;
                dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.09375;
                ddfx = tmpx * 2 + dddfx;
                ddfy = tmpy * 2 + dddfy;
                dfx = (cx1 - x1) * 0.75 + tmpx + dddfx * 0.16666667;
                dfy = (cy1 - y1) * 0.75 + tmpy + dddfy * 0.16666667;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                dfx += ddfx;
                dfy += ddfy;
                ddfx += dddfx;
                ddfy += dddfy;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                dfx += ddfx;
                dfy += ddfy;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                dfx += ddfx + dddfx;
                dfy += ddfy + dddfy;
                pathLength += Math.sqrt(dfx * dfx + dfy * dfy);
                curves[i] = pathLength;
                x1 = x2;
                y1 = y2;
            }
            if (percentPosition)
                position *= pathLength;
            if (percentSpacing) {
                for (var i = 0; i < spacesCount; i++)
                    spaces[i] *= pathLength;
            }
            var segments = this.segments;
            var curveLength = 0;
            for (var i = 0, o = 0, curve = 0, segment = 0; i < spacesCount; i++, o += 3) {
                var space = spaces[i];
                position += space;
                var p = position;
                if (closed) {
                    p %= pathLength;
                    if (p < 0)
                        p += pathLength;
                    curve = 0;
                }
                else if (p < 0) {
                    this.addBeforePosition(p, world, 0, out, o);
                    continue;
                }
                else if (p > pathLength) {
                    this.addAfterPosition(p - pathLength, world, verticesLength - 4, out, o);
                    continue;
                }
                // Determine curve containing position.
                for (;; curve++) {
                    var length_5 = curves[curve];
                    if (p > length_5)
                        continue;
                    if (curve == 0)
                        p /= length_5;
                    else {
                        var prev = curves[curve - 1];
                        p = (p - prev) / (length_5 - prev);
                    }
                    break;
                }
                // Curve segment lengths.
                if (curve != prevCurve) {
                    prevCurve = curve;
                    var ii = curve * 6;
                    x1 = world[ii];
                    y1 = world[ii + 1];
                    cx1 = world[ii + 2];
                    cy1 = world[ii + 3];
                    cx2 = world[ii + 4];
                    cy2 = world[ii + 5];
                    x2 = world[ii + 6];
                    y2 = world[ii + 7];
                    tmpx = (x1 - cx1 * 2 + cx2) * 0.03;
                    tmpy = (y1 - cy1 * 2 + cy2) * 0.03;
                    dddfx = ((cx1 - cx2) * 3 - x1 + x2) * 0.006;
                    dddfy = ((cy1 - cy2) * 3 - y1 + y2) * 0.006;
                    ddfx = tmpx * 2 + dddfx;
                    ddfy = tmpy * 2 + dddfy;
                    dfx = (cx1 - x1) * 0.3 + tmpx + dddfx * 0.16666667;
                    dfy = (cy1 - y1) * 0.3 + tmpy + dddfy * 0.16666667;
                    curveLength = Math.sqrt(dfx * dfx + dfy * dfy);
                    segments[0] = curveLength;
                    for (ii = 1; ii < 8; ii++) {
                        dfx += ddfx;
                        dfy += ddfy;
                        ddfx += dddfx;
                        ddfy += dddfy;
                        curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                        segments[ii] = curveLength;
                    }
                    dfx += ddfx;
                    dfy += ddfy;
                    curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                    segments[8] = curveLength;
                    dfx += ddfx + dddfx;
                    dfy += ddfy + dddfy;
                    curveLength += Math.sqrt(dfx * dfx + dfy * dfy);
                    segments[9] = curveLength;
                    segment = 0;
                }
                // Weight by segment length.
                p *= curveLength;
                for (;; segment++) {
                    var length_6 = segments[segment];
                    if (p > length_6)
                        continue;
                    if (segment == 0)
                        p /= length_6;
                    else {
                        var prev = segments[segment - 1];
                        p = segment + (p - prev) / (length_6 - prev);
                    }
                    break;
                }
                this.addCurvePosition(p * 0.1, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents || (i > 0 && space == 0));
            }
            return out;
        };
        p.addBeforePosition = function (p, temp, i, out, o) {
            var x1 = temp[i], y1 = temp[i + 1], dx = temp[i + 2] - x1, dy = temp[i + 3] - y1, r = Math.atan2(dy, dx);
            out[o] = x1 + p * Math.cos(r);
            out[o + 1] = y1 + p * Math.sin(r);
            out[o + 2] = r;
        };
        p.addAfterPosition = function (p, temp, i, out, o) {
            var x1 = temp[i + 2], y1 = temp[i + 3], dx = x1 - temp[i], dy = y1 - temp[i + 1], r = Math.atan2(dy, dx);
            out[o] = x1 + p * Math.cos(r);
            out[o + 1] = y1 + p * Math.sin(r);
            out[o + 2] = r;
        };
        p.addCurvePosition = function (p, x1, y1, cx1, cy1, cx2, cy2, x2, y2, out, o, tangents) {
            if (p == 0 || isNaN(p))
                p = 0.0001;
            var tt = p * p, ttt = tt * p, u = 1 - p, uu = u * u, uuu = uu * u;
            var ut = u * p, ut3 = ut * 3, uut3 = u * ut3, utt3 = ut3 * p;
            var x = x1 * uuu + cx1 * uut3 + cx2 * utt3 + x2 * ttt, y = y1 * uuu + cy1 * uut3 + cy2 * utt3 + y2 * ttt;
            out[o] = x;
            out[o + 1] = y;
            if (tangents)
                out[o + 2] = Math.atan2(y - (y1 * uu + cy1 * ut * 2 + cy2 * tt), x - (x1 * uu + cx1 * ut * 2 + cx2 * tt));
        };
        p.getOrder = function () {
            return this.data.order;
        };
        PathConstraint.NONE = -1;
        PathConstraint.BEFORE = -2;
        PathConstraint.AFTER = -3;
        return PathConstraint;
    }());
    spine.PathConstraint = PathConstraint;
    egret.registerClass(PathConstraint,'spine.PathConstraint',["spine.Constraint","spine.Updatable"]);
})(spine || (spine = {}));
//# sourceMappingURL=PathConstraint.js.map