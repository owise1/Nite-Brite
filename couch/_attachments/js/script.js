function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

function PixelHandler(){
	var db             = $.couch.db("pixels");
	this.db            = db;
	var max            = 10000;
	var queue_limit    = 20;
	var colors         = [];
	var stage_selector = '#stage';
	
	function _get_canvas(){
		return $(stage_selector)[0];
	}
	
	// x,y,r,g,b,timestamp,lat,lon
	var _draw_color = function(info){
		if(typeof info == 'string')	info = info.split(',');
		var x = info[0];
		var y = info[1];
		var r = info[2];
		var g = info[3];
		var b = info[4];
		var canvas = _get_canvas();  
		if (canvas.getContext){  
		    var ctx = canvas.getContext('2d');  
			ctx.fillStyle = "rgb("+r+","+g+","+b+")";
		    ctx.fillRect(x,y,1,1);  
		}
	}
	this.draw_color = _draw_color;
	
	var _color_queue = [];
	var _push_color = function(info){
		var time = new Date;
		var infoStr = info.join(',');
		var d = { 
			"_id" : infoStr + ',' + time.getTime() + ',' + lat + ',' + lon,
			type : "pixel",
			info : info
		}
		_color_queue.push(d);
		if(_color_queue.length >= queue_limit){
			db.bulkSave({ "docs" : _color_queue }, {
				error : function(response){

				}
			});
			_color_queue = [];
			if(typeof _gaq != 'undefined'){ // google track event
				try{
					_gaq.push(['_trackEvent', "save", "save", "save", queue_limit]);
				} catch(err) { }
			}
			
		}
		// colors.push(infoStr);
		_draw_color(infoStr)
		// _draw_all();
	}
	this.push_color = _push_color;
	
	function _draw_all(){
		$('#stage_holder').html('').append($("<canvas id='stage'>").attr('width', $(window).width()).attr('height', $(window).height()));

		if(colors.length < 1) return;
		
		var canvas = _get_canvas();
		var ctx = canvas.getContext('2d');  
		ctx.clearRect(0,0,$(stage_selector).attr('width'),$(stage_selector).height());
		
		$.each(colors, function(i,info){
			// if(colors.length > max && i < colors.length - max) return;
			_draw_color(info);
		});
		
		// if(colors.length < max) $('#pixels_left').text(max - colors.length + ' pixels left');
		// else $('#pixels_left').text('Additional pixels will remove existing ones.');
	}
	this.draw_all = _draw_all;
	
	function _animate_10K(){
		var _animate_i = 0;
		function do_dot(){
			_draw_color(colors[_animate_i]);
			_animate_i++;
			if(colors.length > _animate_i) setTimeout(do_dot, 40);
		}
		do_dot();
	}
	
	//****// init //****//
	
	$('#stage_holder').html('').append($("<canvas id='stage'>").attr('width', $(window).width()).attr('height', $(window).height()));
	
	
	// get pixels and draw it
	db.view("couch/pixels", {
		reduce : false,
		success : function(response){
			$.each(response.rows, function(i, row){
				colors.push(row.id);
				// _draw_color(row.id);
			})
			_draw_all();
			// _animate_10K();
		}
	})
	
	// changes
	this.db.changes().onChange(function(data){
		if(data.results){
			$.each(data.results, function(i, obj){
				var infoStr = obj.id.split('-')[0];
				if(colors.indexOf(infoStr) < 0){
					colors.push(infoStr);
					_draw_all();
				} else {
					// console.log('skipped');
				}
			})
		}
	})
	
	// get location
	if (navigator.geolocation) {
		var lat, lon;
		navigator.geolocation.getCurrentPosition(function(position){
			lat = position.coords.latitude;
			lon = position.coords.longitude;
		});
	}

	// resize
	$(window).resize(_draw_all).resize();
	
	// clicks
	$('body').delegate(stage_selector, 'click', function(ev){
		var x     = ev.clientX;
		var y     = ev.clientY;
		var color = $('#color').val();
		var r     = hexToR(color);
		var g     = hexToG(color);
		var b     = hexToB(color);

		_push_color([x,y,r,g,b]);
	});
	
	// drawing
	/*
	$('body').mousedown(function(){
		$(this).addClass('active');
	}).mouseup(function(){
		$(this).removeClass('active');
	});
	$('body').mousemove(function(ev){
		if($(this).hasClass('active')){
			var x     = ev.clientX;
			var y     = ev.clientY;
			var color = $('#color').val();
			var r     = hexToR(color);
			var g     = hexToG(color);
			var b     = hexToB(color);

			_push_color([x,y,r,g,b]);
		}
	})
	*/

	
}
