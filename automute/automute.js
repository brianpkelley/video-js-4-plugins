/**
 * @fileoverview Automute/restart auto plays the player but muted.
 * @author Brian Kelley
 */


(function() {
	videojs.plugin('automute', automute);

	/** @namespace plugins.autoMuteRestart */
	/**
	 * Function responsible for auto playing and muting the player when a video loads.
	 * Applies the classes "vjs-automute" and "vjs-automute-restart" to the videojs.bigPlayButton.
	 * Once a user interacts with the player either by click on the bigPlayButton or by loading a new video, these classes are removed.
	 *
	 * @plugindesc Auto plays the plugin in a muted state.  Can either play from current location or restart upon user interaction.
	 *
	 * @function automute
	 * @memberof plugins.autoMuteRestart
	 * @param {Object} [options] Specifies the options to overwrite.
	 * @param {Boolean} [options.restart=false] Should the player restart when unmuted / played.
	 */
	function automute( options ) {

		options = videojs.obj.merge( { restart: false }, options );

		var unMute, onLoadFn, onPauseFn, playFn, initialized;

		initialized = false;

		function removeAutomute () {
			//console.log( "begin removeAutomute" );
			setTimeout(videojs.bind( this, function() { this.muted(false); } ), 0 );
			videojs.addClass( this.el(), 'vjs-has-started' );
			videojs.removeClass( this.bigPlayButton.el(), 'vjs-automute' );
			videojs.removeClass( this.bigPlayButton.el(), 'vjs-automute-restart' );
			this.bigPlayButton.hide();

			this.off( 'play', playFn );
			this.off( 'loadstart', unMute );
			//this.off( 'pause', onPauseFn );
			this.bigPlayButton.off( 'click', onPauseFn );
			this.tech.off( 'mousedown', onPauseFn );
			// Clear off any events that may be left over
			this.tech.off( 'mousedown', this.tech.onClick );
			this.tech.on( 'mousedown', this.tech.onClick );
//			console.log( "end removeAutomute" );
		}

		onPauseFn = videojs.bind( this, function( e ) {
//			console.log( "onPause" );
			e.stopImmediatePropagation();
			if ( this.currentTime() == this.duration() ) {
				return;
			}


			if ( options.restart ) {
				this.trigger({type:'restartunmute'});
				this.currentTime(0);
			} else {
				this.trigger({type:'autoplayunmute'});
			}

			//this.play();
			unMute();
		});

		// Setup the actions to un-automute the player only once the automute has been established
		unMute = videojs.bind( this, removeAutomute );

		onLoadFn = videojs.bind( this, function() {
//			console.log( "onLoad" );
			unMute();
		});



		playFn = videojs.bind(this, function() {

			this.muted(true);

			videojs.removeClass( this.el(), 'vjs-has-started' );
			videojs.removeClass( this.el(), 'vjs-playing' );


			this.bigPlayButton.show();

			videojs.addClass( this.bigPlayButton.el(), 'vjs-automute' );
			if ( options.restart ) {
				videojs.addClass( this.bigPlayButton.el(), 'vjs-automute-restart' );
			}

			if ( initialized ) {
				return;
			}

			initialized = true;

			// They clicked the big play button
			this.bigPlayButton.one( 'click', onPauseFn);
			// Which paused it
			this.tech.one('mousedown', onPauseFn);
			this.tech.off('mousedown', this.tech.onClick );


			// Will the playlist auto load the next item?
			if ( typeof this.playlist === 'object' && this.playlist.options().autoAdvance ) {
				//this.one( 'ended', function() {console.log( 'ended' ); });
				this.one( 'playlistload', unMute );
			} else {
				this.one( 'loadstart', unMute );
			}

		});

		this.on( 'play', playFn );

		// Set autoplay and mute
		this.options_.autoplay = true;
		this.options_.automute = true;
		if ( options.restart ) {
			this.options_.automuterestart = true;
		}
		this.autoplay( true );
		

	}
})();