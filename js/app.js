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
		anim_logo = new TimelineMax({paused: true}),
		anim_intro = new TimelineMax({paused: true}),
		anim_flags = new TimelineMax({paused: true}),
		anim_hands = new TimelineMax({paused: true}),
		anim_tents = new TimelineMax({paused: true}),		
		backgroundColors = [
			"bg1",
			"bg2",
			"bg3",
			"bg4",
			"bg5",
			"bg6"
		],
		$container = $('.header--full-screen-video');		

	function init(){
		adjustVideoPositioning("#mainVideo");

		initNavigationButtons();
		initWaypoints();
		
		if(!Modernizr.touch){
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
			.staggerFrom(".tower-small", 0.3, { y: "100%", ease: Back.easeOut.config(1.7)}, -0.1, "stagger"); 

		// Flags popup animation
		anim_hands
			.staggerFrom(".hand-small", 0.3, { y: "100%", ease: Back.easeOut.config(1.7)}, -0.1, "stagger"); 

		// Flags popup animation
		anim_tents
			.staggerFrom(".tent", 0.3, { y: "100%", ease: Back.easeOut.config(1.7)}, -0.1, "stagger"); 

	}

	function initNavigationButtons(){
		// Scroll down button mobile
		$buttonScrollDown.on("click",function(){
			if(activePanelIndex < 0){
				TweenLite.to(window, 0.4, {scrollTo:{y:$(".page-section.first").offset().top}, ease:Power2.easeOut});
			} else if(activePanelIndex < nrPageSections){
				TweenLite.to(window, 0.4, {scrollTo:{y:$(".page-section.active").next().offset().top}, ease:Power2.easeOut});
			} else if(activePanelIndex == nrPageSections){
				TweenLite.to(window, 0.4, {scrollTo:{y:$(".page-section--form").offset().top}, ease:Power2.easeOut});
			}
			return false
		});
		// Scroll up button mobile
		$buttonScrollUp.on("click",function(){
			if(activePanelIndex <= 0){
				TweenLite.to(window, 0.4, {scrollTo:{y:$(".header--full-screen-video").offset().top}, ease:Power2.easeOut});
			} else if(activePanelIndex <= nrPageSections){
				TweenLite.to(window, 0.4, {scrollTo:{y:$(".page-section.active").prev().offset().top}, ease:Power2.easeOut});
			} else {
				TweenLite.to(window, 0.4, {scrollTo:{y:$(".page-section:last-child").offset().top}, ease:Power2.easeOut});
			}
			return false
		});	

		$(".button--scrollDown").on("click",function(){
			TweenLite.to(window, 0.8, {scrollTo:{y:$(".page-section.first").offset().top}, ease:Power2.easeOut});
		});	

		// Navigation buttons
		$navigation.find("a").on("click",function(){
			if($(this).index() <= 4){
				TweenLite.to(window, 0.4, {scrollTo:{y:$(".page-section:eq("+$(this).index()+")").offset().top}, ease:Power2.easeOut});
			} else {
				TweenLite.to(window, 0.6, {scrollTo:{y:$(".page-section--form").offset().top}, ease:Power2.easeOut});
			}
			return false
		});	
	}

	function initWaypoints(){
		
		setActiveSection(0,1);

		$('.page-section.first').waypoint({
			handler: function(direction) {
				if(direction === "down"){
					setActiveSection(0,1);
					anim_flags.play();
					$(this).addClass("active");	
				} else {
					anim_flags.reverse();
				}
			},
			offset: "0%"
		});

		$('.page-section--form').waypoint({
			handler: function(direction) {
				if(direction === "down"){
					console.log("form hit down");
					setActiveSection(5,1);
				} else {
					console.log("form hit up");
					setActiveSection(4,-1);
				}
			},
			offset: "50%"
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
		console.log(activeIndex + ", "+direction);
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
		$("body").removeClass(backgroundColors[activeIndex-direction]).addClass(backgroundColors[activeIndex]);
		
		if(activeIndex > -1 ){
			$(".page-section:eq('"+(activeIndex-direction)+"') .main-graphic").css("opacity","1").removeClass('animated bounceOutDown bounceInUp').addClass("animated bounceOutDown");	
			$(".page-section:eq('"+(activeIndex)+"') .main-graphic").css("opacity","1").removeClass('animated bounceOutDown bounceInUp').addClass("animated bounceInUp");
		}

		$(".page-section").removeClass("active");
		$(".page-section:eq('"+activeIndex+"')").addClass("active");		
	}

	function animateLogo(activeIndex,direction){
		if(direction == "1"){
			switch(activeIndex) {
				case 0:
					break;
				case 1:
					// anim_logo.tweenTo("two");
					anim_flags.reverse();
					anim_hands.play();
					break;
				case 2:
					// anim_logo.tweenTo("three");
					anim_hands.reverse();
					break;
				case 3:
					// anim_logo.tweenTo("four");
					anim_tents.reverse();
					break;
				case 4:
					// anim_logo.tweenTo("last");
					anim_tents.play();
					break;		
				case 5:
					// anim_logo.tweenTo("last");
					anim_tents.reverse();
					break;							
				default:
					// default code block
			}
		} else if(direction == "-1"){
			switch(activeIndex) {
				case 0:
					// anim_logo.tweenFromTo("two","one");
					anim_flags.play();
					anim_hands.reverse();
					break;
				case 1:
					// anim_logo.tweenTo("two");
					anim_hands.play();
					break;
				case 2:
					// anim_logo.tweenTo("three");
					// anim_tents.play();
					break;
				case 3:
					anim_tents.reverse();
					// anim_logo.tweenTo("four");
					break;			
				case 4:
					anim_tents.play();
					// anim_tents.reverse();
					// anim_logo.tweenTo("four");
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
