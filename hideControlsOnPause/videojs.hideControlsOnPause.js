(function(){
	videojs.plugin('bvHideControlBarOnPause', function(){
		this.on('pause', function() {
			setTimeout( videojs.bind(this, videojs.ControlBar.unlockShowing), 10 );
		});
	});			
})();