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
    var AssetManager = (function () {
        function AssetManager(textureLoader, pathPrefix) {
            if (pathPrefix === void 0) { pathPrefix = ""; }
            this.assets = {};
            this.errors = {};
            this.toLoad = 0;
            this.loaded = 0;
            this.textureLoader = textureLoader;
            this.pathPrefix = pathPrefix;
        }
        var d = __define,c=AssetManager,p=c.prototype;
        p.loadText = function (path, success, error) {
            var _this = this;
            if (success === void 0) { success = null; }
            if (error === void 0) { error = null; }
            path = this.pathPrefix + path;
            this.toLoad++;
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState == XMLHttpRequest.DONE) {
                    if (request.status >= 200 && request.status < 300) {
                        _this.assets[path] = request.responseText;
                        if (success)
                            success(path, request.responseText);
                    }
                    else {
                        _this.errors[path] = "Couldn't load text " + path + ": status " + request.status + ", " + request.responseText;
                        if (error)
                            error(path, "Couldn't load text " + path + ": status " + request.status + ", " + request.responseText);
                    }
                    _this.toLoad--;
                    _this.loaded++;
                }
            };
            request.open("GET", path, true);
            request.send();
        };
        p.loadTexture = function (path, success, error) {
            var _this = this;
            if (success === void 0) { success = null; }
            if (error === void 0) { error = null; }
            path = this.pathPrefix + path;
            this.toLoad++;
            var img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = function (ev) {
                var texture = _this.textureLoader(img);
                _this.assets[path] = texture;
                _this.toLoad--;
                _this.loaded++;
                if (success)
                    success(path, img);
            };
            img.onerror = function (ev) {
                _this.errors[path] = "Couldn't load image " + path;
                _this.toLoad--;
                _this.loaded++;
                if (error)
                    error(path, "Couldn't load image " + path);
            };
            img.src = path;
        };
        p.loadTextureData = function (path, data, success, error) {
            var _this = this;
            if (success === void 0) { success = null; }
            if (error === void 0) { error = null; }
            path = this.pathPrefix + path;
            this.toLoad++;
            var img = new Image();
            img.onload = function (ev) {
                var texture = _this.textureLoader(img);
                _this.assets[path] = texture;
                _this.toLoad--;
                _this.loaded++;
                if (success)
                    success(path, img);
            };
            img.onerror = function (ev) {
                _this.errors[path] = "Couldn't load image " + path;
                _this.toLoad--;
                _this.loaded++;
                if (error)
                    error(path, "Couldn't load image " + path);
            };
            img.src = data;
        };
        p.get = function (path) {
            path = this.pathPrefix + path;
            return this.assets[path];
        };
        p.remove = function (path) {
            path = this.pathPrefix + path;
            var asset = this.assets[path];
            if (asset.dispose)
                asset.dispose();
            this.assets[path] = null;
        };
        p.removeAll = function () {
            for (var key in this.assets) {
                var asset = this.assets[key];
                if (asset.dispose)
                    asset.dispose();
            }
            this.assets = {};
        };
        p.isLoadingComplete = function () {
            return this.toLoad == 0;
        };
        p.getToLoad = function () {
            return this.toLoad;
        };
        p.getLoaded = function () {
            return this.loaded;
        };
        p.dispose = function () {
            this.removeAll();
        };
        p.hasErrors = function () {
            return Object.keys(this.errors).length > 0;
        };
        p.getErrors = function () {
            return this.errors;
        };
        return AssetManager;
    }());
    spine.AssetManager = AssetManager;
    egret.registerClass(AssetManager,'spine.AssetManager',["spine.Disposable"]);
})(spine || (spine = {}));
//# sourceMappingURL=AssetManager.js.map