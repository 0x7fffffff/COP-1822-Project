/**
*	Michael MacCallum - COP1822
*
* 	This file contains all custom Javascript for the project, ranging from
*	the animations of the navigation bar to the AJAX for the form, and the
*	configuration for the carousel. This project utilizes libraries such as
*	jQuery and Slick, each of which have a minified copy in this directory.
*/

/**
*	The MIT License (MIT)
*
*	Copyright (c) [2014] [Michael MacCallum]
*
*	Permission is hereby granted, free of charge, to any person obtaining a
*	copy of this software and associated documentation files
*	(the "Software"), to deal in the Software without restriction, including
*	without limitation the rights to use, copy, modify, merge, publish,
*	distribute, sublicense, and/or sell copies of the Software, and to
*	permit persons to whom the Software is furnished to do so, subject to
*	the following conditions:
*
*	The above copyright notice and this permission notice shall be included
*	in all copies or substantial portions of the Software.
*
*	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
*	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
*	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
*	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
*	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
*	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
*	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Can't use const anywhere in this file..... Way to go IE team.


// Specifies the duration of the navigation bar's animations.
var DURATION = 300;

// Create alleged "constant" to access the local Octodex.
var OCTODEX;
/**
*	TODO: Fix this garbage. $.getJSON() is an async task and this is ugly.
*	It shouldn't be possible for the Octodex to be invoked before it gets
*	created because access requires user interaction with a link and this
*	happens onReady, but it needs to be fixed on principle.
*/
$.getJSON('JSON/octodex.json', function(json, textStatus) {
	OCTODEX = json;
});

function setDefaultHeaderHeights() {
	// Set default data stored on the header.
	$('header').data('size', 'large');

	var width = parseFloat($(window).width());

	if (width <= 550.0) {
		$('header').data('largeSize', 60);
	} else {
		$('header').data('largeSize', 80);
	}

	$('header').data('smallSize', 60);
}

function expandNavBar() {
	// Get the large size of the nav bar.
	var SIZE = $('header').data('largeSize');

	// Set the nav bar's current size to large.
	$('header').data('size', 'large');

	// Cancel animations and animate the nav bar to its new height.
	$('header').stop().animate({
		height: SIZE + 'px'
	}, {
		duration: DURATION,
		queue: false
	});
}

function collapseNavBar() {
	// Get the smaller size for the nav bar.
	var SIZE = $('header').data('smallSize');

	// Set the current size to small.
	$('header').data('size', 'small');

	// Cancel animations and animate nav list to its new height.
	$('header').stop().animate({
		height: SIZE + 'px'
	}, {
		duration: DURATION,
		queue: false
	});
}

function toggleNavBarState() {
	// Check if page's offset has reached the height of the nav bar and adjust.
	if ($(window).scrollTop() > $('header').data('smallSize')) {
		if ($('header').data('size') == 'large') {
			collapseNavBar();
		}
	} else {
		if ($('header').data('size') == 'small') {
			expandNavBar();
		}
	}
}


function resizeLandingToWindowHeight() {
	// get the larger size for the nav bar
	var LARGE_SIZE = $('header').data('largeSize');
	// determine the height for the landing div
	var height = $(window).height() - LARGE_SIZE;
	// apply found height to the landing div
	$('#landing').css('height', height);
}

