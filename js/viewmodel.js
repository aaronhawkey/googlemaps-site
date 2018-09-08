var map;

function ViewModel(){


    function fillInfoWindow(marker, infowindow){
        if(infowindow.marker != marker){
            infowindow.marker = marker;
            infowindow.setContent('<div>'+ marker.title +'</div>');
            infowindow.open(map,marker);
            infowindow.addListener('closeclick', function(){
                infowindow.marker = null;
            });
        }
    }


    
    this.initMap = function(){

        var mapRef = document.getElementById('map');
        map = new google.maps.Map(mapRef, {
          center: locations[0].latlng,
          zoom: 15
        });
        
        var markers = [];
        var infowindow = new google.maps.InfoWindow();
        var bounds = new google.maps.LatLngBounds();

        for(var i=0; i<locations.length; i++){
            var marker = new google.maps.Marker({
                position: locations[i].latlng,
                map: map,
                title: locations[i].name
            });

            markers.push(marker);
            bounds.extend(marker.position);
            marker.addListener('click', function(){
                fillInfoWindow(this, infowindow);
            });
        }
        map.fitBounds(bounds);
    };

    this.initMap();


}
function kickStart(){
    ko.applyBindings(new ViewModel());
}