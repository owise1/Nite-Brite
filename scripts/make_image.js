(function() {
  var Drawer, cradle, db, exec, pixels, sys;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  pixels = [];
  sys = require('sys');
  exec = require('child_process').exec;
  Drawer = (function() {
    function Drawer(pixels) {
      var pixel, splitted, _i, _len, _ref;
      this.pixels = pixels;
      this.process_batch = __bind(this.process_batch, this);
      this.drawn = 0;
      this.per_batch = 500;
      this.image_path = '/Users/Olinor/Desktop/test.png';
      this.x_max = 0;
      this.y_max = 0;
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
    }
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
      console.log(sliced.length);
      if (sliced.length > 0) {
        return exec(str, __bind(function() {
          this.drawn++;
          return this.process_batch();
        }, this));
      }
    };
    return Drawer;
  })();
  cradle = require('cradle');
  db = new cradle.Connection('http://localhost', 5984, {
    cache: true,
    raw: false
  }).database('pixels');
  db.view('couch/pixels', {
    reduce: false,
    descending: true
  }, function(err, res) {
    var d;
    d = new Drawer(res.map(function(row) {
      return row.id;
    }));
    return d.process_batch();
  });
}).call(this);
