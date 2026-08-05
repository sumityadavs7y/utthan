/**
	Abstract : Ajax Page Js File
	File : dz.ajax.js
	#CSS attributes: 
		.dzForm : Form class for ajax submission. 
		.dzFormMsg  : Div Class| Show Form validation error/success message on ajax form submission

	#Javascript Variable
	.dzRes : ajax request result variable
	.dzFormAction : Form action variable
	.dzFormData : Form serialize data variable

**/

function contactForm()
{
	window.verifyRecaptchaCallback = function (response) {
        $('input[data-recaptcha]').val(response).trigger('change');
    }

    window.expiredRecaptchaCallback = function () {
        $('input[data-recaptcha]').val("").trigger('change');
    }
	'use strict';

	$(".dzForm").on('submit',function(e)
	{
		e.preventDefault();
		var thisForm = $(this);
		var msgBox = thisForm.find('.dzFormMsg');
		if (!msgBox.length) {
			msgBox = $('.dzFormMsg').first();
		}
		msgBox.html('<div class="gen alert alert-success">Submitting..</div>');

		$.ajax({
			method: "POST",
			url: thisForm.attr('action'),
			data: thisForm.serialize(),
			dataType: 'json',
			success: function(dzRes){
				var msgDiv = dzRes.status == 1
					? '<div class="gen alert alert-success">'+dzRes.msg+'</div>'
					: '<div class="err alert alert-danger">'+dzRes.msg+'</div>';
				msgBox.html(msgDiv);

				setTimeout(function(){
					msgBox.find('.alert').hide(1000);
				}, 10000);

				if (dzRes.status == 1) {
					thisForm[0].reset();
				}
				if (typeof grecaptcha !== 'undefined' && thisForm.find('[data-recaptcha]').length) {
					try { grecaptcha.reset(); } catch (err) {}
				}
			},
			error: function(xhr){
				var msg = (xhr.responseJSON && xhr.responseJSON.msg)
					? xhr.responseJSON.msg
					: 'Something went wrong. Please try again.';
				msgBox.html('<div class="err alert alert-danger">'+msg+'</div>');
			}
		})
	});
	
	
	/* This function is for mail champ subscription START*/
	$(".dzSubscribe").on('submit',function(e)
	{
		e.preventDefault();
		var thisForm = $(this);
		var msgBox = thisForm.find('.dzSubscribeMsg');
		if (!msgBox.length) {
			msgBox = thisForm.siblings('.dzSubscribeMsg').first();
		}
		var dzFormAction = thisForm.attr('action');
		var dzFormData = thisForm.serialize();
		thisForm.addClass('dz-ajax-overlay');
		
		$.ajax({
			method: "POST",
			url: dzFormAction,
			data: dzFormData,
			dataType: 'json',
		  success: function(dzRes) {
			thisForm.removeClass('dz-ajax-overlay');  
			var msgDiv = dzRes.status == 1
				? '<div class="gen alert alert-success">'+dzRes.msg+'</div>'
				: '<div class="err alert alert-danger">'+dzRes.msg+'</div>';
			msgBox.html(msgDiv);
			
			setTimeout(function(){
				msgBox.find('.alert').hide(1000);
			}, 10000);
			
			if (dzRes.status == 1) {
				thisForm[0].reset();
			}
		  },
		  error: function(xhr){
			thisForm.removeClass('dz-ajax-overlay');
			var msg = (xhr.responseJSON && xhr.responseJSON.msg)
				? xhr.responseJSON.msg
				: 'Something went wrong. Please try again.';
			msgBox.html('<div class="err alert alert-danger">'+msg+'</div>');
		  }
		}) 
	});
	
	/* This function is for mail champ subscription END*/
	
}


jQuery(document).ready(function() {
    'use strict';
	contactForm();
})
