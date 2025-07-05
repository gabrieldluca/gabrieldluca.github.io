jQuery(document).ready(function($) {
	var timelines = $('.horizontal-timeline');
	var eventsMinDistance = 71;

	if (timelines.length > 0) initTimeline(timelines);

	function initTimeline(timelines) {
		timelines.each(function() {
			var timeline = $(this);
			var components = cacheTimelineComponents(timeline);

			setDatePosition(components, eventsMinDistance);
			var timelineTotWidth = setTimelineWidth(components, eventsMinDistance);
			timeline.addClass('loaded');

			updateSlide(components, timelineTotWidth, 'next');
			updateFilling($('.selected'), components.fillingLine, timelineTotWidth);

			bindEventHandlers(components, timelineTotWidth, timeline);
		});
	}

	function cacheTimelineComponents(timeline) {
		var wrapper = timeline.find('.events-wrapper');
		return {
			timelineWrapper: wrapper,
			eventsWrapper: wrapper.children('.events'),
			fillingLine: wrapper.children('.events').children('.filling-line'),
			timelineEvents: wrapper.children('.events').find('a'),
			timelineNavigation: timeline.find('.timeline-navigation'),
			eventsContent: timeline.children('.events-content')
		};
	}

	function bindEventHandlers(components, timelineTotWidth, timeline) {
		components.timelineNavigation.on('click', '.next', function(event) {
			event.preventDefault();
			updateSlide(components, timelineTotWidth, 'next');
		});

		components.timelineNavigation.on('click', '.prev', function(event) {
			event.preventDefault();
			updateSlide(components, timelineTotWidth, 'prev');
		});

		components.eventsWrapper.on('click', 'a', function(event) {
			event.preventDefault();
			
			if ($(this).hasClass('selected')) {
				return;
			}
			
			components.timelineEvents.removeClass('selected');
			$(this).addClass('selected');
			updateOlderEvents($(this));
			updateFilling($(this), components.fillingLine, timelineTotWidth);
			updateVisibleContent($(this), components.eventsContent);
		});

		components.eventsContent.on('swipeleft', function() {
			var mq = checkMQ();
			if (mq === 'mobile') showNewContent(components, timelineTotWidth, 'next');
		});

		components.eventsContent.on('swiperight', function() {
			var mq = checkMQ();
			if (mq === 'mobile') showNewContent(components, timelineTotWidth, 'prev');
		});

		$(document).keyup(function(event) {
			if (event.which === 37 && elementInViewport(timeline.get(0))) {
				showNewContent(components, timelineTotWidth, 'prev');
			} else if (event.which === 39 && elementInViewport(timeline.get(0))) {
				showNewContent(components, timelineTotWidth, 'next');
			}
		});

		$(window).on('resize', function() {
			var currentTranslateValue = getTranslateValue(components.eventsWrapper);
			var timelineWrapperWidth = components.timelineWrapper.width();
			var eventsWrapperWidth = components.eventsWrapper.width();
			var totWidth = timelineWrapperWidth - eventsWrapperWidth;
			
			updateNavigationArrows(components, currentTranslateValue, totWidth);
		});
	}

	function updateSlide(components, timelineTotWidth, direction) {
		var translateValue = getTranslateValue(components.eventsWrapper);
		var wrapperWidth = Number(components.timelineWrapper.css('width').replace('px', ''));

		if (direction === 'next') {
			translateTimeline(
				components,
				translateValue - wrapperWidth + eventsMinDistance,
				wrapperWidth - timelineTotWidth
			);
		} else {
			translateTimeline(
				components,
				translateValue + wrapperWidth - eventsMinDistance,
				wrapperWidth - timelineTotWidth
			);
		}
	}

	function showNewContent(components, timelineTotWidth, direction) {
		var visibleContent = components.eventsContent.find('.selected');
		var newContent = direction === 'next' ? visibleContent.next() : visibleContent.prev();

		if (newContent.length > 0) {
			var selectedDate = components.eventsWrapper.find('.selected');
			var newEvent = direction === 'next'
				? selectedDate.parent('li').next('li').children('a')
				: selectedDate.parent('li').prev('li').children('a');

			updateFilling(newEvent, components.fillingLine, timelineTotWidth);
			updateVisibleContent(newEvent, components.eventsContent);
			newEvent.addClass('selected');
			selectedDate.removeClass('selected');
			updateOlderEvents(newEvent);
			updateTimelinePosition(direction, newEvent, components, timelineTotWidth);
		}
	}

	function updateTimelinePosition(direction, event, components, timelineTotWidth) {
		var eventStyle = window.getComputedStyle(event.get(0), null);
		var eventLeft = Number(eventStyle.getPropertyValue('left').replace('px', ''));
		var timelineWidth = Number(components.timelineWrapper.css('width').replace('px', ''));
		var timelineTotWidth = Number(components.eventsWrapper.css('width').replace('px', ''));
		var timelineTranslate = getTranslateValue(components.eventsWrapper);

		if (
			(direction === 'next' && eventLeft > timelineWidth - timelineTranslate) ||
			(direction === 'prev' && eventLeft < -timelineTranslate)
		) {
			translateTimeline(
				components,
				-eventLeft + timelineWidth / 2,
				timelineWidth - timelineTotWidth
			);
		}
	}

	function translateTimeline(components, value, totWidth) {
		var eventsWrapper = components.eventsWrapper.get(0);
		value = value > 0 ? 0 : value;
		value = typeof totWidth !== 'undefined' && value < totWidth ? totWidth : value;
		setTransformValue(eventsWrapper, 'translateX', value + 'px');

		updateNavigationArrows(components, value, totWidth);
	}

	function updateNavigationArrows(components, value, totWidth) {
		var prevArrow = components.timelineNavigation.find('.prev');
		var nextArrow = components.timelineNavigation.find('.next');

		// Check if we can navigate left (prev) - timeline at leftmost position
		if (value === 0) {
			prevArrow.addClass('inactive');
		} else {
			prevArrow.removeClass('inactive');
		}

		// Check if we can navigate right (next) - timeline at rightmost position
		if (value === totWidth) {
			nextArrow.addClass('inactive');
		} else {
			nextArrow.removeClass('inactive');
		}
	}

	function updateFilling(selectedEvent, filling, totWidth) {
		var eventStyle = window.getComputedStyle(selectedEvent.get(0), null);
		var eventLeft = eventStyle.getPropertyValue('left');
		var eventWidth = eventStyle.getPropertyValue('width');
		var eventCenter = Number(eventLeft.replace('px', '')) + Number(eventWidth.replace('px', '')) / 2;
		var scaleValue = eventCenter / totWidth;
		setTransformValue(filling.get(0), 'scaleX', scaleValue);
	}

	function setDatePosition(components, min) {
		var totalEvents = components.timelineEvents.length;
		var fixedSpacing = 200;
		var leftPadding = 50;

		for (var i = 0; i < totalEvents; i++) {
			components.timelineEvents.eq(i).css('left', leftPadding + i * fixedSpacing + 'px');
		}
	}

	function setTimelineWidth(components, width) {
		var totalEvents = components.timelineEvents.length;
		var fixedSpacing = 200;
		var calculatedWidth = (totalEvents - 1) * fixedSpacing + width;
		var timelineWrapperWidth = components.timelineWrapper.width();
		var totalWidth = Math.max(calculatedWidth, timelineWrapperWidth);

		components.eventsWrapper.css('width', totalWidth + 'px');
		updateFilling(components.timelineEvents.eq(0), components.fillingLine, totalWidth);

		return totalWidth;
	}

	function updateVisibleContent(event, eventsContent) {
		var eventDate = event.data('date');
		var visibleContent = eventsContent.find('.selected');
		var selectedContent = eventsContent.find('[data-date="' + eventDate + '"]');

		var classEntering, classLeaving;
		if (selectedContent.index() > visibleContent.index()) {
			classEntering = 'selected enter-right';
			classLeaving = 'leave-left';
		} else {
			classEntering = 'selected enter-left';
			classLeaving = 'leave-right';
		}

		selectedContent.attr('class', classEntering);
		visibleContent.attr('class', classLeaving).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {
			visibleContent.removeClass('leave-right leave-left');
			selectedContent.removeClass('enter-left enter-right');
		});
	}

	function updateOlderEvents(event) {
		event.parent('li').prevAll('li').children('a').addClass('older-event').end().end().nextAll('li').children('a').removeClass('older-event');
	}

	function getTranslateValue(timeline) {
		var timelineStyle = window.getComputedStyle(timeline.get(0), null);
		var timelineTranslate =
			timelineStyle.getPropertyValue('-webkit-transform') ||
			timelineStyle.getPropertyValue('-moz-transform') ||
			timelineStyle.getPropertyValue('-ms-transform') ||
			timelineStyle.getPropertyValue('-o-transform') ||
			timelineStyle.getPropertyValue('transform');

		if (timelineTranslate.indexOf('(') >= 0) {
			timelineTranslate = timelineTranslate.split('(')[1];
			timelineTranslate = timelineTranslate.split(')')[0];
			timelineTranslate = timelineTranslate.split(',');
			var translateValue = timelineTranslate[4];
		} else {
			var translateValue = 0;
		}

		return Number(translateValue);
	}

	function setTransformValue(element, property, value) {
		element.style['-webkit-transform'] = property + '(' + value + ')';
		element.style['-moz-transform'] = property + '(' + value + ')';
		element.style['-ms-transform'] = property + '(' + value + ')';
		element.style['-o-transform'] = property + '(' + value + ')';
		element.style['transform'] = property + '(' + value + ')';
	}

	/*
		How to tell if a DOM element is visible in the current viewport?
		http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
	*/
	function elementInViewport(el) {
		var top = el.offsetTop;
		var left = el.offsetLeft;
		var width = el.offsetWidth;
		var height = el.offsetHeight;

		while (el.offsetParent) {
			el = el.offsetParent;
			top += el.offsetTop;
			left += el.offsetLeft;
		}

		return (
			top < window.pageYOffset + window.innerHeight &&
			left < window.pageXOffset + window.innerWidth &&
			top + height > window.pageYOffset &&
			left + width > window.pageXOffset
		);
	}

	function checkMQ() {
		// Check if mobile or desktop device
		return window
			.getComputedStyle(document.querySelector('.horizontal-timeline'), '::before')
			.getPropertyValue('content')
			.replace(/'/g, '')
			.replace(/"/g, '');
	}
});