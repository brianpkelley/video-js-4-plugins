/********************************/
/**     Playlist Container     **/
/********************************/
videojs.Playlist = videojs.Component.extend({
	init: function( player, options) {

		/*
		 * We need to set up the class names as child compontents use this to know which orientation they are in
		 */
		videojs.addClass(player.el(), 'vjs-has-playlist');
		var parentNode = player.el().parentNode;


		if ( options.vertical ) {
			videojs.addClass(player.el(), 'vjs-vertical-playlist');
			if ( parentNode.className.indexOf('video-js-responsive-container') >= 0 ) {
				videojs.addClass(parentNode, 'vjs-vertical-playlist');
			}
		} else {
			videojs.addClass(player.el(), 'vjs-horizontal-playlist');
			if ( parentNode.className.indexOf('video-js-responsive-container') >= 0 ) {
				videojs.addClass(parentNode, 'vjs-horizontal-playlist');
			}
		}

		// Call the base init
		videojs.Component.call(this, player, options);
		
		this.setupPlaylist();

		// Process queue when playlist is loaded
		this.on( 'playlistLoaded', videojs.bind( this, this.playlistLoaded ) );
		
		videojs.on( this.playlistSlider.contentEl(), 'playlistitemclick', videojs.bind( this, function(e) {
			this.userInteraction(false);
			this.player().play();
			this.player().trigger({type: 'playlistload', item: this.items_[e.index]});
		}) );
		
		videojs.on( window, 'resize', videojs.bind( this, this.onResize ) );
		
		// Auto advance
		if ( this.options_.autoAdvance ) {
			this.autoAdvanceFn = videojs.bind( this, function() {
				setTimeout( videojs.bind(this, function() {
					this.loadNext();
					this.player().trigger({type: 'playlistautoload'});
					this.player().play();
					console.log( "auto load" );
					
				}, 50) );
			});
			videojs.on( this.player().el(), 'ended', this.autoAdvanceFn );
		}

		this.playlistCaption.showCaption( this.options_.vertical );

		this.on('click', function(e) {
			e.stopImmediatePropagation();
		});
	}
});
videojs.Playlist.prototype.createEl = function() {
	var props = {
		className: 'vjs-playlist',
		innerHTML: '',
		'aria-live': 'polite', // let the screen reader user know that the text of the button may change
		tabIndex: 0
	};
	return videojs.createEl('div', props);
};

videojs.Playlist.prototype.options_ = {
	"children": {
		"playlistCaption": {},
		"playlistPrevious": {},
		"playlistSlider":{},
		"playlistNext": {}
	}
};

videojs.Playlist.prototype.items_ = [];
videojs.Playlist.prototype.hasPlaylistLoaded_ = false;
videojs.Playlist.prototype.playlistLoadQueue = [];

// Setup
videojs.Playlist.prototype.setupPlaylist = function() {
	if ( this.options_.url ) {
		var separator = "?";
		if ( this.options_.url.indexOf( '?' ) > 0 ) {
			separator = "&";
		}

		videojs.JSONP( this.options_.url + separator + "callback={callback}", videojs.bind( this, function( data ) {
			this.options_.items = data;
			this.createItems();
		}));
	} else { // Not a URL

		this.createItems();
	}
};

videojs.Playlist.prototype.createItems = function() {
	var items = this.options_.items;
	var temp = null;
	this.items_ = [];

	for ( var x = 0; x < items.length; x++ ) {
		if ( items[x] ) {
			this.items_[x] = this.playlistSlider.addChild('playlistItem', items[x] );
		}
	}

	this.trigger({type:'playlistLoaded', items: this.items_ });

	// Load the first item in the playlist
	setTimeout( videojs.bind( this,function() {  this.onResize(); this.loadItem(0); } ), 1000 );
};

// Playlist Load
videojs.Playlist.prototype.playlistLoaded = function(e) {
	this.hasPlaylistLoaded = true;
	this.processPlaylistLoad();
};

videojs.Playlist.prototype.processPlaylistLoad = function() {
	var nextFn;
	while ( ( nextFn = this.playlistLoadQueue.pop() ) !== undefined ) {
		nextFn( this.items_ );
	}
};

videojs.Playlist.prototype.onPlaylistLoad = function( fn ) {
	if ( this.hasPlaylistLoaded ) {
		fn( this.items_ );
	} else {
		this.playlistLoadQueue.push( fn );
	}
};



/** Actions **/