function highlightLinkForVisibleSection(changeHash) {
	// Dominant element has yet to be determined.
	var dominantElement = null;
	// Will be used to test if current element has creater overlap than current.
	var maxOverlap = 0.0;

	// Loop over every section element on the page.
	$('section').each(function(index, el) {

		// Get the window for its dimensions.
		var frame = $(window);

		// Adjust visible window's origin for displacement by the nav bar.
		var frameOriginY = frame.scrollTop() + $('header').data('smallSize');
		// Get the new height of the visible window.
		var frameSizeY = frameOriginY + frame.height() -
			$('header').data('smallSize');

		// Needz moar jQuerizations.
		var element = $(el);

		// Get the element's dimensions in top down frames.
		var elementOriginY = element.position().top;
		var elementSizeY = elementOriginY + element.height();

		/**
		*	Determine Y overlap from subtracting the max origin from the
		*	min of the frame size and the element size to get amount of the
		*	section that is actually in frame.
		*/
		var overlapY = Math.max(0, Math.min(frameSizeY, elementSizeY) -
			Math.max(frameOriginY, elementOriginY));
		// Divide by the frame size to get the in bounds percentage.
		var divided = overlapY / frameSizeY;

		/**
		*	Only set the new dominant element and new max overlap if the
		*	percentage of the current element in bounds is greater than the
		*	max overlap and if the new most dominant element is different from
		*	the current.
		*/
		if (divided > maxOverlap && !element.is(dominantElement)) {
			maxOverlap = divided;
			dominantElement = element;

			// http://lea.verou.me/2011/05/change-url-hash-without-page-jump/
			if (changeHash == 'true') {
				if(history.pushState) {
				    history.pushState(null, null, '#' +
				    	$(this).attr('data-highlight'));
				}
			}
		}
	});

	// Create the selector for the section's id.
	var id = '#' + dominantElement.attr('data-highlight');

	// Iterate over the links in the nav bar.
	$('li a.jquery_link').each(function(index, el) {
		// Needz moar jQuerizations.
		var link = $(el);
		// Contents of the href attribute will are equal to the section's id.
		var href = link.attr('href');

		var blueColor = 'rgb(6, 150, 222)';
		var greyColor = 'rgb(81, 81, 81)';

		// Compare the created selector to the link and set link colors.
		if (href == id) {
			link.css('color', blueColor);
		} else {
			link.css('color', greyColor);
		}

		// Hover colors must be independently specfied.
		link.hover(function() {
			// On hover.
			link.css('color', blueColor);
		}, function() {
			// On unhover. Should only unhighlight non-dominant elements.
			if (href == id) {
				link.css('color', blueColor);
			} else {
				link.css('color', greyColor);
			}
		});
	});
}

function configureScrollToTop() {
	// Get scroll to top button.
	var scrollToTop = $('#scroll_to_top');

	// Position scroll to top button in button right corner of screen.
	scrollToTop.css({
		top: $(window).height() - scrollToTop.height() * 2,
		left: $(window).width() - scrollToTop.width() * 2
	});

	if (scrollToTop.css('visibility') == 'collapse') {
		scrollToTop.css('visibility', 'visible');
	} else {
		// Add event handler to button to animate the page to top if clicked.
		scrollToTop.click(function(event) {
			$("html, body").animate({
				scrollTop: 0
			}, "slow");
			return false;
		});

		// Add event handler to adjust button's image when hover state changes.
		scrollToTop.hover(function() {
			scrollToTop.attr('src', 'images/scroller.png');
		}, function() {
			scrollToTop.attr('src', 'images/scrollerHover.png');
		});
	}
}

function overrideReadMoreLinkBehavior() {
	// Get all divs inside repo nodes.
	var repos = $('.repo div');
	// Get the number of rendered repo nodes.
	var count = repos.size();

	// Loop over all repo nodes selected above.
	repos.each(function(index, el) {
		var textContainer = $(el);
		// Get full repo description from data-description attribute.
		var description = $(el).attr('data-description');

		// Double check that description is a non-empty string.
		if (description.length > 0) {
			// Find child anchor node and add click handler.
			textContainer.find('a').on('click', function(event) {
				// Remove default link behavior.
				event.preventDefault();

				// Pull the non-truncated description from data-description.
				var fullDescription = textContainer.attr('data-description');
				/**
				*	Replace parent's ('.repo div') HTML with the contents of
				*	the data-description attribute. This will remove the
				*	the link inside the container as well, which is to be
				*	expected because all content is loaded.
				*
				*	Output is set on the container's HTML instead of text to
				*	make sure that any escaped characters from the JSON get
				*	rendered. It will also give me the ability to add more to
				*	this later in terms of data detectors on the description.
				*/
				textContainer.html(fullDescription);
				$('#show_more').attr('data-remaining', 'value');
			});
		}
	});
}

