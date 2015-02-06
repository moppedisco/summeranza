
$( document ).ready(function() {

});
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
		$logo = $(".site-navigation__logo"),
		$intro = $('.header--full-screen-video'),
		$panels = $(".page-section"),
		$navigation = $(".site-navigation__link-group"),
		$buttonScrollDown = $(".button--section-jump--down"),
		$buttonScrollUp = $(".button--section-jump--up"),
		$videoElement = $("#mainVideo"),
		activePanelIndex = 0,
		menuLinkheight = $(".site-navigation__link").height(),
		scrollWait = 1000,
		lastAnimation = 0,
		scrolled = false,
		anim_logo = new TimelineMax({paused: true}),
		anim_intro = new TimelineMax({paused: true}),
		anim_flags = new TimelineMax({paused: true}),
		// backgroundColors = [
		// 	"rgb(255,238,173)",
		// 	"rgb(210,234,228)",
		// 	"rgb(250,204,187)",
		// 	"bg4",
		// 	"bg5"
		// ];
		backgroundColors = [
			"bg1",
			"bg2",
			"bg3",
			"bg4",
			"bg5"
		];		

	function init(){
		initNavigationButtons();
		reSizeVideoWrapper();
		adjustVideoPositioning("#mainVideo");

		// $.stellar({
		// 	 verticalScrolling: false
		// });

		createAnimations();

		initVideoplayer();

		$(window).resize(function() {
			if(!Modernizr.touch){
				adjustVideoPositioning("#mainVideo");
				reSizeVideoWrapper();
			}
		});

		window.addEventListener( 'scroll', noscroll );

		initVerticalScroll();

		$(document).bind('mousewheel DOMMouseScroll MozMousePixelScroll', function(event) {
			event.preventDefault();

			var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;

			var timeNow = new Date().getTime();
			if(timeNow - lastAnimation < scrollWait) {
				event.preventDefault();
				return;
			}
			lastAnimation = timeNow;
			run_introAnim();
			initWaypoints();
			$("body").addClass("introAnimating");
		});
	}

	function initVideoplayer(callback){
		$videoElement[0].addEventListener("pause",function(){
			stopVideo();
		});

		$(".button--watch-video").on("click",function(){
			$(this).fadeOut();

			$(".intro-text").fadeOut(800,function(){
				$videoElement[0].muted = false;
				$videoElement[0].loop = false;
				$videoElement[0].controls = true;
				$videoElement[0].currentTime = 0;
			});		
		});

		$(".button--scrolldown").on("click",function(){
			$(".button--watch-video").fadeIn();
			$(".intro-text").fadeIn();		
			$videoElement[0].loop = true;
			$videoElement[0].controls = false;
			$videoElement[0].muted = true;
		});
	}

	function noscroll(){
		window.scrollTo(0,0);
	}

	function initVerticalScroll(){
		// $("body").mousewheel(function(event, delta) {
		// 	this.scrollLeft -= (delta);
		// 	event.preventDefault();
		// });
		
	}

	function initNavigationButtons(){
		// Scroll down button mobile
		// $buttonScrollDown.on("click",function(){
		// 	$body.animate({
		// 		scrollTop: $(".page-section.active").next().offset().top-92
		// 	}, 800);
		// 	return false
		// });
		// // Scroll up button mobile
		// $buttonScrollUp.on("click",function(){
		// 	if(activePanelIndex != 0){
		// 		$body.animate({
		// 			scrollTop: $(".page-section.active").prev().offset().top-92
		// 		}, 800);
		// 	} else {
		// 		$body.animate({
		// 			scrollTop: $(".page-section.first").offset().top
		// 		}, 800);				
		// 	}
		// 	return false
		// });	

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

	var scrollTime = 0;
	var last_scroll = 0;

	function initWaypoints(){
		// $('.page-section.first').addClass("active");
		$panels.waypoint({
			element: $(".wrapper"),
			// horizontal: true,
			handler: function(direction) {
				var currentIndex = $(".page-section").index(this);
					prevIndex = currentIndex-1;

				if(direction === "down"){
					if(currentIndex === 0){
						return false
					}
					setActiveSection(currentIndex,"1");
				} else if(direction === "up"){
					if(prevIndex < 0){
						return false
					}
					setActiveSection(prevIndex,"-1");
				}
			},
			offset: "3%"
		});
	}

	function setActiveSection(activeIndex,direction){
		activePanelIndex = activeIndex;
		// Reset navigation
		$navigation.find("a").removeClass("active");

		$logo.addClass("animate"+activeIndex);
		if(direction === "-1"){
			$logo.removeClass("animate"+(activeIndex-direction));	
		}
		
		animateLogo(activeIndex,direction);

		// Animate navigation
		if(Modernizr.touch){
			$navigation.css({"transform":"translateY(-"+(menuLinkheight*(activeIndex))+"px)"});
		}
		// Set active navigation element
		$navigation.find("a:eq("+activeIndex+")").addClass("active");
		
		// Set active section background class on body
		// $(".wrapper").css("background-color",backgroundColors[activeIndex]).addClass("introDone");
		// console.log("asda");
		TweenLite.to("body", 1, {className:backgroundColors[activeIndex],onComplete: function(){
			$body.addClass("introDone");
		}});
		
		$(".page-section:eq('"+(activeIndex-direction)+"') .main-graphic").css("opacity","1").removeClass('animated bounceOutDown bounceInUp').addClass("animated bounceOutDown");
		$(".page-section:eq('"+activeIndex+"')").addClass("active");
		$(".page-section:eq('"+(activeIndex-direction)+"')").removeClass("active");
		$(".page-section:eq('"+(activeIndex)+"') .main-graphic").css("opacity","1").removeClass('animated bounceOutDown bounceInUp').addClass("animated bounceInUp");

	}

	function createAnimations(){
		// Logo animation sequence
		anim_logo
			.to($(".logo-nr2"),0.3,{ opacity: "1", rotation: "180", transformOrigin:"50% 50%" },'one')
			.to($(".logo-nr2"),0.3,{ y: "-50%"},"one+=0.3")
			.to($(".logo-nr1"),0.3,{ y: "50%" },"one+=0.3")
			.to($(".logo-nr1"),0.3,{ rotation: "-90", y: "0%" },"two")
			.to($(".logo-nr2"),0.3,{ rotation: "90", y: "0%" },"two")
			.to($(".logo-nr1"),0.3,{ x: "-16px"  },"two+=0.3")
			.to($(".logo-nr2"),0.3,{ x: "16px"  },"two+=0.3")
			.to($(".logo-nr1"),0.3,{ x: "16px"  },"three")
			.to($(".logo-nr2"),0.3,{ x: "-16px"  },"three")
			.to($(".logo-nr1"),0.3,{ x: "16px"  },"four")
			.to($(".logo-nr2"),0.3,{ x: "-16px"  },"four")
			.to($(".logo-nr3"),0.3,{ opacity: "1", rotation: "0" },"five")
			.to($(".logo-nr4"),0.3,{ opacity: "1", rotation: "-180"  },"five")
			.to($(".logo-nr1"),0.3,{ x: "32px" },"five+=0.3")
			.to($(".logo-nr2"),0.3,{ x: "-32px" },"five+=0.3")
			.to($(".logo-nr3"),0.3,{ y: "32px" },"five+=0.3")
			.to($(".logo-nr4"),0.3,{ y: "-32px"  },"five+=0.3")
			.to($(".logo-nr3"),0.3,{ y: "32px" },"last")
			.to($(".logo-nr4"),0.3,{ y: "-32px"  },"last");

		// Flags popup animation
		anim_flags
			.staggerFrom(".tower-small", 0.3, { y: "200", ease: Back.easeOut.config(1.7)}, -0.1, "stagger"); 

		// Video to site transtion sequence
		anim_intro
			.staggerTo([".header__text--summeranza", ".header__text--tagline"], 0.5, 
				{
					y:"-10",
					opacity: 0
				}, 0.1,"seq0")
			.to($(".header__ef-logo"),0.5,{ opacity: "0", ease: Power4.easeInOut },"seq0")
			.to($(".button--watch-video"),0.5,{ opacity: "0", ease: Power4.easeInOut },"seq0")			
			.staggerFrom([".header__text--date", ".header__text--venue"], 0.5, 
				{
					y:"10px",
					opacity: 0,
					ease: Back.easeOut.config(1.1)
				}, 0.1,"-=0.1")		

			.to($intro,0.3,{ autoAlpha: "0",delay: 0.6})
			.staggerFrom([".wave-level2", ".wave-level3",".page-section.first .main-graphic"], 0.3, 
				{
					y:"100%",
					ease: Back.easeOut.config(1.1),
					onComplete: function(){
						$(".page-section.first").addClass("active");
						window.removeEventListener( 'scroll', noscroll );
						$("body").removeClass("introAnimating").addClass("introDone");
						anim_flags.play();
					}					
				}, 0.1,"-=0.1");

	}
	function run_introAnim(){
		$(document).unbind('mousewheel DOMMouseScroll MozMousePixelScroll');
		anim_intro.play();
	}

	function animateLogo(activeIndex,direction){
		if(direction == "1"){
			switch(activeIndex) {
				case 0:
					
					break;
				case 1:
					anim_logo.tweenTo("two");
					anim_flags.reverse();
					break;
				case 2:
					anim_logo.tweenTo("three");
					break;
				case 3:
					anim_logo.tweenTo("four");
					break;
				case 4:
					anim_logo.tweenTo("last");
					break;		
				default:
					// default code block
			}
		} else if(direction == "-1"){
			switch(activeIndex) {
				case 0:
					anim_logo.tweenFromTo("two","one");
					anim_flags.play();
					break;
				case 1:
					anim_logo.tweenTo("two");
					break;
				case 2:
					anim_logo.tweenTo("three");
					break;
				case 3:
					anim_logo.tweenTo("four");
					break;			
				default:
					// default code block
			}
		}

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