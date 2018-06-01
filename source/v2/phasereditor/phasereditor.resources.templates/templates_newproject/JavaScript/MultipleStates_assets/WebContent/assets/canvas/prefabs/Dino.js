
// -- user code here --

/* --- start generated code --- */

// Generated by Phaser Editor 1.4.3 (Phaser v2.6.2)


/**
 * Dino.
 * @param {Phaser.Game} aGame A reference to the currently running game.
 * @param {Number} aX The x coordinate (in world space) to position the Sprite at.
 * @param {Number} aY The y coordinate (in world space) to position the Sprite at.
 * @param {any} aKey This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture.
 * @param {any} aFrame If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
 */
function Dino(aGame, aX, aY, aKey, aFrame) {
	
	var pKey = aKey === undefined? 'dino' : aKey;
	var pFrame = aFrame === undefined? 1 : aFrame;
	
	Phaser.Sprite.call(this, aGame, aX, aY, pKey, pFrame);
	var _anim_walk = this.animations.add('walk', [8, 9, 10, 11], 6, true);
	var _anim_stay = this.animations.add('stay', [0, 1, 2], 4, true);
	var _anim_jump = this.animations.add('jump', [4, 5], 4, true);
	_anim_stay.play();
	
	// public fields
	
	this.fAnim_walk = _anim_walk;
	this.fAnim_stay = _anim_stay;
	this.fAnim_jump = _anim_jump;
	
}

/** @type Phaser.Sprite */
var Dino_proto = Object.create(Phaser.Sprite.prototype);
Dino.prototype = Dino_proto;
Dino.prototype.constructor = Dino;

/* --- end generated code --- */
// -- user code here --