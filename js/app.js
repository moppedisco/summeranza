
$( document ).ready(function() {
	$("body").mousewheel(function(event, delta) {
		this.scrollLeft -= (delta);
		event.preventDefault();
	});	

	$.stellar();

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
			offset: "30%"
		});
		// $('.page-section.first').waypoint({
		// 	element: $(".wrapper"),
		// 	horizontal: true,			
		// 	handler: function(direction) {
		// 		if(direction === "left"){
		// 			// $(this).removeClass("static").addClass("active");	
		// 			// $(".site-navigation").addClass("fixed");
		// 		} else {
		// 			// $(this).removeClass("active").addClass("static");	
		// 			// $(".site-navigation").removeClass("fixed");
		// 		}
		// 	},
		// 	offset: "0%"
		// });
	}

	function setActiveSection(activeIndex,direction){
		activePanelIndex = activeIndex;
		// Reset navigation
		$navigation.find("a").removeClass("active");

		$logo.addClass("animate"+activeIndex);
		if(direction === "-1"){
			$logo.removeClass("animate"+(activeIndex-direction));	
		}
		
		
		// animateLogo(activeIndex);

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

	function animateLogo(activeIndex){
		switch(activeIndex) {
			case 1:
				// $logo.find("img:eq()")
				break;
			case 2:
				// code block
				break;
			default:
				// default code block
		}
	}

	return {
		init: init
	};

}(window))  // Self execute