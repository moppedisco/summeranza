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
		},
		preventDefault: function(e) {
			e = e || window.event;
			if (e.preventDefault)
			e.preventDefault();
			e.returnValue = false;  
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
		$videoElement = $("#mainVideo"),
		activePanelIndex = -1,
		nrPageSections = $(".page-section").length-1,
		menuLinkheight = $(".site-navigation__link").height(),
		scrollWait = 1000,
		lastAnimation = 0,
		isAnimating = false,
		anim_logo = new TimelineMax({paused: true}),
		anim_intro = new TimelineMax({paused: true}),
		anim_flags = new TimelineMax({paused: true}),
		anim_hands = new TimelineMax({paused: true}),		
		backgroundColors = [
			"bg1",
			"bg2",
			"bg3",
			"bg4",
			"bg5"
		],
		scrollVal,
		isRevealed, 
		noscroll, 
		isAnimating,
		isVideoPlaying = false,
		$container = $('.header--full-screen-video');		

	var ie = (function(){
		var undef,rv = -1; // Return value assumes failure.
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf('MSIE ');
		var trident = ua.indexOf('Trident/');

		if (msie > 0) {
			// IE 10 or older => return version number
			rv = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		} else if (trident > 0) {
			// IE 11 (or newer) => return version number
			var rvNum = ua.indexOf('rv:');
			rv = parseInt(ua.substring(rvNum + 3, ua.indexOf('.', rvNum)), 10);
		}

		return ((rv > -1) ? rv : undef);
	}());


	// disable/enable scroll (mousewheel and keys) from http://stackoverflow.com/a/4770179					
	// left: 37, up: 38, right: 39, down: 40,
	// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
	var keys = [32, 37, 38, 39, 40], wheelIter = 0;

	function init(){

		

		adjustVideoPositioning("#mainVideo");

		initNavigationButtons();
		initWaypoints();
		initVideoplayer();
		if(!Modernizr.touch){
			
			// initHeaderScroll();
			reSizeVideoWrapper();
		}
		
		$(window).resize(function() {
			if(!Modernizr.touch){
				adjustVideoPositioning("#mainVideo");
				reSizeVideoWrapper();
			}
		});

		createAnimations();
	}

	function keydown(e) {
		for (var i = keys.length; i--;) {
			if (e.keyCode === keys[i]) {
				Summeranza.helpers.preventDefault(e);
				return;
			}
		}
	}

	function touchmove(e) {
		Summeranza.helpers.preventDefault(e);
	}

	function wheel(e) {
		// for IE 
		//if( ie ) {
			//preventDefault(e);
		//}
	}

	function disable_scroll() {
		window.onmousewheel = document.onmousewheel = wheel;
		document.onkeydown = keydown;
		document.body.ontouchmove = touchmove;
	}

	function enable_scroll() {
		window.onmousewheel = document.onmousewheel = document.onkeydown = document.body.ontouchmove = null;  
	}

		
	function scrollPage() {
		scrollVal = Summeranza.helpers.scrollY();
		
		if( noscroll && !ie ) {
			if( scrollVal < 0 ) return false;
			// keep it that way
			window.scrollTo( 0, 0 );
		}

		if( $container.hasClass('notrans')) {
			$container.removeClass('notrans');
			return false;
		}

		if( isAnimating || isVideoPlaying) {
			return false;
		}
		
		if( scrollVal <= 0 && isRevealed ) {
			toggleIntro(0);
		}
		else if( scrollVal > 0 && !isRevealed ){
			toggleIntro(1);
		}
	}

	function toggleIntro( reveal ) {
		isAnimating = true;
		
		if( reveal ) {
			$container.addClass('modify');
			// anim_intro.tweenTo("seq3");
		}
		else {
			noscroll = true;
			disable_scroll();
			// anim_intro.tweenFromTo("seq3","seq5");
			$container.removeClass('modify');
		}

		// simulating the end of the transition:
		setTimeout( function() {
			isRevealed = !isRevealed;
			isAnimating = false;
			if( reveal ) {
				noscroll = false;
				enable_scroll();
			}
		}, 600 );
	}

	function initHeaderScroll(){
		var pageScroll = Summeranza.helpers.scrollY();
		noscroll = pageScroll === 0;
		
		disable_scroll();
		if( pageScroll ) {
			isRevealed = true;
		}
		
		window.addEventListener( 'scroll', scrollPage );
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

		// Flags popup animation
		anim_hands
			.staggerFrom(".hand-small", 0.3, { y: "200", ease: Back.easeOut.config(1.7)}, -0.1, "stagger"); 


		// Video to site transtion sequence
		// anim_intro
		// 	.staggerFrom([".header__text--summeranza", ".header__text--tagline"], 0.3, 
		// 		{ x:"0", opacity: 1,ease: Power2.easeOut }, 0.1,"seq0")
		// 	.staggerTo([".header__text--summeranza", ".header__text--tagline"],0.1, 
		// 		{ x:"-10", opacity: 0,ease: Power2.easeOut }, 0.1,"seq1")		
		// 	.staggerFrom([".header__text--date", ".header__text--venue"], 0.3, 
		// 		{ x:"10px", opacity: 0,ease: Power2.easeOut }, 0.1,"seq2")
		// 	.staggerTo([".header__text--date", ".header__text--venue"], 0.3, 
		// 		{ x:"-10", opacity: 0,ease: Power2.easeOut }, 0.1,"seq3");
	}

	function initVideoplayer(callback){
		if(!Modernizr.touch){
			$videoElement[0].addEventListener("pause",function(){
				isVideoPlaying = false;
				enable_scroll();
				if(!$videoElement[0].seeking){
					$(".button--watch-video").fadeIn();
					$(".header__vert-box").fadeIn();			
				}
			});

			$videoElement[0].addEventListener("ended",function(){
				isVideoPlaying = false;
				$videoElement[0].currentTime = 0;
				$videoElement[0].pause();
				$(".button--watch-video").fadeIn();
				$(".header__vert-box").fadeIn();
			});

			$videoElement[0].addEventListener("play",function(){
				isVideoPlaying = true;

				if(!$videoElement[0].autoplay){
					$(".button--watch-video").fadeOut();
					$(".header__vert-box").fadeOut();				
				}
			});
		}

		$(".button--watch-video").on("click",function(){
			if(!Modernizr.touch){
				playIntro(function(){

					$videoElement[0].currentTime = 0;
					$videoElement[0].pause();
					$videoElement[0].play();
					$videoElement[0].controls = true;
					$videoElement[0].muted = false;
					$videoElement[0].autoplay = false;
					$videoElement[0].loop = false;

					isVideoPlaying = true;
					disable_scroll()
				});
			} else {
				$videoElement[0].play();
			}
		});
	}

	function playIntro(callback){
		if(Summeranza.helpers.scrollY()>0){
			$body.animate({
				scrollTop: 0
			},400,function(){
				callback();
			});
		} else {
			callback();
		}		
	}

	function initNavigationButtons(){
		// Scroll down button mobile
		$buttonScrollDown.on("click",function(){
			if(activePanelIndex < 0){
				TweenLite.to(window, 0.4, {scrollTo:{y:$(".page-section.first").offset().top}, ease:Power2.easeOut});
			} else if(activePanelIndex == nrPageSections){
				return false
			} else {
				TweenLite.to(window, 0.4, {scrollTo:{y:$(".page-section.active").next().offset().top}, ease:Power2.easeOut});
			}
			return false
		});
		// Scroll up button mobile
		$buttonScrollUp.on("click",function(){
			if(activePanelIndex <= 0){
				TweenLite.to(window, 0.4, {scrollTo:{y:$(".header--full-screen-video").offset().top}, ease:Power2.easeOut});
			} else {
				TweenLite.to(window, 0.4, {scrollTo:{y:$(".page-section.active").prev().offset().top}, ease:Power2.easeOut});
			}
			return false
		});	

		// Navigation buttons
		$navigation.find("a").on("click",function(){
			if(!Modernizr.touch){
				TweenLite.to(window, 0.4, {scrollTo:{y:$(".page-section:eq("+$(this).index()+")").offset().top}, ease:Power2.easeOut});
			}
			return false
		});	
	}

	function initWaypoints(){
		
		$('.page-section.first').addClass("static");
		$('.wrapper').addClass("bg1");

		$('.page-section.first').waypoint({
			handler: function(direction) {
				if(direction === "down"){
					activePanelIndex = 0;
					anim_flags.play();
					$(this).removeClass("static").addClass("active");	
					$(".site-navigation").addClass("fixed");
					$(".wave").addClass("animated fadeInUp");
				} else {
					anim_flags.reverse();
					activePanelIndex = -1;
					$(this).removeClass("active").addClass("static");
					$(".site-navigation").removeClass("fixed");
				}
			},
			offset: "0%"
		});

		$panels.waypoint({
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
					setActiveSection(prevIndex,'-1');
				}

			},
			offset: "50%"
		});

	}

	function setActiveSection(activeIndex,direction){
		// if(isAnimating){
		// 	return false
		// }
		// isAnimating = true;

		// setTimeout(function(){ 
		// 	isAnimating = false;
		// }, 800);

		activePanelIndex = activeIndex;
		// Reset navigation
		$navigation.find("a").removeClass("active");
		// Animate navigation
		if(Modernizr.touch){
			$navigation.css({"transform":"translateY(-"+(menuLinkheight*(activeIndex))+"px)"});
		}
		// Set active navigation element
		$navigation.find("a:eq("+activeIndex+")").addClass("active");
		
		if(!Modernizr.touch){
			animateLogo(activeIndex,direction);
		}

		// Set active section background class on body
		$(".wrapper").removeClass(backgroundColors[activeIndex-direction]).addClass(backgroundColors[activeIndex]);
		
		$(".page-section:eq('"+(activeIndex-direction)+"') .main-graphic").css("opacity","1").removeClass('animated bounceOutDown bounceInUp').addClass("animated bounceOutDown");
		$(".page-section").removeClass("active");
		$(".page-section:eq('"+activeIndex+"')").addClass("active");
		
		$(".page-section:eq('"+(activeIndex)+"') .main-graphic").css("opacity","1").removeClass('animated bounceOutDown bounceInUp').addClass("animated bounceInUp");
	}

	function animateLogo(activeIndex,direction){
		if(direction == "1"){
			switch(activeIndex) {
				case 0:
					break;
				case 1:
					anim_logo.tweenTo("two");
					anim_flags.reverse();
					anim_hands.play();
					break;
				case 2:
					anim_logo.tweenTo("three");
					anim_hands.reverse();
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
					anim_hands.reverse();
					break;
				case 1:
					anim_logo.tweenTo("two");
					anim_hands.play();
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
