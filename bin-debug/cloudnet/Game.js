var cloudnet;
(function (cloudnet) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.call(this);
            this.lastTime = 0;
            var shape = new egret.Shape();
            shape.graphics.beginFill(0x00ff00);
            shape.graphics.drawRect(0, 0, 720, 1280);
            shape.graphics.endFill();
            this.addChild(shape);
            var data = {
                queen: 'idle_1',
                alien: 'death',
                sword: 'A_2_idle',
                coin: 'rotate',
                spineboy: 'death',
                tank: 'drive',
                spineboy_ess: 'death',
                alien_36: 'death',
            };
            var key = 'spineboy_ess'; //queen//sword//alien
            var json_txt = RES.getRes(key + "_json");
            var atlas_txt = RES.getRes(key + "_atlas");
            var atlas_png = RES.getRes(key + "_png");
            var obj = {};
            obj[(key + ".png")] = atlas_png;
            var atlas = spine.SpineUtil.createTextureAtlas(atlas_txt, obj);
            var ske_data = spine.SpineUtil.createSkeletonData(json_txt, atlas);
            var ske_renderer = new spine.SkeletonRenderer(ske_data);
            this.addChild(ske_renderer);
            this.ske_renderer = ske_renderer;
            ske_renderer.scaleX = ske_renderer.scaleY = 0.5;
            ske_renderer.scaleY *= -1;
            ske_renderer.x = 300;
            ske_renderer.y = 500;
            ske_renderer.update(1);
            egret.log("A");
            ske_renderer.state.setAnimation(0, data[key], true);
            this.t = new egret.Timer(1000);
            this.t.addEventListener(egret.TimerEvent.TIMER, this.onTimer, this);
            this.t.start();
            /*
            let json = await loadText('assets/' + name + '.json');
            let atlas = await loadText('assets/' + name + '.atlas');
            let texAtlas = spine.createTextureAtlas(atlas, {
                [name + '.png']: await loadImage('assets/' + name + '.png')
            });
            let skelData = spine.createSkeletonData(json, texAtlas);

            return new spine.SkeletonAnimation(skelData);
            */
            this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
            this.addEventListener(egret.Event.ENTER_FRAME, this.onFrame, this);
        }
        var d = __define,c=Game,p=c.prototype;
        p.onAddedToStage = function (e) {
            this.lastTime = Date.now() / 1000;
            this.ske_renderer.skeleton.setToSetupPose();
        };
        p.onFrame = function (e) {
            var now = Date.now() / 1000;
            var dt = now - this.lastTime;
            this.ske_renderer.update(dt);
            this.lastTime = now;
            egret.warn(dt);
        };
        p.onTimer = function () {
            // this.ske_renderer.update(1);
        };
        return Game;
    }(egret.Sprite));
    cloudnet.Game = Game;
    egret.registerClass(Game,'cloudnet.Game');
})(cloudnet || (cloudnet = {}));
//# sourceMappingURL=Game.js.map