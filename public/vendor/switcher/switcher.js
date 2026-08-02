var currentURL      = window.location.href;

function addSwitcher()
{
	var urlLTR = '';
	var urlRTL = '';
	if(currentURL.indexOf('xhtml-rtl') > -1){
		urlLTR = currentURL.replace('xhtml-rtl', 'xhtml');
		urlRTL = currentURL;
	}else{
		urlRTL = currentURL.replace('xhtml', 'xhtml-rtl');
		urlLTR = currentURL;
	}
	
	var dzSwitcher = '<div id="dzSwitcher-right" class="styleswitcher"><div class="overlay-switch"></div><div class="switcher-btn-bx"><a href="javascript:void(0);" class="switch-btn closed"><span class="fas fa-cog"></span></a></div><div class="styleswitcher-inner"><div class="sw-main-title">Theme Setting<a href="javascript:void(0);" class="dez-page btn btn-primary btn-sm" onclick="deleteAllCookie()">Delete All Cookie</a></div><div class="theme-design row"><div class="theme-box col-md-12"><h5 class="switcher-title"><span>Theme</span></h5><ul val="themeFullColor" class="color-skins theme-panel-save"><li class="active"><a class="theme-skin skin-1 theme-color" href="javascript:void(0);" data-color-theme="skin-1" data-logo-selector=".logo-dark img, .logo-white img, .layout-dark .header-nav .logo-dark img" data-logo-image="images/logo.png, images/logo-white.png, images/logo-white.png"></a></li><li><a class="theme-skin skin-2 theme-color" href="javascript:void(0);" data-color-theme="skin-2" data-logo-selector=".logo-dark img, .logo-white img, .layout-dark .header-nav .logo-dark img" data-logo-image="images/logo-2.png, images/logo-white-2.png, images/logo-white-2.png"></a></li><li><a class="theme-skin skin-3 theme-color" href="javascript:void(0);" data-color-theme="skin-3" data-logo-selector=".logo-dark img, .logo-white img, .layout-dark .header-nav .logo-dark img" data-logo-image="images/logo-3.png, images/logo-white-3.png, images/logo-white-3.png"></a></li><li><a class="theme-skin skin-4 theme-color" href="javascript:void(0);" data-color-theme="skin-4" data-logo-selector=".logo-dark img, .logo-white img, .layout-dark .header-nav .logo-dark img" data-logo-image="images/logo-4.png, images/logo-white-4.png, images/logo-white-4.png"></a></li><li><a class="theme-skin skin-5 theme-color" href="javascript:void(0);" data-color-theme="skin-5" data-logo-selector=".logo-dark img, .logo-white img, .layout-dark .header-nav .logo-dark img" data-logo-image="images/logo.png, images/logo-white.png, images/logo-white.png"></a></li><li><a class="theme-skin skin-6 theme-color" href="javascript:void(0);" data-color-theme="skin-6" data-logo-selector=".logo-dark img, .logo-white img, .layout-dark .header-nav .logo-dark img" data-logo-image="images/logo-6.png, images/logo-white-6.png, images/logo-white-6.png"></a></li><li><a class="theme-skin skin-7 theme-color" href="javascript:void(0);" data-color-theme="skin-7" data-logo-selector=".logo-dark img, .logo-white img, .layout-dark .header-nav .logo-dark img" data-logo-image="images/logo-7.png, images/logo-white-7.png, images/logo-white-7.png"></a></li><li><a class="theme-skin skin-8 theme-color" href="javascript:void(0);" data-color-theme="skin-8" data-logo-selector=".logo-dark img, .logo-white img, .layout-dark .header-nav .logo-dark img" data-logo-image="images/logo-8.png, images/logo-white-8.png, images/logo-white-8.png"></a></li><li><a class="theme-skin skin-9 theme-color" href="javascript:void(0);" data-color-theme="skin-9" data-logo-selector=".logo-dark img, .logo-white img, .layout-dark .header-nav .logo-dark img" data-logo-image="images/logo-9.png, images/logo-white-9.png, images/logo-white-9.png"></a></li></ul></div></div><div class="theme-design row theme-layout-wrapper"><div class="theme-box col-md-12"><h5 class="switcher-title"><span>Theme Layout</span></h5><ul val="layout" class="layout layout-view theme-panel-save"><li class="wide-layout active"><a href="javascript:void(0);" dir="wide-layout"><div></div><span>Wide</span></a></li><li class="boxed"><a href="javascript:void(0);" dir="boxed"><div><span></span></div><span>Boxed</span></a></li><li class="frame"><a href="javascript:void(0);" dir="frame"><div><span></span></div><span>Frame</span></a></li></ul><div id="ThemeRangeSlider" class="price-slide-2 range-slider px-2 mb-3" style="display:none"><div class="price"><input type="text" id="FramePadding" class="amount" readonly="" value="20px"><div id="slider-range-3"></div></div></div></div></div><div class="theme-design row theme-view-wrapper"><div class="col-md-6 theme-box"><h5 class="switcher-title"><span>Theme Corner</span></h5><ul val="mode" class="tab-checkbx corner-view theme-panel-save"><li class="sharp-theme"><a href="javascript:void(0);">Sharp</a></li><li class="rounded-theme active"><a href="javascript:void(0);">Round</a></li></ul></div><div class="col-md-6 theme-box"><h5 class="switcher-title"><span>Header</span></h5><ul val="header" class="tab-checkbx header-view theme-panel-save"><li class="header-fixed active"><a href="javascript:void(0);" dir="sticky-header">Fixed</a></li><li class="header-static"><a href="javascript:void(0);" dir="sticky-no">Static</a></li></ul></div></div><div class="theme-design row mb-0 theme-background-wrapper"><div class="col-md-12 theme-box mb-4"><h5 class="switcher-title"><span>Background Color</span></h5><ul val="bgColor" class="bg-color-switcher theme-panel-save"><li><a class="bg-color-1" href="javascript:void(0);" dir="#1B8271"></a></li><li><a class="bg-color-2" href="javascript:void(0);" dir="#ff6b43"></a></li><li><a class="bg-color-3" href="javascript:void(0);" dir="#9b8db7"></a></li><li><a class="bg-color-4" href="javascript:void(0);" dir="#e5588d"></a></li><li><a class="bg-color-5" href="javascript:void(0);" dir="#faa900"></a></li><li><a class="bg-color-6" href="javascript:void(0);" dir="#e4484e"></a></li><li><a class="bg-color-7" href="javascript:void(0);" dir="#977fff"></a></li><li><a class="bg-color-8" href="javascript:void(0);" dir="#51c147"></a></li><li><a class="bg-color-9" href="javascript:void(0);" dir="#ff8f16"></a></li></ul></div><div class="col-md-12 theme-box mb-4"><h5 class="switcher-title"><span>Background Image</span></h5><ul val="bgImage" class="background-switcher theme-panel-save"><li><img src="images/switcher/switcher-bg/bg1.jpg" dir="images/background/bg1.jpg" alt=""></li><li><img src="images/switcher/switcher-bg/bg2.jpg" dir="images/background/bg3.jpg" alt=""></li><li><img src="images/switcher/switcher-bg/bg3.jpg" dir="images/background/bg6.jpg" alt=""></li><li><img src="images/switcher/switcher-bg/bg4.jpg" dir="images/background/bg7.jpg" alt=""></li><li><img src="images/switcher/switcher-bg/bg5.jpg" dir="images/background/bg17.jpg" alt=""></li><li><img src="images/switcher/switcher-bg/bg6.jpg" dir="images/background/bg20.jpg" alt=""></li><li><img src="images/switcher/switcher-bg/bg7.jpg" dir="images/background/bg21.jpg" alt=""></li><li><img src="images/switcher/switcher-bg/bg8.jpg" dir="images/background/bg22.jpg" alt=""></li><li><img src="images/switcher/switcher-bg/bg9.jpg" dir="images/background/bg23.jpg" alt=""></li></ul></div><div class="col-md-12 theme-box"><h5 class="switcher-title"><span>Background Pattern</span></h5><ul val="bgPatten" class="pattern-switcher theme-panel-save"><li><img src="images/switcher/switcher-patterns/bg1.jpg" dir="images/pattern/pt1.jpg" alt=""></li><li><img src="images/switcher/switcher-patterns/bg2.jpg" dir="images/pattern/pt2.jpg" alt=""></li><li><img src="images/switcher/switcher-patterns/bg3.jpg" dir="images/pattern/pt3.jpg" alt=""></li><li><img src="images/switcher/switcher-patterns/bg4.jpg" dir="images/pattern/pt4.jpg" alt=""></li><li><img src="images/switcher/switcher-patterns/bg5.jpg" dir="images/pattern/pt5.jpg" alt=""></li><li><img src="images/switcher/switcher-patterns/bg6.jpg" dir="images/pattern/pt6.jpg" alt=""></li><li><img src="images/switcher/switcher-patterns/bg7.jpg" dir="images/pattern/pt7.jpg" alt=""></li><li><img src="images/switcher/switcher-patterns/bg8.jpg" dir="images/pattern/pt8.jpg" alt=""></li><li><img src="images/switcher/switcher-patterns/bg9.jpg" dir="images/pattern/pt9.jpg" alt=""></li></ul></div></div></div></div>';
	
	if($("#dzSwitcher-right").length == 0) {
		jQuery('body').append(dzSwitcher);
	}
}

