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
    var Attachment = (function () {
        function Attachment(name) {
            if (name == null)
                throw new Error("name cannot be null.");
            this.name = name;
        }
        var d = __define,c=Attachment,p=c.prototype;
        return Attachment;
    }());
    spine.Attachment = Attachment;
    egret.registerClass(Attachment,'spine.Attachment');
    var VertexAttachment = (function (_super) {
        __extends(VertexAttachment, _super);
        function VertexAttachment(name) {
            _super.call(this, name);
            this.id = (VertexAttachment.nextID++ & 65535) << 11;
            this.worldVerticesLength = 0;
        }
        var d = __define,c=VertexAttachment,p=c.prototype;
        /** Transforms local vertices to world coordinates.
         * @param start The index of the first local vertex value to transform. Each vertex has 2 values, x and y.
         * @param count The number of world vertex values to output. Must be <= {@link #getWorldVerticesLength()} - start.
         * @param worldVertices The output world vertices. Must have a length >= offset + count.
         * @param offset The worldVertices index to begin writing values. */
        p.computeWorldVertices = function (slot, start, count, worldVertices, offset, stride) {
            count = offset + (count >> 1) * stride;
            var skeleton = slot.bone.skeleton;
            var deformArray = slot.attachmentVertices;
            var vertices = this.vertices;
            var bones = this.bones;
            if (bones == null) {
                if (deformArray.length > 0)
                    vertices = deformArray;
                var bone = slot.bone;
                var x = bone.worldX;
                var y = bone.worldY;
                var a = bone.a, b = bone.b, c = bone.c, d = bone.d;
                for (var v_1 = start, w = offset; w < count; v_1 += 2, w += stride) {
                    var vx = vertices[v_1], vy = vertices[v_1 + 1];
                    worldVertices[w] = vx * a + vy * b + x;
                    worldVertices[w + 1] = vx * c + vy * d + y;
                }
                return;
            }
            var v = 0, skip = 0;
            for (var i = 0; i < start; i += 2) {
                var n = bones[v];
                v += n + 1;
                skip += n;
            }
            var skeletonBones = skeleton.bones;
            if (deformArray.length == 0) {
                for (var w = offset, b = skip * 3; w < count; w += stride) {
                    var wx = 0, wy = 0;
                    var n = bones[v++];
                    n += v;
                    for (; v < n; v++, b += 3) {
                        var bone = skeletonBones[bones[v]];
                        var vx = vertices[b], vy = vertices[b + 1], weight = vertices[b + 2];
                        wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                        wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
                    }
                    worldVertices[w] = wx;
                    worldVertices[w + 1] = wy;
                }
            }
            else {
                var deform = deformArray;
                for (var w = offset, b = skip * 3, f = skip << 1; w < count; w += stride) {
                    var wx = 0, wy = 0;
                    var n = bones[v++];
                    n += v;
                    for (; v < n; v++, b += 3, f += 2) {
                        var bone = skeletonBones[bones[v]];
                        var vx = vertices[b] + deform[f], vy = vertices[b + 1] + deform[f + 1], weight = vertices[b + 2];
                        wx += (vx * bone.a + vy * bone.b + bone.worldX) * weight;
                        wy += (vx * bone.c + vy * bone.d + bone.worldY) * weight;
                    }
                    worldVertices[w] = wx;
                    worldVertices[w + 1] = wy;
                }
            }
        };
        /** Returns true if a deform originally applied to the specified attachment should be applied to this attachment. */
        p.applyDeform = function (sourceAttachment) {
            return this == sourceAttachment;
        };
        VertexAttachment.nextID = 0;
        return VertexAttachment;
    }(Attachment));
    spine.VertexAttachment = VertexAttachment;
    egret.registerClass(VertexAttachment,'spine.VertexAttachment');
})(spine || (spine = {}));
//# sourceMappingURL=Attachment.js.map