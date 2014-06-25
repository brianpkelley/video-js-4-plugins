(function(){


	videojs.DimTheLightsToggle = videojs.Button.extend({
		init: function( player, options ) {
			videojs.Button.call( this, player, options );
			
			var playerEl = this.player_.el();
		/*	if ( playerEl.parentNode.className.indexOf( 'video-js-responsive-container') > -1 ) {
				this.mainEl_ = playerEl.parentNode.parentNode;
			} else {*/
				this.mainEl_ = playerEl;
			//}
			
			this.mainEl_.parentNode.appendChild( this.overlay_ );
			
			
		}
	});
	
	videojs.DimTheLightsToggle.prototype.isDim = false;
	videojs.DimTheLightsToggle.prototype.buttonText = "Dim The Lights";
	
	videojs.DimTheLightsToggle.prototype.createEl = function(type, props){
		
		this.overlay_ = videojs.createEl('div', {
			className: 'vjs-dim-overlay'
		});
		
			
		return vjs.Button.prototype.createEl.call(this, type, props);
	};
	
	videojs.DimTheLightsToggle.prototype.buildCSSClass = function() {
		return 'vjs-dim-the-lights icon-lightbulb ' + vjs.Button.prototype.buildCSSClass.call(this);
	};
	
	videojs.DimTheLightsToggle.prototype.onClick = function() {
		if ( !this.isDim ) {
			this.dimTheLights();
			
			videojs.one( document, 'keyup', videojs.bind(this, function(evt) {
				if ( evt.keyCode == 27 ) {
					this.raiseTheLights();
				}
			}) );
			
		} else {
			this.raiseTheLights();
			
		}
	};
	
	videojs.DimTheLightsToggle.prototype.dimTheLights = function() {
		this.isDim = true;
		this.mainEl_.className += ' vjs-dim-focus';
		
		this.overlay_.style.display = 'block';
		setTimeout( videojs.bind( this, function() { this.overlay_.className += ' vjs-dim-off'; } ), 10 );
		
		this.el_.className += ' vjs-dim-toggle';
	};
	
	videojs.DimTheLightsToggle.prototype.raiseTheLights = function() {
		this.isDim = false;
		this.mainEl_.className = this.mainEl_.className.replace(/\s?vjs\-dim\-focus/gi, '');
		
		this.overlay_.style.display = 'none';
		this.overlay_.className = this.overlay_.className.replace(/\s?vjs\-dim\-off/gi, '');
		
		this.el_.className = this.el_.className.replace(/\s?vjs\-dim\-toggle/gi, '');
	};
	
	
	/** @namespace plugins.dimTheLights */
	/**
	 * Function responsible for auto playing and muting the player when a video loads.
	 * Applies the classes "vjs-automute" and "vjs-automute-restart" to the videojs.bigPlayButton.
	 * Once a user interacts with the player either by click on the bigPlayButton or by loading a new video, these classes are removed.
	 *
	 * @plugindesc Adds an overlay to the page that will darken the surrounding areas.
	 *
	 * @function dimTheLights
	 * @memberof plugins.dimTheLights
	 * 
	 */
	videojs.plugin('dimTheLights',function( options ) {
		this.controlBar.addChild( 'dimTheLightsToggle', {
			//Options
		});
	});
})();