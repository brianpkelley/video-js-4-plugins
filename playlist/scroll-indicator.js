videojs.ScrollIndicator = videojs.Button.extend({
		init: function( player, options) {
			videojs.Button.call(this, player, options);
			this.on( 'mousedown', this.onMouseDown );
			this.on( 'touchstart', this.onMouseDown );

			this.on( 'selectstart', function() { return false; } );
			this.el_.setAttribute('unselectable', 'on');


			this.linkEl_ = options.linkEl;

			this.dragging_ = true;
			this.dragDiff_ = null;
			this.handle_ = null;

			videojs.on( this.linkEl_, 'resize', videojs.bind( this, this.onResize ) );
			videojs.on( this.linkEl_, 'scroll', videojs.bind( this, this.onScroll ) );

		}
	});

	videojs.ScrollIndicator.prototype.createEl = function( type, props ) {
		return vjs.Component.prototype.createEl.call(this, 'div', vjs.obj.merge({
			className: 'vjs-playlist-scroll-indicator',
			innerHTML: ''
		}, props));
	};



	videojs.ScrollIndicator.prototype.onResize = function( e ) {
		//console.log( "scrollIndicator.onResize()" );
		this.setIndicatorSize();
		this.setTrackSize();
		this.options_.vertical ? this.moveIndicator_( this.el_.offsetTop ) : this.moveIndicator_( this.el_.offsetLeft );
	};




	videojs.ScrollIndicator.prototype.setTrackSize = function() {
		this.min_ = 0;
		this.max_ = this.options_.vertical ? this.linkEl_.offsetHeight - this.el_.offsetHeight : this.linkEl_.offsetWidth - this.el_.offsetWidth;
	};

	videojs.ScrollIndicator.prototype.setIndicatorSize = function() {
		var total = this.options_.vertical ? this.linkEl_.offsetHeight : this.linkEl_.offsetWidth;
		var maxScroll = this.options_.vertical ? this.linkEl_.scrollHeight : this.linkEl_.scrollWidth;

		var percent = (80 * ( total / maxScroll ) ) + 20; // No smaller than 20%

		if ( this.options_.vertical ) {
			this.el_.style.height = percent + "%";
		} else {
			this.el_.style.width = percent + "%";
		}

	};

	videojs.ScrollIndicator.prototype.getSize = function() {
		return {from: this.min_, to: this.max_};
	};


	videojs.ScrollIndicator.prototype.onMouseDown = function( e ) {

		this.draggin_ = true;

		var current = videojs.findPosition( this.el_ );
		this.parent_ = videojs.findPosition( this.el_.parentNode );

		if ( this.options_.vertical ) {
			var mouseY = e.pageY;
			this.dragDiff_ = mouseY - current.top;
		} else {
			var mouseX = e.pageX;
			this.dragDiff_ = mouseX - current.left;
		}

		this.handle_ = videojs.bind( this, this.onDrag );

		videojs.on( document, 'mousemove', this.handle_ );
		videojs.one( document, 'mouseup', videojs.bind( this, this.onMouseUp ) );

		return false;

	};

	videojs.ScrollIndicator.prototype.onDrag = function(e) {
		var newPos;
		newPos = this.options_.vertical ? ( e.pageY - this.parent_.top - this.dragDiff_ ) :	newPos = ( e.pageX - this.parent_.left - this.dragDiff_ );

		//this.moveIndicator_( newPos );

		this.trigger( { type:'dragscroll', position: newPos } );
	};

	videojs.ScrollIndicator.prototype.onMouseUp = function() {
		videojs.off( document, 'mousemove', this.handle_ );
		this.trigger( 'mouseup' );
	};


	videojs.ScrollIndicator.prototype.moveIndicator_ = function( newPos ) {
		if ( newPos <= this.min_ ) {
			newPos = this.min_;
		} else if ( newPos >= this.max_ ) {
			newPos = this.max_;
		}

		if ( this.options_.vertical ) {
			this.el_.style.top = newPos + "px";
		} else {
			this.el_.style.left = newPos + "px";
		}
	};

	videojs.ScrollIndicator.prototype.onScroll = function( e ) {
		var percent = this.options_.vertical ? this.linkEl_.scrollTop / ( this.linkEl_.scrollHeight - this.linkEl_.offsetHeight ) : this.linkEl_.scrollLeft / ( this.linkEl_.scrollWidth - this.linkEl_.offsetWidth );
		this.moveIndicator_( this.max_ * percent );
	};
