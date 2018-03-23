require('./bootstrap');

var desktopVer = true,
	pageIntroduced = false,
	currentColor = '#f57576',
	waterColor = {
		'homepage': '#f57576',
		'info': '#55B788'
	},
	parallaxScene1 = null,
	parallaxInstance1 = null,
	parallaxScene2 = null,
	parallaxInstance2 = null;

$(function () {
	/* Mediacheck */
	mediaCheck({
		media: '(max-width: 768px)',
		entry: function () {
			desktopVer = false;
		},
		exit: function () {
			desktopVer = true;
		}
	});
	
	/* BARBA */
	var lastElementClicked;

	Barba.Dispatcher.on('linkClicked', function (e) {
		clickedElem = e;
	});
	
	var HomepageIntro = Barba.BaseView.extend({
		namespace: 'homepage',
		onEnter: function() {
			if (!pageIntroduced) {
				barbaAllIntro(waterColor['homepage']);
				pageIntroduced = true;
			}
		},
		onEnterCompleted: function() {
			barbaHomepageScript();
		},
		onLeave: function() {
			
		},
		onLeaveCompleted: function() {
			
		}
	});
	
	var InfoIntro = Barba.BaseView.extend({
		namespace: 'info',
		onEnter: function() {
			if (!pageIntroduced) {
				barbaAllIntro(waterColor['info']);
				pageIntroduced = true;
			}
		},
		onEnterCompleted: function() {
			barbaHomepageScript();
		},
		onLeave: function() {
			
		},
		onLeaveCompleted: function() {
			
		}
	});

	var desktopTransition = Barba.BaseTransition.extend({
		start: function () {
			Promise
				.all([this.newContainerLoading, this.fadeOut()])
				.then(this.fadeIn.bind(this));
		},
		fadeOut: function () {
			return $(this.oldContainer).animate({
				opacity: 0
			}).promise();
		},
		fadeIn: function () {
			var _this = this;
			var $el = $(this.newContainer);

			$(this.oldContainer).hide();

			$el.css({
				visibility: 'visible',
				opacity: 0
			});

			$el.animate({
				opacity: 1
			}, 400, function () {
				_this.done();
			});
		}
	});

	var mobileTransition = Barba.BaseTransition.extend({
		start: function () {
			Promise
				.all([this.newContainerLoading, this.outro()])
				.then(this.intro.bind(this));
		},
		outro: function () {			
			var barbaDefer = Barba.Utils.deferred(),
				tl = new TimelineMax,
				tl2 = new TimelineMax,
				changeColor = waterColor['homepage'];
			
			if ($(clickedElem).hasClass('barba--homepage')) currentColor = waterColor['homepage'];
			else if ($(clickedElem).hasClass('barba--info')) currentColor = waterColor['info'];
			
			$('.wave').css({
				paddingTop: '110vh',
				opacity: 1
			});
			
			$('.water').css({ 
				fill: currentColor
			});
			
			$('.wave-container').css('z-index', 10);

			tl.fromTo(".nav--right", 0.3, {
				opacity: 1,
				left: 0
			}, {
				opacity: 0,
				left: -20
			}).to(".nav--right", 0, {
				css: {
					display: 'none'
				}
			});

			tl2.to(".container--zoomout", 0.3, {
				css: {
					transform: 'scale(1)',
					opacity: 1,
					left: '0vw'
				}
			}, 0.1).to(".wave", 1.5, {
				css: {
					paddingTop: '0vh'
				}
			});
			
			$('html, body').toggleClass('mobile-nav-open');

			return tl2.eventCallback("onComplete", function () {
				barbaDefer.resolve();
			}), barbaDefer.promise;
		},
		intro: function () {
			var _this = this,
				$el = $(this.newContainer),
				tl = new TimelineMax;

			$(this.oldContainer).hide();

			$el.css({
				visibility: 'visible',
				opacity: 0
			});
			
			$('.bubble-canvas').css('background', currentColor);
			$('.wave-container').css('z-index', 0);

			$('.wave').animate({
				opacity: 0
			}, 500);
			
			$el.animate({
				opacity: 1
			}, 500, function () {
				barbaHomepageScript($el);
				_this.done();
			});
		}
	});

	Barba.Pjax.getTransition = function () {
		var trans = !desktopVer ? mobileTransition : desktopTransition;
//		if ($(clickedElem).hasClass('barba--homepage')) trans = GsapTransitionHome;
		return trans;
	};
	
	Barba.Pjax.init();
	
	var currentPage = Barba.HistoryManager.currentStatus().namespace;
	
	if (currentPage === 'homepage') HomepageIntro.init();
	if (currentPage === 'info') InfoIntro.init();
	
	Barba.Pjax.start();
	
	/* Prevent BarbaJS refresh when same page redirection */
	var links = $('a.js--preventrefresh');
		var cbk = function(e) {
		 if(e.currentTarget.href === window.location.href) {
		   e.preventDefault();
		   e.stopPropagation();
		 }
	};

	for (var i = 0; i < links.length; i++) {
		links[i].addEventListener('click', cbk);
	}
	
	/* General */
	$('body').on('click', '.nav__toggle', function() {
		$('html, body').toggleClass('mobile-nav-open');
		if ($('html, body').hasClass('mobile-nav-open')) mobileNavOpen();
		else mobileNavClose();
	});
	
	$('body').on('click', '.container--zoomout', function() {
		if ($('.mobile-nav-open').length > 0 && !desktopVer) mobileNavClose();
	});
});

