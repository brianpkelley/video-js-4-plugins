#addThis Video.js Plugin#
This creates a "share" menu in the control bar for video.js.  Currently it only supports creating links for the some of the more popular sites, and a "more" link that opens a new window with the entire list of shareable sites.

##Usage##
In the data-setup or setup object passed to videojs function.

####HTML####
````html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>HTML5 Video Player</title>

  <!--[if IE]>
    <script src="https://getfirebug.com/releases/lite/1.4/firebug-lite.js"></script>
  <!--<![endif]-->

  <script src="js/video.dev.js"></script>
  <script src="js/videojs.addThis.js"></script>
</head>
<body>
  <video id="vid1" class="video-js vjs-blue-skin" controls preload="auto" width="420" height="236"
      poster="//video2.bettervideo.com/video/PRE/JPG640x360/12.8886.jpg"
      data-setup='{"plugins":{"addThis":{"website_url": "http://www.google.com", "embed": true, "reddit":false,"delicious":false}}}'>
    <source src="http://vjs.zencdn.net/v/oceans.mp4" type="video/mp4">
	  <source src="http://vjs.zencdn.net/v/oceans.webm" type="video/webm">
	  <track kind="captions" src="/vtt/captions.vtt" srclang="en" label="English"></track>
    <p>Video Playback Not Supported</p>
  </video>
  
</body>
</html>
````
####Javascript####
````html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>HTML5 Video Player</title>
  
  <!-- Base Player -->
  <link href="../../dist/video-js/video-js.min.css" rel="stylesheet" />
  <script src="../../dist/video-js/video.dev.js"></script>
  
  <!-- Plugins -->
  <link href="videojs.addThis.css" rel="stylesheet" />
  <script src="videojs.addThis.js"></script>
  

</head>
<body>


  	<video id="vid1" controls preload="none" poster="http://www.videojs.com/img/poster.jpg" class="video-js vjs-default-skin" >
	  <source src="http://vjs.zencdn.net/v/oceans.mp4" type="video/mp4">
	  <source src="http://vjs.zencdn.net/v/oceans.webm" type="video/webm">
	  <track kind="captions" src="/vtt/captions.vtt" srclang="en" label="English"></track>
	</video>
  
  <script>
	videojs("vid1", {
			height: 267,
			width: 640,
			plugins: {
				addThis: {
				  reddit: false,
				  delecious: false,
				  website_url: "http://www.google.com",
				  embed: true
				}
			}
		}, function(){
		// Player (this) is initialized and ready.
	});
  </script>
</body>
</html>
````
