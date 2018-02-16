require('./bootstrap');

$(function () {
	var lastElementClicked;
	Barba.Pjax.start();

	Barba.Dispatcher.on('linkClicked', function (e) {
		lastElementClicked = e;
	});

	var gsaptest = Barba.BaseTransition.extend({
		start: function () {
			Promise.all([this.newContainerLoading, this.in()]).then(this.out.bind(this))
		},
		in: function () {
			var t = Barba.Utils.deferred(),
				i = new TimelineMax;
			
			i.to("body", 5, {
				backgroundColor: '#000000'
			});
			
			return i.eventCallback("onComplete", function () {
				t.resolve();
			}), t.promise;
		},
		out: function () {
			var _this = this,
				i = ($(this.newContainer), new TimelineMax);
			
			i.to("body", 5, {
				backgroundColor: 'red'
			});
			
			i.eventCallback("onComplete", function () {
				_this.done();
			});
		}
	});

	var FadeTransition = Barba.BaseTransition.extend({
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

	Barba.Pjax.getTransition = function () {
		transition = FadeTransition;
		if ($(lastElementClicked).hasClass('home')) transition = gsaptest;
		return transition;
	};
});
