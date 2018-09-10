var map;
var DATE = 20180909
function ViewModel(){

    var self = this;
    this.markers = []
    this.searchOption = ko.observable("");

  

    // Responsible for filling in Info Windows. Uses "locations" object data and
    // foursquare data. This function also interfaces with the Foursquare API
    function fillInfoWindow(marker, infowindow){
        if(infowindow.marker != marker){
            infowindow.marker = marker;
            
            var url = 'https://api.foursquare.com/v2/venues/search?client_id=' + 
                secrets.foursquare.client_ID + 
                '&client_secret=' + secrets.foursquare.client_secret + 
                '&ll=' + marker.getPosition().toUrlValue() + 
                '&intent=match'+ 
                '&name=' + marker.title+
                '&v=' + DATE;

            $.getJSON(url, function(searchObj){
                var htmlString  = '<div class="title center-text">'+ 
                    marker.title +'</div>'+
                    '<div class="info center-text">' + marker.my_info + '</div>'+
                    '<div class="center-text address">'+ 
                    searchObj.response.venues[0].location.address + 
                    ' ' + searchObj.response.venues[0].location.city + ', ' + 
                    searchObj.response.venues[0].location.state + ' ' + 
                    searchObj.response.venues[0].location.postalCode +'</div>';

                
                infowindow.setContent(htmlString)
                infowindow.open(map,marker);
                infowindow.addListener('closeclick', function(){
                infowindow.marker = null;
                });
            }).fail(function(){
                alert("Sorry, there was an issue retreiving Foursquare data.");
            });
        }
    }


    // Is triggered when link clicked. Animates pin and fills window.
    this.popAndFillInfoWindow = function(){
        fillInfoWindow(this, self.infowindow);
        this.setAnimation(google.maps.Animation.DROP);
        setTimeout((function(){
            this.setAnimation(null);
        }).bind(this), 1400);
    }

    //Responsible for Maps initialization and initial marker spawning
    this.initMap = function(){

        var mapRef = document.getElementById('map');
        map = new google.maps.Map(mapRef, {
          center: locations[0].latlng,
          zoom: 15,
          styles:[
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
        });
        
        var markers = [];
        this.infowindow = new google.maps.InfoWindow();
        var bounds = new google.maps.LatLngBounds();

        // Marker Creation
        for(var i=0; i<locations.length; i++){
            var marker = new google.maps.Marker({
                position: locations[i].latlng,
                map: map,
                title: locations[i].name,
                animation: google.maps.Animation.DROP,
                my_info: locations[i].info
            });

            this.markers.push(marker);
            bounds.extend(marker.position);
            marker.addListener('click', function(){
                marker = this;
                marker.animation = google.maps.Animation.BOUNCE
                setTimeout(function(){ marker.setAnimation(null); }, 750);
                fillInfoWindow(this, self.infowindow);
            });
        }
        map.fitBounds(bounds);
    };

    this.initMap();

    // Locations are observables
    this.locations = ko.observableArray(locations);


    // KO Computed to filter in real time.
    this.myLocationsFilter = ko.computed(function() {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.searchOption()
                    .toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);

}

// Google Maps Error Handling
googleMapsError = function googleMapsError(){
    alert("Sorry, Google Maps did not load.");
}

// Starts app once Google Maps API loads.
function kickStart(){
    ko.applyBindings(new ViewModel());
}