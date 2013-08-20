(function(){
	var gaChecks = 0;
	var gaType = 0;
	
	var queue = [];
	
	var videojsRef = null; // reference to the videojs object from the plugin function
	var lastReportedTime = 0; // avoid duplicates
	var loadedAllData = false;
	var seeking = false;
	
	var eventLimits = {
		loadstart: 			false,	// begin looking for data  --- extra, is it needed?
		loadedmetadata: 	false,	// duration and dimensions loaded
		loadeddata: 		false,	// data at current playback position loaded --- I hope it would be if we are playing
		loadedalldata:	 	false,	// completely loaded
		play: 				true,	// we're playing
		pause: 				true,	// we're not playing
		timeupdate: 		true,	// player progression ( ever 15-250 ms when playing )
		ended: 				true,	// we're finished playing
		durationchange: 	false,	// duration changed, or is known for the first time
		progress: 			false,	// download progress  --- This will be fired A LOT, not needed
		resize: 			true,	// video playback size has changed
		volumechange: 		true,	// Too Loud? Too OLD!
		error:				true,	// Playback error
		fullscreenchange: 	true,	// Goin blind?
		mute:				true,   // No Sound?
		
		seekend: 			true,	// Mouse up on the seekbar / handle
		
		socialclick: 		true	// Click event for better video social plugin
	}
	
	
	var defaults = {
		eventLimits: eventLimits,
		primaryGA: null,
		secondaryGA: null
	}
	var options = {};
	
	
	var debug = 0;
	
	
	
	/***********************************************
	 * Events
	 ***********************************************/
	// begin looking for data
	function onLoadStart( e ) {
		loadedAllData = false;
		if ( ! options.eventLimits.loadstart ) return; // Disable this report
		
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'View',
			'value': null
		});
	}
	
	// duration and dimensions loaded
	function onLoadedMetaData( e ) {
		if ( ! options.eventLimits.loadedmetadata ) return; // Disable this report
		
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Meta Data Loaded',
			'value': null
		});
	}
	
	// data at current playback position loaded
	function onLoadedData( e ) {
		if ( ! options.eventLimits.loadeddata ) return; // Disable this report
		
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Video Data Loading',
			'value': null
		});
	}
	
	// completely loaded
	function onLoadedAllData( e ) {
		if ( ! options.eventLimits.loadedalldata || loadedAllData ) return; // Disable this report
		loadedAllData = true;
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'All Video Data Loaded',
			'value': null
		});
	}
	
	// we're playing
	function onPlay( e ) {
		if ( ! options.eventLimits.play || seeking ) { seeking = false; return; } // Disable this report
		
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Play',
			'value': null
		});
		
	}
	
	// we're not playing
	function onPause( e ) {
		if ( ! options.eventLimits.pause || seeking ) return; // Disable this report
		
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Pause',
			'value': getTime()
		});
	}
	function onSeekBegin( e ) {
		seeking = true;		
		// Add mouse up listener
		videojs.one(document,'mouseup',onSeekEnd);
	}
	
	function onSeekEnd( e ) {	
		if ( ! options.eventLimits.seekend ) return; // Disable this report
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Seek',
			'value': getTime()
		});
	}
	
	function onVolumeBegin( e ) {
		// Add mouse up listener
		videojs.one(document,'mouseup',onVolumeEnd);
	}
	
	function onVolumeEnd( e ) {
		if ( ! options.eventLimits.volumechange ) return; // Disable this report
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Volume Change',
			'value': getVolume()
		});
	}
	
	function onMute( e ) {
		if ( ! options.eventLimits.volumechange ) return; // Disable this report
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Muted',
			'value': videojsRef.muted()
		});
	}
	
	// player progression ( 25, 50, 75 percent )
	function onTimeUpdate( e ) {
		if ( ! options.eventLimits.timeupdate || seeking ) return; // Disable this report
		
		// Need to limit this
		var currentTime = Math.floor( videojsRef.currentTime() )
								
		var percent = Math.floor( (currentTime / videojsRef.duration()) * 100 ) ;
		
		if ( currentTime && lastReportedTime != currentTime && ( percent == 25 || percent == 50 || percent == 75 ) ) {
			
			lastReportedTime = currentTime;
			videoData = getVideoData();
			doTracking({
				'category': videoData.cid,
				'action': videoData.vid,
				'label': 'Progress - ' + percent +'%',
				'value': null
				
			});
		}
		
	}
	
	// we're finished playing
	function onEnded( e ) {
		if ( ! options.eventLimits.ended ) return; // Disable this report
		
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Ended',
			'value': null
		});
	}
	
	// duration changed, or is known for the first time
	function onDurationChange( e ) {
		if ( ! options.eventLimits.durationchange ) return; // Disable this report
		
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Duration Changed',
			'value': null
		});
	}
	
	// download progress
	function onProgress( e ) {
		if ( ! options.eventLimits.progress ) return; // Disable this report
		
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Download Progress',
			'value': null
		});
	}
	
	// video playback size has changed
	function onResize( e ) {
		if ( ! options.eventLimits.resize ) return; // Disable this report
		
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Resize',
			'value': null
		});
	}
	
	// Too Loud? Too OLD!
	function onVolumeChange( e ) {
		if ( ! options.eventLimits.volumechange ) return; // Disable this report
		
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Volume Change',
			'value': null
		});
	}
	
	// Playback error
	function onError( e ) {
		if ( ! options.eventLimits.error ) return; // Disable this report
		
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Playback Error',
			'value': null
		});
	}
	
	// Goin blind?
	function onFullScreenChange( e ) {
		if ( ! options.eventLimits.fullscreen ) return; // Disable this report
		
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Fullscreen',
			'value': null
		});
	}
	
	// Social Plugin
	function onSocialClick( e ) {
		if ( ! options.eventLimits.socialclick ) return; // Disable this report
		
		videoData = getVideoData();
		doTracking({
			'category': videoData.cid,
			'action': videoData.vid,
			'label': 'Social - '+e.kind,
			'value': null
		});
	}
	
	
	function processQueue() {
		if ( gaType ) {
			var tempTracking
			while( tempTracking = queue.pop() ) {
				doTracking( tempTracking );
			}
		}
	}
	
	function doTracking( opt ) {
		
		if ( gaType ) {
			// Send to google
			googleTrack( opt );
		} else {
			queue.push( opt );
		}
	}
	
	
	/***********************************************
	 * Google Code
	 ***********************************************/
	function googleTrack(opt) {
		if ( gaType ) {
			switch( gaType ) {
				case 1: // UA Style
					if ( debug ) { console.log( "[BV Reporting]", gaType, opt ); }
					ga('bv.send', 'event', opt.category, opt.action, opt.label, opt.value);
					if ( options.secondaryGA ) {
						ga('bvSecondary.send', 'event', opt.category, opt.action, opt.label, opt.value);
					}
					break; 
				case 2: // GA Async Style
					if ( debug ) { console.log( "[BV Reporting]", gaType, opt ); }
					_gaq.push(['bv._trackEvent', opt.category, opt.action, opt.label, opt.value]);
					if ( options.secondaryGA ) {
						_gaq.push(['bvSecondary._trackEvent', opt.category, opt.action, opt.label, opt.value]);
					}
					break; 
				case 3: // GA Sync Style
					if ( debug ) { console.log( "[BV Reporting]", gaType, opt ); }
					
					break;
			}
		}
	}
	
	function checkIfAnalyticsLoaded() {
		// Test for all variations of google analytics
		if ( window.ga && window.ga.getAll ) {
			// Do tracking with analytics.js
			gaType = 1;
			ga('create', options.primaryGA, {'name':'bv'});
			if ( options.secondaryGA ) {
				ga('create', options.secondaryGA, {'name':'bvSecondary'});
			}
			processQueue();
		} else if (window._gat && window._gat._getTracker) {
			// Do tracking with async old-style analytics
			gaType = 2;
			_gat._createTracker(options.primaryGA,'bv');
			if ( options.secondaryGA ) {
				_gat._createTracker(options.secondaryGA,'bvSecondary');
			}
			processQueue();
		} else if (window.urchinTracker) {
			// Do tracking with sync old-style analytics
			gaType = 3;
			// Need to find this code ?
			//processQueue();
		} else {
			if ( gaChecks < 10 ) { // 5s, it its not loaded yet... when will it be?
				gaChecks++;
				setTimeout(checkIfAnalyticsLoaded, 500);
			} else {
				// Include ga.js
				gaType = 1;
				
				
				
				(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
				m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
				})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
				
				
				
				ga('create', 'UA-42516461-1', {'name':'bv'});
				if ( options.secondaryGA ) {
					ga('create', options.secondaryGA, {'name':'bvSecondary'});
				}
				
				processQueue();
			}
		}
	}
	
	/***********************************************
	 * Helper code
	 ***********************************************/
	function getTime() {
		return Math.round( videojsRef.currentTime() );
	}
	function getVolume() {
		return Math.round( videojsRef.volume() * 100 );
	}
	function getVideoData() {
		var src;
		if ( videojsRef.el().querySelector('video') !== undefined ) { // HTML5
			var video = videojsRef.el().querySelector('video');
			src = video.src || video.currentSrc;
			
		} else { // FLASH
			var values = deserializeFromQuery( videojsRef.el().querySelector('param[name=flashvars]').value )
			src = decodeURIComponent( values.src );
		}
		var srcSplit = src.split('/');
		
		var filename = srcSplit[srcSplit.length-1];
		var filenameSplit = filename.split('.');
		
		var cid = filenameSplit[0];
		var vid = filenameSplit[1];
		var type = filenameSplit[2];
		
		var returnObj = {
			'cid': cid,
			'vid': vid,
			'filename': filename
		};
		
		return returnObj;
	}
	
	function serializeToJSON( obj ) {
		return JSON.stringify(obj,undefined);
	}
	function deserializeFromJSON(s) {
		return JSON.parse(s);
	}
	function serializeToQuery( obj ) {
		var str = [];
		for(var p in obj)
		   str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		return str.join("&");
	}
	
	function deserializeFromQuery(s) {
		var query = {};
		
		s.replace(/\b([^&=]*)=([^&=]*)\b/g, function (m, a, d) {
			if (typeof query[a] != 'undefined') {
				query[a] += ',' + d;
			} else {
				query[a] = d;
			}
		});
		
		return query;
	}
	
	
	
	/***********************************************
	 * Plugin code
	 ***********************************************/
	
	
	
	videojs.plugin('bvReporting', function(userOptions){
		options = vjs.obj.merge(defaults, userOptions);
		// Initializing
		videojsRef = this;
		
		checkIfAnalyticsLoaded();
		
		// Lets Play Catch ... the event!
		// Native Video.js Events
		
		this.on('loadstart',onLoadStart);					// begin looking for data
		this.on('loadedmetadata',onLoadedMetaData);			// duration and dimensions loaded
		this.on('loadeddata',onLoadedData);					// data at current playback position loaded
		this.on('loadedalldata',onLoadedAllData);			// completely loaded
		this.on('play',onPlay);								// we're playing
		this.on('pause',onPause);							// we're not playing
		this.on('timeupdate',onTimeUpdate);					// player progression ( ever 15-250 ms when playing )
		this.on('ended',onEnded);							// we're finished playing
		this.on('durationchange',onDurationChange);			// duration changed, or is known for the first time
		this.on('progress',onProgress);						// download progress
		this.on('resize',onResize);							// video playback size has changed
		this.on('error',onError);							// Playback error
		this.on('fullscreenchange',onFullScreenChange);		// Goin blind?
		
		this.controlBar.progressControl.seekBar.on('mousedown',onSeekBegin);
		this.controlBar.volumeControl.volumeBar.on('mousedown',onVolumeBegin);
		this.controlBar.muteToggle.on('mouseup',onMute);
		
		// this.controlBar.volumeControl.volumeSlider.volumeBar.on('mousedown',onVolumeBegin);
		// this.controlBar.volumeControl.muteToggle.on('mouseup',onMute);
		
		// BetterVideo Events
		if( videojs.SocialItem ) { // Check if the social items exists
			this.on('socialclick',onSocialClick);
		}
		
		
	});			
})();


