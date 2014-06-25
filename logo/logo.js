(function() {
	var website_url;


	videojs.Logo = videojs.Button.extend({
		init: function( player, options ) {
			videojs.Button.call(this, player, options);
			this.name_ = "logoButton";
		}
	});
	videojs.Logo.prototype.createEl = function() {
		var props = {
			className: ' vjs-logo-control vjs-control',
			role: 'button',
			'aria-live': 'polite', // let the screen reader user know that the text of the button may change
			tabIndex: 0
		};
		var el = videojs.Component.prototype.createEl(null, props);

		this.contentEl_ = videojs.Component.prototype.createEl( 'div', {
			className: 'vjs-control-content',
			innerHTML: '<span class="vjs-control-text">' + (this.options_.alt) + '</span>'
		});

		this.contentEl_.appendChild( videojs.Component.prototype.createEl('img', {
			src: this.options_.src
		}));

		if ( this.options_.url && this.options_.url !== "" ) {
			el.style.cursor = "pointer";
		}
		el.style.width = "auto";
		el.appendChild( this.contentEl_ );

		return el;
	};
	videojs.Logo.prototype.onClick = function() {
		if ( this.options_.url ) {
			window.open(this.options_.url, 'Website');
			this.player_.trigger({type: 'logo'});
		}
	};


	/**
	 * @namespace plugins.logo
	 */
	/**
	 * Displays a logo as a control bar button.  Can be used to open a link in a new window.
	 *
	 * @memberof plugins.logo
	 * @function logo
	 * @param {Object} options Options object.
	 * @param {String} options.src The absolute URL to the logo image.
	 * @param {String} options.alt The alternate text to use if the image can not be found, or to display on hover.
	 * @param {String} [options.url] The url to a website that will open in a new window.
	 * @param {String} options.width The CSS width value with the units.  Example: 120px
	 */

	videojs.plugin('logo', function(options) {
		var player = this.el();
		//options = options || {};


		//var optionsClone = JSON.parse(JSON.stringify(options)); // clone
		//optionsClone.el = createLogoButton( options );

		// = new videojs.Logo(this, optionsClone);
		//;
		var logo = this.controlBar.addChild( 'logo', options );
		// move it to the first float right item
		this.controlBar.el().insertBefore(logo.el(), this.controlBar.el().childNodes[0]);
	});
})();