function barbaAllIntro(color) {
	$('.bubble-canvas').css('background', color);
	$('.water').wavify({
		height: -49,
		amplitude: 50,
		speed: .25,
		bones: 3,
		color: color
	});

	var tl = new TimelineMax,
		tl2 = new TimelineMax,
		tl3 = new TimelineMax;

	tl.to(".start-hide", 0.5, {
		opacity: 1
	}).fromTo(".wave", 1.5, {
		css: {
			paddingTop: '110vh'
		}
	}, {
		css: {
			paddingTop: '0vh'
		}
	}).from("#barba-wrapper", 0.5, {
		opacity: 0
	}).to(".wave", 0, {
		css: {
			opacity: 0,
			paddingTop: '110vh'
		}
	}).from(".navbar", 0.5, {
		opacity: 0
	});

	tl2.from(".intro__container--initials", 1.25, {
		ease: Power4.easeOut,
		css: {
			right: '-100%',
			opacity: 0
		}
	}, 2.5);

	tl3.from(".intro__container--info", 1, {
		bottom: -40,
		opacity: 0
	}, 3);
}

function barbaHomepageScript(newPage) {
	var currentPage = newPage ? newPage : $('.barba-container');
	
	if (!$('.bubble-container').hasClass('initiated')) {
		/* Bubble Canvas */
		var Canvas = $('.bubble-canvas')[0];
		var ctx = Canvas.getContext('2d');

		var resize = function () {
			Canvas.width = Canvas.clientWidth;
			Canvas.height = Canvas.clientHeight;
		};

		window.addEventListener('resize', resize);
		resize();

		var elements = [];
		var presets = {};

		presets.r = function (x, y, s, dx, dy) {
			return {
				x: x,
				y: y,
				r: 12 * s,
				w: 5 * s,
				dx: dx,
				dy: dy,
				draw: function (ctx, t) {
					this.x += this.dx;
					this.y += this.dy;

					ctx.beginPath();
					ctx.arc(this.x + +Math.sin((50 + x + (t / 10)) / 100) * 3, this.y + +Math.sin((45 + x + (t / 10)) / 100) * 4, this.r, 0, 2 * Math.PI, false);
					ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
					ctx.fill();
				}
			}
		};

		for (var x = 0; x < Canvas.width; x++) {
			for (var y = 0; y < Canvas.height; y++) {
				if (Math.round(Math.random() * 8000) == 1) {
					var s = ((Math.random() * 5) + 1) / 10;
					elements.push(presets.r(x, y, s, 0, 0));
				}
			}
		}

		setInterval(function () {
			ctx.clearRect(0, 0, Canvas.width, Canvas.height);

			var time = new Date().getTime();
			for (var e in elements)
				elements[e].draw(ctx, time);
		}, 10);
		
		$('.bubble-container').addClass('initiated');
	}

	/* Parallax */
	if (parallaxInstance1) parallaxInstance1.destroy();
	if (parallaxInstance2) parallaxInstance2.destroy();
	parallaxScene1 = $(currentPage).find('.js-parallax--initial')[0];
	parallaxInstance1 = new Parallax(parallaxScene1);
	parallaxScene2 = $(currentPage).find('.js-parallax--info')[0];
	parallaxInstance2 = new Parallax(parallaxScene2);
}

function mobileNavOpen() {
	var tl = new TimelineMax;

	tl.to(".container--zoomout", 0.3, {
		css: {
			transform: 'scale(0.85)',
			opacity: 0.3,
			left: '50vw'
		}
	}).to(".nav--right", 0, {
		css: {
			display: 'block'
		}
	}).to(".nav--right", 0.3, {
		opacity: 1,
		left: 0
	}, 0.2);
}

function mobileNavClose() {
	var tl2 = new TimelineMax,
		tl3 = new TimelineMax;

	tl2.fromTo(".nav--right", 0.3, {
		opacity: 1,
		left: 0
	}, {
		opacity: 0,
		left: -20
	}).to(".nav--right", 0, {
		css: {
			display: 'none'
		}
	});

	tl3.to(".container--zoomout", 0.3, {
		css: {
			transform: 'scale(1)',
			opacity: 1,
			left: '0vw'
		}
	}, 0.1);
}