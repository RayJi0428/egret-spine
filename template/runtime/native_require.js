
var game_file_list = [
    //以下为自动修改，请勿修改
    //----auto game_file_list start----
	"libs/modules/egret/egret.js",
	"libs/modules/egret/egret.native.js",
	"libs/modules/game/game.js",
	"libs/modules/game/game.native.js",
	"libs/modules/res/res.js",
	"libs/modules/eui/eui.js",
	"libs/modules/tween/tween.js",
	"libs/modules/dragonBones/dragonBones.js",
	"bin-debug/cloudnet/Game.js",
	"bin-debug/cloudnet/LoadingUI.js",
	"bin-debug/cloudnet/Main.js",
	"bin-debug/spine/core/src/Animation.js",
	"bin-debug/spine/core/src/AnimationState.js",
	"bin-debug/spine/core/src/AnimationStateData.js",
	"bin-debug/spine/core/src/AssetManager.js",
	"bin-debug/spine/core/src/AtlasAttachmentLoader.js",
	"bin-debug/spine/core/src/attachments/Attachment.js",
	"bin-debug/spine/core/src/attachments/AttachmentLoader.js",
	"bin-debug/spine/core/src/attachments/AttachmentType.js",
	"bin-debug/spine/core/src/attachments/BoundingBoxAttachment.js",
	"bin-debug/spine/core/src/attachments/ClippingAttachment.js",
	"bin-debug/spine/core/src/attachments/MeshAttachment.js",
	"bin-debug/spine/core/src/attachments/PathAttachment.js",
	"bin-debug/spine/core/src/attachments/PointAttachment.js",
	"bin-debug/spine/core/src/attachments/RegionAttachment.js",
	"bin-debug/spine/core/src/BlendMode.js",
	"bin-debug/spine/core/src/Bone.js",
	"bin-debug/spine/core/src/BoneData.js",
	"bin-debug/spine/core/src/Constraint.js",
	"bin-debug/spine/core/src/Event.js",
	"bin-debug/spine/core/src/EventData.js",
	"bin-debug/spine/core/src/IkConstraint.js",
	"bin-debug/spine/core/src/IkConstraintData.js",
	"bin-debug/spine/core/src/PathConstraint.js",
	"bin-debug/spine/core/src/PathConstraintData.js",
	"bin-debug/spine/core/src/SharedAssetManager.js",
	"bin-debug/spine/core/src/Skeleton.js",
	"bin-debug/spine/core/src/SkeletonBounds.js",
	"bin-debug/spine/core/src/SkeletonClipping.js",
	"bin-debug/spine/core/src/SkeletonData.js",
	"bin-debug/spine/core/src/SkeletonJson.js",
	"bin-debug/spine/core/src/Skin.js",
	"bin-debug/spine/core/src/Slot.js",
	"bin-debug/spine/core/src/SlotData.js",
	"bin-debug/spine/core/src/Texture.js",
	"bin-debug/spine/core/src/TextureAtlas.js",
	"bin-debug/spine/core/src/TransformConstraint.js",
	"bin-debug/spine/core/src/TransformConstraintData.js",
	"bin-debug/spine/core/src/Triangulator.js",
	"bin-debug/spine/core/src/Updatable.js",
	"bin-debug/spine/core/src/Utils.js",
	"bin-debug/spine/impl/AdapterTexture.js",
	"bin-debug/spine/impl/SkeletonRenderer.js",
	"bin-debug/spine/impl/SlotRenderer.js",
	"bin-debug/spine/impl/SpineUtil.js",
	//----auto game_file_list end----
];

var window = this;

egret_native.setSearchPaths([""]);

egret_native.requireFiles = function () {
    for (var key in game_file_list) {
        var src = game_file_list[key];
        require(src);
    }
};

egret_native.egretInit = function () {
    if(egret_native.featureEnable) {
        //控制一些优化方案是否开启
        egret_native.featureEnable({
            
        });
    }
    egret_native.requireFiles();
    egret.TextField.default_fontFamily = "/system/fonts/DroidSansFallback.ttf";
    //egret.dom为空实现
    egret.dom = {};
    egret.dom.drawAsCanvas = function () {
    };
};

egret_native.egretStart = function () {
    var option = {
        //以下为自动修改，请勿修改
        //----auto option start----
		entryClassName: "Main",
		frameRate: 30,
		scaleMode: "showAll",
		contentWidth: 720,
		contentHeight: 1280,
		showPaintRect: false,
		showFPS: false,
		fpsStyles: "x:0,y:0,size:12,textColor:0xffffff,bgAlpha:0.9",
		showLog: false,
		logFilter: "",
		maxTouches: 2,
		textureScaleFactor: 1
		//----auto option end----
    };

    egret.native.NativePlayer.option = option;
    egret.runEgret();
    egret_native.Label.createLabel(egret.TextField.default_fontFamily, 20, "", 0);
    egret_native.EGTView.preSetOffScreenBufferEnable(true);
};