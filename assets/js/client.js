$(function(){
	var socket = io();

	// stall video loading as to not break the android app
	// setTimeout(function(){
	// 	$('#video').attr("src", "http://10.1.25.61:4747/mjpegfeed");
	// }, 3000);

	/* Click Handlers */
	$('.interested').click(function() {
		socket.emit('interested', true);
		var id = $(this).data('id');
		window.location = '/notify/'+id;
	});

	$('.share').click(function() {
		socket.emit('share', true);
		window.location = '/share';
	});

	/* Gauges */
	var foodPercentageGauge = new JustGage({
          id: "foodPercentage", 
          value: 0, 
          min: 0,
          max: 100,
          title: "How much food is left?",
          label: "%",
          levelColors: [
          	'#DEA74D',
          	'#BDD13E',
          	'#8ABA25',
          	'#71D528'
          ]
        });

	/* Socket IO */
	// 0 - 100%
	socket.on('foodWeightChange', function(value) {
		console.log('foodWeightChange', value);

		foodPercentageGauge.refresh(value.data);
		$('.weight .progress-bar').css('width', value.data+'%').attr('aria-valuenow', value.data); 
	});

// TEST PURPOSE
foodPercentageGauge.refresh(78);

	// 0 - 100%
	socket.emit('freshnessChange', 33);
	socket.on('freshnessChange', function(value) {
		console.log('freshnessChange', value);
		
		var output, cls;

		if(value >= 0 && value < 25) {
			output = 'Not so fresh.';
			cls = 'bad';
		} else if(value > 25 && value < 50) {
			output = 'Pretty fresh.';
			cls = 'okay';
		} else if(value > 50 && value < 75) {
			output = 'Very fresh.';
			cls = 'verygood';
		} else if(value > 75) {
			output = 'Amazingly fresh!';
			cls = 'best';
		}

// TEST PURPOSE
output = 'Not so fresh.';
cls = 'bad';
		
		$('.freshness').removeClass('bad okay verygood best').addClass(cls);
		$('.freshness span').text(output);

		//$('.freshness .progress-bar').css('width', value.data+'%').attr('aria-valuenow', value.data); 
	});

	// 0 or 1
	socket.on('eggChange', function(isPresent) {

		var $egg = $('.eggPresent');

		if(isPresent === 1) {
			$egg.text('We have fresh eggs!');
		} else {
			$egg.text('Sorry, we are out of eggs');
		}
	});
});