function generateReposFromJSON(json) {

	// Get all the numeric ids from the rendered repos.
	var ids = $(".repo").map(function() {
		/**
		*	Extracts integers from each repo's data-repo attribute.
		*	Radix: base 10
		*/
		return parseInt($(this).attr('data-repo'), 10);
	}).get();

	// Get the max numeric value from the list of ids.
	var highest = Math.max.apply(Math, ids);
	var colCount = 3;

		// Get next 3 repos, numbered for non-programmer humans.
	for (var i = highest + 1 ; i < highest + 1 + colCount ; i++) {
		var repo = json[i];
		// Only have a few to work with, so they need to repeat.
		var octocat = OCTODEX[i % OCTODEX.length];

		// number of repos remaining.
		var remaining = json.length - (highest + 1 + colCount);

		/**
		*	Require that the repo exists. This also handles termination
		*	when the array runs out of repos to provide.
		*/
		if (repo !== null) {

			// Get description field and make unaltered copy.
			var description = repo.description;
			var data = description;

			var maxLength = 100;
			var overflowBuffer = 40;

			// Require the description to exist.
			if (description !== null) {
				// Require the description's length to be > 140 chars.
				if (description.length > maxLength + overflowBuffer) {
					/**
					*	Get first 100 characters from description and
					*	add show more link.
					*/
					description = description.substring(0, maxLength) +
						'... <a href="#">show more</a>';
				}
			} else {
				// Blank looks better than 'null'.
				description = '';
			}

			var language = repo.language;

			if (language === null || language.length === 0) {
				language = 'No Language';
			}

			/**
			*	This is ugly, don't look. Pseudo HTML formatted
			*	Javascript string. Had to break and conecate because JS
			*	doesn't allow breaks in the middle of the string.
			*/
			var template =
			'<div class="repo" data-repo="' + i + '">' +
				'<a href="' + repo.html_url + '">' +
					'<img src="' + octocat.path + '" ' +
						'alt="' + octocat.name + '">' +
				'</a>' +
				'<h3>' +
					'<a alt="' + repo.name + '" ' +
						'href="' + repo.html_url + '">' +
						repo.name +
					'</a>' +
				'</h3>' +
				'<hr />' +
				'<h4>' +
					language +
				'</h4>' +
				'<div data-description="' + data + '">' +
					description +
				'</div>' +
			'</div>';

			/**
			*	Add the template HTML before the show more button. This
			*	will add the new repo as the second to last element in
			*	the repositories container.
			*/
			$('#show_more').before(template);

			// Change count down text on more link if repos remain.
			if (remaining > 0) {
				var numToShow = colCount;

				if (remaining <= colCount) {
					numToShow = remaining;
				}

				$('#show_more').html('Show ' + numToShow + ' of ' +
					remaining + ' More');
			} else {
				// Hide the show more link when all repos are shown.
				$('#show_more').hide();
			}
		}
	}

	// Add show more capability to newly added repos.
	overrideReadMoreLinkBehavior();
}

// On scroll attempt to adjust nav bar, highlighted links & scrollToTop button.

// $.getScript('js/jquery.ba-throttle-debounce.js', function(data, textStatus) {
// 	console.log(textStatus);
// 	if (textStatus == 'success') {
// 		$(window).scroll($.throttle(1000, true, function(e) {
// 			highlightLinkForVisibleSection();
// 		}));
// 	};
// });

$(window).scroll(function(event) {
	toggleNavBarState();
	highlightLinkForVisibleSection(false);

	// Get the offset for the bottom of the page.
	var bottom = $(document).height() - $(window).height() -
		$(window).scrollTop();
	// Get the height of the footer.
	var footer = $('footer').height();

	// If the bottom offset is <= the footer, the footer is visible.
	if (bottom <= footer) {
		// Move the button up by the amount of the footer visible on the page.
		$('#scroll_to_top').css({
			top: $(window).height() - $('header').data('smallSize') * 2.0 -
				(footer - bottom)
		});
	} else {
		$('#scroll_to_top').css({
			top: $(window).height() - $('header').data('smallSize') * 2.0
		});
	}
});


$(window).resize(function(event) {
	resizeLandingToWindowHeight();
	configureScrollToTop();
});

// On resize attempt to adjust nav bar and highlighted links.
$(window).on("throttledresize", function(event) {
	resizeLandingToWindowHeight();
	highlightLinkForVisibleSection(true);
	configureScrollToTop();
	setDefaultHeaderHeights();
});

$(window).on("orientationchange", function(event) {
	resizeLandingToWindowHeight();
	highlightLinkForVisibleSection(true);
	configureScrollToTop();
	setDefaultHeaderHeights();
});

$(window).on('beforeunload', function(event) {
	localStorage.setItem('shouldAllowHashChange', 'false');
});


$(window).load(function() {
	localStorage.setItem('shouldAllowHashChange', 'true');
});

$(function() {
	/**
	*	Initial configuration for Slick carousel. Still needs more fine tuning
	*	including auditing the confiurations for different layout sizes.
	*/
	$('#projects_slick_container').slick({
		dots: true,
		lazyLoad: 'progressive',
		slidesToShow: 4,
		slidesToScroll: 1,
		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 3,
					slidesToScroll: 1,
					dots: true
				}
			},
			{
				breakpoint: 600,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 1,
					dots: true
				}
			},
			{
				breakpoint: 480,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
					dots: true
				}
			}
		]
	});
});

