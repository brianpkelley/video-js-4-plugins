//
// Author: Brian Kelley
// Description: Creates a "share" menu in the control bar.  See the readme on github.
// 				https://github.com/brianpkelley/video-js-4-plugins/blob/master/addThis/README.md
//

(function() {
	
	// AddThis optional parameters
	var pubid = false;
	var ct = false;
	var email_template = false;
	var share_url = false;
	var website_url = false;
	/***********************************************
	 * Social Item
	 ***********************************************/
	videojs.SocialItem = videojs.MenuItem.extend({
		init: function(player, options){
			
			videojs.MenuItem.call(this, player, options);
			if ( "embed" == options.kind ) { 
				this.embedEl_ = new videojs.EmbedWindow(this.player(), {});
				this.player().el().appendChild( this.embedEl_.el() );
			}
		}
	});
	
	videojs.SocialItem.prototype.createEl = function(type, props) {
		return vjs.Button.prototype.createEl.call(this, 'li', vjs.obj.merge({
			className: 'vjs-menu-item',
			innerHTML: '<span class="icon-'+this.options_['iconClass']+'"></span>'
		}, props));
	};
	
	videojs.SocialItem.prototype.onClick = function() {
		var serialize = function(obj) {
			var str = [];
			for(var p in obj) {
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
			}
			return str.join("&");
		}

	
		// Send this to AddThis.com
		// Available Services - http://www.addthis.com/services/list
		// http://support.addthis.com/customer/portal/articles/381265-addthis-sharing-endpoints
		// URL - http://api.addthis.com/oexchange/0.8/forward/SERVICE_TAG/offer?OPTIONS
		// Name	 						Description	 																			Type	 		Required?		 			Example
		// url	 							URL of the page being shared.				 											string			yes	 						http://addthis.com
		// title	 						Title of the page being shared.				 											string			no	 						AddThis Home Page
		// description						Short description of the page being shared.												string			no	 						AddThis: One button. Your content everywhere.
		// pubid	 						Your publisher profile ID (analytics).	 												string			no	 						addthis
		// email_template					Email template to use for email sharing (requires pubid param)							string			no	 						my_template
		// ct	 							Enable click tracking (shared page must have AddThis client code to measure clicks)	 	string			no							ct=1
		
		var send = {
			'url': share_url || document.location.href,
			'title': document.title,
			'description': 'Check out this cool video at '+document.location.href,
			'pubid': pubid || null,
			'email_template': email_template || null,
			'ct': ct || null
		};
		var width;
		var height;
		var kind = this.options().kind;
		
		var deserialize = function (s) {
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
		
		var src;
		
		if ( this.player().el().querySelector('video') ) { // HTML5
			src = this.player().el().querySelector('video').src;
		} else { // FLASH
			var values = deserialize( this.player().el().querySelector('param[name=flashvars]').value )
			src = decodeURIComponent( values.src );
		}
		
		
		switch ( kind ) {
			// Special Cases
			/////////////////////////////
			case 'embed':
				
				// Get current theme
				//console.log( this.player(), this.player().el(), this.player().el().className)
				theme = /\s?vjs-(.*?)-skin\s?/gi.exec( this.player().el().className )[1];
				console.log( this.player() );
				
				
				var pluginObj = this.player().options().plugins;
				var pluginStr = JSON.stringify( pluginObj );
				
				// Change this code to suit your needs
				var embedCode = '<link href="http://vjs.zencdn.net/4.1/video-js.css" rel="stylesheet"><script src="http://vjs.zencdn.net/4.1/video.js"></script>\n<video id="videojsplayer" class="video-js vjs-default-skin" controls preload="auto" \n\tposter="'+this.player().poster()+'"\n\tdata-setup=\'{}\'>\n\t<source src="'+src+'" type="video/mp4" />\n\t<p>Video Playback Not Supported</p>\n</video>';
				// Create Elements
				this.embedEl_.setEmbedCode( embedCode );
				this.embedEl_.show();
				
				[].slice.call( this.embedEl_.el().getElementsByTagName('textarea') )[0].select();
				
				break;
			case 'link':
				if ( website_url ) {
					window.open(website_url, 'Website');
				}
				break;
			case 'more': 
				width = width || 550;
				height = height || 450;
				window.open('http://api.addthis.com/oexchange/0.8/offer??'+serialize(send), 'AddThis', 'height='+height+',width='+width+',modal=yes,alwaysRaised=yes');
				break;
			
			
			
			
			// AddThis.com Forward Share API
			////////////////////////////////////////
			
			case 'facebook':
				width = width || 550;
				height = height || 270;
				// Fall through
			case 'twitter':
				width = width || 550;
				height = height || 260;
				send.text = send.description.replace(/\shttp\:\/\/.*$/gi, '');
				// Fall through
			case 'email':
				width = width || 550;
				height = height || 700;
				// Fall through
			default:
				width = width || 550;
				height = height || 450;
				window.open('http://api.addthis.com/oexchange/0.8/forward/'+kind+'/offer?'+serialize(send), 'AddThis', 'height='+height+',width='+width+',modal=yes,alwaysRaised=yes');
				// http://support.addthis.com/customer/portal/articles/381265-addthis-sharing-endpoints
				// http://www.addthis.com/services/list
		}
		
		// This can be and is caught in the googleAnalytics Plugin
		videojs.trigger(this.player().el(),{type: 'socialclick', target: this.player().el(), kind: kind});
		
	};
	
	/***********************************************
	 * Social Menu Button
	 ***********************************************/
	videojs.Social = videojs.MenuButton.extend({
	/** @constructor */
	  init: function(player, options){
			videojs.MenuButton.call(this, player, options);
			console.log( options, this.items )
			if ( this.items.length > 4 ) {
				this.menu.contentEl().style.width = "15em";
				this.menu.contentEl().style.left = "-7.5em";
			}
			
				
			this.on('click', this.onClick);
	  }
	});
	videojs.Social.prototype.options_ = {
		facebook: true,
		twitter: true,
		googleplus: true,
		linkedin: true,
		pinterest: true,
		delicious: true,
		reddit: true,
		email: true,
		embed: false,
		//link: false,
		more: true
	}
	videojs.Social.prototype.onClick = function() {};
	
	videojs.Social.prototype.createItems = function() {
		var items = [], track;
		var options = this.options();
		
		console.log( options );
		
		if ( options['facebook'] ) {
			items.push(new videojs.SocialItem(this.player_, {
					'label': 'Facebook',
					'kind': 'facebook',
					'iconClass': 'facebook'
			}));
		}
		
		if ( options['twitter'] ) {
			items.push(new videojs.SocialItem(this.player_, {
					'label': 'Twitter',
					'kind': 'twitter',
					'iconClass': 'twitter'
			}));
		}
		
		if ( options['googleplus'] ) {
			items.push(new videojs.SocialItem(this.player_, {
					'label': 'Google+',
					'kind': 'google_plusone_share',
					'iconClass': 'google-plus'
			}));
		}
		
		if ( options['linkedin'] ) {
			items.push(new videojs.SocialItem(this.player_, {
					'label': 'LinkedIn+',
					'kind': 'linkedin',
					'iconClass': 'linkedin'
			}));
		}
		
		if ( options['pinterest'] ) {	
			items.push(new videojs.SocialItem(this.player_, {
					'label': 'Pinterest+',
					'kind': 'pinterest',
					'iconClass': 'pinterest'
			}));
		}
		
		if ( options['delicious'] ) {	
			items.push(new videojs.SocialItem(this.player_, {
					'label': 'Delicious',
					'kind': 'delicious',
					'iconClass': 'delicious'
			}));
		}
		
		if ( options['reddit'] ) {	
			items.push(new videojs.SocialItem(this.player_, {
					'label': 'Reddit',
					'kind': 'reddit',
					'iconClass': 'reddit'
			}));
		}
		
		if ( options['more'] ) {	
			items.push(new videojs.SocialItem(this.player_, {
					'label': 'More Services',
					'kind': 'more',
					'iconClass': 'plus'
			}));
		}
		
		
		if ( options['email'] ) {	
			items.push(new videojs.SocialItem(this.player_, {
					'label': 'Email',
					'kind': 'email',
					'iconClass': 'envelope'
			}));
		}
		
		if ( options['embed'] ) {	
			items.push(new videojs.SocialItem(this.player_, {
					'label': 'Embed',
					'kind': 'embed',
					'iconClass': 'code'
			}));
		}
		
		if ( options['website_url'] ) {	
			items.push(new videojs.SocialItem(this.player_, {
					'label': 'Link',
					'kind': 'link',
					'iconClass': 'globe'
			}));
		}
		
		
		
		return items;
	};
	
	
	/***********************************************
	 * Embed window to grab the code
	 ***********************************************/
	videojs.EmbedWindow = videojs.Component.extend({
		/** @constructor */
		init: function(player, options){
			videojs.Component.call(this, player, options);
			this.hide();
			
			this.exitEl_ = new videojs.ExitButton(player,{});
			this.exitEl_.on('click', videojs.bind(this, function() {
				this.hide();
			}));
			this.el_.appendChild( this.exitEl_.el() );
			
			this.textAreaEl_ = document.createElement('textarea');
			this.textAreaEl_.style.fontSize = "10px";
			if ( options.embedCode ) {
				this.setEmbedCode( options.embedCode );
			}
			
			this.el_.appendChild( this.textAreaEl_ );
		},
		
		setEmbedCode: function(embedCode) {
			this.textAreaEl_.value = embedCode || "";
		}
	});
	
	videojs.EmbedWindow.prototype.createEl = function(player,options) {
		return videojs.Component.prototype.createEl(player, {
			className: 'vjs-embed-window ',
			innerHTML: '<h4 class="vjs-embed-title"><span class="icon-code"></span>  Embed Code</h4>',
			'aria-live': 'polite', // let the screen reader user know that the text of the button may change
			tabIndex: 0
		});
	}
	
	videojs.ExitButton = videojs.Button.extend({
		/** @constructor */
		init: function(player, options){
			videojs.Component.call(this, player, options);
		}		
	});
	
	videojs.ExitButton.prototype.createEl = function(player,options) {
		return videojs.Component.prototype.createEl(player,{
			className: 'vjs-button icon-remove-sign',
			innerHTML: '',
			role: 'button',
			'aria-live': 'polite', // let the screen reader user know that the text of the button may change
			tabIndex: 0,
			style: 'font-size: 10px'
		});
	}
	videojs.ExitButton.prototype.onClick = function() {};
	
	
	
	
	
	// Note that we're not doing this in prototype.createEl() because
	// it won't be called by Component.init (due to name obfuscation).
	var createSocialButton = function(options) {
	  var props = {
		  className: 'vjs-social-button vjs-control vjs-menu-button icon-share',
		  innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">' + ('Social') + '</span></div>',
		  role: 'button',
		  'aria-live': 'polite', // let the screen reader user know that the text of the button may change
		  tabIndex: 0
		};
	  return videojs.Component.prototype.createEl(null, props);
	};
	
	var social;
	videojs.plugin('addThis', function(options) {
		options = options || {};
		
		if ( options.includeFontAwesome || options.includeFontAwesome === undefined ) {
			var tempLink = document.createElement('link');
			tempLink.href = '//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css';
			tempLink.rel = 'stylesheet';
			document.getElementsByTagName('head')[0].appendChild( tempLink );
		}
		
		if ( options.pubid ) {
			pubid = options.pubid;
		}
		if ( options.ct ) {
			ct = options.ct;
		}
		if ( options.email_template ) {
			email_template = options.email_template;
		}
		if ( options.share_url ) {
			share_url = options.share_url;
		}
		if ( options.website_url && options.website_url != /http(s)?:\/\//.test(options.website_url) && options.website_url != "") {
			website_url = options.website_url;
		} else {
			delete options.website_url;
		}
		
		var optionsClone = JSON.parse(JSON.stringify(options));
		console.log( options, optionsClone );
		optionsClone.el = createSocialButton(options);
		
		
	  social = new videojs.Social(this, optionsClone);
	  this.controlBar.el().appendChild(social.el());
	});
})();