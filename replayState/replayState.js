(function() {
	'use strict';
	
	
	vjs.PlayToggle.prototype.removeRestart = function() {
		setTimeout( videojs.bind( this, function() {
			vjs.removeClass(this.el_, 'icon-undo');
		}), 1);
	};
	
	
	
  // OnPlay - Add the vjs-playing class to the element so it can change appearance
	vjs.PlayToggle.prototype.onPlay = function(){
		
		this.removeRestart();
		
		vjs.removeClass(this.el_, 'vjs-paused');
		vjs.addClass(this.el_, 'vjs-playing');
		this.el_.children[0].children[0].innerHTML = 'Pause'; // change the button text to "Pause"
	};
	
		// OnPause - Add the vjs-paused class to the element so it can change appearance
	vjs.PlayToggle.prototype.onPause = function(){
		var bigPlayButton = this.player().bigPlayButton;
		
		vjs.removeClass(this.el_, 'icon-undo');
		vjs.removeClass(this.el_, 'vjs-playing');
		
		vjs.removeClass(bigPlayButton.el(), 'icon-undo' );
		
		if ( this.player_.duration() == this.player_.currentTime() ) {
			vjs.addClass(this.el_, 'icon-undo');
			vjs.addClass(bigPlayButton.el() , 'icon-undo');
			this.el_.children[0].children[0].innerHTML = 'Replay'; // change the button text to "Play"
			
			this.removeRestart_ = videojs.bind( this, function() {
				vjs.removeClass(this.el_, 'icon-undo');
			});
			this.player_.one('playlistautoload', this.removeRestart_ );
		} else {
			vjs.addClass(this.el_, 'vjs-paused');
			this.el_.children[0].children[0].innerHTML = 'Play'; // change the button text to "Play"
		}
	};
	
	
	
})();
