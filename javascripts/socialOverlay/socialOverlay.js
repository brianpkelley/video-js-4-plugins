(function() {
	'use strict';
	
	// Create the button
	videojs.ShareButton = videojs.Button.extend({
		init: function( player, options ) {
			// Initialize the button using the default constructor
			videojs.Button.call( this, player, options );
			
		}
	});
	
	// Set the text for the button
	videojs.ShareButton.prototype.buttonText = 'Share Video';
	
	// These are the defaults for this class.
	videojs.ShareButton.prototype.options_ = {};
	
	// videojs.Button uses this function to build the class name.
	videojs.ShareButton.prototype.buildCSSClass = function() {
		// Add our className to the returned className
		return 'vjs-share-button ' + videojs.Button.prototype.buildCSSClass.call(this);
	};
	
	// videojs.Button already sets up the onclick event handler, we just need to overwrite the callback
	videojs.ShareButton.prototype.onClick = function( e ) {
		// We need to stop this event before it bubbles up to "window" for our event listener below.
		e.stopImmediatePropagation();
		
		
		// There are a few ways to accomplish opening the overlay
		// I chose to create and destroy the overlay to demonstrate
		// the dispose method.	Creating the component as a child is
		// the direction I would choose.
		this.overlay_ = new videojs.ShareContainer( this.player_, this.options_ );
		
		// We need to add an event listener to close the overlay when the user clicks outside the overlay / player.
		// Because we are destroying the overlay, we only need to listen to this once.
		videojs.one( window, 'click', videojs.bind( this, this.windowClick ) );
		
		// Add the overlay to the player
		this.player_.addChild( this.overlay_ );
		
		// Call the show method to apply effects and display the overlay
		this.overlay_.show();
		
		// Pause the video
		this.player_.pause();
		
		
	};
	
	videojs.ShareButton.prototype.windowClick = function( e ) {
		// Remove it from the parent (player)
		this.player_.removeChild( this.overlay_ );
		
		// Now remove it from memory.
		// The dispose method removes the element and component.
		this.overlay_.dispose();
		
		// We no longer use this variable so release it.
		delete this.overlay_;
	};
	
	
	
	
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	
	
	// Create the overlay and container for the links
	videojs.ShareContainer = videojs.Component.extend({
		init: function( player, options ) {
			// call the parent constructor
			videojs.Component.call( this, player, options );
			
		}
	});
	
	videojs.ShareContainer.prototype.options_ = {
		children: {
			'facebookShare': {},
			'twitterShare': {},
			'pinterestShare': {},
			'googlePlusShare': {},
			'linkedInShare': {}
		}
	};
	
	// This function will be called by the videojs.Component constructor. 
	videojs.ShareContainer.prototype.createEl = function( tagName, props ) {
		// Create the elements
		
		// The black and blury overlay
		var overlay = videojs.createEl( 'div', {
			className: 'vjs-sharing-overlay'
		});
		
		// The container for the links/logos of the social sites we wish to offer
		var container = videojs.createEl( 'div', {
			className: 'vjs-sharing-container'
		});
		
		// this.contentEl is the element that children (links/logos) are added to.
		this.contentEl_ = container;
		
		overlay.appendChild( this.contentEl_);
		
		// This will become "this.el_"
		return overlay;
	};
	
	videojs.ShareContainer.prototype.show = function() {
		var techEl;
		var playerEl;
		
		// Do the default show method
		this.el_.style.display = 'table';
		
		// To get the blur effect, we need to add it to the tech element.
		// But we do not want to waste our time with trying to blur a flash element.
		if ( this.player_.techName != "Flash" ) {
			techEl = this.player_.tech.el();
			playerEl = this.player_.el();
			
			// We have to set the clip property here because it is dependent on the size of the player
			techEl.style.clip = 'rect(0 0 ' + playerEl.offsetWidth + 'px ' + playerEl.offsetHeight + 'px)';
			
			// Add our class to blur the video.
			videojs.addClass( techEl, 'vjs-blur' );
		}
		
		// Hide the controls, using opacity = 0 will use the default transition timing.
		this.player_.controlBar.el().style.opacity = '0';
		
		this.el_.style.opacity = '1';
		
	};
	
	videojs.ShareContainer.prototype.hide = function() {
		var techEl = this.player_.tech.el();
		
		// Do the default hide method
		videojs.Component.prototype.hide.call( this );
		
		// This time we don't care if it is flash, html, youtube etc
		techEl.style.clip = '';
		videojs.removeClass( techEl, 'vjs-blur' );
		
		// Show the controls, using opacity = '' will use the default opacity.
		this.player_.controlBar.el().style.opacity = '';
	};
	
	videojs.ShareContainer.prototype.dispose = function() {
		// Hide and remove classes from the tech element
		this.hide();
		
		// Do the default dispose method
		videojs.Component.prototype.dispose.call( this );
		
	};
	

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// This is the base class for the share items.  Each Icon can be passed a "Name" and an icon class.
	videojs.OverlaySocialButton = videojs.Button.extend({
		init: function( player, options ) {
			videojs.Button.call(this, player, options );
			
		}
	});
	

	videojs.OverlaySocialButton.prototype.createEl = function(type, props){
		var el;
	
		// Add standard Aria and Tabindex info
		props = vjs.obj.merge({
			className: this.buildCSSClass(),
			'role': 'button',
			'aria-live': 'polite', // let the screen reader user know that the text of the button may change
			tabIndex: 0
		}, props);
		
		// 'i' is needed for the Font-Awesome icons
		el = vjs.Component.prototype.createEl.call(this, 'i', props);
	
		// if innerHTML hasn't been overridden (bigPlayButton), add content elements
		if (!props.innerHTML) {
			this.contentEl_ = vjs.createEl('div', {
				className: 'vjs-control-content'
			});
	
			this.controlText_ = vjs.createEl('span', {
				className: 'vjs-control-text',
				innerHTML: this.options_.text || 'Need Text'
			});
	
			this.contentEl_.appendChild(this.controlText_);
			el.appendChild(this.contentEl_);
		}
	
		return el;
	};
	
	videojs.OverlaySocialButton.prototype.buildCSSClass = function() {
		return 'vjs-share-icon fa fa-' + this.options_.icon + '-square fa-5x';//+ vjs.Button.prototype.buildCSSClass.call(this);
	};
		
	
	// These are the indvidual buttons for each type of share.
	// Twitter	
	videojs.TwitterShare = videojs.OverlaySocialButton.extend({
		init: function( player, options ) {
			videojs.OverlaySocialButton.call( this, player, options );
		}
	});
	videojs.TwitterShare.prototype.options_ = { icon: 'twitter', text: 'Twitter' };
	videojs.TwitterShare.prototype.onClick = function() {
		// Do Share action here
	};
		
	// Facebook	
	videojs.FacebookShare = videojs.OverlaySocialButton.extend({
		init: function( player, options ) {
			videojs.OverlaySocialButton.call( this, player, options );
		}
	});
	videojs.FacebookShare.prototype.options_ = { icon: 'facebook', text: 'Facebook' };
	videojs.FacebookShare.prototype.onClick = function() {
		// Do Share action here
	};
		
	// Pinterest
	videojs.PinterestShare = videojs.OverlaySocialButton.extend({
		init: function( player, options ) {
			videojs.OverlaySocialButton.call( this, player, options );
		}
	});
	videojs.PinterestShare.prototype.options_ = { icon: 'pinterest', text: 'Pinterest' };
	videojs.PinterestShare.prototype.onClick = function() {
		// Do Share action here
	};
	
	// Google Plus
	videojs.GooglePlusShare = videojs.OverlaySocialButton.extend({
		init: function( player, options ) {
			videojs.OverlaySocialButton.call( this, player, options );
		}
	});	
	videojs.GooglePlusShare.prototype.options_ = { icon: 'google-plus', text: 'Google+' };
	videojs.GooglePlusShare.prototype.onClick = function() {
		// Do Share action here
	};
	
	// LinkedIn
	videojs.LinkedInShare = videojs.OverlaySocialButton.extend({
		init: function( player, options ) {
			videojs.OverlaySocialButton.call( this, player, options );
		}
	});	
	videojs.LinkedInShare.prototype.options_ = { icon: 'linkedin', text: 'LinkedIn' };
	videojs.LinkedInShare.prototype.onClick = function() {
		// Do Share action here
	};
	
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	
	// This function will be called by video.js when it loops through all of the registered plugins.
	var pluginFn = function( options ) {
		// We need to pass off the options to the control bar button.
		var shareComponent = new videojs.ShareButton( this, options );
		
		// Set the default position for the sharing button. Default: control-bar
		var onScreen = options.onScreen || false; 
		// Now we remove the onScreen option as it does not pertain to anything inside the button.
		delete options.onScreen;
		
		var shareButton;
		
		// Should the button be added to the control bar or screen?
		if ( onScreen ) {
			shareButton = this.addChild( shareComponent );
		} else {
			shareButton = this.controlBar.addChild( shareComponent );
		}
		
		
	};

	videojs.plugin( 'socialOverlay', pluginFn );
	
	
	
	
	//videojs.obj.merge(videojs, videojs);
})();