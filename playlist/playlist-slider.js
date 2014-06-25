videojs.PlaylistSlider = videojs.Component.extend({
	init: function( player, options) {

		// Which orientation are we in
		options.vertical = player.el().className.indexOf( 'vjs-vertical-playlist' ) != -1;
		
		// Initialize
		videojs.Component.call(this, player, options);
		
		// These track which elements are visible.
		// Used for when we click on the bottom scroll button,
		// we grab the next/previous siblings and move them into view
		this.firstVisible_ = false;
		this.lastVisible_ = false;
		
		// Setup events
		videojs.on(this.slidePaneEl_, 'scroll', videojs.bind( this, this.onScroll ) );
		this.scrollIndicator.on( 'dragscroll', videojs.bind( this, this.onDragScroll ) );
		this.on('mousewheel', videojs.bind( this, function() {
			this.player().playlist.userInteraction( true );
		}));
		this.isDragging_ = false;
	}
});

videojs.PlaylistSlider.prototype.createEl = function( type, props ) {
	// Overal container div
	var el = vjs.createEl( 'div', {
		className: 'vjs-playlist-slide-container'
	});
	// Div to hold the ul and scroll up/down or left/right (ul don't like to scroll nicely)
	this.slidePaneEl_ = vjs.Component.prototype.createEl.call(this, 'div', vjs.obj.merge({
		className: 'vjs-playlist-slide-pane',
		innerHTML: ''
	}, props));
	
	// UL to hold the children
	this.contentEl_ = vjs.Component.prototype.createEl.call( this, 'ul', {});

	this.slidePaneEl_.appendChild( this.contentEl_ );
	el.appendChild( this.slidePaneEl_ );

	// Set up the indicator
	this.scrollIndicator = new videojs.ScrollIndicator(this.player(), {
		linkEl: this.slidePaneEl_,
		vertical: this.options_.vertical
	});

	el.appendChild( this.scrollIndicator.el() );

	return el;
};

videojs.PlaylistSlider.prototype.slidePaneEl = function() {
	return this.slidePaneEl_;
};

videojs.PlaylistSlider.prototype.options_ = {
	"children": { }
};

videojs.PlaylistSlider.prototype.addChild = function () {
	var child = videojs.Component.prototype.addChild.apply(this, arguments);
	if ( child.el_.tagName !== 'LI' ) {
		
		throw new Error("Type Error: Child Elements Must Be LI");
	}
	child.setIndex( this.children_.length - 1 );
	return child;
};

// Set Size
videojs.PlaylistSlider.prototype.setSize = function( size ) {
	this.options_.vertical ? this.setSizeY_( size ) : this.setSizeX_( size );

	videojs.trigger( this.slidePaneEl_, 'resize' );

	if ( size >= this.getScrollSize() ) {
		this.scrollIndicator.hide();
	} else {
		this.scrollIndicator.show();
	}
};

videojs.PlaylistSlider.prototype.setSizeY_ = function( size ) {
	this.el_.style.height = size + "px";
};

videojs.PlaylistSlider.prototype.setSizeX_ = function( size ) {
	this.el_.style.width = size + "px";
};


// Get Max Scroll
videojs.PlaylistSlider.prototype.getMaxScroll = function() {
	return this.options_.vertical ? this.getMaxScrollY_() : this.getMaxScrollX_();
};

videojs.PlaylistSlider.prototype.getMaxScrollY_ = function() {
	return this.slidePaneEl_.scrollHeight - this.slidePaneEl_.offsetHeight;
};

videojs.PlaylistSlider.prototype.getMaxScrollX_ = function() {
	return this.slidePaneEl_.scrollWidth - this.slidePaneEl_.offsetWidth;
};

// Get Scroll Size
videojs.PlaylistSlider.prototype.getScrollSize = function() {
	return this.options_.vertical ? this.getScrollSizeY_() : this.getScrollSizeX_();
};

videojs.PlaylistSlider.prototype.getScrollSizeY_ = function() {
	return this.slidePaneEl_.scrollHeight;
};

videojs.PlaylistSlider.prototype.getScrollSizeX_ = function() {
	return this.slidePaneEl_.scrollWidth;
};

// Get Scroll Position
videojs.PlaylistSlider.prototype.getScroll = function() {
	return this.options_.vertical ? this.getScrollY_() : this.getScrollX_();
};

