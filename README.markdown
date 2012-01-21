Nite-Brite
==========

Nite-Brite is a picture that everyone is drawing at the same time.

+ Choose a color
+ Click to add a pixel
+ *Or* sit back and watch what everyone else is drawing

[Here's an example](http://exuberated.com/nite-brite)

Nerd Words
----------

Nite-Brite is a couchapp that enables collaboration on a single pixel-drawing in real-time. 
Each pixel is a couchdb document with an _id in this scheme:

x,y,r,g,b,timestamp in milliseconds,latitude,longitude

*Ex:* `230,311,18,52,86,1325962878384,37.8087081,-122.2467254`

All of the parameters up to the timestamp are required, the location info is optional.  The timestamp is useful because it creates a history for the drawing and encourages collaborators because their additions will not simply be overwritten.  Location is in there because it allows us to subdivide the drawing further.