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
		$intro = $('.header--full-screen-video'),
		$panels = $(".page-section"),
		$navigation = $(".site-navigation__link-group"),
		$buttonScrollDown = $(".button--section-jump--down"),
		$buttonScrollUp = $(".button--section-jump--up"),
		$videoElement = $("#mainVideo"),
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

		$(window).resize(function() {
			if(!Modernizr.touch){
				adjustVideoPositioning("#mainVideo");
				reSizeVideoWrapper();
			}
		});
	}

	function initVideoplayer(callback){
		$videoElement[0].addEventListener("pause",function(){
			stopVideo();
		});

		$(".button--watch-video").on("click",function(){
			playIntro(function(){
				playVideo();
			});
		});

		$(".button--scrolldown").on("click",function(){
			stopVideo();
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
		window.addEventListener( 'scroll', noscroll );
		$(".button--watch-video").fadeOut();

		$(".intro-text").fadeOut(800,function(){
			$videoElement[0].muted = false;
			$videoElement[0].loop = false;
			$videoElement[0].currentTime = 0;
		});		
	}

	function stopVideo(){
		window.removeEventListener( 'scroll', noscroll );
		$(".button--watch-video").fadeIn();
		$(".intro-text").fadeIn();		
		$videoElement[0].loop = true;
		$videoElement[0].controls = false;
		$videoElement[0].muted = true;
	}

	function noscroll() {
		window.scrollTo(0,0);
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
		$('body').addClass("bg1");
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

	function setActiveSection(activeIndex,direction){
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