videojs.Playlist.prototype.userInteraction = function( set ) {
	if ( set !== undefined ) {
		this.userInteraction_ = set;


		if ( this.interactionCheck_ ) {
			clearTimeout( this.interactionCheck_ );
		}
		this.interactionCheck_ = setTimeout( videojs.bind( this, function() {
			this.userInteraction_ = false;
			clearTimeout( this.interactionCheck_ );
			this.interactionCheck_ = false;
		}), 20000 );

	}

	return this.userInteraction_;
};

/** Loading Items **/


videojs.Playlist.prototype.loadNext =  function() {
	var nextItem = this.currentItem + 1;

	if ( nextItem < this.items_.length ) {
		this.loadItem( nextItem );
	} else if ( this.options_.loop ) {
		this.loadItem( 0 );
	}
	//this.player().play
};

videojs.Playlist.prototype.loadPrevious =  function() {

	var previousItem = this.currentItem - 1;

	if ( previousItem < 0 ) {
		previousItem = this.items_.length - 1;
	}
	this.loadItem( previousItem );

};

videojs.Playlist.prototype.loadItem = function( item ) {

	var index;
	if ( typeof item === "object" && item.index !== undefined ) {
		index = item.index;
	} else {
		index = item;
	}
	this.currentItem = index;

	this.playlistSlider.select( this.currentItem, !this.userInteraction() );

	// Set the new video source
	this.player().src( { src: this.items_[index].options().src, type: this.items_[index].options().type } );
	// Set the poster... yes all 3
	// set the custom element
	this.player().posterImage.el().style.backgroundImage = 'url('+this.items_[index].options().poster+')';
	// set the poster on the video element
	if ( this.player().tech.el().tagName === "VIDEO" ) {
		this.player().tech.el().poster = this.items_[index].options().poster;
	}
	// future proof
	this.player().poster( this.items_[index].options().poster );

	this.playlistCaption.setCaption( this.items_[index].options().caption );

	//this.trigger({type: 'playlistload', item: this.items_[index]});
};


/** Events **/
videojs.Playlist.prototype.onScroll = function(e) {

	this.firstVisible_ = false;
	this.lastVisible_ = false;
	this.setVisible();

};

videojs.Playlist.prototype.onResize = function( e ) {
	var newSize = this.slidePaneSize();
	// this needs to be set before we can get the maxScroll Size
	this.playlistSlider.setSize( newSize );

	var maxScroll = this.playlistSlider.getMaxScroll();
	
	// We just potentially resized the view pane, so double check the visible objects to preload them.
	this.playlistSlider.setVisible();

	if ( maxScroll <= 0 ) {
		this.playlistNext.hide();
		this.playlistPrevious.hide();
	} else {
		this.playlistNext.show();
		this.playlistPrevious.show();
	}

};


/** Positioning **/
videojs.Playlist.prototype.slidePaneSize = function() {
	var newSlidPaneSize;

	this.playlistPrevious.show();
	this.playlistNext.show();

	if ( this.options_.vertical ) {
		newSlidPaneSize = this.el_.offsetHeight - this.playlistPrevious.el().offsetHeight - this.playlistNext.el().offsetHeight;
	} else {
		newSlidPaneSize = this.el_.offsetWidth - this.playlistPrevious.el().offsetWidth - this.playlistNext.el().offsetWidth;
	}

	return newSlidPaneSize;
};


/** Movement **/

videojs.Playlist.prototype.moveToNext = function() {
	this.playlistSlider.moveToNext( true );
};

videojs.Playlist.prototype.moveToPrevious = function() {
	this.playlistSlider.moveToPrevious( true );
};

videojs.Playlist.prototype.moveToSelected = function( index ) {
	this.playlistSlider.moveToSelected( index );
};

videojs.Playlist.prototype.moveBy = function( pos ) {
	this.playlistSlider.scrollBy( pos );
};






if ( !videojs.JSONP ) {
	videojs.JSONP = function (url, callback) {
		var docHead = document.getElementsByTagName('head')[0];
		function rand() {
			var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
			c = '', i = -1;
			while (++i < 15) c += chars.charAt(Math.floor(Math.random() * 52));
			return c;
		}

		function create(url) {
			var e = url.match(/callback=jsonp.(\w+)/),
			c = e ? e[1] : rand();
			videojs.JSONP[c] = function(data) {
				callback(data);
				delete videojs.JSONP[c];
				docHead.removeChild(script);
			};
			return 'videojs.JSONP.' + c;
		}

		var cb = create(url),
			script = document.createElement('script');
			script.type = 'text/javascript';

			script.src = url.replace(/(\{|%7B)callback(\}|%7D)/ig, cb);
			docHead.appendChild(script);

	};
}



