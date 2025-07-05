jQuery(document).ready(function($) {
	var modal = $('#documentModal');
	var modalImage = $('#modalImage');
	var clearSrcTimeout = null;

	// Open modal when clicking on awards
	$('.awards-container').on('click', function() {
		var documentPath = $(this).data('document');
		if (documentPath) {
			if (clearSrcTimeout) {
				clearTimeout(clearSrcTimeout);
				clearSrcTimeout = null;
			}
			modalImage.attr('src', documentPath);
			openModal();
		}
	});

	// Close modal when clicking on backdrop
	$('.modal-backdrop').on('click', function() {
		closeModal();
	});

	// Close modal with Escape key
	$(document).on('keydown', function(e) {
		if (e.key === 'Escape' && modal.hasClass('show')) {
			closeModal();
		}
	});

	function openModal() {
		modal.addClass('show');
		$('body').css('overflow', 'hidden'); // Prevent background scrolling
	}

	function closeModal() {
		modal.removeClass('show');
		$('body').css('overflow', ''); // Restore scrolling
		// Clear image source after animation completes
		clearSrcTimeout = setTimeout(function() {
			modalImage.attr('src', '');
			clearSrcTimeout = null;
		}, 300);
	}
}); 