jQuery(window).on('load',function(){
	
	//=== Switcher panal slide function	=====================//
	jQuery('.styleswitcher').animate({
		'left': '-500px'
	});
	jQuery('.styleswitcher-right').animate({
		'right': '-500px',
		'left': 'auto'
	});
	jQuery('.switch-btn').addClass('closed');
	//=== Switcher panal slide function END	=====================//
	
});
	
$(function(){		
	"use strict";
	
	addSwitcher();
	
	//=== Switcher panal slide function	=====================//
	jQuery('.switch-btn').on('click',function () {
		if (jQuery(this).hasClass('open')) {
			jQuery(this).addClass('closed');
			jQuery(this).removeClass('open');
			jQuery('.styleswitcher').animate({
				'left': '-500px'
			});
			jQuery('.styleswitcher-right').animate({
				'right': '-500px',
				'left': 'auto'
			});
		} else {
			if (jQuery(this).hasClass('closed')) {
			jQuery(this).addClass('open');
			jQuery(this).removeClass('closed');
			jQuery('.styleswitcher').animate({
				'left': '30px'
			});
			jQuery('.styleswitcher-right').animate({
				'right': '30px',
				'left': 'auto'
			});
			}
		}	
		jQuery('.styleswitcher').toggleClass('open');
	});
	
	//=== Switcher panal slide function END	=====================//

	//=== Color css change function	=====================//
    // Color changer
	
	jQuery('.overlay-switch').on('click',function(){
		
		if (jQuery('.styleswitcher').hasClass('open')) {
			jQuery('.styleswitcher').animate({
				'left': '-500px'
			});
			jQuery('.styleswitcher').removeClass('open');
			jQuery('.switch-btn').removeClass('open');
			jQuery('.switch-btn').addClass('closed');
		}else{
			jQuery('.styleswitcher').animate({
				'left': '30px'
			});
			jQuery('.switch-btn').addClass('open');
			jQuery('.switch-btn').removeClass('closed');
			//jQuery('.styleswitcher').addClass('open');
		}
	});
	
	//=== Color css change function	=====================//
	
	//=== Background image change function	=====================//
	jQuery('.color-skins li a').on('click',function(){
		jQuery('.color-skins li').removeClass('active');
		jQuery(this).parent('li').addClass('active');
	});
	 
	//=== Background image change function	=====================//
	jQuery('.background-switcher li img').on('click',function(){
		var imgbg = jQuery(this).attr('dir');
		//console.<span id="IL_AD2" class="IL_AD">log</span>(imgbg);
		jQuery('#bg').css({backgroundImage: "url("+imgbg+")"});
		jQuery('.background-switcher li, .pattern-switcher li, .bg-color-switcher li').removeClass('active');
		jQuery(this).parent('li').addClass('active');
	 });
	//=== Background image change function	End=====================//
	
	//=== Background pattern change function	=====================//
	jQuery('.pattern-switcher li img').on('click',function(){
		var imgbg = jQuery(this).attr('dir');
		//console.<span id="IL_AD2" class="IL_AD">log</span>(imgbg);
		jQuery('#bg').css({backgroundImage: "url("+imgbg+")"});
		jQuery("#bg").css( "background-size", "auto");
		jQuery('.background-switcher li, .pattern-switcher li, .bg-color-switcher li').removeClass('active');
		jQuery(this).parent('li').addClass('active');
	 });
	//=== Background pattern change function End=====================//
	
	//=== Background pattern change function	=====================//
	jQuery('.bg-color-switcher li a').on('click',function(){
		var bgcolor = jQuery(this).attr('dir');
		//alert(bgcolor);
		//console.<span id="IL_AD2" class="IL_AD">log</span>(bgcolor);
		jQuery('#bg').css('background-color', bgcolor);
		jQuery('#bg').css('background-image', '');
		jQuery('.background-switcher li, .pattern-switcher li, .bg-color-switcher li').removeClass('active');
		jQuery(this).parent('li').addClass('active');
	 });
	//=== Background pattern change function End=====================//
	

	//=== Layout boxed & fullscreen change function	=====================//
	jQuery('.layout-view li ').on('click', function(){
		jQuery('.layout-view li ').removeClass('active');
		jQuery(this).addClass('active');	
	});
	jQuery('.skin-view li ').on('click', function(){
		jQuery('.skin-view li ').removeClass('active');
		jQuery(this).addClass('active');	
	});
	
	jQuery('.wide-layout').on('click',function() { 
		jQuery("body").addClass('wide-layout');
		jQuery("body").removeClass('boxed');
		jQuery("body").removeClass('frame').removeAttr("style");
		jQuery('#ThemeRangeSlider').hide('slow');
	});
	
	jQuery('.boxed').on('click',function() { 
		jQuery("body").addClass('boxed');
		jQuery("body").removeClass('wide-layout');
		jQuery("body").removeClass('frame').removeAttr("style");
		jQuery('#ThemeRangeSlider').hide('slow');
	});
	jQuery('.frame').on('click',function() { 
		jQuery("body").addClass('frame');
		jQuery("body").removeClass('boxed wide-layout');
		jQuery('#ThemeRangeSlider').show('slow');
		//themeFramePadding();
		jQuery(".main-bar-wraper").addClass('sticky-no');
		jQuery(".main-bar-wraper").removeClass('sticky-header');
	});
	themeFramePadding();
	//=== Layout boxed & fullscreen change function	END=====================//

	//=== Nav light & dark change function	END=====================//
	jQuery('.nav-view li ').on('click', function(){
		jQuery('.nav-view li ').removeClass('active');
		jQuery(this).addClass('active');	
	});
	
	jQuery('.nav-light').on('click',function() { 
		jQuery(".header-nav").addClass('nav-light');
		jQuery(".header-nav").removeClass('nav-dark');
	});
	
	jQuery('.nav-dark').on('click',function() { 
		jQuery(".header-nav").addClass('nav-dark');
		jQuery(".header-nav").removeClass('nav-light');
	});
	//=== Nav light & dark change function	END=====================//	
	
	
	//=== Corner & Sharp Change function =====================//
	jQuery('.corner-view li ').on('click', function(){
		jQuery('.corner-view li ').removeClass('active');
		jQuery(this).addClass('active');	
	});
	
	jQuery('.sharp-theme').on('click',function() { 
		jQuery("body").addClass('theme-sharped').removeClass('theme-rounded');
	});
	
	jQuery('.rounded-theme').on('click',function() { 
		jQuery("body").addClass('theme-rounded').removeClass('theme-sharped');
	});
	//=== Corner & Sharp Change function END =====================//	
	
	//=== Layout light & dark Change function =====================//
	jQuery('.theme-version li ').on('click', function(){
		jQuery('.theme-version li ').removeClass('active');
		jQuery(this).addClass('active');	
	});
	
	jQuery('.light-theme').on('click',function() { 
		jQuery("body").addClass('layout-light').removeClass('layout-dark');
	});
	
	jQuery('.dark-theme').on('click',function() { 
		jQuery("body").addClass('layout-dark').removeClass('layout-light');
	});
	//=== Layout light & dark Change function END =====================//	
	
	/* Header View */
	jQuery('.header-view li ').on('click', function(){
		jQuery('.header-view li ').removeClass('active');
		jQuery(this).addClass('active');
	});
	
	jQuery('.header-fixed').on('click',function() { 
		jQuery(".main-bar-wraper").addClass('sticky-header');
		jQuery(".main-bar-wraper").removeClass('sticky-no');
	});
	
	jQuery('.header-static').on('click',function() { 
		jQuery(".main-bar-wraper").addClass('sticky-no');
		jQuery(".main-bar-wraper").removeClass('sticky-header');
	});
	/* Header View END */
	
	/* Menubar */
	jQuery('.menubar-view li').on('click', function(){
		jQuery('.menubar-view li').removeClass('active');
		jQuery(this).addClass('active');
	});
	
	jQuery('.menubar-left').on('click',function() { 
		jQuery('.page-wraper').addClass('sidemenu');
		jQuery('.header-nav').addClass('sidenav content-scroll');
		setTimeout(function(){
			Lavi.headerResize();
		}, 1000); 
		Lavi.customScroll();
		Lavi.dzTheme();
	});
	
	jQuery('.menubar-top').on('click',function() { 
		jQuery('.page-wraper').removeClass('sidemenu');
		jQuery('.header-nav').removeClass('sidenav');
		setTimeout(function(){
			Lavi.headerResize();
		}, 1000); 
		
		/* remove content-scroll */
		var logoheaderHTML =  jQuery('<div>').append($('.header-nav .logo-header').clone()).html(); 
		var navbarHTML = jQuery('<div>').append($('.header-nav .navbar-nav').clone()).html(); 
		var footermenuHTML = jQuery('<div>').append($('.header-nav .footer-menu').clone()).html(); 
		jQuery('.content-scroll').removeClass('content-scroll mCustomScrollbar _mCS_1 mCS_no_scrollbar');
		jQuery('.header-nav').empty();
		jQuery('.header-nav').append(logoheaderHTML).append(navbarHTML).append(footermenuHTML);
		/* remove content-scroll END */
	});
	/* Menubar END */
	
	var currentURL      = window.location.href; 
	if(currentURL.indexOf('index.html') > -1){
		jQuery('.menubar-box').remove();
	}
	
});

