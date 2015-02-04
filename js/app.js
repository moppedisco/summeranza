
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
		backgroundColors = [
			"rgb(255,238,173)",
			"rgb(210,234,228)",
			"rgb(250,204,187)",
			"bg4",
			"bg5"
		];

	function init(){
		initNavigationButtons();
		initWaypoints();

		reSizeVideoWrapper();
		adjustVideoPositioning("#mainVideo");

		initVideoplayer();

		$(window).resize(function() {
			if(!Modernizr.touch){
				adjustVideoPositioning("#mainVideo");
				reSizeVideoWrapper();
			}
		});

		// $("body").css("overflow","hidden");

		initScroll();
		$(document).bind('mousewheel DOMMouseScroll MozMousePixelScroll', function(event) {
			event.preventDefault();
			var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
			console.log(delta);
			var timeNow = new Date().getTime();
			if(timeNow - lastAnimation < scrollWait && delta > 0) {
				event.preventDefault();
				return;
			}
			console.log("asd");
			lastAnimation = timeNow;
			introAnim();
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

	function playVideo(){
		// window.addEventListener( 'scroll', noscroll );

	}

	function stopVideo(){
		// window.removeEventListener( 'scroll', noscroll );

	}


	function introAnim(){
		$(document).unbind('mousewheel DOMMouseScroll MozMousePixelScroll');
		$.stellar();
		$(".intro-text").transition({
			opacity: "0",
			marginTop: "20px"
		},600,function(){
			window.scrollTo(0,0);

			$(".page-section.first img").css({
				"z-index":"99999",
				"transform":"translate(0,100%)"
			}).transition({
				y: "-10px",
				delay: 300
			},400).transition({
				y: "0"
			},150);

			$(".wave2").css({
				"z-index":"99999",
				"transform":"translate(0,100%)"
			}).transition({
				y: "-10px"
			},300).transition({
				y: "0"
			},100);
			setTimeout(function(){ 
				$intro.transition({
					opacity: "0"
				},function(){
					initScroll();
				});
			}, 600);
		});
	}

	function initScroll(){
		$("body").mousewheel(function(event, delta) {
			this.scrollLeft -= (delta);
			event.preventDefault();
		});
		
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
		$('.page-section.first').addClass("active");
		$panels.waypoint({
			element: $(".wrapper"),
			horizontal: true,
			handler: function(direction) {
				var currentIndex = $(".page-section").index(this);
					prevIndex = currentIndex-1;

				if(direction === "right"){
					if(currentIndex === 0){
						return false
					}
					setActiveSection(currentIndex,"1");
				} else if(direction === "left"){
					if(prevIndex < 0){
						return false
					}
					setActiveSection(prevIndex,"-1");
				}

			},
			offset: "0%"
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
		$(".wrapper").css("background-color",backgroundColors[activeIndex]);
		
		$(".page-section:eq('"+(activeIndex-direction)+"') img").css("opacity","1").attr('class', '').addClass("animated bounceOutDown");
		$(".page-section:eq('"+activeIndex+"')").addClass("active");
		$(".page-section:eq('"+(activeIndex-direction)+"')").removeClass("active");
		$(".page-section:eq('"+(activeIndex)+"') img").css("opacity","1").attr('class', '').addClass("animated bounceInUp");

	}

	function animateLogo(activeIndex,direction){
		if(direction === "1"){
			switch(activeIndex) {
				case 1:
					$(".logo-nr2").css("opacity","0").transition({
						opacity: "1",
						rotate: "180"
					},function(){
						$(".logo-nr1").transition({
							y: "50%"
						});
						$(".logo-nr2").transition({
							y: "50%"
						});
					});
					break;
				case 2:
					$(".logo-nr1").css({ transformOrigin:'50% 0%'}).transition({
						rotate: "90deg"
					}).transition({
						x: "25%"
					});
					$(".logo-nr2").css({ transformOrigin:'50% 50%'}).transition({
						rotate: "270deg"
					}).transition({
						y: "-25%"
					});
					break;
				default:
					// default code block
			}
		} else if(direction === "-1"){
			switch(activeIndex) {
				case 0:
					$(".logo-nr2").transition({
						y: 0
					}).transition({
						opacity: "0",
						rotate: "0"						
					});
					$(".logo-nr1").transition({
						y: "0%"
					});					
					break;
				case 1:
					$(".logo-nr1").css({ transformOrigin:'50% 0%'}).transition({
						x: "0%",
						y: "50%"
					}).transition({
						rotate: "0deg"
					});
					$(".logo-nr2").css({ transformOrigin:'50% 50%'}).transition({
						y: "50%"
					}).transition({
						rotate: "180deg"
					});
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