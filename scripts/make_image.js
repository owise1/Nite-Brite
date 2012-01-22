(function() {
  var Drawer, cradle, d, exec, fs, pixels, sys;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  pixels = [];
  sys = require('sys');
  exec = require('child_process').exec;
  cradle = require('cradle');
  fs = require('fs');
  Drawer = (function() {
    function Drawer() {
      this.upload_attachment = __bind(this.upload_attachment, this);
      this.save_image = __bind(this.save_image, this);
      this.process_batch = __bind(this.process_batch, this);
      this.process_view = __bind(this.process_view, this);      this.drawn = 0;
      this.per_batch = 500;
      this.image_path = '/Users/Olinor/Desktop/test.png';
      this.x_max = 0;
      this.y_max = 0;
      this.pixels = [];
      this.db = new cradle.Connection('http://localhost', 5984, {
        cache: true,
        raw: false
      }).database('pixels');
    }
    Drawer.prototype.go = function() {
      return this.db.view('couch/pixels', {
        reduce: false
      }, this.process_view);
    };
    Drawer.prototype.process_view = function(err, res) {
      var pixel, splitted, _i, _len, _ref;
      this.pixels = res.map(function(row) {
        return row.id;
      });
      _ref = this.pixels;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pixel = _ref[_i];
        splitted = pixel.split(',');
        if (parseInt(splitted[0]) > this.x_max) {
          this.x_max = parseInt(splitted[0]);
        }
        if (parseInt(splitted[1]) > this.y_max) {
          this.y_max = parseInt(splitted[1]);
        }
      }
      return this.process_batch();
    };
    Drawer.prototype.process_batch = function() {
      var draw_point_str, pixel, sliced, splitted, str, _i, _len;
      draw_point_str = '';
      sliced = this.pixels.slice(this.drawn * this.per_batch, this.drawn * this.per_batch + this.per_batch);
      for (_i = 0, _len = sliced.length; _i < _len; _i++) {
        pixel = sliced[_i];
        splitted = pixel.split(',');
        draw_point_str += " -fill 'rgb(" + splitted[2] + "," + splitted[3] + "," + splitted[4] + ")' -draw 'point " + splitted[0] + "," + splitted[1] + "'";
      }
      if (this.drawn < 1) {
        str = "convert -size " + this.x_max + "x" + this.y_max + " xc:black" + draw_point_str + " " + this.image_path;
      } else {
        str = "convert " + this.image_path + " -size " + this.x_max + "x" + this.y_max + " " + draw_point_str + " " + this.image_path;
      }
      if (sliced.length > 0) {
        return exec(str, __bind(function() {
          console.log("batch " + this.drawn);
          this.drawn++;
          return this.process_batch();
        }, this));
      } else {
        return this.save_image();
      }
    };
    Drawer.prototype.save_image = function() {
      var d;
      d = new Date;
      return this.db.save({
        timestamp: d.getTime(),
        last_pixel_timestamp: this.pixels[this.pixels.length - 1].split(',')[5],
        type: 'snapshot'
      }, this.upload_attachment);
    };
    Drawer.prototype.upload_attachment = function(err, res) {
      console.log(this.image_path);
      return this.db.saveAttachment(res.id, res.rev, 'snapshot.png', 'image/png', fs.createReadStream(this.image_path), function(err, data) {
        return console.log(data);
      });
    };
    return Drawer;
  })();
  d = new Drawer;
  d.go();
}).call(this);