/* Theme Panel Save */
	
	
	var themeOption = ['themeStandardColor','themeFullColor','layout','header','themeVersion','menubar','bgColor','bgImage','bgPatten'];
	themeOption['layout'] = ['wide','boxed','frame','frame_value','layout_value'];
	themeOption['themeStandardColor'] = ['skin-1','skin-2','skin-3','skin-4','skin-5','skin-6','skin-7','skin-8','skin-9','skin-10','themeStandardColor_value','themeStandardColor_logo'];
	themeOption['themeFullColor'] = ['../assets/css/skin/skin-1','../assets/css/skin/skin-2','../assets/css/skin/skin-3','../assets/css/skin/skin-4','../assets/css/skin/skin-5','../assets/css/skin/skin-6','../assets/css/skin/skin-7','../assets/css/skin/skin-8','../assets/css/skin/skin-9','../assets/css/skin/skin-10','themeFullColor_value','themeFullColor_logo'];
	themeOption['header'] = ['fixed','static','header_value'];
	themeOption['themeVersion'] = ['light','dark','version_value'];
	themeOption['menubar'] = ['left','top','menubar_value'];
	themeOption['bgColor'] = ['#ff5e14','#d2151e','#fdb400','#0086f0','#6a1a1f','#019444','#00c6ff','#e87800','#cc9f5a','#bd5ec6','bgColor_value'];
	themeOption['bgImage'] =['bg1.jpg','bg2.jpg','bg3.jpg','bg4.jpg','bgImage_value'];
	themeOption['bgPatten'] =['pt1.jpg','pt2.jpg','pt3.jpg','pt4.jpg','pt5.jpg','pt6.jpg','pt7.jpg','pt8.jpg','pt9.jpg','pt10.jpg','pt11.jpg','pt12.jpg','bgPatten_value'];

