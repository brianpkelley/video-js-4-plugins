	videojs.PlaylistItem = videojs.Button.extend({
		init: function( player, options ) {
			videojs.Component.call(this, player, options);

			// Once loaded we change this to true to avoid double-loading
			this.loaded = false;


			var touchstart = false;
			this.on('touchstart', function(event) {
				// Stop click and other mouse events from triggering also
				//event.preventDefault();
				touchstart = true;
			});
			this.on('touchmove', function() {
				touchstart = false;
			});
			var self = this;
			this.on('touchend', function(event) {
				if (touchstart) {
					self.onClick(event);
				}
				event.preventDefault();
			});

			this.on('click', this.onClick);
			this.on('focus', this.onFocus);
			this.on('blur', this.onBlur);


			this.addClass( this.options_.type.substr( 0, this.options_.type.indexOf('/') ) );
		}
	});

	videojs.PlaylistItem.prototype.createEl = function(type, props) {
		var el = vjs.Button.prototype.createEl.call(this, 'li', vjs.obj.merge({
			className: 'vjs-playlist-item vjs-item-placeholder ',
			innerHTML: ''
		}, props));

		this.image_ = vjs.Component.prototype.createEl.call( this, 'img', {
			src: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
		});
		this.caption_ = videojs.Component.prototype.createEl.call( this, 'div', {
			className: 'vjs-playlist-item-caption',
			innerHTML: this.options_.caption
		});

		el.appendChild( this.image_ );
		el.appendChild( this.caption_ );

		return el;
	};

	videojs.PlaylistItem.prototype.onClick = function( e ) {
		this.player_.playlist.loadItem( this.options_.index );
		videojs.trigger(this.el_.parentNode, {type: 'playlistitemclick', index: this.options_.index });
	};

	videojs.PlaylistItem.prototype.preload = function() {
		if ( !this.loaded ) {
			this.image_.src = this.options_.thumbnail;
			videojs.on( this.image_, 'load', videojs.bind( this, function () {
				this.loaded = true;
				this.removeClass('vjs-item-placeholder');
			}) );
		}
	};
	
	videojs.PlaylistItem.prototype.setIndex = function( index ) {
		this.options_.index = index;
	};
	
	videojs.PlaylistItem.prototype.getPosition = function() {
		return {
			top: this.el_.offsetTop,
			bottom: this.el_.offsetTop + this.el_.offsetHeight,
			left: this.el_.offsetLeft,
			right: this.el_.offsetLeft + this.el_.offsetWidth
		};
	};