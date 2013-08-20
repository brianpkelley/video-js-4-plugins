(function() {
	
	var bigSize = {};
	var smallSize = {};
	
	// Main button
	videojs.ResizeControl = videojs.MenuButton.extend({
		init: function( player, options ) {
			videojs.MenuButton.call(this, player, options);
		}
	});
	
	// Enable Fullscreen on main icon click
	videojs.ResizeControl.prototype.onClick = videojs.FullscreenToggle.prototype.onClick;
	
	videojs.ResizeControl.prototype.createItems = function(){
		var items = [], track;
		var options = this.options();
		
		items.push(new videojs.LargerToggle(this.player_,{}));
		items.push(new videojs.SmallerToggle(this.player_,{}));
		
		console.log( items[0].el().style.width );
		
		return items;
	};
		
	
	// Go Larger button
	videojs.LargerToggle = videojs.MenuItem.extend({
		init: function( player, options ) {
			videojs.Button.call(this, player, options);
		}
		
	});
	
	videojs.LargerToggle.prototype.createEl = function(type, props) {
		return vjs.Button.prototype.createEl.call(this, 'li', vjs.obj.merge({
			className: 'vjs-menu-item',
			innerHTML: '<span class="icon-resize-full"></span>'
		}, props));
	}
	
	videojs.LargerToggle.prototype.buildCSSClass = function(){
		return 'vjs-larger-control ' + vjs.Button.prototype.buildCSSClass.call(this);
	};
	
	videojs.LargerToggle.prototype.onClick = function() {
		this.player().el().style.height = bigSize.h + "px";
		this.player().el().style.width = bigSize.w + "px";
	}
	
	
	
	// Go Smaller button
	videojs.SmallerToggle = videojs.MenuItem.extend({
		init: function( player, options ) {
			videojs.Button.call(this, player, options);
		}
	});
	
	videojs.SmallerToggle.prototype.createEl = function(type, props) {
		return vjs.Button.prototype.createEl.call(this, 'li', vjs.obj.merge({
			className: 'vjs-menu-item',
			innerHTML: '<span class="icon-resize-small"></span>'
		}, props));
	}
	
	videojs.SmallerToggle.prototype.buildCSSClass = function(){
		return 'vjs-smaller-control icon-resize-small ' + vjs.Button.prototype.buildCSSClass.call(this);
	};
	
	videojs.SmallerToggle.prototype.onClick = function() {
		this.player().el().style.height = smallSize.h + "px";
		this.player().el().style.width = smallSize.w + "px";
	}
	
	
	// Plugin Code
	var createResizeButton = function(options) {
	  var props = {
		  className: 'vjs-resize-button vjs-control vjs-menu-button icon-desktop',
		  innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">' + ('Enlarge') + '</span></div>',
		  role: 'button',
		  'aria-live': 'polite', // let the screen reader user know that the text of the button may change
		  tabIndex: 0
		};
	  return videojs.Component.prototype.createEl(null, props);
	};
	
	videojs.plugin('resize', function(options) {
		var player = this.el();
		options = options || {};
		
		if ( options.size.h > player.offsetHeight ) {
			smallSize = {
				h: player.offsetHeight,
				w: player.offsetWidth
			};
			bigSize = options.size;
		} else {
			bigSize = {
				h: player.offsetHeight,
				w: player.offsetWidth
			};
			smallSize = options.size;
		}

		var optionsClone = JSON.parse(JSON.stringify(options));
	  optionsClone.el = createResizeButton( options );
		
		
	  var resize = new videojs.ResizeControl(this, optionsClone);
	  this.controlBar.el().appendChild(resize.el());
	});
})();