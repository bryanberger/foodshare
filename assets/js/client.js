$(function(){
	var socket = io();

	// stall video loading as to not break the android app
	// setTimeout(function(){
		// setInterval(function(){
		// 	$('#item-0 #video').attr("src", "http://10.1.24.42:8080/shot.jpg?" + Math.random());
		// }, 30);
		// $('#video').attr("src", "http://10.1.25.61:4747/mjpegfeed");
	// }, 3000);
	setInterval(function(){
		$('#item-0 #video').attr("src", "http://10.1.24.42:8080/shot.jpg?rnd="+Math.floor(Math.random()*1000000));
	}, 200);

	/* Click Handlers */
	$('.interested').click(function() {
		socket.emit('interested', true);
		var id = $(this).data('id');
		window.location = '/notify/'+id;
	});

	$('.share').click(function() {
		socket.emit('share', {id:0, enable:true});
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

		if (document.getElementById('foodPercentage')) {
			foodPercentageGauge.refresh(value.data.val);
		}

		$('#item-' + value.data.id +' .weight .progress-bar').css('width', value.data.val+'%').attr('aria-valuenow', value.data.val); 
	});

	// 0 - 100%
	//	socket.emit('freshnessChange', 33);
	socket.on('freshnessChange', function(value) {
		console.log('freshnessChange', value.data.val);
		
		var output, cls;
		var val = value.data.val; 

		if(val >= 0 && val < 25) {
			output = 'Not so fresh.';
			cls = 'bad';
		} else if(val > 25 && val < 50) {
			output = 'Pretty fresh.';
			cls = 'okay';
		} else if(val > 50 && val < 75) {
			output = 'Very fresh.';
			cls = 'verygood';
		} else if(val > 75) {
			output = 'Amazingly fresh!';
			cls = 'best';
		}

		$('.freshness').removeClass('bad okay verygood best').addClass(cls);
		$('.freshness span').text(output);
	});

	// 0 or 1
	socket.on('eggChange', function(obj) {

		var $egg = $('.eggPresent');

		if(obj.data.val === 1) {
			$egg.text('We have '+ obj.data.quantity +' fresh eggs!');
		} else {
			$egg.text('Sorry, we are out of eggs');
		}
	});
});