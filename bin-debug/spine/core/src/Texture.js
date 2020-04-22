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
    var Texture = (function () {
        function Texture(image) {
            this._image = image;
        }
        var d = __define,c=Texture,p=c.prototype;
        p.getImage = function () {
            return this._image;
        };
        Texture.filterFromString = function (text) {
            switch (text.toLowerCase()) {
                case "nearest": return TextureFilter.Nearest;
                case "linear": return TextureFilter.Linear;
                case "mipmap": return TextureFilter.MipMap;
                case "mipmapnearestnearest": return TextureFilter.MipMapNearestNearest;
                case "mipmaplinearnearest": return TextureFilter.MipMapLinearNearest;
                case "mipmapnearestlinear": return TextureFilter.MipMapNearestLinear;
                case "mipmaplinearlinear": return TextureFilter.MipMapLinearLinear;
                default: throw new Error("Unknown texture filter " + text);
            }
        };
        Texture.wrapFromString = function (text) {
            switch (text.toLowerCase()) {
                case "mirroredtepeat": return TextureWrap.MirroredRepeat;
                case "clamptoedge": return TextureWrap.ClampToEdge;
                case "repeat": return TextureWrap.Repeat;
                default: throw new Error("Unknown texture wrap " + text);
            }
        };
        return Texture;
    }());
    spine.Texture = Texture;
    egret.registerClass(Texture,'spine.Texture');
    (function (TextureFilter) {
        TextureFilter[TextureFilter["Nearest"] = 9728] = "Nearest";
        TextureFilter[TextureFilter["Linear"] = 9729] = "Linear";
        TextureFilter[TextureFilter["MipMap"] = 9987] = "MipMap";
        TextureFilter[TextureFilter["MipMapNearestNearest"] = 9984] = "MipMapNearestNearest";
        TextureFilter[TextureFilter["MipMapLinearNearest"] = 9985] = "MipMapLinearNearest";
        TextureFilter[TextureFilter["MipMapNearestLinear"] = 9986] = "MipMapNearestLinear";
        TextureFilter[TextureFilter["MipMapLinearLinear"] = 9987] = "MipMapLinearLinear"; // WebGLRenderingContext.LINEAR_MIPMAP_LINEAR
    })(spine.TextureFilter || (spine.TextureFilter = {}));
    var TextureFilter = spine.TextureFilter;
    (function (TextureWrap) {
        TextureWrap[TextureWrap["MirroredRepeat"] = 33648] = "MirroredRepeat";
        TextureWrap[TextureWrap["ClampToEdge"] = 33071] = "ClampToEdge";
        TextureWrap[TextureWrap["Repeat"] = 10497] = "Repeat"; // WebGLRenderingContext.REPEAT
    })(spine.TextureWrap || (spine.TextureWrap = {}));
    var TextureWrap = spine.TextureWrap;
    var TextureRegion = (function () {
        function TextureRegion() {
            this.u = 0;
            this.v = 0;
            this.u2 = 0;
            this.v2 = 0;
            this.width = 0;
            this.height = 0;
            this.rotate = false;
            this.offsetX = 0;
            this.offsetY = 0;
            this.originalWidth = 0;
            this.originalHeight = 0;
        }
        var d = __define,c=TextureRegion,p=c.prototype;
        return TextureRegion;
    }());
    spine.TextureRegion = TextureRegion;
    egret.registerClass(TextureRegion,'spine.TextureRegion');
})(spine || (spine = {}));
//# sourceMappingURL=Texture.js.map