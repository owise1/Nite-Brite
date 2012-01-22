pixels = []

sys = require 'sys'
exec = require('child_process').exec
cradle = require 'cradle'
fs = require 'fs'

class Drawer
	constructor: ->
		@drawn = 0
		@per_batch = 500
		@image_path = '/Users/Olinor/Desktop/test.png'
		@x_max = 0
		@y_max = 0
		@pixels = []
		@db = 	
			new cradle.Connection 'http://localhost', 5984
				cache : true
				raw : false
			.database('pixels')

	go: ->
		@db.view 'couch/pixels', 
			reduce : false
			this.process_view
		
					
	process_view: (err, res) =>
		@pixels = res.map (row) -> row.id
		for pixel in @pixels
			splitted = pixel.split ','
			@x_max = parseInt splitted[0] if parseInt(splitted[0]) > @x_max
			@y_max = parseInt splitted[1] if parseInt(splitted[1]) > @y_max
		this.process_batch()
		
	process_batch: =>
		draw_point_str = ''
		sliced = @pixels.slice @drawn*@per_batch, @drawn*@per_batch+@per_batch
		for pixel in sliced
			splitted = pixel.split ','
			draw_point_str += " -fill 'rgb(#{splitted[2]},#{splitted[3]},#{splitted[4]})' -draw 'point #{splitted[0]},#{splitted[1]}'"
		if(@drawn < 1)
			str = "convert -size #{@x_max}x#{@y_max} xc:black#{draw_point_str} #{@image_path}" 
		else
			str = "convert #{@image_path} -size #{@x_max}x#{@y_max} #{draw_point_str} #{@image_path}" 
		if sliced.length > 0
			exec str, =>
				console.log("batch #{@drawn}");
				@drawn++
				this.process_batch()
		else
			this.save_image()

	save_image: =>
		d = new Date
		@db.save
			timestamp: d.getTime(),
			last_pixel_timestamp : @pixels[(@pixels.length - 1)].split(',')[5],
			type: 'snapshot',
			this.upload_attachment
	
	upload_attachment: (err, res) =>
		console.log(@image_path);
		@db.saveAttachment( 
		    res.id, 
		    res.rev, 
		    'snapshot.png',
		    'image/png', 
		    fs.createReadStream(@image_path),
		    ( err, data ) ->
		        console.log(data);
		)
	
		
		
		
d = new Drawer		
d.go()
