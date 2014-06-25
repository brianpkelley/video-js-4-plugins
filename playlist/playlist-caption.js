	/********************************/
	/**      Playlist Caption      **/
	/********************************/
	videojs.PlaylistCaption = videojs.Component.extend({
		init: function( player, options ) {
			videojs.Component.call(this, player, options);
		}
	});
	
	videojs.PlaylistCaption.prototype.createEl = function( type, props ) {
		var el = vjs.Button.prototype.createEl.call(this, 'div', vjs.obj.merge({
			className: 'vjs-playlist-caption',
			innerHTML: ''
		}, props));
		
		return el;
	};
	
	videojs.PlaylistCaption.prototype.showCaption = function( vertical ) {
		if ( vertical && false ) {
			videojs.addClass( this.player().el(), 'vjs-has-playlist-caption' );
			this.player().el().appendChild( this.el_ );
		} else {
			videojs.addClass( this.player().el(), 'vjs-has-playlist-caption' );
		}
	
	};
	
	videojs.PlaylistCaption.prototype.setCaption = function( text ) {
		this.el_.innerHTML = text;
		
	};
	