jQuery(window).on('load', function(){
	
	jQuery(document).on('click', '.theme-color', function(){
        jQuery(".skin").attr("href", 'css/skin/'+jQuery(this).data('color-theme')+'.css');
		var logoSelectorArr = jQuery(this).data('logo-selector').split(',');
		var logoSrcArr		= jQuery(this).data('logo-image').split(',');
		var arrCount = logoSelectorArr.length;
		
		for(var i=0; i<arrCount; i++){
			jQuery(logoSelectorArr[i]).attr('src',logoSrcArr[i]);
		}
		return false;
		
		
    });
	
	jQuery(document).on('click', '.theme-panel-save li a, .theme-panel-save li img', function() {
			
			
			
			var optionData =  jQuery(this).parent().parent().attr('val');
			if(optionData == 'themeStandardColor' || optionData == 'themeFullColor'){
				var optionValue =  jQuery(this).data('color-theme');
			}else{
				var optionValue =  jQuery(this).attr('dir');
			}
			
			if(optionData == 'bgColor'){
				deleteCookie('bgImage_value');
				deleteCookie('bgPatten_value');
			}else if(optionData == 'bgImage'){
				deleteCookie('bgColor_value');
				deleteCookie('bgPatten_value');
			}else if(optionData == 'bgPatten'){
				deleteCookie('bgColor_value');
				deleteCookie('bgImage_value');
			}else if(optionData == 'themeStandardColor' || optionData == 'themeFullColor'){
				var themeLogoSelector =  jQuery(this).data('logo-selector');
				var themeLogoImage =  jQuery(this).data('logo-image');
				setCookie(optionData+'_logo_selector',themeLogoSelector,1);
				setCookie(optionData+'_logo_image',themeLogoImage,1);
				
				
				if(optionData == 'themeStandardColor'){
					deleteCookie('themeFullColor_value');
				}else if(optionData == 'themeFullColor'){
					deleteCookie('themeStandardColor_value');
				}
			}
			
			
			
			setCookie(optionData+'_value',optionValue,1);
	});
	
	
	setThemePanel();
	
	
	
	/* Set Version Light/Dark */
	if(currentURL.indexOf('dark') > -1){
		jQuery('body').addClass('layout-dark');
		setCookie('themeVersion_value','dark','');
	}else{
		jQuery('body').removeClass('layout-dark');
		setCookie('themeVersion_value','light','');
	}
	
	
	//deleteAllCookie();
	//alert(document.cookie);
	
	
	
});

