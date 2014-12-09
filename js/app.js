/* 
/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
START HERE //////////////////////////////////
*/

(function(window){

	var animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
		// animation end event name
		animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
		promiseVideoloaded = new $.Deferred(),
		promiseIntroAnimIn = new $.Deferred(),
		promiseIntroAnimOut = new $.Deferred();

	// Main app
	function init(){

		Summeranza.app.init();

		if(!Modernizr.touch){
			loadVideoIntro();	
		} else {

		}

		Modernizr.load({
			test: Modernizr.touch,
			yep : ['js/fastClick.js'],
			callback : function (url, result, key) {
				if(result){
					FastClick.attach(document.body);
				}
			}
		});		
	}

	function loadVideoIntro(){
		$("#mainVideo")[0].addEventListener('loadeddata', function() {
			console.log("video is loaded");
			promiseVideoloaded.resolve(this);
		});

		$(".loader-circle")[0].addEventListener( animEndEventName, function(){
			console.log("loader animation done");
			promiseIntroAnimIn.resolve(this);
		});

		// $(".loader-screen")[0].addEventListener( animEndEventName, function(){
		// 	console.log("loader screen disapeared");
		// 	// promiseIntroAnimOut.resolve(this);
		// });

		var pelle = $.when( promiseVideoloaded, promiseIntroAnimIn ).done(function ( v1, v2 ) {
		    $(".loader-screen").addClass("loaded");
		    console.log("intro anim and video is done");
		});
	}

	window.Summeranza = {
		init: init
	};

}(window));

/* 
/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
Helpers = viewportsize, scroll position /////
*/

Summeranza.helpers = (function(window){

	var docElem = window.document.documentElement;

	return {
		getViewportW: function() {
			var client = docElem['clientWidth'], inner = window['innerWidth'];
			return client < inner ? inner : client;
		},
		getViewportH: function() {
			var client = docElem['clientHeight'], inner = window['innerHeight'];
			return client < inner ? inner : client;
		},
		scrollX: function() { 
			return window.pageXOffset || docElem.scrollLeft; 
		},
		scrollY: function() { 
			return window.pageYOffset || docElem.scrollTop; 
		}
	};
}(window));

