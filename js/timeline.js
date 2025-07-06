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

			components.timelineEvents.each(function() {
				var eventDate = $(this).data('date');
				if (!eventDate) return;
				var parts = eventDate.split('/');
				var eventTime = new Date(parts[2], parts[0] - 1, parts[1]).getTime();
				var now = new Date();
				now.setHours(0,0,0,0);
				if (eventTime > now.getTime()) {
					$(this).addClass('future-event');
				}
			});

			updateSlide(components, timelineTotWidth, 'prev');
			
			// Ensure first event is selected if none selected
			var selectedEvent = components.timelineEvents.filter('.selected');
			if (selectedEvent.length === 0) {
				selectedEvent = components.timelineEvents.first();
				selectedEvent.addClass('selected').removeClass('future-event');
			}
			
			updateFilling(selectedEvent, components.fillingLine, timelineTotWidth);
			updateOlderEvents(selectedEvent);
			
			// Ensure the selected content is visible
			var selectedContent = components.eventsContent.find('[data-date="' + selectedEvent.data('date') + '"]');
			if (selectedContent.length > 0) {
				selectedContent.addClass('selected').css({
					'opacity': 1,
					'transform': 'translateX(0)',
					'pointer-events': 'auto'
				});
				
				var initialHeight = selectedContent.outerHeight(true);
				components.eventsContent.css('height', initialHeight + 'px');
			}

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
			$(this).addClass('selected').removeClass('future-event');
			$(this).removeClass('older-event');
			updateOlderEvents($(this));
			updateFilling($(this), components.fillingLine, timelineTotWidth);
			updateVisibleContent($(this), components.eventsContent);
		});

		components.eventsContent.on('swipeleft', function() {
			if (isMobile()) showNewContent(components, timelineTotWidth, 'next');
		});

		components.eventsContent.on('swiperight', function() {
			if (isMobile()) showNewContent(components, timelineTotWidth, 'prev');
		});

		$(document).keyup(function(event) {
			if (event.which === 37 && elementInViewport(timeline.get(0))) {
				showNewContent(components, timelineTotWidth, 'prev');
			} else if (event.which === 39 && elementInViewport(timeline.get(0))) {
				showNewContent(components, timelineTotWidth, 'next');
			}
		});

		$(window).on('resize', function() {
			// Recalculate event positions and timeline width
			setDatePosition(components, eventsMinDistance);
			var timelineTotWidth = setTimelineWidth(components, eventsMinDistance);

			// Reset translation to 0 (leftmost)
			setTransformValue(components.eventsWrapper.get(0), 'translateX', '0px');

			// Update filling line and navigation arrows
			var selectedEvent = components.eventsWrapper.find('.selected');
			updateFilling(selectedEvent, components.fillingLine, timelineTotWidth);

			var currentTranslateValue = 0;
			var timelineWrapperWidth = components.timelineWrapper.width();
			var eventsWrapperWidth = components.eventsWrapper.width();
			var totWidth = timelineWrapperWidth - eventsWrapperWidth;
			updateNavigationArrows(components, currentTranslateValue, totWidth);

			// Recalculate the height for the selected card
			var eventsContent = $('.horizontal-timeline .events-content');
			var selectedCard = eventsContent.find('li.selected');
			if (selectedCard.length) {
				eventsContent.height(selectedCard.outerHeight(true));
			}
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
		var selectedEvent = components.eventsWrapper.find('.selected');
		var newEvent = direction === 'next'
			? selectedEvent.parent('li').next('li').children('a')
			: selectedEvent.parent('li').prev('li').children('a');

		if (newEvent.length > 0) {
			updateFilling(newEvent, components.fillingLine, timelineTotWidth);
			updateVisibleContent(newEvent, components.eventsContent);
			newEvent.addClass('selected').removeClass('future-event');
			selectedEvent.removeClass('selected');
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
		var fixedSpacing = isMobile() ? 120 : 188;
		var leftPadding = 50;
		var positions = [];

		for (var i = 0; i < totalEvents; i++) {
			positions.push(leftPadding + i * fixedSpacing + 'px');
		}
		
		components.timelineEvents.each(function(index) {
			$(this).css('left', positions[index]);
		});
	}

	function setTimelineWidth(components, width) {
		var totalEvents = components.timelineEvents.length;
		var fixedSpacing = isMobile() ? 120 : 188;
		var leftPadding = 50;
		var rightPadding = 80;
		var calculatedWidth = leftPadding + (totalEvents - 1) * fixedSpacing + rightPadding;
		var timelineWrapperWidth = components.timelineWrapper.width();
		var totalWidth = Math.max(calculatedWidth, timelineWrapperWidth);

		components.eventsWrapper.css('width', totalWidth + 'px');
		return totalWidth;
	}

	function updateVisibleContent(event, eventsContent) {
		const eventDate = event.data('date');
		const currentCard = eventsContent.find('.selected');
		const newCard = eventsContent.find('[data-date="' + eventDate + '"]');
		
		if (isSameCard(currentCard, newCard)) return;
		
		clearAnimationStates(eventsContent);
		startCardTransition(currentCard, newCard, eventsContent);
		scheduleTransitionCompletion(currentCard, newCard, eventsContent);
	}
	
	function isSameCard(currentCard, newCard) {
		return currentCard.is(newCard);
	}
	
	function clearAnimationStates(eventsContent) {
		eventsContent.find('li').removeClass('entering leaving');
	}
	
	function startCardTransition(currentCard, newCard, eventsContent) {
		const timeline = eventsContent.closest('.horizontal-timeline');
		
		timeline.addClass('animating');
		currentCard.removeClass('selected').addClass('leaving');
		resetCardStyles(newCard);
		newCard.addClass('entering');
	}
	
	function resetCardStyles(card) {
		card[0].style.opacity = '';
		card[0].style.pointerEvents = '';
	}
	
	function scheduleTransitionCompletion(currentCard, newCard, eventsContent) {
		setTimeout(() => {
			completeCardTransition(currentCard, newCard, eventsContent);
		}, 300);
	}
	
	function completeCardTransition(currentCard, newCard, eventsContent) {
		const timeline = eventsContent.closest('.horizontal-timeline');
		
		currentCard.removeClass('leaving');
		newCard.removeClass('entering').addClass('selected');
		hideInactiveCards(eventsContent, newCard);
		adjustContainerHeight(eventsContent, newCard);
		timeline.removeClass('animating');
	}
	
	function hideInactiveCards(eventsContent, activeCard) {
		eventsContent.find('li').not(activeCard).not('.leaving').css({ 
			opacity: 0, 
			pointerEvents: 'none' 
		});
	}
	
	function adjustContainerHeight(eventsContent, card) {
		eventsContent.height(card.outerHeight(true));
	}

	function updateOlderEvents(event) {
		event.parent('li').prevAll('li').children('a')
			.addClass('older-event')
			.removeClass('future-event')
			.end().end()
			.nextAll('li').children('a')
			.removeClass('older-event')
			.addClass('future-event');
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
			top < window.scrollY + window.innerHeight &&
			left < window.scrollX + window.innerWidth &&
			top + height > window.scrollY &&
			left + width > window.scrollX
		);
	}

	function isMobile() {
		return window.matchMedia('(max-width: 650px)').matches;
	}
});