videojs.PlaylistSlider.prototype.getScrollY_ = function() {
	return this.slidePaneEl_.scrollTop;
};

videojs.PlaylistSlider.prototype.getScrollX_ = function() {
	return this.slidePaneEl_.scrollLeft;
};


// Scroll the pane
videojs.PlaylistSlider.prototype.setScroll = function( scroll ) {
	this.options_.vertical ? this.setScrollY_( scroll ) : this.setScrollX_( scroll );
	this.setVisible();
};

videojs.PlaylistSlider.prototype.setScrollY_ = function( scroll ) {
	this.slidePaneEl_.scrollTop = scroll;
};

videojs.PlaylistSlider.prototype.setScrollX_ = function( scroll ) {
	this.slidePaneEl_.scrollLeft = scroll;
};

videojs.PlaylistSlider.prototype.scrollToChild = function( index ) {
	//console.log( "ScrollToChild", index );
	if ( index.index ) {
		index = index.index;
	}
	
	var targetChild = this.children_[index];
	
	if ( !targetChild ) {
		return false;
	}
	var childPosition = this.childPosition( index ); 
	var childSize = childPosition.lower - childPosition.upper;
	var currentPosition = this.getPosition();
	var maxScroll = this.getMaxScroll();
	
	
	if ( childPosition.upper >= currentPosition.upper && childPosition.lower <= currentPosition.lower ) {
		this.setVisible();
		return true;
	}
	
	var targetPosition;
	
	if ( childPosition.upper < currentPosition.upper + currentPosition.total / 2 ) {
		targetPosition = maxScroll - ( maxScroll - childPosition.upper + 5 );
	} else {
		targetPosition = currentPosition.upper + ( childPosition.lower - ( currentPosition.lower - 5 ) );
	}
	
	//console.log( "ScrollToChild", targetPosition );
	this.smoothScroll( targetPosition );
	
	
	return true;
};

videojs.PlaylistSlider.prototype.smoothScroll = function ( pos ) {
	clearTimeout( this.animationTimer );
	//console.log( "smoothScroll" );
	var y = this.getScroll();
	y += Math.round( (pos - y) * 0.3 );
	
	if (Math.abs(y-pos) < 2)
	{
		this.moveToChild_ = false;
		this.setScroll( pos );
		return;
	}
	this.setScroll( y );
	this.animationTimer = setTimeout(videojs.bind( this, this.smoothScroll ), 40, pos);   
};

videojs.PlaylistSlider.prototype.scrollBy = function( amount ) {
	this.setScroll( this.getScroll() + amount );
};

// Events
videojs.PlaylistSlider.prototype.onScroll = function( e ) {
	this.firstVisible_ = false;
	this.lastVisible_ = false;
	this.setVisible();
};

videojs.PlaylistSlider.prototype.onDragScroll = function( e ) {
	var maxScroll = this.getMaxScroll();
	var visible = this.scrollIndicator.getSize();

	var newScrollPosition = ( e.position / visible.to ) * maxScroll;

	this.setScroll( newScrollPosition );

	// Set "isDragging_" to true to avoid moving the playlist on the next item if the user
	// recently dragged the slider.  After 20s the default behaviour will continue.
	this.isDragging_ = true;
	if ( this.isDraggingCheck_ ) {
		clearTimeout( this.isDragginCheck_ );
	}
	this.isDraggingCheck_ = setTimeout( videojs.bind( this, function() {
		this.isDragging_ = false;
		clearTimeout( this.isDraggingCheck_ );
		this.isDraggingCheck_ = false;
	}), 20000 );

	this.player().playlist.userInteraction( true );
};

videojs.PlaylistSlider.prototype.isDragging = function() {
	return this.isDragging_;
};


// Selection
videojs.PlaylistSlider.prototype.select = function( index, moveAfterSelection ) {
	//console.log("Selected", index, moveAfterSelection );
	for ( var x = 0; x < this.children_.length; x++ ) {
		videojs.removeClass( this.children_[x].el(), 'vjs-playlist-selected' );
	}
	
	videojs.addClass( this.children_[index].el(), 'vjs-playlist-selected' );
	
	if ( moveAfterSelection) {
		this.moveToSelected();
	}
};