$(function() {
	/**
	*	Resize the landing page once onReady to override its default height of
	*	600px and size it to the window's bounds. These will also set the
	*	initial states for the highlighted links, the scroll to top button, and
	*	the read more links below the repositories.
	*/
	var allowChange = localStorage.getItem('shouldAllowHashChange');

	setDefaultHeaderHeights();
	resizeLandingToWindowHeight();
	highlightLinkForVisibleSection(allowChange);
	configureScrollToTop();
	overrideReadMoreLinkBehavior();

	// Configure functionality of links in the navigation bar.
	$('.jquery_link').on('click', function(event) {
		// Remove default functionality of the link. We want to animate it.
		event.preventDefault();

		/**
		*	Use the href attribute as the target. This will allow the brower
		*	to fall back on link functionality without animations in case jQuery
		*	fails. This also removes the need to have an additional data
		*	attribute to keep track of which nav link is linked to each section.
		*/
		var target = $(this).attr('href');
		// Gets the large size of the navigation bar.
		var offset = $('header').data('largeSize');

		/**
		*	Reset the offset size to the navigation bar's small size if
		*	the link will navigate the page to any section below the landing
		*	page. This is necessary to align with the navigation bar's smaller
		*	size at these offsets.
		*/
		if (target != '#landing') {
			offset = $('header').data('smallSize');
			collapseNavBar();
		}

		/**
		*	Animate the offset of the page to align the selected section with
		*	the bottom of the navigation bar.
		*/
		$('html, body').stop().animate({
			scrollTop: $(target).offset().top - offset
		}, 500, function() {
			$('.hideable_link').stop().animate({
				height: '0px'
			}, 250);

			// Change hash in URL while after animation.
			window.location.hash = target;
		});
	});

	$('#expander').on('click', function(event) {
		event.preventDefault();

		var height = parseFloat($('.hideable_link').height());

		$('.hideable_link').stop().animate({
			height: (height === 0 ? 40 : 0) + 'px'
		}, 250);
	});

	// Add a click handler to the show more link from the GitHub section.
	$('#show_more').on('click', function(event) {
		// Remove the default behavior of the link.
		event.preventDefault();

		// Get git repos stringified JSON from localStorage.
		var repoCache = localStorage.getItem('repoStorage');

		// Check if repo cache is null.
		if (repoCache === null) {
			// Load repos from local JSON file. Fallback URL commented below.
			var path = 'JSON/repos.json';
			// var path = 'https://api.github.com/users/0x7fffffff/repos';

			/**
			*	Make request for JSON at path specified above.
			*	Javascript object in second argument specifies the params
			*	to be passed through the URL. These include a sort option
			*	and a limit for results per page.
			*/
			$.getJSON(path, {
				sort 	 : 'pushed',
				per_page : '100'
			}, function(json, textStatus) {
				// Check if JSON was successfully gotten.
				if (textStatus == 'success') {
					// Cache JSON response. Must be stringified to be stored.
					localStorage.setItem('repoStorage', JSON.stringify(json));
					generateReposFromJSON(json);
				}
			});
		} else {
			generateReposFromJSON(JSON.parse(repoCache));
		}
	});
});

