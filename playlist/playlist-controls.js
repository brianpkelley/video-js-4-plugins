
	/*********************************/
	/*           Previous            */
	/*********************************/
	videojs.PlaylistPrevious = videojs.Button.extend({
		init: function( player, options ) {
			videojs.Button.call(this, player, options);

			this.on( 'mousedown', videojs.bind( this, this.onMouseDown ) );

		}
	});

	videojs.PlaylistPrevious.prototype.createEl = function(type, props) {
		return vjs.Button.prototype.createEl.call(this, 'div', vjs.obj.merge({
			className: 'vjs-playlist-previous',
			innerHTML: '<span class="icon-chevron-up"></span>'
		}, props));
	};

	videojs.PlaylistPrevious.prototype.onMouseDown = function() {
		videojs.one( document.body, 'mouseup', videojs.bind( this, this.onMouseUp ) );
		this.moveIncrement_ = -4;
		this.clickAndHoldTimer_ = setTimeout( videojs.bind(this, this.onClickAndHold ), 100 );
		this.player().playlist.userInteraction( true );
	};

	videojs.PlaylistPrevious.prototype.onMouseUp = function() {
		clearTimeout( this.clickAndHoldTimer_ );
		clearTimeout( this.moveTimer_ );
		clearTimeout( this.moveIncrementTimer_ );
	};

	videojs.PlaylistPrevious.prototype.onClickAndHold = function() {
		this.clickAndHold = true;
		this.moveIncrementTimer_ = setTimeout( videojs.bind( this, function() { this.moveIncrement_ = -8; } ), 5000 );
		this.doClickAndHold_();

	};

	videojs.PlaylistPrevious.prototype.doClickAndHold_ = function() {
		this.player().playlist.moveBy( this.moveIncrement_ );

		this.moveTimer_ = setTimeout( videojs.bind( this, this.doClickAndHold_), 10 );
	};

	videojs.PlaylistPrevious.prototype.onClick = function() {
		if ( !this.clickAndHold_ ) {
			this.player().playlist.moveToPrevious();
		}
		this.clickAndHold = false;
	};

	/*****************************/
	/*           Next            */
	/*****************************/
	videojs.PlaylistNext = videojs.Button.extend({
		init: function( player, options ) {
			videojs.Button.call(this, player, options);

			this.on( 'mousedown', videojs.bind( this, this.onMouseDown ) );
		}
	});

	videojs.PlaylistNext.prototype.createEl = function(type, props) {
		return vjs.Button.prototype.createEl.call(this, 'div', vjs.obj.merge({
			className: 'vjs-playlist-next',
			innerHTML: '<span class="icon-chevron-down"></span>'
		}, props));
	};

	videojs.PlaylistNext.prototype.onMouseDown = function() {
		videojs.one( document.body, 'mouseup', videojs.bind( this, this.onMouseUp ) );
		this.moveIncrement_ = 4;
		this.clickAndHoldTimer_ = setTimeout( videojs.bind(this, this.onClickAndHold ), 100 );
		this.player().playlist.userInteraction( true );
	};

	videojs.PlaylistNext.prototype.onMouseUp = function() {
		clearTimeout( this.clickAndHoldTimer_ );
		clearTimeout( this.moveTimer_ );
		clearTimeout( this.moveIncrementTimer_ );
	};

	videojs.PlaylistNext.prototype.onClickAndHold = function() {
		this.clickAndHold = true;
		this.moveIncrementTimer_ = setTimeout( videojs.bind( this, function() { this.moveIncrement_ = 8; } ), 5000 );
		this.doClickAndHold_();

	};

	videojs.PlaylistNext.prototype.doClickAndHold_ = function() {
		this.player().playlist.moveBy( this.moveIncrement_ );

		this.moveTimer_ = setTimeout( videojs.bind( this, this.doClickAndHold_ ), 10 );
	};

	videojs.PlaylistNext.prototype.onClick = function() {
		if ( !this.clickAndHold_ ) {
			this.player().playlist.moveToNext();
		}
		this.clickAndHold = false;
	};






/**
 * Move to the next Item video
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @class
 * @extends vjs.Button
 */
vjs.AdvancePlaylist = vjs.Button.extend({
  /**
   * @constructor
   * @memberof vjs.AdvancePlaylist
   * @instance
   */
  init: function(player, options){
    vjs.Button.call(this, player, options);
  }
});

vjs.AdvancePlaylist.prototype.buttonText = 'Next Item';

vjs.AdvancePlaylist.prototype.buildCSSClass = function(){
  return 'icon-step-forward ' + vjs.Button.prototype.buildCSSClass.call(this);
};

vjs.AdvancePlaylist.prototype.onClick = function(){
	this.player().playlist.loadNext();
};








/**
 * Move to the previous Item video
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @class
 * @extends vjs.Button
 */
vjs.RegressPlaylist = vjs.Button.extend({
  /**
   * @constructor
   * @memberof vjs.RegressPlaylist
   * @instance
   */
  init: function(player, options){
    vjs.Button.call(this, player, options);
  }
});

vjs.RegressPlaylist.prototype.buttonText = 'Previous Item';

vjs.RegressPlaylist.prototype.buildCSSClass = function(){
  return 'icon-step-backward ' + vjs.Button.prototype.buildCSSClass.call(this);
};

vjs.RegressPlaylist.prototype.onClick = function(){
	this.player().playlist.loadPrevious();
};




/**
 * Empty button for play toggle placeholder
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @class
 * @extends vjs.Button
 */
vjs.PlaceholderButton = vjs.Button.extend({
  /**
   * @constructor
   * @memberof vjs.RegressPlaylist
   * @instance
   */
  init: function(player, options){
    vjs.Button.call(this, player, options);
		this.el_.style.opacity = 0;
  }
});

vjs.PlaceholderButton.prototype.buttonText = '';

vjs.PlaceholderButton.prototype.buildCSSClass = function(){
  return 'vjs-empty-button ' + vjs.Button.prototype.buildCSSClass.call(this);
};

vjs.PlaceholderButton.prototype.onClick = function(){

};





