module spine {

	/**
	 * 
	 */
	export class SkeletonRenderer extends egret.DisplayObjectContainer {

		public skeleton: Skeleton;
		public skeletonData: SkeletonData;
		public state: AnimationState;
		public stateData: AnimationStateData;
		public slotRenderers: SlotRenderer[] = [];
		private colored: boolean = false;

		/**
		 * 
		 */
		public constructor(skeletonData: SkeletonData) {
			super();

			this.stateData = new AnimationStateData(skeletonData);
			this.state = new AnimationState(this.stateData);
			this.skeleton = new Skeleton(skeletonData);
			this.skeleton.updateWorldTransform();

			for (let slot of this.skeleton.slots) {
				let renderer = new SlotRenderer();

				renderer.name = slot.data.name;
				this.slotRenderers.push(renderer);
				this.addChild(renderer);
				renderer.renderSlot(slot, this.skeleton, this.colored);
				this.colored = renderer.colored;
			}
		}

		public update(dt: number) {
			this.state.update(dt);
			this.state.apply(this.skeleton);
			this.skeleton.updateWorldTransform();

			let drawOrder = this.skeleton.drawOrder;
			let slots = this.skeleton.slots;

			for (let i = 0; i < drawOrder.length; i++) {
				let slot = drawOrder[i].data.index;
				this.setChildIndex(this.slotRenderers[slot], i);
			}
			for (let i = 0; i < slots.length; i++) {
				let renderer = this.slotRenderers[i];

				renderer.renderSlot(slots[i], this.skeleton, this.colored);
				this.colored = renderer.colored;
			}
		}
	}
}