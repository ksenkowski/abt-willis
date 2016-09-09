$(function() {
	var toggleMenu = function() {
		$('.js-menu-lines').toggleClass('is-animated');
		$('.menu-container').toggleClass('is-hidden');
		$('.menu').toggleClass('is-active');
	};

	$('.js-menu-lines').on('click', function(e) {
		e.preventDefault();
		toggleMenu();
	});
	
});
