(function() {
'use strict';
	
	videojs.CallToAction = videojs.Component.extend({
		init: function( player, options ) {
			var addButton = false;
			if ( options.el && options.el.nodeType === 1) {
				this.contentEl_ = options.el;
				delete options.el;
			} else {
				addButton = true;
			}
	
			videojs.Component.call( this, player, options );
			
			if ( addButton ) {
				this.contentEl_ = this.callToActionContainer_;
				this.callToAction_ = this.addChild( 'callToActionButton', this.options_.link );
				this.exitButton.on( 'click', videojs.bind( this, function() {
					this.player_.trigger({type: 'calltoactionclose', actionTime: this.getTime() });
					this.conceal();
				}) );
				
				this.callToAction_.on('click', videojs.bind(this, function() {
					this.player_.trigger({type: 'calltoaction', actionTime: this.getTime() });
				}));
			}
	
			this.timerDisplay.length( this.options_.timer );
	
			this.player_.on( 'ended', videojs.bind( this, this.reveal ) );
			
			
			this.on('click', function(e) {
				e.stopImmediatePropagation();
			});
	
			// Do we have a playlist and does it autoAdvance?
			this.playlistAutoAdvance = false;
			this.playlistCheckTimer = setTimeout( videojs.bind( this, this.playlistCheck ), 1 );
		}
	});
	
	
	videojs.CallToAction.prototype.createEl = function() {
		var el = videojs.Component.prototype.createEl(null, {
			className: 'vjs-call-to-action ',
		});
	
		if ( this.contentEl_ && this.contentEl_.nodeType === 1 ) {
			el.appendChild( this.contentEl_ );
		} else {
			this.title_ = videojs.createEl('h2',{
				innerHTML: this.options_.title
			});
			this.message_ = videojs.createEl('p',{
				innerHTML: this.options_.text
			});
			this.callToActionContainer_ = videojs.createEl('div', {
				className: 'link-container'
			});
			/*this.callToAction_ = videojs.createEl('a',{
				innerHTML: this.options_.link.text,
				href: this.options_.link.url,
				target: '_blank',
				name: 'callToAction'
			});*/
	
			//this.callToActionContainer_.appendChild( this.callToAction_ );
	
			el.appendChild( this.title_ );
			el.appendChild( this.message_ );
			el.appendChild( this.callToActionContainer_ );
		}
	
	
		return el;
	};
	
	videojs.CallToAction.prototype.options_ = {
		title: '',
		text: '',
		link: {
			url: '',
			text: ''
		},
		el: null,
		timer: 30,
		children: {
			exitButton: {},
			timerDisplay: {
				descriptionText: "Time till next item:",
				timeLabel: "s"
			}
		}
	};
	
	videojs.CallToAction.prototype.playlistCheck = function() {
		if ( this.player_.playlist && this.player_.playlist.autoAdvanceFn ) {
			this.playlistAutoAdvance = true;
			this.autoAdvanceFn = this.player_.playlist.autoAdvanceFn;
			
			videojs.off( this.player().el(), 'ended', this.player_.playlist.autoAdvanceFn );
			
			this.timerDisplay.on( 'complete', videojs.bind( this, this.timerComplete ) );
			//this.player_.autoplay( false );
		} else {
			this.timerDisplay.hide();
		}
	
	};
	
	videojs.CallToAction.prototype.reveal = function () {
		this.show();
	
		if ( this.playlistAutoAdvance ) {
			// Load next item
			//this.player_.playlist.loadNext();
			this.player_.pause();
			// Show the timer
			this.timerDisplay.show();
			// Start the display timer
			this.timerDisplay.start();
			/*
				this.displayTime = this.options_.timer;
				this.displayTimerEl_.innerHTML = this.displayTime + " seconds";
			*/
		}
	};
	
	
	
	videojs.CallToAction.prototype.conceal = function() {
		this.hide();
		this.timerDisplay.cancel();
	};
	
	
	videojs.CallToAction.prototype.timerComplete = function() {
		this.hide();
		videojs.bind( this.player_.playlist, this.autoAdvanceFn )();
	};
	
	videojs.CallToAction.prototype.getTime = function() {
		this.timerDisplay.time_;
	};
	
	
	
	
	
	videojs.CallToActionButton = videojs.Button.extend({
		init: function( player, options ) {
			videojs.Button.call(this, player, options);
			this.name_ = "callToActionButton";
		}
	});
	videojs.CallToActionButton.prototype.createEl = function() {
		var props = {
			className: '',
			innerHTML: this.options_.text,
			role: 'button',
			'aria-live': 'polite', // let the screen reader user know that the text of the button may change
			tabIndex: 0
		};
		var el = videojs.Component.prototype.createEl('a', props);
		
		el.style.cursor = "pointer";
		
		return el;
	};
	videojs.CallToActionButton.prototype.onClick = function() {
		if ( this.options_.url ) {
			window.open(this.options_.url, 'CallToAction');
		}
	};
	
	
	
	
	
	
	if ( !videojs.ExitButton ) {
		/**
		 * Exit button.
		 * @class
		 * @construtor
		 * @param {vjs.Player|Object} player
		 * @param {Object} options
		 * @extends vjs.Button
		 */
		videojs.ExitButton = videojs.Button.extend({
			init: function(player, options){
	
				videojs.Component.call(this, player, options);
			}
		});
		videojs.ExitButton.prototype.buttonText = "Exit";
		videojs.ExitButton.prototype.buildCSSClass = function(){
			// TODO: Change vjs-control to vjs-button?
			return 'vjs-control vjs-exit-button icon-remove-sign ' + vjs.Component.prototype.buildCSSClass.call(this);
		};
		videojs.ExitButton.prototype.onClick = function() {};
	}
	
	if ( !videojs.PauseButton ) {
		/**
		 * Pause button.
		 * @class
		 * @construtor
		 * @param {vjs.Player|Object} player
		 * @param {Object} options
		 * @extends vjs.Button
		 */
		videojs.PauseButton = videojs.Button.extend({
			init: function(player, options){
				videojs.Component.call(this, player, options);
			}
		});
		videojs.PauseButton.prototype.buttonText = "Pause";
		videojs.PauseButton.prototype.buildCSSClass = function(){
			// TODO: Change vjs-control to vjs-button?
			return 'vjs-control vjs-pause-button icon-pause ' + vjs.Component.prototype.buildCSSClass.call(this);
		};
		videojs.PauseButton.prototype.onClick = function() {};
	}
	
	
		/**
		 * Timer Display.
		 * @class
		 * @construtor
		 * @param {vjs.Player|Object} player
		 * @param {Object} options
		 * @extends vjs.Component
		 */
		videojs.TimerDisplay = videojs.Component.extend({
			init: function(player, options){
				videojs.Component.call(this, player, options);
				this.pauseButton.on( 'click', videojs.bind( this, this.cancel ) );
			}
		});
	
		videojs.TimerDisplay.prototype.options_ = {
			descriptionText: '',
			timeLabel: 'seconds',
			children: {
				pauseButton: {}
			}
		};
	
		videojs.TimerDisplay.prototype.createEl = function() {
			
			var el = videojs.Component.prototype.createEl(null, {
				className: this.buildCSSClass()
			});
	
			this.descriptionText_ = videojs.Component.prototype.createEl( 'span', {
				innerHTML: this.options_.descriptionText
			});
	
			this.timerText_ = videojs.Component.prototype.createEl( 'span', {
				className: 'vjs-time-left'
			});
	
			el.appendChild( this.descriptionText_ );
			el.appendChild( this.timerText_ );
			return el;
		};
		videojs.TimerDisplay.prototype.buildCSSClass = function(){
			// TODO: Change vjs-control to vjs-button?
			return 'vjs-display-timer ' + vjs.Component.prototype.buildCSSClass.call(this);
		};
	
		videojs.TimerDisplay.prototype.length = function() {
			if ( arguments.length ) {
				this.options_.length = arguments[0];
			}
			return this.options_.length;
		};
	
		videojs.TimerDisplay.prototype.start = function() {
			this.clear();
			this.time_ = this.options_.length;
			this.play();
		};
		videojs.TimerDisplay.prototype.play = function() {
			this.update();
			this.timer_ = setInterval( videojs.bind( this, this.update ), 1000 );
		};
		videojs.TimerDisplay.prototype.pause = function() {
			this.clear();
		};
		videojs.TimerDisplay.prototype.cancel = function() {
			this.clear();
			this.time_ = 0;
			this.hide();
		};
	
		videojs.TimerDisplay.prototype.clear = function() {
			clearInterval( this.timer_ );
		};
	
		videojs.TimerDisplay.prototype.update = function() {
			this.timerText_.innerHTML = this.time_ + this.options_.timeLabel;
			this.time_--;
	
			if ( this.time_ <= 0 ) {
				this.clear();
				this.trigger( 'complete', {} );
			}
	
		};
})();	
	

	/**
	 * @namespace plugins.callToAction
	 */
	/**
	 * Displays a logo as a control bar button.  Can be used to open a link in a new window.
	 *
	 * @memberof plugins.callToAction
	 * @function callToAction
	 * @param {Object} options Options object.
	 * @param {String} [options.title] Title of the call to action slide.
	 * @param {String} [options.text] A short message to include on the call to action slide.
	 * @param {Object} [options.link] Object containing the link url and text.
	 * @param {String} [options.link.url] The url for the call to action link.
	 * @param {String} [options.link.text] The text to display on the call to action button.
	 * @param {String|Element} [options.el] Either the id of the an element to use as the call to action slide, or a reference to the element.
	 */
(function() {
	videojs.plugin('callToAction', function( options ) {

		options = options || {};
		if ( (!options.link || !options.title) && !options.el ) {
			return;
		}

		if ( options.el ) {
			if ( typeof options.el === "string" && document.getElementById( options.el.replace('#','') ) ) {
				options.el = document.getElementById( options.el.replace('#','') );
				this.callToAction = this.addChild('callToAction', options );
			} else if ( options.el.nodeType === 1) {
				// We have a node, this node will be shown at the end of the video.
				this.callToAction = this.addChild('callToAction', options );
			} else {
				console.warn( "VideoJs.CallToAction Aborting: Invalid element specified, neither html element or element id" );
			}
		} else {
			// We don't have a node, we need to create one
			this.callToAction = this.addChild('callToAction', options );
		}

		 


	});
})();
