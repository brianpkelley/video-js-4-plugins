```html
<video id="video-js-1" controls preload="none" poster="http://www.videojs.com/img/poster.jpg" class="video-js vjs-default-skin" >
      <source src="http://vjs.zencdn.net/v/oceans.mp4" type="video/mp4" />
      <source src="http://vjs.zencdn.net/v/oceans.webm" type="video/webm" />
      <track kind="captions" src="/vtt/captions.vtt" srclang="en" label="English"></track>
</video>
```

```javascript
<script>
	videojs("video-js-1", {
		height: 267,
		width: 640,
		plugins: {
			logo: {
				src: "http://www.3playmedia.com/ui/images/Video-js-logo.png",
				alt: "Logo Alt Text",
				url: "http://www.videojs.com",
				width: '50px'
			}
		}
	}, function(){
		// Player Ready.  
		// this = videojs('video-js-1');
	});
</script>
```

View this demo:
https://jsfiddle.net/3n1gm4/ez9vzjo3/
