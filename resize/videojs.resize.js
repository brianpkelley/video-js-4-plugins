(function() {
	

	
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
		
		items.push(new videojs.LargerToggle(this.player_,this.options_.bigSize));
		items.push(new videojs.SmallerToggle(this.player_,this.options_.smallSize));
		
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
		this.player().el().style.height = this.options_.h + "px";
		this.player().el().style.width = this.options_.w + "px";
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
		this.player().el().style.height = this.options_.h + "px";
		this.player().el().style.width = this.options_.w + "px";
	}
	
	
	videojs.plugin('resize', function(options) {
		var player = this.el();
		var newOpts = {};
		options = options || {};

		if ( options.size.h > player.offsetHeight ) {
			newOpts.smallSize = {
				h: player.offsetHeight,
				w: player.offsetWidth
			};
			newOpts.bigSize = options.size;
		} else {
			newOpts.bigSize = {
				h: player.offsetHeight,
				w: player.offsetWidth
			};
			newOpts.smallSize = options.size;
		}
		var resize = this.controlBar.addChild( 'resizeControl', newOpts );

		this.controlBar.el().className += " vjs-does-resize";
	});
})();