// Query URL
var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Size of the marker
function markerSize(magnitude){
    return magnitude * 5;
};

// combining multiple layers into a group
var CombinedData = new L.LayerGroup();

d3.json(queryUrl, function(data){
    L.geoJSON(data.features, {
        // convert point feature to map layer 
        pointToLayer: function(feature, coord){
            return L.circleMarker(coord, {
                radius: markerSize(feature.properties.mag)
            });
        },
        style: function(dataFeature){
            return {
                opacity: 0.8,
                fillOpacity: 0.8,
                color: "black",
                fillColor: markerColor(dataFeature.properties.mag),
                stroke: true,
                weight: 0.75
            }
        },

        onEachFeature: function(feature, layer){
            layer.bindPopup('<h3>' + feature.properties.place + '<h3><hr><p>' +
            new Date(feature.properties.time) + '</p>');
        }

    }).addTo(CombinedData);
    dataMap(CombinedData); 
});

var TectonicPlateUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';
var TectonicPlates = new L.LayerGroup();

d3.json(TectonicPlateUrl, function(data){
    L.geoJSON(data.features, {
        style: function (geoJsonFeature){
            return{
                weight: 3,
                color: 'orange'
            }
        },
    }).addTo(TectonicPlates);
})

// Assign different colors to better represent / showcase the earthquake magnitude

function markerColor(magnitude){
    if (magnitude > 5){
        return "OrangeRed";
    }

    else if (magnitude > 4){
        return "Coral";
    }

    else if (magnitude > 3){
        return "Orange";
    }

    else if (magnitude > 2){
        return "Gold";
    }

    else if (magnitude > 1){
        return "GreenYellow";
    }

    else {
        return "PaleGreen"
    }
};

function dataMap(){
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/satellite-v9",
      accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/light-v10",
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
      "Satellite Map": satellite,
      "Light Map": lightmap,
      "Dark Map": darkmap
    };

    var overlayMaps = {
        'Tectonic Plates': TectonicPlates,
        "Earthquakes": CombinedData
    };

    var myMap = L.map('map', {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, CombinedData, lightmap, satellite, TectonicPlates]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Set up the legend.
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend');
        var magnitude = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML = "<div style='background-color:white; padding: .5em;'><h4 style='background-color:white; padding:.5em'> Earthquakes Magnitude Legend</h4><ul>";

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