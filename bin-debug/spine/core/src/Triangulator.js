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
    var Triangulator = (function () {
        function Triangulator() {
            this.convexPolygons = new Array();
            this.convexPolygonsIndices = new Array();
            this.indicesArray = new Array();
            this.isConcaveArray = new Array();
            this.triangles = new Array();
            this.polygonPool = new spine.Pool(function () {
                return new Array();
            });
            this.polygonIndicesPool = new spine.Pool(function () {
                return new Array();
            });
        }
        var d = __define,c=Triangulator,p=c.prototype;
        p.triangulate = function (verticesArray) {
            var vertices = verticesArray;
            var vertexCount = verticesArray.length >> 1;
            var indices = this.indicesArray;
            indices.length = 0;
            for (var i = 0; i < vertexCount; i++)
                indices[i] = i;
            var isConcave = this.isConcaveArray;
            isConcave.length = 0;
            for (var i = 0, n = vertexCount; i < n; ++i)
                isConcave[i] = Triangulator.isConcave(i, vertexCount, vertices, indices);
            var triangles = this.triangles;
            triangles.length = 0;
            while (vertexCount > 3) {
                // Find ear tip.
                var previous = vertexCount - 1, i = 0, next = 1;
                while (true) {
                    outer: if (!isConcave[i]) {
                        var p1 = indices[previous] << 1, p2 = indices[i] << 1, p3 = indices[next] << 1;
                        var p1x = vertices[p1], p1y = vertices[p1 + 1];
                        var p2x = vertices[p2], p2y = vertices[p2 + 1];
                        var p3x = vertices[p3], p3y = vertices[p3 + 1];
                        for (var ii = (next + 1) % vertexCount; ii != previous; ii = (ii + 1) % vertexCount) {
                            if (!isConcave[ii])
                                continue;
                            var v = indices[ii] << 1;
                            var vx = vertices[v], vy = vertices[v + 1];
                            if (Triangulator.positiveArea(p3x, p3y, p1x, p1y, vx, vy)) {
                                if (Triangulator.positiveArea(p1x, p1y, p2x, p2y, vx, vy)) {
                                    if (Triangulator.positiveArea(p2x, p2y, p3x, p3y, vx, vy))
                                        break outer;
                                }
                            }
                        }
                        break;
                    }
                    if (next == 0) {
                        do {
                            if (!isConcave[i])
                                break;
                            i--;
                        } while (i > 0);
                        break;
                    }
                    previous = i;
                    i = next;
                    next = (next + 1) % vertexCount;
                }
                // Cut ear tip.
                triangles.push(indices[(vertexCount + i - 1) % vertexCount]);
                triangles.push(indices[i]);
                triangles.push(indices[(i + 1) % vertexCount]);
                indices.splice(i, 1);
                isConcave.splice(i, 1);
                vertexCount--;
                var previousIndex = (vertexCount + i - 1) % vertexCount;
                var nextIndex = i == vertexCount ? 0 : i;
                isConcave[previousIndex] = Triangulator.isConcave(previousIndex, vertexCount, vertices, indices);
                isConcave[nextIndex] = Triangulator.isConcave(nextIndex, vertexCount, vertices, indices);
            }
            if (vertexCount == 3) {
                triangles.push(indices[2]);
                triangles.push(indices[0]);
                triangles.push(indices[1]);
            }
            return triangles;
        };
        p.decompose = function (verticesArray, triangles) {
            var vertices = verticesArray;
            var convexPolygons = this.convexPolygons;
            this.polygonPool.freeAll(convexPolygons);
            convexPolygons.length = 0;
            var convexPolygonsIndices = this.convexPolygonsIndices;
            this.polygonIndicesPool.freeAll(convexPolygonsIndices);
            convexPolygonsIndices.length = 0;
            var polygonIndices = this.polygonIndicesPool.obtain();
            polygonIndices.length = 0;
            var polygon = this.polygonPool.obtain();
            polygon.length = 0;
            // Merge subsequent triangles if they form a triangle fan.
            var fanBaseIndex = -1, lastWinding = 0;
            for (var i = 0, n = triangles.length; i < n; i += 3) {
                var t1 = triangles[i] << 1, t2 = triangles[i + 1] << 1, t3 = triangles[i + 2] << 1;
                var x1 = vertices[t1], y1 = vertices[t1 + 1];
                var x2 = vertices[t2], y2 = vertices[t2 + 1];
                var x3 = vertices[t3], y3 = vertices[t3 + 1];
                // If the base of the last triangle is the same as this triangle, check if they form a convex polygon (triangle fan).
                var merged = false;
                if (fanBaseIndex == t1) {
                    var o = polygon.length - 4;
                    var winding1 = Triangulator.winding(polygon[o], polygon[o + 1], polygon[o + 2], polygon[o + 3], x3, y3);
                    var winding2 = Triangulator.winding(x3, y3, polygon[0], polygon[1], polygon[2], polygon[3]);
                    if (winding1 == lastWinding && winding2 == lastWinding) {
                        polygon.push(x3);
                        polygon.push(y3);
                        polygonIndices.push(t3);
                        merged = true;
                    }
                }
                // Otherwise make this triangle the new base.
                if (!merged) {
                    if (polygon.length > 0) {
                        convexPolygons.push(polygon);
                        convexPolygonsIndices.push(polygonIndices);
                    }
                    else {
                        this.polygonPool.free(polygon);
                        this.polygonIndicesPool.free(polygonIndices);
                    }
                    polygon = this.polygonPool.obtain();
                    polygon.length = 0;
                    polygon.push(x1);
                    polygon.push(y1);
                    polygon.push(x2);
                    polygon.push(y2);
                    polygon.push(x3);
                    polygon.push(y3);
                    polygonIndices = this.polygonIndicesPool.obtain();
                    polygonIndices.length = 0;
                    polygonIndices.push(t1);
                    polygonIndices.push(t2);
                    polygonIndices.push(t3);
                    lastWinding = Triangulator.winding(x1, y1, x2, y2, x3, y3);
                    fanBaseIndex = t1;
                }
            }
            if (polygon.length > 0) {
                convexPolygons.push(polygon);
                convexPolygonsIndices.push(polygonIndices);
            }
            // Go through the list of polygons and try to merge the remaining triangles with the found triangle fans.
            for (var i = 0, n = convexPolygons.length; i < n; i++) {
                polygonIndices = convexPolygonsIndices[i];
                if (polygonIndices.length == 0)
                    continue;
                var firstIndex = polygonIndices[0];
                var lastIndex = polygonIndices[polygonIndices.length - 1];
                polygon = convexPolygons[i];
                var o = polygon.length - 4;
                var prevPrevX = polygon[o], prevPrevY = polygon[o + 1];
                var prevX = polygon[o + 2], prevY = polygon[o + 3];
                var firstX = polygon[0], firstY = polygon[1];
                var secondX = polygon[2], secondY = polygon[3];
                var winding = Triangulator.winding(prevPrevX, prevPrevY, prevX, prevY, firstX, firstY);
                for (var ii = 0; ii < n; ii++) {
                    if (ii == i)
                        continue;
                    var otherIndices = convexPolygonsIndices[ii];
                    if (otherIndices.length != 3)
                        continue;
                    var otherFirstIndex = otherIndices[0];
                    var otherSecondIndex = otherIndices[1];
                    var otherLastIndex = otherIndices[2];
                    var otherPoly = convexPolygons[ii];
                    var x3 = otherPoly[otherPoly.length - 2], y3 = otherPoly[otherPoly.length - 1];
                    if (otherFirstIndex != firstIndex || otherSecondIndex != lastIndex)
                        continue;
                    var winding1 = Triangulator.winding(prevPrevX, prevPrevY, prevX, prevY, x3, y3);
                    var winding2 = Triangulator.winding(x3, y3, firstX, firstY, secondX, secondY);
                    if (winding1 == winding && winding2 == winding) {
                        otherPoly.length = 0;
                        otherIndices.length = 0;
                        polygon.push(x3);
                        polygon.push(y3);
                        polygonIndices.push(otherLastIndex);
                        prevPrevX = prevX;
                        prevPrevY = prevY;
                        prevX = x3;
                        prevY = y3;
                        ii = 0;
                    }
                }
            }
            // Remove empty polygons that resulted from the merge step above.
            for (var i = convexPolygons.length - 1; i >= 0; i--) {
                polygon = convexPolygons[i];
                if (polygon.length == 0) {
                    convexPolygons.splice(i, 1);
                    this.polygonPool.free(polygon);
                    polygonIndices = convexPolygonsIndices[i];
                    convexPolygonsIndices.splice(i, 1);
                    this.polygonIndicesPool.free(polygonIndices);
                }
            }
            return convexPolygons;
        };
        Triangulator.isConcave = function (index, vertexCount, vertices, indices) {
            var previous = indices[(vertexCount + index - 1) % vertexCount] << 1;
            var current = indices[index] << 1;
            var next = indices[(index + 1) % vertexCount] << 1;
            return !this.positiveArea(vertices[previous], vertices[previous + 1], vertices[current], vertices[current + 1], vertices[next], vertices[next + 1]);
        };
        Triangulator.positiveArea = function (p1x, p1y, p2x, p2y, p3x, p3y) {
            return p1x * (p3y - p2y) + p2x * (p1y - p3y) + p3x * (p2y - p1y) >= 0;
        };
        Triangulator.winding = function (p1x, p1y, p2x, p2y, p3x, p3y) {
            var px = p2x - p1x, py = p2y - p1y;
            return p3x * py - p3y * px + px * p1y - p1x * py >= 0 ? 1 : -1;
        };
        return Triangulator;
    }());
    spine.Triangulator = Triangulator;
    egret.registerClass(Triangulator,'spine.Triangulator');
})(spine || (spine = {}));
//# sourceMappingURL=Triangulator.js.map