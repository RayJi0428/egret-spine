module spine {
	export class SpineUtil {
		public constructor() {
		}

		public static createSkeletonData(jsonData: string | {}, atlas: TextureAtlas) {
			let json = new SkeletonJson(new AtlasAttachmentLoader(atlas));
			return json.readSkeletonData(jsonData);
		}

		public static createTextureAtlas(atlasData: string, textures: any) {
			return new TextureAtlas(atlasData, (file: string) => {
				return new AdapterTexture(textures[file].bitmapData);
			});
		}
	}
}