function themeFramePadding(){
	var themeOptionFrameValue = getCookie('frame_value');
	if(themeOptionFrameValue == ''){
		themeOptionFrameValue = 20;
	}
	
	if($("#slider-range-3").length > 0 )
	{
		
		$("#slider-range-3").unbind().slider({
				min: 20,
				max: 80,
				//value: 20,
				value: themeOptionFrameValue,
				animate:"slow",
				orientation: "horizontal",
				slide: function( event, ui ) {
					frameSlider = ui.value;
					$('#' + this.id).prev().val(frameSlider+"px");
					$( "#bg" ).css('padding',frameSlider+"px");
					setCookie('frame_value',frameSlider,1);
			   }
		});
	}
}

function setThemePanel(){
	jQuery.each(themeOption, function(index, themeOptionItem) {
		themeOptionItemValue = getCookie(themeOptionItem+'_value');
		
		
		
		//alert(themeOptionItem+' '+themeOptionItemValue + '  '+ '111');
		//alert('.'+themeOptionItem+'-view '+' .'+themeOptionItemValue);
		//alert(themeOptionItemValue);
		if(themeOptionItemValue != '' && themeOptionItemValue != '1'){
			
				if(themeOptionItem == 'themeStandardColor'){
					jQuery(".skin").attr("href", themeOptionItemValue);
				}else if(themeOptionItem == 'themeFullColor'){
					jQuery(".skin").attr("href", 'css/skin/'+themeOptionItemValue+'.css');
					
					jQuery('.color-skins li').removeClass('active');
					jQuery('.color-skins li .'+themeOptionItemValue+' ').parent().addClass('active');
					
					//setThemeLogo(themeOptionItem);
				}else if(themeOptionItem == 'layout'){
					///jQuery('.'+themeOptionItem+'-view li').removeClass('active');
					
					/* setTimeout(function(){
						
						jQuery('.'+themeOptionItem+'-view '+' .'+themeOptionItemValue).addClass('active');	
					}, 300); */
					
					
					if(themeOptionItemValue == 'boxed' || themeOptionItemValue == 'frame'){
						jQuery('.layout-view li').removeClass('active');
						jQuery('.layout-view .'+themeOptionItemValue+' ').addClass('active');
					}
					
					if(themeOptionItemValue == 'frame'){
						jQuery('#ThemeRangeSlider').show('slow');
						jQuery("body").addClass(themeOptionItemValue);
						themeOptionFrameValue = getCookie('frame_value');
						if(themeOptionFrameValue == ''){
							themeOptionFrameValue = 20;
						}
						jQuery('#FramePadding').val(themeOptionFrameValue+"px");
						jQuery("#bg").css('padding',themeOptionFrameValue+"px");
					}else{
						jQuery("body").addClass(themeOptionItemValue);	
					}
				}else if(themeOptionItem == 'header'){
					jQuery('.'+themeOptionItem+'-view li').removeClass('active');
					if( themeOptionItemValue == 'sticky-header'){
						jQuery('.'+themeOptionItem+'-view').find('.header-fixed').addClass('active');

						jQuery('.header-fixed').addClass('active');
						jQuery('.header-static').removeClass('active');
						
					}else if( themeOptionItemValue == 'sticky-no'){
						jQuery('.'+themeOptionItem+'-view').find('.header-static').addClass('active');
						
						jQuery('.header-fixed').removeClass('active');
						jQuery('.header-static').addClass('active');
					}
					jQuery(".main-bar-wraper").addClass(themeOptionItemValue);
				}else if(themeOptionItem == 'themeVersion'){
					
					if( themeOptionItemValue == 'light'){
						jQuery("body").addClass('layout-light').removeClass('layout-dark');	
						
						jQuery('.light-theme').addClass('active');
						jQuery('.dark-theme').removeClass('active');
						
					}else if( themeOptionItemValue == 'dark'){
						jQuery("body").addClass('layout-dark').removeClass('layout-light');
						
						jQuery('.dark-theme').addClass('active');
						jQuery('.light-theme').removeClass('active');

					}
					jQuery(".main-bar-wraper").addClass(themeOptionItemValue);
				}else if(themeOptionItem == 'menubar'){
					jQuery('.'+themeOptionItem+'-view li').removeClass('active');
					if( themeOptionItemValue == 'left'){
							jQuery('.'+themeOptionItem+'-view').find('.menubar-left').addClass('active');
							jQuery('.page-wraper').addClass('sidemenu');
							jQuery('.header-nav').addClass('sidenav content-scroll');
							
					}else if( themeOptionItemValue == 'top'){
							jQuery('.'+themeOptionItem+'-view').find('.menubar-top').addClass('active');
							jQuery('.page-wraper').removeClass('sidemenu');
							jQuery('.header-nav').removeClass('sidenav');
							 
							
							/* remove content-scroll */
							/* var logoheaderHTML =  jQuery('<div>').append($('.header-nav .logo-header').clone()).html(); 
							var navbarHTML = jQuery('<div>').append($('.header-nav .navbar-nav').clone()).html(); 
							var footermenuHTML = jQuery('<div>').append($('.header-nav .footer-menu').clone()).html(); 
							jQuery('.content-scroll').removeClass('content-scroll mCustomScrollbar _mCS_1 mCS_no_scrollbar');
							jQuery('.header-nav').empty();
							jQuery('.header-nav').append(logoheaderHTML).append(navbarHTML).append(footermenuHTML); */
					}
					
				}else if(themeOptionItem == 'bgColor' && themeOptionItemValue != ''  && themeOptionItemValue != 1){
					
					jQuery('#bg').css('background-color', themeOptionItemValue);
					jQuery('#bg').css('background-image', '');
					
					/* To Selected */
					jQuery('.bg-color-switcher li').removeClass('active');
					jQuery('.bg-color-switcher [dir="'+themeOptionItemValue+'"]').parent().addClass('active');
					
				}else if(themeOptionItem == 'bgImage'  && themeOptionItemValue != '' && themeOptionItemValue != 1){
					
					jQuery('#bg').css({backgroundImage: "url("+themeOptionItemValue+")"});
					
					
					/* To Selected */
					jQuery('.background-switcher li').removeClass('active');
					jQuery('.background-switcher [dir="'+themeOptionItemValue+'"]').parent().addClass('active');
					
				}else if(themeOptionItem == 'bgPatten'  && themeOptionItemValue != '' && themeOptionItemValue != 1){
					jQuery('#bg').css({backgroundImage: "url("+themeOptionItemValue+")"});
					jQuery("#bg").css( "background-size", "auto");
					
					/* To Selected */
					jQuery('.pattern-switcher li').removeClass('active');
					jQuery('.pattern-switcher [dir="'+themeOptionItemValue+'"]').parent().addClass('active');
				}
		}
	});
	
	
	
	var ts_logo_selector = getCookie('themeStandardColor_logo_selector');
	
	var tf_logo_selector = getCookie('themeFullColor_logo_selector');
	
	
	
	if(ts_logo_selector != '')
	{
		var ts_logo_image = getCookie('themeStandardColor_logo_image');
		
		var logoSelectorArr = ts_logo_selector.split(',');
		var logoSrcArr		= ts_logo_image.split(',');
		var arrCount = logoSelectorArr.length;
		for(var i=0; i<arrCount; i++){
			jQuery(logoSelectorArr[i]).attr('src',logoSrcArr[i]);
		}
	}
	
	if(tf_logo_selector != '')
	{
		var tf_logo_image = getCookie('themeFullColor_logo_image');
		
		var logoSelectorArr = tf_logo_selector.split(',');
		var logoSrcArr		= tf_logo_image.split(',');
		var arrCount = logoSelectorArr.length;
		for(var i=0; i<arrCount; i++){
			jQuery(logoSelectorArr[i]).attr('src',logoSrcArr[i]);
		}
	}
	
	
	/* Switcher Direction Selected */
	if(currentURL.indexOf('xhtml-rtl') > -1){
		jQuery('.rtl-theme').addClass('active');
		jQuery('.ltr-theme').removeClass('active');
	}else{
		jQuery('.rtl-theme').removeClass('active');
		jQuery('.ltr-theme').addClass('active');
	}
	

}

function setThemeLogo(themeOptionItemAttr){
	var logo = getCookie(themeOptionItemAttr+'_logo');
	if(logo != ''){
		jQuery(".logo-white img").attr("src", logo);
		jQuery(".logo-dark img").attr("src", logo);
		jQuery(".logo-center .logo-c").attr("src", logo);
	}
}

function setCookie(cname, cvalue, exhours) {
		var d = new Date();
		d.setTime(d.getTime() + (30*60*1000)); /* 30 Minutes*/
		var expires = "expires="+ d.toString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function deleteCookie(cname) {
		var d = new Date();
		d.setTime(d.getTime() + (1)); /* 1/1000 second*/
		var expires = "expires="+ d.toString();
		document.cookie = cname + "=1;" + expires + ";path=/";
}

function deleteAllCookie() {
	jQuery.each(themeOption, function(index, themeOptionItem) {
			deleteCookie(themeOptionItem+'_value');
			deleteCookie(themeOptionItem+'_logo_selector');
			deleteCookie(themeOptionItem+'_logo_image');
	});
	location.reload();
}
