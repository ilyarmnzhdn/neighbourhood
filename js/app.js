var map;
var infoWindow;
// Foursqaure API
var clientID = "MIT352PEQ0JP4YFI25WE3P3NKKOZI0DTTPRGZSIB1Z05XII4";
var clientSecret = "CZQWIENUBIAGNGVE1KJ0HVMLEYS43YKP25OPT5S1PUKOXUYF";
// Declare global infoWindow


function initMap() {
// Constructor creates a new map - only center and zoom are required.
    var almaty = {lat: 43.2428, lng: 76.9548};
    map = new google.maps.Map(document.getElementById('map'), {
        center: almaty,
        zoom: 14,
        styles: styles,
        mapTypeControl: false
    });

    infoWindow = new google.maps.InfoWindow();

    ko.applyBindings(new MapViewModel());
}

/*If error occuries when loading map*/
function mapError() {
    alert('Loading Google Maps API : Failed!');
}


function MapViewModel() {
    var self = this;

    self.currentFilter = ko.observable(''); // property to store the filter
    self.locationsArray = ko.observableArray([]);
    //Store all locations in knockout array
    locations.forEach(function(location) {
        self.locationsArray.push(new Location(location));
    });

    self.searchResults = ko.computed(function() {
        var filter = self.currentFilter().toLowerCase();

        if (filter) {
            return ko.utils.arrayFilter(self.locationsArray(), function(location) {
                var string = location.title.toLowerCase();
                var result = string.includes(filter);
                location.marker.setVisible(result);
                return result;
            });
        }
        // 2. run the filter and only add to the array if a match
            self.locationsArray().forEach(function(location) {
                location.marker.setVisible(true);
            });
            return self.locationsArray();
    }, self);

    self.showClickedLocation = function(location) {
        populateInfoWindow(location.marker, infoWindow);
    };
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infoWindow) {
    var self = this;
// Check to make sure the infowindow is not already opened on this marker.
    if (infoWindow.marker != marker) {
        infoWindow.setContent('');
        infoWindow.marker = marker;
        var lat = marker.lat;
        var lng = marker.lng;
        //URL to search by location in Foursqare API
        var foursqareURL = 'https://api.foursquare.com/v2/venues/search?ll=' +
            lat + ',' + lng + '&client_id=' + clientID +
            '&client_secret=' + clientSecret + '&query=' + marker.title +
            '&v=20170708' + '&m=foursquare';
        $.getJSON(foursqareURL).done(function(marker) {
            var result = marker.response.venues[0];
                self.title = result.name;
                self.street = result.location.address;
                self.city = result.location.formattedAddress[1];
                self.checkinsCount = result.stats.checkinsCount;
                self.country = result.location.country;
                self.category = result.categories[0].shortName;
                self.content = '<h5>' + self.title + '</h5>' +
                    '<h6>(' + self.category +
                    ')</h6>' + '<div>' +
                    '<h7> Address: </h7>' +
                    '<p>' + self.street + '</p>' +
                    '<p>' + self.city + '</p>' +
                    '<p>' + self.country + '</p>' +
                    '<p>' + self.checkinsCount + ' checkins.' + '</p>' +
                    '</div>' + '</div>';
            infoWindow.setContent(self.content);
        }).fail(function() {
                alert("There was an issue loading the Foursquare API. Please refresh your page to try again.");
        });

        map.panTo({lat: lat, lng: lng});
        // Bounce animation to clicked marker
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 750);

        infoWindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
        infoWindow.addListener('closeclick', function() {
                infoWindow.marker = null;
        });
    }
}


var Location = function(data) {
    var self = this;

    this.title = data.title;
    this.latitude = data.location.lat;
    this.longitude = data.location.lng;

// The following group uses the location to create a marker on initialize.
    this.marker = new google.maps.Marker({
        map: map,
        title: this.title,
        position: {lat: this.latitude, lng: this.longitude},
        lat: this.latitude,
        lng: this.longitude,
        animation: google.maps.Animation.DROP
    });
    //Listener for marker
    this.marker.addListener('click', function() {
            // Bounce animation to clicked marker
            self.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                self.marker.setAnimation(null);
            }, 700);
            populateInfoWindow(self.marker, infoWindow);
    });
};