/********************************/
/**           PLUGIN           **/
/********************************/
/**
 * @typedef {Object} PlaylistItem
 * @property {String} thumbnail Url to the thumbnail to be displayed in the playlist.
 * @property {String} poster Url to the poster image displayed by the player before playback starts.
 * @property {String} src Url to the itme to be played.
 * @property {String} type Type of item to be played. Example: "video/mp4" "image/jpg"
 * @property {String} caption Caption to be displayed over the thumbnail or between the playlist and player on horizontal playlists.
 */
/**
 * @namespace plugins.playlist
 */
/**
 * Creates a playlist container displayed either below or besides the main player. Core Functionality is based in {@link videojs.Playlist}
 * You can either specify a url to a JSON encoded playlist or an Object that contains it.
 * @function playlist
 * @memberof plugins.playlist
 * @param {Object} options Options object.
 * @param {Boolean} [options.vertical=false] Tells the player to render a horizontal and beneath playlist or a vertical and to the right playlist.
 * @param {Boolean} [options.autoAdvance=false] Should the player advance to the next item in the playlist once the current item has ended.
 * @param {Boolean} [options.loop=false] If autoAdvance is selected, should the player loop to the first item once the last item has ended.
 * @param {PlaylistItem[]} [options.items] The set of playlist objects.
 * @param {String} [options.url] A url pointing to a JSON encoded playlist file.
 */

/*
"playlist":{
            "vertical": false,
            "autoAdvance": true,
            "loop": true,
            "items": [
              {
                "thumbnail": "http://video2.bettervideo.com/video/WHI/JPG120x90/10.12908667.jpg",
                "poster": "",
                "src": "http://www.designbolts.com/wp-content/uploads/2013/07/Turbo-Wallpaper1.jpg",
                "type": "image/jpg",
                "caption": "Video 3"
              },{
                "thumbnail": "http://video2.bettervideo.com/video/WHI/JPG120x90/10.12908669.jpg",
                "poster": "http://video2.bettervideo.com/video/WHI/JPG120x90/10.12908669.jpg",
                "src": "http://video2.bettervideo.com/video/WHI/MP4480x360/10.12908669.mp4",
                "type": "video/mp4",
                "caption": "Video 1"
              },{
                "thumbnail": "http://video2.bettervideo.com/video/WHI/JPG120x90/10.12908667.jpg",
                "poster": "",
                "src": "http://1.bp.blogspot.com/-aiGt2nvsZS8/Ub754c4Z_jI/AAAAAAAAAF8/eiJPbnzM1FE/s1600/turbo%2Bsnail%2Bmovie.jpg",
                "type": "image/jpg",
                "caption": "Video 3"
              },{
                "thumbnail": "http://video2.bettervideo.com/video/WHI/JPG120x90/10.12914505.jpg",
                "poster": "",
                "src": "http://video2.bettervideo.com/video/WHI/MP4480x360/10.12914505.mp4",
                "type": "video/mp4",
                "caption": "Video 2"
              }


            ]
          }
          */
videojs.plugin('playlist', function(options) {
	this.playlist = this.addChild('playlist', options);

	if ( options.addControls ) {
		this.playlist.advancePlaylistButton = this.controlBar.addChild('advancePlaylist');
		this.playlist.regressPlaylistButton = this.controlBar.addChild('regressPlaylist');


		this.playlist.placeholderButton = this.controlBar.addChild('placeholderButton');

		var controlBarChildren = this.controlBar.el().childNodes;
		var playToggleLocation = 0;

		var playLocation = function() {
			var loc = -1;
			for ( var x = 0; x < controlBarChildren.length; x++ ) {
				if ( controlBarChildren[x].className.indexOf('vjs-play-control') != -1) {
					loc = x;
					break;
				}
			}
			return loc;
		};


		playToggleLocation = playLocation();

		this.controlBar.el().insertBefore( this.playlist.regressPlaylistButton.el(), this.controlBar.el().childNodes[playToggleLocation] );

		playToggleLocation = playLocation();

		this.controlBar.el().insertBefore( this.playlist.advancePlaylistButton.el(), this.controlBar.el().childNodes[playToggleLocation+1] );

		//playToggleLocation = playLocation();

		//this.controlBar.el().insertBefore( this.playlist.placeholderButton.el(), this.controlBar.el().childNodes[playToggleLocation] );
		//this.playlist.placeholderButton.hide();
	}

});