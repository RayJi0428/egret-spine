module cloudnet {
	export class Game extends egret.Sprite {

		private t: egret.Timer;

		private ske_renderer: spine.SkeletonRenderer;
		public constructor() {
			super();

			let shape = new egret.Shape();
			shape.graphics.beginFill(0x00ff00);
			shape.graphics.drawRect(0, 0, 720, 1280);
			shape.graphics.endFill();
			this.addChild(shape);

			let data: any = {
				queen: 'idle_1',
				alien: 'death',
				sword: 'A_2_idle',
				coin: 'rotate',
				spineboy: 'death',
				tank: 'drive',
				spineboy_ess: 'death',
				alien_36: 'death',
				
			};
			let key: string = 'spineboy_ess';//queen//sword//alien
			let json_txt: string = RES.getRes(`${key}_json`);
			let atlas_txt: string = RES.getRes(`${key}_atlas`);
			let atlas_png: egret.Texture = RES.getRes(`${key}_png`);
			let obj = {};
			obj[`${key}.png`] = atlas_png;
			let atlas: spine.TextureAtlas = spine.SpineUtil.createTextureAtlas(atlas_txt, obj);
			let ske_data: spine.SkeletonData = spine.SpineUtil.createSkeletonData(json_txt, atlas);
			let ske_renderer: spine.SkeletonRenderer = new spine.SkeletonRenderer(ske_data);
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

		private onAddedToStage(e: egret.Event): void {
			this.lastTime = Date.now() / 1000;
			this.ske_renderer.skeleton.setToSetupPose();
		}
		private lastTime: number = 0;
		private onFrame(e: egret.Event): void {
			let now = Date.now() / 1000;
			let dt = now - this.lastTime;
			this.ske_renderer.update(dt);
			this.lastTime = now;
			egret.warn(dt);
		}

		private onTimer(): void {
			// this.ske_renderer.update(1);
		}
	}
}