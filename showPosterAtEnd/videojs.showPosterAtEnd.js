(function(){
	videojs.plugin('showPosterAtEnd', function(){
		this.on('ended',function() {
			console.log( this );
			this.posterImage.show();
			this.bigPlayButton.show();
			this.currentTime(0.0);
			this.pause();
		});
	});			
})();