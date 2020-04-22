module spine {
	export class SlotRenderer extends egret.DisplayObjectContainer {
		public colored: boolean = false;
		private currentSprite: egret.DisplayObject;
		private colorFilter: egret.ColorMatrixFilter;

		public renderSlot(slot: Slot, skeleton: Skeleton, colored: boolean) {
			let bone = slot.bone;
			let attachment = slot.getAttachment() as RegionAttachment;
			let matrix = this.matrix;

			// update transform.
			matrix.a = bone.a;
			matrix.b = bone.c;
			matrix.c = bone.b;
			matrix.d = bone.d;
			matrix.tx = bone.worldX;
			matrix.ty = bone.worldY;
			this.matrix = matrix;

			if (slot.data.blendMode == BlendMode.Additive) {
				this.blendMode = egret.BlendMode.ADD;
			}
			else {
				this.blendMode = egret.BlendMode.NORMAL;
			}
			// update color.
			if (attachment) {
				let r = skeleton.color.r * slot.color.r * attachment.color.r;
				let g = skeleton.color.g * slot.color.g * attachment.color.g;
				let b = skeleton.color.b * slot.color.b * attachment.color.b;
				this.alpha = skeleton.color.a * slot.color.a * attachment.color.a;
				this.colored = colored || (r & g & b) !== 1;

				if (this.colored) {
					if (!this.colorFilter) {
						this.colorFilter = new egret.ColorMatrixFilter();
					}
					this.colorFilter.matrix[0] = r;
					this.colorFilter.matrix[6] = g;
					this.colorFilter.matrix[13] = b;
					if (!this.filters) {
						this.filters = [this.colorFilter];
					}
				} else {
					this.filters = null;
				}
			}
			// only RegionAttachment is supported.
			if (attachment instanceof RegionAttachment) {
				let region = attachment.region as TextureAtlasRegion;
				let currentName = this.currentSprite ? this.currentSprite.name : '';
				let regionName = region ? region.name : '';
				this.visible = true;

				// attachment changed.
				if (currentName != regionName) {
					if (this.currentSprite) {
						this.currentSprite.visible = false;
						this.currentSprite = null;
					}
					if (region) {
						this.currentSprite = this.getChildByName(regionName) ||
							this.createSprite(attachment, region);
						this.currentSprite.visible = true;
					}
				}

			} else {
				this.visible = false;
			}
		}

		private createSprite(attachment: RegionAttachment, region: TextureAtlasRegion) {
			let sheet = (region.texture as AdapterTexture).spriteSheet;
			let texture = sheet.getTexture(region.name) || region.rotate
				? sheet.createTexture(
					region.name,
					region.x, region.y,
					region.height, region.width,
					region.offsetX, region.offsetY,
					region.originalHeight, region.originalWidth
				)
				: sheet.createTexture(
					region.name,
					region.x, region.y,
					region.width, region.height,
					region.offsetX, region.offsetY,
					region.originalWidth, region.originalHeight
				);
			let sprite = new egret.Bitmap(texture);

			sprite.name = region.name;
			sprite.x = attachment.x;
			sprite.y = attachment.y;
			sprite.anchorOffsetX = 0.5 * sprite.width;
			sprite.anchorOffsetY = 0.5 * sprite.height;
			sprite.scaleX = attachment.scaleX * (attachment.width / region.width);
			sprite.scaleY = -attachment.scaleY * (attachment.height / region.height);
			sprite.rotation = attachment.rotation;
			if (region.rotate) {
				sprite.rotation -= 90;
			}
			this.addChild(sprite);

			return sprite;
		}
	}
}