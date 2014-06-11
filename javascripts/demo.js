
var demo = (function () {

	var colors = [
		'#7CE8F9',
		'#E6DB74',
		'#F92672',
		'#70C72E'
	];

	this.timer1 = new koTimer(300, {
		wait: true
	});

	this.timer2 = new koTimer(300, {
		wait: true
	});

	this.timer3 = new koTimer(600, {
		wait: true
	});

	this.timer4 = new koTimer(600, {
		wait: true
	});

})();

$(document).ready(function () {

	//init ko
	ko.applyBindings(demo, $('.demos')[0]);

	demo.timer1.start();
	demo.timer2.start();
	demo.timer3.start();
	demo.timer4.start();

});