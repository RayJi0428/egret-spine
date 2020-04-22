module spine {
	export class AdapterTexture extends Texture {
		public spriteSheet: egret.SpriteSheet;

		public constructor(bitmapData: egret.BitmapData) {
			super(bitmapData.source);
			let texture = new egret.Texture();
			texture.bitmapData = bitmapData;
			this.spriteSheet = new egret.SpriteSheet(texture);
		}

		/** NIY */
		setFilters(minFilter: TextureFilter, magFilter: TextureFilter): void { }
		setWraps(uWrap: TextureWrap, vWrap: TextureWrap): void { }
		dispose(): void { }
	}
}