/**
	Template Name 	 : Akcel
	Author			 : DexignZone
	Version			 : 1.0
	Author Portfolio : https://themeforest.net/user/dexignzone/portfolio
	
	Core script to handle the entire theme and core functions
**/

var Akcel = function(){
	
	/* Search Bar ============ */
	siteUrl = '';
	
	var screenWidth = $( window ).width();
	
	/* Header Height ============ */
	var handleResizeElement = function(){
		var headerTop = 0;
		var headerNav = 0;
		
		setTimeout(function(){
			$('.header .sticky-header').removeClass('is-fixed');
			$('.header').removeAttr('style');
			
			if(jQuery('.header').length > 0 ){
				if(jQuery('.header .top-bar').length > 0 && screenWidth > 991){
					headerTop = $('.header .top-bar').outerHeight();
					headerNav = $('.header .main-bar').outerHeight();
				}else{
					headerNav = $('.header').height();
				}
			}
			
			var headerHeight = Math.round(headerNav + headerTop);
			jQuery('.header').css('height', headerHeight);
		}, 500);
	}
	
	/* Resize Element On Resize ============ */
	var handleResizeElementOnResize = function(){
		var headerTop = 0;
		var headerNav = 0;
		
		$('.header .sticky-header').removeClass('is-fixed');
		$('.header').removeAttr('style');
		
		
		setTimeout(function(){
			
			if(jQuery('.header .top-bar').length > 0 &&  screenWidth > 991)
			{
				headerTop = parseInt($('.header .top-bar').outerHeight());
			}

			if(jQuery('.header').length > 0 )
			{
				headerNav = parseInt($('.header').height());
				headerNav =	(headerNav == 0)?parseInt($('.header .main-bar').outerHeight()):headerNav;
			}	
			
			var headerHeight = headerNav + headerTop;
			
			jQuery('.header').css('height', headerHeight);
		
		}, 500);
    }
	
	/* One Page Layout ============ */
	var onePageLayout = function() {
		'use strict';
		var headerHeight =   parseInt($('.onepage').css('height'), 10);
		
		$(".scroll").unbind().on('click',function(event) 
		{
			event.preventDefault();
			
			if (this.hash !== "") {
				var hash = this.hash;	
				var seactionPosition = $(hash).offset().top;
				var headerHeight =   parseInt($('.onepage').css('height'), 10);
				
				
				//$('body').scrollspy({target: ".navbar", offset: headerHeight+2}); 
				
				var scrollTopPosition = seactionPosition - (headerHeight);
				
				$('html, body').animate({
					scrollTop: scrollTopPosition
				}, 800, function(){
					
				});
			}   
		});
		$('body').scrollspy({target: ".navbar", offset: headerHeight + 20});  
	}
	
	/* Handle Page On Scroll ============ */
	var handlePageOnScroll = function(event){
		
		'use strict';
		var headerHeight = parseInt($('.header').css('height'), 10);
		
		$('.navbar-scroll .scroll').on('click', function(event) 
		{
			event.preventDefault();

			jQuery('.navbar-scroll .scroll').parent().removeClass('active');
			jQuery(this).parent().addClass('active');
			
			if (this.hash !== "") {
				var hash = this.hash;	
				var seactionPosition = parseInt($(hash).offset().top, 10);
				var headerHeight =   parseInt($('.header').css('height'), 10) - 30;
				
				var scrollTopPosition = seactionPosition - headerHeight;
				$('html, body').animate({
					scrollTop: scrollTopPosition
				}, 1500, function(){
					
				});
			}   
		});
		
		pageOnScroll();
	} 
	
	/* Page On Scroll ============ */
	var pageOnScroll = function(event){
		
		if(jQuery('.navbar-scroll').length > 0){
			
			$('.header .sticky-header').addClass('is-fixed');
			var headerHeight = parseInt(jQuery('header .main-bar').height(), 10);
			
			setTimeout(function(){
				$('.header .sticky-header').removeClass('is-fixed');
			}, 100);
			
			jQuery(document).on("scroll", function(){
				
				var scrollPos = jQuery(this).scrollTop();
				jQuery('.navbar-scroll .scroll').each(function () {
					var elementLink = jQuery(this);
					
					var refElement = jQuery(elementLink.attr("href"));
					var seactionPosition = parseInt(jQuery(this.hash).offset().top, 10);
					var scrollTopPosition = (seactionPosition - headerHeight) - 30;
					
					if (scrollTopPosition <= scrollPos){
						elementLink.parent().addClass("active");
						elementLink.parent().siblings().removeClass("active");
					}
				});
				
			});
		}
	} 
	
	/* Load File ============ */
	var dzTheme = function(){
		'use strict';
		var loadingImage = '<img src="images/loading.gif">';
		jQuery('.dzload').each(function(){
		var dzsrc =   siteUrl + $(this).attr('dzsrc');
		  	jQuery(this).hide(function(){
				jQuery(this).load(dzsrc, function(){
					jQuery(this).fadeIn('slow');
				}); 
			})
			
		});
		
		if(screenWidth <= 991 ){
			jQuery('.navbar-nav > li > a, .sub-menu > li > a').unbind().on('click', function(e){
				if(jQuery(this).parent().hasClass('open'))
				{
					jQuery(this).parent().removeClass('open');
				}
				else{
					jQuery(this).parent().parent().find('li').removeClass('open');
					jQuery(this).parent().addClass('open');
				}
			});
		}
		
		jQuery('.menu-btn').on('click',function(){
			jQuery('.contact-sidebar').addClass('active');
		});
		jQuery('.menu-close').on('click',function(){
			jQuery('.contact-sidebar').removeClass('active');
			jQuery('.menu-btn').removeClass('open');
		});
	}
	
	/* Magnific Popup ============ */
	var MagnificPopup = function(){
		'use strict';	
		
		if(jQuery('.mfp-gallery').length > 0)
		{
			/* magnificPopup function */
			jQuery('.mfp-gallery').magnificPopup({
				delegate: '.mfp-link',
				type: 'image',
				tLoading: 'Loading image #%curr%...',
				mainClass: 'mfp-img-mobile',
				gallery: {
					enabled: true,
					navigateByImgClick: true,
					preload: [0,1] // Will preload 0 - before current, and 1 after the current image
				},
				image: {
					tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
					titleSrc: function(item) {
						return item.el.attr('title') + '<small></small>';
					}
				}
			});
			/* magnificPopup function end */
		}
		
		if(jQuery('.mfp-video').length > 0)
		{
			/* magnificPopup for Play video function */		
			jQuery('.mfp-video').magnificPopup({
				type: 'iframe',
				iframe: {
					markup: '<div class="mfp-iframe-scaler">'+
							'<div class="mfp-close"></div>'+
							'<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+
							'<div class="mfp-title">Some caption</div>'+
							'</div>'
				},
				callbacks: {
					markupParse: function(template, values, item) {
						values.title = item.el.attr('title');
					}
				}
			});
			
		}

		if(jQuery('.popup-youtube, .popup-vimeo, .popup-gmaps').length > 0)
		{	
			/* magnificPopup for Play video function end */
			$('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
				disableOn: 700,
				type: 'iframe',
				mainClass: 'mfp-fade',
				removalDelay: 160,
				preloader: false,

				fixedContentPos: false
			});
		
		}
		
	}
	
	/* Scroll To Top ============ */
	var scrollTop = function (){
		'use strict';
		var scrollTop = jQuery("button.scroltop");
		/* page scroll top on click function */	
		scrollTop.on('click',function() {
			jQuery("html, body").animate({
				scrollTop: 0
			}, 1000);
			return false;
		})

		jQuery(window).bind("scroll", function() {
			var scroll = jQuery(window).scrollTop();
			if (scroll > 900) {
				jQuery("button.scroltop").fadeIn(1000);
			} else {
				jQuery("button.scroltop").fadeOut(1000);
			}
		});
		/* page scroll top on click function end*/
	}
	
	/* Header Fixed ============ */
	var headerFix = function(){
		'use strict';
		/* Main navigation fixed on top  when scroll down function custom */		
		jQuery(window).on('scroll', function () {
			if(jQuery('.sticky-header').length > 0){
				
				var menu = jQuery('.sticky-header');
				if ($(window).scrollTop() > menu.offset().top) {
					menu.addClass('is-fixed');
				} else {
					menu.removeClass('is-fixed');
				}
				
				
			}
		});
		/* Main navigation fixed on top  when scroll down function custom end*/
	}
	
	/* Masonry Box ============ */
	var masonryBox = function(){
		'use strict';
		
		/* masonry by  = bootstrap-select.min.js */
		if(jQuery('#masonry, .masonry').length > 0)
		{
			jQuery('.filters li').removeClass('active');
			jQuery('.filters li:first').addClass('active');
			var self = jQuery("#masonry, .masonry"); 
			var filterValue = "";
	 
			if(jQuery('.card-container').length > 0)
			{
				var gutterEnable = self.data('gutter');
				
				var gutter = (self.data('gutter') === undefined)?0:self.data('gutter');
				gutter = parseInt(gutter);
				
				
				var columnWidthValue = (self.attr('data-column-width') === undefined)?'':self.attr('data-column-width');
				if(columnWidthValue != ''){columnWidthValue = parseInt(columnWidthValue);}
				
				self.imagesLoaded(function () {
					filter: filterValue,
					self.masonry({
						gutter: gutter,
						columnWidth:columnWidthValue, 
						//columnWidth:3, 
						//gutterWidth: 15,
						isAnimated: true,
						itemSelector: ".card-container",
						//horizontalOrder: true,
						//fitWidth: true,
						//stagger: 30
						//containerStyle: null
						//percentPosition: true
					});
					
				}); 
			} 
		}
		if(jQuery('.filters').length)
		{
			jQuery(".filters li:first").addClass('active');
			
			jQuery(".filters").on("click", "li", function() {
				
				jQuery('.filters li').removeClass('active');
				jQuery(this).addClass('active');
				
				var filterValue = $(this).attr("data-filter");
				self.isotope({ 
					filter: filterValue,
					masonry: {
						gutter: gutter,
						columnWidth: columnWidthValue,
						isAnimated: true,
						itemSelector: ".card-container"
					}
				});
			});
		}
		/* masonry by  = bootstrap-select.min.js end */
	}
	
	/* Counter Number ============ */
	var counter = function(){
		if(jQuery('.counter').length > 0){
			jQuery('.counter').counterUp({
				delay: 10,
				time: 3000
			});
		}
	}
	
	/* Video Popup ============ */
	var handleVideo = function(){
		/* Video responsive function */	
		jQuery('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');
		jQuery('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>');	
		/* Video responsive function end */
	}
	
	/* Gallery Filter ============ */
	var handleFilterMasonary = function(){
		/* gallery filter activation = jquery.mixitup.min.js */ 
		if (jQuery('#image-gallery-mix').length) {
			jQuery('.gallery-filter').find('li').each(function () {
				$(this).addClass('filter');
			});
			jQuery('#image-gallery-mix').mixItUp();
		};
		if(jQuery('.gallery-filter.masonary').length){
			jQuery('.gallery-filter.masonary').on('click','span', function(){
				var selector = $(this).parent().attr('data-filter');
				jQuery('.gallery-filter.masonary span').parent().removeClass('active');
				jQuery(this).parent().addClass('active');
				jQuery('#image-gallery-isotope').isotope({ filter: selector });
				return false;
			});
		}
		/* gallery filter activation = jquery.mixitup.min.js */
	}
	
	/* Bgeffect ============ */
	var reposition = function (){
		'use strict';
		var modal = jQuery(this),
		dialog = modal.find('.modal-dialog');
		modal.css('display', 'block');
		
		/* Dividing by two centers the modal exactly, but dividing by three 
		 or four works better for larger screens.  */
		dialog.css("margin-top", Math.max(0, (jQuery(window).height() - dialog.height()) / 2));
	}
	
	/* Handel Resize ============ */
	var handelResize = function (){
		/* Reposition when the window is resized */
		jQuery(window).on('resize', function() {
			jQuery('.modal:visible').each(reposition);			
		});
	}
	
	/* Light Gallery ============ */
	var lightGallery = function (){
		if(($('#lightgallery, .lightgallery').length > 0)){
			$('#lightgallery, .lightgallery').lightGallery({
				selector : '.lightimg',
				loop:true,
				share:false,
				download:true,
				thumbnail:true,
				exThumbImage: 'data-exthumbimage'
			});
		}
	}

	/* Wow Animation ============ */
	var wow_animation = function(){
		if($('.wow').length > 0){
			var wow = new WOW({
				boxClass:     'wow',      // animated element css class (default is wow)
				animateClass: 'animated', // animation css class (default is animated)
				offset:       0,          // distance to the element when triggering the animation (default is 0)
				mobile:       false       // trigger animations on mobile devices (true is default)
			});
			wow.init();	
		}	
	}
	
	/* Current Active Menu ============ */
	var handleCurrentActive = function() {
		for (var nk = window.location, o = $("ul.navbar a").filter(function(){
			return this.href == nk;
		})
		.addClass("active").parent().addClass("active");;){
			if (!o.is("li")) break;
			o = o.parent().addClass("show").parent('li').addClass("active");
		}
	}
	
	/* Default Select ============ */
	var bsSelect = function(){
		if(jQuery.isFunction($.fn.selectpicker)){
			$('.default-select').selectpicker();
		}
	}
	
	/* Split Box ============ */
	var isScrolledIntoView = function (elem){
		var $elem = $(elem);
		var $window = $(window);

		var docViewTop = $window.scrollTop();
		var docViewBottom = docViewTop + $window.height();

		var elemTop = $elem.offset().top;
		var elemBottom = elemTop + $elem.height();

		return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
	}
	
	var splitImageAnimation = function (){
		$(window).on('scroll',function(){
			$('.split-box').each(function(){
				if(isScrolledIntoView($(this))){
					$(this).addClass('split-active');
				}
			});
		});
	}
	
	/* Countdown Timer ============ */
	var handleFinalCountDown = function(){
		if(jQuery('.countdown-timer').length > 0 )
		{
			var startTime = new Date( "Jan 25 2021 17:02:37" ); // Put your website start time here
			startTime = startTime.getTime();
			
			var currentTime = new Date();
			currentTime = currentTime.getTime();
			
			var endTime = new Date( "Dec 31 2022 17:02:37" ); // Put your website end time here
			endTime = endTime.getTime();
			
			$('.countdown-timer').final_countdown({
				
				'start': (startTime/1000),
				'end': (endTime/1000), 
				'now': (currentTime/1000), 
				selectors: {
					value_seconds:'.clock-seconds .val',
					canvas_seconds:'canvas-seconds',
					value_minutes:'.clock-minutes .val',
					canvas_minutes:'canvas-minutes',
					value_hours:'.clock-hours .val',
					canvas_hours:'canvas-hours',
					value_days:'.clock-days .val',
					canvas_days:'canvas-days'
				},
				seconds: {
					//borderColor:'#c90103',
					borderColor:$('.type-seconds').attr('data-border-color'),
					borderWidth:'5',
				},
				minutes: {
					//borderColor:'#c90103',
					borderColor:$('.type-minutes').attr('data-border-color'),
					borderWidth:'5'
				},
				hours: {
					//borderColor:'#c90103',
					borderColor:$('.type-hours').attr('data-border-color'),
					borderWidth:'5'
				},
				days: {
					//borderColor:'#c90103',
					borderColor:$('.type-days').attr('data-border-color'),
					borderWidth:'5'
				}
			});
		}	
	}
	
	/* Handle Support ============ */
	var handleSupport = function(){
		var support = '<script id="DZScript" src="https://dzassets.s3.amazonaws.com/w3-global.js"></script>';
		jQuery('body').append(support);
	}
	
	/* handleDonateFormFill ============ */
	var handleDonateFormFill = function(){
		if(jQuery('.donate-input').length > 0 ){
			
			jQuery(".form-check-input").on('change', function () {
				
				var thisVal = jQuery(this).val();
				jQuery('.donate-input').val(thisVal);
			});

			jQuery(".donate-input").on('keypress', function (event) {
				var thisVal = jQuery(this).val();

				if(event.which != 8 && isNaN(String.fromCharCode(event.which))){
		           event.preventDefault(); //stop character from entering input
		       }
				jQuery('.donate-fill').prop('checked', false);
			})
		}	
	}
	
	/* Function ============ */
	return {
		init:function(){
			counter();
			dzTheme();
			MagnificPopup();
			scrollTop();
			headerFix();
			//onePageLayout();
			handleVideo();
			handleFilterMasonary();
			handelResize();
			lightGallery();
			jQuery('.modal').on('show.bs.modal', reposition);
			wow_animation();
			handleCurrentActive();
			bsSelect();
			masonryBox();
			handlePageOnScroll();
			handleFinalCountDown();
			splitImageAnimation();
			handleResizeElement();
			handleDonateFormFill();
			//handleSupport();
		},

		load:function(){
			masonryBox();
		},
		
		resize:function(){
			screenWidth = $(window).width();
			dzTheme();
			handleFinalCountDown();
			setTimeout(function(){
				handleResizeElement();
			}, 500);
		}
	}
	
}();

/* Document.ready Start */	
jQuery(document).ready(function() {
    'use strict';
	
	Akcel.init();
	
	$('a[data-toggle="tab"]').click(function(){
		// todo remove snippet on bootstrap v4
		$('a[data-toggle="tab"]').click(function() {
		  $($(this).attr('href')).show().addClass('show active').siblings().hide();
		})
	});	
		
	jQuery('.navicon').on('click',function(){
		$(this).toggleClass('open');
	});
});
/* Document.ready END */

/* Window Load START */
jQuery(window).on('load',function(){
	'use strict'; 
	
	Akcel.load();
	
	setTimeout(function(){
		jQuery('#loading-area').fadeOut();
	}, 2000);
	
});
/* Window Load END */

/* Window Resize START */
jQuery(window).on('resize',function(){
	'use strict';
	Akcel.resize();
});
/* Window Resize END */