// Store API endpoint inside queryUrl

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the queryUrl

d3.json(queryUrl, function (data){

    // Once we get a data, send the data.features object to the createFeatures function

    creatFeatures(data);
})

// Determine the size of markers to reflect the earthquake magnitude

function markerSize(magnitude){
    return (magnitude + 1) * 2;
}

// Assign different colors to better represent / showcase the earthquake magnitude

function markerColor(magnitude){
    if (magnitude > 5){
        return "yellow";
    }

    else if (magnitude > 4){
        return "blue";
    }

    else if (magnitude > 3){
        return "green";
    }

    else if (magnitude > 2){
        return "red";
    }

    else if (magnitude > 1){
        return "pink";
    }
}

function creatFeatures(earthquakeData){

    // Define a function to set the maker style

    function dataStyle(feature){
      return{
        opacity: .7,
        fillOpacity: .7,
        fillColor: markerColor(feature.properties.magnitude),
        color: "#000000", 
        radius: markerSize(feature.properties.magnitude),
        stroke: true,
        weight: 0.75
      };
    }

    // Define a function to run once for each feature in the features array
    // Given each feature a popup describing the place and time of the earthquake

    function onEachFeature(feature,layer){
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + Date (feature.properties.time) + "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquake data object
    // Run the onEachFeature function once for each piece of data in the array

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, latlng){
          return L.circleMarker(latlng);
        },
        style: dataStyle
    });

    // Sending the earthquakes layer to the createMap function

    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });
  
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "dark-v10",
      accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [streetmap, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // Set up the legend.
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend');
        var magnitude = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML = "<div style='background-color:white; padding: .5em;'><h4 style='background-color:white; padding:.5em'>Magnitude</h4><ul>";

        for (var i = 0; i < magnitude.length; i++) {
             div.innerHTML += 
             '<li style=\"list-style:none; padding:.5em; background-color:' + markerColor(magnitude[i] + 1) + ';\"> '+ 
                magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+')
                "</li>";
        }
       div.innerHTML += "</ul></div>"; 

        return div;
    };

    // Adding legend to the map.
    legend.addTo(myMap);
  }
  