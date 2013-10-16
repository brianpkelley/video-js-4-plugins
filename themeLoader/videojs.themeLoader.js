//
// Author: Brian Kelley
// Description: Very simple plugin that automatically includes the video.js css file that
// 				relates to the classname vjs-SKINNAME-skin.  On line 17 insert your theme
//				directory relative to the page or absolute.  Strongly recommended to us
//				temp.href = "//yoursite.com/XXXXXXX" (note the absence of http: or https:) to avoid issues with protocols.
//
// Example: <video class="videojs vjs-blue-skin"></video> would automatically include "yourThemeDirectory/blue.css"
// 

(function(){
	videojs.plugin('bvThemeLoader', function(){
		var skinTest = /vjs\-(.*?)\-skin/.exec(this.el().className);
		var skinName = skinTest[1];
		
		var head = document.getElementsByTagName('head')[0];
		var temp = document.createElement('link');
		
		// replace with path to your themes directory
		temp.href = "themes/"+skinName+".css";
		temp.rel = "stylesheet";
		
		head.appendChild( temp );
		
	});			
})();