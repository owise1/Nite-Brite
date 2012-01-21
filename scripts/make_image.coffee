pixels = []

sys = require('sys')
exec = require('child_process').exec

class Drawer
	constructor: (@pixels) ->
		@drawn = 0
		@per_batch = 500
		@image_path = '/Users/Olinor/Desktop/test.png'
		@x_max = 0
		@y_max = 0
		for pixel in @pixels
			splitted = pixel.split ','
			@x_max = parseInt splitted[0] if parseInt(splitted[0]) > @x_max
			@y_max = parseInt splitted[1] if parseInt(splitted[1]) > @y_max
			
	process_batch: =>
		draw_point_str = ''
		sliced = @pixels.slice(@drawn*@per_batch,@drawn*@per_batch+@per_batch)
		for pixel in sliced
			splitted = pixel.split ','
			draw_point_str += " -fill 'rgb(#{splitted[2]},#{splitted[3]},#{splitted[4]})' -draw 'point #{splitted[0]},#{splitted[1]}'"
		if(@drawn < 1)
			str = "convert -size #{@x_max}x#{@y_max} xc:black#{draw_point_str} #{@image_path}" 
		else
			str = "convert #{@image_path} -size #{@x_max}x#{@y_max} #{draw_point_str} #{@image_path}" 
		console.log sliced.length;
		if sliced.length > 0
			exec str, =>
				@drawn++
				this.process_batch()
		
		

cradle = require 'cradle'
db = 	
	new cradle.Connection 'http://localhost', 5984
		cache : true
		raw : false
	.database 'pixels'
	
db.view 'couch/pixels', 
	reduce : false
	descending : true,
	(err, res) ->
		d = new Drawer res.map (row) ->
			row.id
		d.process_batch()
			
		
			