/* 
/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
MAIN FUNCTIONALITY //////////////////////////
*/
Summeranza.app = (function(window){

	var $body = $("body"),
		$intro = $('.header--full-screen-video'),
		$panels = $(".page-section"),
		$navigation = $(".site-navigation__link-group"),
		$buttonScrollDown = $(".button--section-jump--down"),
		$buttonScrollUp = $(".button--section-jump--up"),
		activePanelIndex = 0,
		menuLinkheight = $(".site-navigation__link").height(),
		backgroundColors = [
			"bg1",
			"bg2",
			"bg3",
			"bg4",
			"bg5"
		];

	function init(){
		
		reSizeVideoWrapper();

		adjustVideoPositioning("#mainVideo");

		initNavigationButtons();
		initWaypoints();
		initVideoplayer();

		$(".button--watch-video").on("click",function(){
			playIntroVideo();
		});

		$(window).resize(function() {
			if(!Modernizr.touch){
				adjustVideoPositioning("#mainVideo");
				reSizeVideoWrapper();
			}
		});
	}

	function initVideoplayer(){

	}

	function playIntroVideo(){
		if(Summeranza.helpers.scrollY()>0){
			$body.animate({
				scrollTop: 0
			},400,function(){
				$(".wrapper,.section--small").hide();
				$(".intro-text").fadeOut(800,function(){
					document.getElementById("mainVideo").muted = false;
					document.getElementById("mainVideo").loop = false;
					document.getElementById("mainVideo").currentTime = 0;
					document.getElementById("mainVideo").controls = true;
				});
			});
		} else {
			$(".wrapper,.section--small").hide();
			$(".intro-text").fadeOut(800,function(){
				document.getElementById("mainVideo").muted = false;
				document.getElementById("mainVideo").loop = false;
				document.getElementById("mainVideo").currentTime = 0;
				document.getElementById("mainVideo").controls = true;
			});				
		}		
	}

	function initNavigationButtons(){
		// Scroll down button mobile
		$buttonScrollDown.on("click",function(){
			$body.animate({
				scrollTop: $(".page-section.active").next().offset().top-92
			}, 800);
			return false
		});
		// Scroll up button mobile
		$buttonScrollUp.on("click",function(){
			if(activePanelIndex != 0){
				$body.animate({
					scrollTop: $(".page-section.active").prev().offset().top-92
				}, 800);
			} else {
				$body.animate({
					scrollTop: $(".page-section.first").offset().top
				}, 800);				
			}
			return false
		});	

		// Navigation buttons
		$navigation.find("a").on("click",function(){
			if(!Modernizr.touch){
				$body.animate({
					scrollTop: $(".page-section:eq("+$(this).index()+")").offset().top
				}, 800);
			}
			return false
		});	
	}

	function initWaypoints(){
		$('.page-section.first').addClass("static");
		$panels.waypoint({
			handler: function(direction) {
				var currentIndex = $(".page-section").index(this);
					prevIndex = currentIndex-1;

				if(direction === "down"){
					if(currentIndex === 0){
						return false
					}
					setActiveSection(currentIndex);
				} else if(direction === "up"){
					if(prevIndex < 0){
						return false
					}
					setActiveSection(prevIndex);
				}

			},
			offset: "50%"
		});
		$('.page-section.first').waypoint({
			handler: function(direction) {
				if(direction === "down"){
					$(this).removeClass("static").addClass("active");	
					$(".site-navigation").addClass("fixed");
				} else {
					$(this).removeClass("active").addClass("static");	
					$(".site-navigation").removeClass("fixed");
				}
			},
			offset: "0%"
		});
	}

	function setActiveSection(activeIndex){
		activePanelIndex = activeIndex;
		// Reset navigation
		$navigation.find("a").removeClass("active");
		// Animate navigation
		if(Modernizr.touch){
			$navigation.css({"transform":"translateY(-"+(menuLinkheight*(activeIndex))+"px)"});
		}
		// Set active navigation element
		$navigation.find("a:eq("+activeIndex+")").addClass("active");
		
		// Set active section background class on body
		$body.attr("class","").addClass(backgroundColors[activeIndex]);
		
		$panels.each(function(index) {
			$(this).removeClass("active");
			if(index === activeIndex){
				$(this).addClass("active");
			}
		});		
	}

	function reSizeVideoWrapper(){
		$intro.css({"height":Summeranza.helpers.getViewportH(),"width":Summeranza.helpers.getViewportW()});	
	}

	function adjustVideoPositioning(element) {
		var windowW = $(window).width();
		var windowH = $(window).height();
		var mediaAspect = 16/9;
		var windowAspect = windowW/windowH;
		if (windowAspect < mediaAspect) {
			// taller
			$(element).find("video")
				.width(windowH*mediaAspect)
				.height(windowH);
			$(element)
				.css('top',0)
				.css('left',-(windowH*mediaAspect-windowW)/2)
				.css('height',windowH);
			$(element+'_html5_api').css('width',windowH*mediaAspect);
			$(element+'_flash_api')
				.css('width',windowH*mediaAspect)
				.css('height',windowH);
		} else {
			// wider
			$(element).find("video")
				.width(windowW)
				.height(windowW/mediaAspect);
			$(element)
				.css('top',-(windowW/mediaAspect-windowH)/2)
				.css('left',0)
				.css('height',windowW/mediaAspect);
			$(element+'_html5_api').css('width','100%');
			$(element+'_flash_api')
				.css('width',windowW)
				.css('height',windowW/mediaAspect);
		}
	}

	return {
		init: init
	};

}(window))  // Self execute
