var markerArray = new Array();
var pathArray = new Array();
//var LMOArray = new Array();

function initialize() {

  var mapOptions = {
    center : new google.maps.LatLng(41.870232, -87.618806),
    zoom : 5,
    mapTypeId : google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
  

  var markerPath = new google.maps.Polyline({
    path : pathArray,
    strokeColor : "DF08DB",
    strokeOpacity : 1.0,
    strokeWeight : 2
  });

  $(function() {

    Parse.$ = jQuery;

    //$( "#datepicker" ).datepicker();

    // Initialize Parse with your Parse application javascript keys
    // Kino
    //Parse.initialize("sAhwQbIiILNb0BdLKr9p16ptzNapynYNUQXLuZPO", "bCf0MMwyewSCVoeCeE8mfomjTRzufS8PcBrK4hb3");
    // David
    //Parse.initialize("Fwh3pvfYzFQQM6KOsfHw6Kt1SYrZANQGgMUCYRkC", "QdSBLAilpniAxX9eamtQEO4QCQdny9nc7vOGMWYS");
    // Garrett
    Parse.initialize("x7xIgeplRvJ8w9nSaQAvPlwQMpFpfsT5ZQVMvLU9", "3v04khPQKQAGImBUvxxGjffQbHRmXW4AvonPy0vE");
    // Murali
    //Parse.initialize("v957ARKbPgtDXE1qFKku0arBI7apHBrDiXz76606", "NMkN6Pzl3kjQswsqFm2eUICllynqYw81xdps5CgI");

    /*
     {
     user : pointer
     locations : [
     {
     location : geopoint
     date : date
     data : text
     }
     ]
     }
     */

    var collection;

    var LocationMetadataObject = Parse.Object.extend("LocationMetadataObject", {
      defaults : {
        location : new Parse.GeoPoint({
          latitude : 0.0,
          longitude : 0.0
        }),
        data : "default",
      }
    });

    var UserMetadataObject = Parse.Object.extend("UserMetadataObject");

    // The Application
    // ---------------

    var InputView = Parse.View.extend({
      events : {
        "submit form.input-form" : "input",
        "click .log-out" : "logOut",
      },

      el : ".content",

      initialize : function() {
        _.bindAll(this, "input");
        this.render();
      },

      input : function(e) {
        ClearOverlay();
        pathArray.length = null;
        markerArray.length = null;
        
        markerPath.setMap(map);
        //alert('input');
        //alert('you called input');
        var self = this;
        var latitude = this.$("#input-latitude").val();
        var longitude = this.$("#input-longitude").val();
        var data = this.$("#input-data").val();

        var date = this.$("#input-date").val();
        var time = this.$("#input-time").val();
        //alert(date);
        //alert(time);

        var datetime = date + ' ' + time;

        if (datetime == ' ') {
          datetime = new Date(Date.parse('now'));
        } else {
          datetime = new Date(Date.parse(datetime));
        }

        var user = Parse.User.current();
        var GeoPointObject = new Parse.GeoPoint({
          latitude : parseFloat(latitude),
          longitude : parseFloat(longitude)
        });

        var locationMetadataObject = new LocationMetadataObject();

        locationMetadataObject.set("location", GeoPointObject);
        locationMetadataObject.set("data", data);
        locationMetadataObject.set("datetime", datetime);
        locationMetadataObject.set("user", user);

        var query = new Parse.Query(UserMetadataObject);

        query.equalTo("user", user);
        query.first({
          success : function(results) {
            //alert("Successfully retrieved " + results.id + " scores."); // yablLUMTz6
            //alert("Successfully retrieved " + results.get("user").id + " scores."); // DpBqNvTwlh
            //alert("Successfully retrieved " + results.get("locations") + " scores."); // [Object]
            //alert(JSON.stringify(results));
            //alert("Successfully retrieved " + results.get("locations")[0] + " scores."); // [Object]
            //alert("Retrieved " + results.get("locations").length + " records."); //
            //alert("Successfully retrieved " + results.get("locations")[0].id + " scores."); //lw7eLkjN37

            results.get("locations").push(locationMetadataObject);
            results.save();
            var markerPoint = new google.maps.LatLng(latitude, longitude);

            //pathArray.push(markerPoint);
            //markerPath.setPath(pathArray);

            //alert("1");
           /* var marker = new google.maps.Marker({
              position : markerPoint,
              map : map,
            });
            markerArray.push(marker);  
            //alert("2");
            var infoWindowOptions = {
              content : data
            };
            //alert("3");
            var infoWindow = new google.maps.InfoWindow(infoWindowOptions);
            google.maps.event.addListener(marker, 'click', function(e) {
              infoWindow.open(map, marker);
            });  */
            //alert("4");
            collection.fetch({
              success : function(collection) {
                collection.each(function(object) {
                  data = object.get("data");
                  latitude = object.get("location")["latitude"];
                  longitude = object.get("location")["longitude"];
                  datetime = object.get("datetime");
                  objectId = object.id;
                  var markerPoint = new google.maps.LatLng(latitude, longitude);
                  pathArray.push(markerPoint);
                  markerPath.setPath(pathArray);

                  var marker = new google.maps.Marker({
                    position : markerPoint,
                    map : map,
                  });
                  marker.objectId = objectId;
                  var infoWindowOptions = {
                    content : data
                  };
                  //alert("3");
                  var infoWindow = new google.maps.InfoWindow(infoWindowOptions);
                  google.maps.event.addListener(marker, 'click', function(e) {
                    infoWindow.open(map, marker);
                  });
                  markerArray.push(marker);
                  map.center = markerArray[markerArray.length - 1].position;
                });

              },
              error : function(collection, error) {
                // Collection could not be retrieved.
              }
            });
          },
          error : function(error) {
            alert("Error: " + error.code + " " + error.message);
          }
        });

        //alert("End Input Function");
        return false;
      },

      // Logs out the user and shows the login view
      logOut : function(e) {
        Parse.User.logOut();
        new LogInView();
        this.undelegateEvents();
        //alert('logOut');
        delete this;

        // Clear Map on logout, and reset path and marker arrays
        ClearOverlay();
        markerArray.length = 0;
        pathArray.length = 0;
      },

      render : function() {
        this.$el.html(_.template($("#input-template").html()));
        this.$("#input-date").datepicker();
        this.delegateEvents();
      }
    });

    var LogInView = Parse.View.extend({// This is Initial view, with LogIn and SignUp functions
      events : {
        "submit form.login-form" : "logIn",
        "submit form.signup-form" : "signUp"
      },

      el : ".content",

      initialize : function() {
        _.bindAll(this, "logIn", "signUp");
        this.render();
      },

      logIn : function(e) {
        markerPath.setMap(map);
        // Reset the path object to display on the map on every LogIn event
        //alert('login');
        var self = this;
        var username = this.$("#login-username").val();
        var password = this.$("#login-password").val();

        Parse.User.logIn(username, password, {
          success : function(user) {

            // Store marker objects in a Parse.com Collection
            var LMOCollection = Parse.Collection.extend({
              model : LocationMetadataObject,
              query : (new Parse.Query(LocationMetadataObject)).equalTo("user", user)
            });

            collection = new LMOCollection();
            collection.comparator = function(object) {// Sort collection by datetime
              return object.get("datetime");
            }
            collection.fetch({
              success : function(collection) {
                collection.each(function(object) {
                  data = object.get("data");
                  latitude = object.get("location")["latitude"];
                  longitude = object.get("location")["longitude"];
                  datetime = object.get("datetime");
                  objectId = object.id;
                  var markerPoint = new google.maps.LatLng(latitude, longitude);
                  pathArray.push(markerPoint);
                  markerPath.setPath(pathArray);

                  var marker = new google.maps.Marker({
                    position : markerPoint,
                    map : map,
                  });
                  marker.objectId = objectId;
                  var infoWindowOptions = {
                    content : data
                  };
                  //alert("3");
                  var infoWindow = new google.maps.InfoWindow(infoWindowOptions);
                  google.maps.event.addListener(marker, 'click', function(e) {
                    infoWindow.open(map, marker);
                  });
                  markerArray.push(marker);
                  map.center = markerArray[markerArray.length - 1].position;
                });

              },
              error : function(collection, error) {
                // Collection could not be retrieved.
              }
            });

            /* Dated version of recalling points

             var query = new Parse.Query(UserMetadataObject);
             query.equalTo("user", user);
             query.first({
             success : function(results) {

             locationsLen = results.get("locations").length;
             alert('locations length:' + String(locationsLen));

             // iterate through existing markers to display on map
             for (var x = 0; x < locationsLen; x++) {
             var query1 = new Parse.Query(LocationMetadataObject);
             query1.equalTo("objectId", results.get("locations")[x].id);
             query1.first({
             success : function(results1) {
             data = results1.get("data");
             latitude = results1.get('location')['latitude'];
             longitude = results1.get('location')['longitude'];
             datetime = results1.get('datetime');
             var markerPoint = new google.maps.LatLng(latitude, longitude);
             pathArray.push(markerPoint);
             markerPath.setPath(pathArray);

             /*
             var marker = new google.maps.Marker({
             position : new google.maps.LatLng(latitude, longitude),
             map : map,
             });
             markerArray.push(marker);

             var infoWindowOptions = {
             content : data
             };

             var infoWindow = new google.maps.InfoWindow(infoWindowOptions);
             google.maps.event.addListener(marker, 'click', function(e) {
             infoWindow.open(map, marker);
             });

             // Need to pull LocationMetadataObjects into array before drawing path to avoid asynchronous loading
             var LMO = new Object();
             alert('object created');
             LMO.data = data;
             LMO.position = new google.map.LatLng(latitude, longitude);
             LMO.datetime = datetime;
             alert('object fields initialized');
             alert(JSON.stringify(LMO));
             LMOArray.push(LMO);

             }
             })
             }

             },
             error : function(error) {
             alert("Error: " + error.code + " " + error.message);
             }
             });*/

            new InputView();
            self.undelegateEvents();
            delete self;
          },

          error : function(user, error) {
            self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
            this.$(".login-form button").removeAttr("disabled");
          }
        });

        this.$(".login-form button").attr("disabled", "disabled");
        return false;
      },

      signUp : function(e) {
        
        
        var self = this;
        var username = this.$("#signup-username").val();
        var password = this.$("#signup-password").val();

        Parse.User.signUp(username, password, {
          ACL : new Parse.ACL()
        }, {
          success : function(user) {

            var user = Parse.User.current();
            //var LocationMetadataObject = Parse.Object.extend("LocationMetadataObject");
            //var locationMetadataObject = new LocationMetadataObject();
            var UserMetadataObject = Parse.Object.extend("UserMetadataObject");
            var userMetadataObject = new UserMetadataObject();
            //var locationMetadataObjectArray = [locationMetadataObject];
            userMetadataObject.set("locations", []);
            userMetadataObject.set("user", user);
            // Saves all sub-objects as well
            userMetadataObject.save();

            new InputView();
            self.undelegateEvents();
            delete self;
          },

          error : function(user, error) {
            self.$(".signup-form .error").html(error.message).show();
            this.$(".signup-form button").removeAttr("disabled");
          }
        });

        this.$(".signup-form button").attr("disabled", "disabled");

        return false;
      },

      render : function() {
        this.$el.html(_.template($("#login-template").html()));
        this.delegateEvents();
      }
    });

    // The main view for the app
    var AppView = Parse.View.extend({
      // Instead of generating a new element, bind to the existing skeleton of
      // the App already present in the HTML.
      el : $("#purpleapp"),

      initialize : function() {
        this.render();
      },
      render : function() {
        if (Parse.User.current()) {
          new InputView();
        } else {
          new LogInView();
        }
      }
    });

    var App = new AppView;

  });

  function ClearOverlay() {// Iterates through markerArray and clears markers off map. Also removes path.
    //alert('ClearOverLay');
    for ( i = 0; i < markerArray.length; i++) {
      markerArray[i].setMap(null);
    }
    markerPath.setMap(null);
  }

}