$(function() {
	/**
	*	https://api.stackexchange.com/2.2/users/716216?order=desc
			&sort=reputation&site=stackoverflow
	*
	*	Request JSON from Stack Exchange API v2.2 to get information about
	*	my profile.
	*/

	// Replace on deployment.
	var userPath = 'JSON/stackExchange.json';
	// var path = 'https://api.stackexchange.com/2.2/users/716216';


	/**
	*	Make request for JSON at path specified above.
	*	Javascript object in second argument specifies the params
	*	to be passed through the URL. These include order to specify sorting,
	*	sort to determine the column to sort by, site for which SE network
	*	should be used, and filter which can not be explained properly. It
	*	allows you to specify which columns from the query you're interested in
	*	actually receiving. The input is generated at the listed URL based on
	* 	user selections.
	*
	*	http://api.stackexchange.com/docs/users
	*/
	$.getJSON(userPath, {
		order  : 'desc',
		sort   : 'reputation',
		site   : 'stackoverflow',
		filter : '!)69QNaSIc2a*pNvM2u.o*2cz8LY2'
	}, function(json, textStatus) {
		// Check if JSON was successfully gotten.
		if (textStatus == 'success') {
			// Returns users in an array -> items.
			var users = json.items;
			// There should only ever be one user as per the query.
			var user = users[0];

			// Parse a float of the current user's current reputation.
			var reputation = parseFloat(user.reputation);
			// Create shorten reputation of the form 'xx.y'
			var shortRep = (Math.round(reputation / 100.0)) / 10.0;

			// var answerURL = 'http://stackoverflow.com/users/716216/0x7fffffff' +
			// 	'?tab=answers&sort=votes#user-tab-answers';

			// var answerItem = $('<li></li>');
			// var answerLink = $('<a></a>');

			// answerLink.attr({
			// 	href: answerURL
			// });

			// answerLink.text(' Answers');
			// answerItem.text(user.answer_count);

			// answerItem.append(answerLink);

			// Replace the rep span's text with shortRep + k
			$('#rep').text(shortRep + 'k');
			// $('#diamond_list').append(answerItem);
		}
	});

	// http://api.stackexchange.com/2.2/users/716216/posts?pagesize=10&order=desc&sort=creation&site=stackoverflow&filter=!-*f(6rc-sAtD&post_type=answer
	// var answerPath = 'http://api.stackexchange.com/2.2/users/716216/posts';
	var answerPath = 'JSON/answers.json';

	$.getJSON(answerPath, {
		pagesize: '10',
		order: 'desc',
		sort: 'creation',
		site: 'stackoverflow',
		filter: '!-*f(6rc-sAtD',
		post_type: 'answer'
	}, function(json, textStatus) {
		if (textStatus == 'success') {

			var answerContainer = $('#answers_slick_container');

			$(json.items).each(function(index, el) {

				// To msecs since 1970.
				var date = new Date(el.creation_date * 1000.0);

				// ISO string for fuzzy time, UTC for readability.
				var isoDate = date.toISOString();
				var utcString = date.toUTCString();


				var container = $('<div class="answer"></div>');

				var question = $('<a></a>');
				var title = $('<h2></h2>');

				title.html(el.title);

				question.html(title);
				question.attr({
					href: el.link
				});

				var time = $('<time></time>');

				time.text(utcString);
				time.attr({
					class: 'timeago',
					datetime: isoDate
				});

				container.append(question);
				container.append(time);

				answerContainer.append(container);
			});

			$.getScript('js/jquery.timeago.min.js', function(data, textStatus) {
				if (textStatus == 'success') {
					$("time.timeago").timeago();
				}
			});

			answerContainer.slick({
				dots: false,
				autoplay: true,
				infinite: true,
				speed: 500,
				slidesToShow: 1,
				slidesToScroll: 1,
			});
		}
	});
});

$(function () {
	$.getScript('js/jquery.mobile.custom.min.js', function(data, textStatus) {
		if (textStatus == 'success') {
			$(window).on("scrollstart", function() {
				var height = parseFloat($('.hideable_link').height());

				if (height !== 0.0) {
					$('.hideable_link').stop().animate({
						height: '0px'
					}, 250);
				}
			});

			$(window).on('scrollstop', function(event) {
				var allowChange = localStorage.getItem('shouldAllowHashChange');
				highlightLinkForVisibleSection(allowChange);
			});
		}
	});
});

/**
*	The anonymous function below uses code obtained from following the tutorial
*	about creating a contact for using AJAX at this link.
*	http://blog.teamtreehouse.com/create-ajax-contact-form
*/
$(function() {
	// Get the form.
	var form = $('#ajax-contact');

	// Get the messages div.
	var formMessages = $('#form-messages');

	// Set up an event listener for the contact form.
	$(form).submit(function(e) {
		// Stop the browser from submitting the form.
		e.preventDefault();

		// Serialize the form data.
		var formData = $(form).serialize();

		// Submit the form using AJAX.
		$.ajax({
			type: 'POST',
			url: $(form).attr('action'),
			data: formData
		}).done(function(response) {
			console.log(response);
			// Make sure that the formMessages div has the 'success' class.
			$(formMessages).removeClass('error');
			$(formMessages).addClass('success');

			// Set the message text.
			$(formMessages).text(response);

			// Clear the form.
			$('#name').val('');
			$('#email').val('');
			$('#message').val('');

		}).fail(function(data) {
			// Make sure that the formMessages div has the 'error' class.
			$(formMessages).removeClass('success');
			$(formMessages).addClass('error');

			// Set the message text.
			if (data.responseText !== '') {
				$(formMessages).text(data.responseText);
			} else {
				$(formMessages).text('Error: message could not be sent.');
			}
		});
	});
});



$('.buttons').on('hover', function(event) {
	$(this).children('.image').stop().animate ({
		alpha: 1
	}, 500);
}, function() {
	$(this).children('.image').stop().animate ({
		alpha: 0
	}, 500);
});