// Positioning
videojs.PlaylistSlider.prototype.getPosition = function() {
	var viewPane = this.slidePaneEl_;

	if ( this.options_.vertical ) {
		return {
			upper: viewPane.scrollTop,
			lower: viewPane.scrollTop + viewPane.offsetHeight,
			total: viewPane.offsetHeight
		};
	} else {
		return {
			upper: viewPane.scrollLeft,
			lower: viewPane.scrollLeft + viewPane.offsetWidth,
			total: viewPane.offsetWidth
		};
	}
};

videojs.PlaylistSlider.prototype.childPosition = function( index ) {
	if ( !this.children_ && !this.children_[index] ) {
		return false;
	}
	var childData = this.children_[index].getPosition();
	var childPosition = this.options_.vertical ? { upper: childData.top, lower: childData.bottom } : { upper: childData.left, lower: childData.right };
	return childPosition;
};

// Visibility
videojs.PlaylistSlider.prototype.isVisible = function( index ) {
	var currentPosition = this.getPosition();
	var itemPosition = this.childPosition( index );
	
	//console.log( "isVisible: ", currentPosition, itemPosition );
	//console.trace();
	if ( itemPosition.upper >= currentPosition.upper && itemPosition.lower <= currentPosition.lower ) {
		return true; // Return === true to signify item is wholly visible
	} else if ( itemPosition.lower > currentPosition.upper && itemPosition.upper < currentPosition.lower ) {
		return 1; // Return truthy to signify it is visible but not wholly in the view pane
	} else if ( ( itemPosition.upper < currentPosition.lower + 100 && itemPosition.upper > currentPosition.lower - 100 ) || ( itemPosition.lower > currentPosition.upper + 100 && itemPosition.lower < currentPosition.upper + 100 ) ) {
		return 0; // Item will be visible shortly
	} else {
		return false; // Item is well outside the view pane
	}

};

videojs.PlaylistSlider.prototype.setVisible = function() {
	//console.log( "Setting Visible Items", arguments.callee.caller.toString() );
	var item = null;
	var isVisible = null;
	
	this.firstVisible_ = false;
	this.lastVisible_ = false;
	
	for ( var x = 0; x < this.children_.length; x++ ) {
		isVisible = this.isVisible( x );
		item = this.children_[x];
		
		if ( isVisible ) { // Partially or wholly on screen
			if ( isVisible === true  ) { // wholly visible
				if ( this.firstVisible_ === false ) {
					this.firstVisible_ = x;
				}
				this.lastVisible_ = x;
			}
			item.addClass( 'visible' );


		} else {
			item.removeClass( 'visible' );
		}

		if ( isVisible === 0 || isVisible ) { // Is it visible or upcoming? Make sure the image is loaded.
			item.preload();
		}

	}
	

};

// Movement
videojs.PlaylistSlider.prototype.moveToNext = function( isClick ) {
	//console.log( "isClick:", isClick, "lastVisible_:", this.lastVisible_, "moveToChild_:", this.moveToChild_ );
	if ( isClick ) {
		var next = this.lastVisible_+1;
		if ( next == this.moveToChild_ ) {
			next++;
		}
		this.moveToChild_ = next;
		this.scrollToChild( this.moveToChild_ );
	} else {
		this.scrollToChild( this.lastVisible_+1 );
	}
};

videojs.PlaylistSlider.prototype.moveToPrevious = function( isClick ) {
	if ( isClick ) {
		var next = this.firstVisible_-1;
		if ( next == this.moveToChild_ ) {
			next--;
		}
		this.moveToChild_ = next;
		this.scrollToChild( this.moveToChild_ );
	} else {
		this.scrollToChild( this.firstVisible_-1 );
	}
};

videojs.PlaylistSlider.prototype.moveToSelected = function( index ) {
	//console.log( "moveToSelected" );
	var visible = this.getPosition();
	var itemDims = null;
	var selected = null;

	if ( index ) {
		selected = this.children_[item];
	} else {
		for ( var x = 0; x < this.children_.length; x++ )  {
			if ( this.children_[x].el().className.match('vjs-playlist-selected') !== null ){
				selected = this.children_[x];
				index = x;
				break;
			}
		}
	}

	itemDims = selected.getPosition();
	
	var nextIndex;
	if ( itemDims.upper - itemDims.total < visible.upper ) {
		nextIndex = this.children_[index-1] ? index-1 : index;
	} else if ( itemDims.lower + itemDims.total > visible.lower ) {
		nextIndex = this.children_[index+1] ? index+1 : index;
	} else {
		nextIndex = index;
	}
	//console.log( nextIndex );
	this.scrollToChild( nextIndex );
};





