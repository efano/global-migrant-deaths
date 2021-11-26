        mapboxgl.accessToken =
          "pk.eyJ1IjoibGlzZmFuby1tYXBib3giLCJhIjoiY2pvN3IyeGJ2MDFjZzNxcDB3YnJuN3hlbCJ9.r8HK2MZh-AiDtupL5c5s9Q";
        var map = new mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/lisfano-mapbox/ck3dtcooa263c1cnztrl0xy36",
          center: [0, 26],
          zoom: 0
        });

        map.addControl(new mapboxgl.NavigationControl(), "top-left");

        // when the map is done loading
        map.on("load", function () {
          // request GEOJSON data
          d3.json("data/migrant-deaths.json").then(geojson => {
            // when loaded
            console.log(geojson);
            addLayer(geojson);

            function addLayer(geojson) {
              // add the GeoJSON data as a mapbox gl layer
              map.addLayer({
                id: "deaths",
                type: "circle",
                source: {
                  type: "geojson",
                  data: geojson
                },
                paint: {
                  "circle-radius": [
                    "interpolate",
                    ["linear"],
                    ["number", ["get", "DM-T"]],
                    0, 1.5,
                    5, 4,
                    100, 8,
                    1022, 18
                  ],

                  "circle-color": [
                    "interpolate",
                    ["linear"],
                    ["number", ["get", "DM-T"]],
                    0, "#2dc4b2",
                    1, "#33deca",
                    5, "#43ccde",
                    10, "#52cffe",
                    20, "#69bff8",
                    25, "#80b2f3",
                    50, "#96a4e8",
                    75, "#a995d8",
                    100, "#bf86c4",
                    250, "#ce79a9",
                    500, "#d46f8a",
                    1000, "#d16b6b"
                  ],
                  "circle-opacity": 0.8,
                  "circle-stroke-color": "#555",
                  "circle-stroke-width": 0.2,
                },
              });

              // radio button interactivity
              document.getElementById('filters').addEventListener('change', function (e) {
                var year = parseInt(e.target.value);

                // update the map filter
                if (document.getElementById('all').checked) {
                  map.setFilter('deaths', null)
                } else {
                  map.setFilter('deaths', ['==', ['number', ['get', 'YEAR']], year]);
                }
              });
            };

            // var bounds = turf.bbox(geojson);
            // console.log("bounds: ", bounds);

            // map will flyTo the bounds provided
            map.fitBounds([-119.63429, -33.5177, 123.00626, 66.92998], {
              padding: {
                top: 10,
                bottom: 30,
                left: 50,
                right: 360
              }
            });

            var onZoomend = function () {
              // set the max bounds
              map.setMaxBounds(map.getBounds())

              // display the legend
              d3.select("#legend").classed("none", false);

              // remove the listener
              map.off("zoomend", onZoomend);
            };

            // when the map is done zooming
            map.on("zoomend", onZoomend);

            // Create a popup, but don"t add it to the map yet.
            var popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false
            });

            map.on("mousemove", "deaths", function (e) {
              var features = map.queryRenderedFeatures(e.point);

              // Change the cursor style as a UI affordance.
              map.getCanvas().style.cursor = "pointer";

              //Populate the popup and set its coordinates based on the feature found.
              popup.setLngLat(e.features[0].geometry.coordinates)
                .setHTML("<h3>" + "Number of Dead and Missing: " + (e.features[0]
                    .properties["DM-T"].toLocaleString()) + "</h3><br>" + "<h4><b>" +
                  "Report Date: " + "</b>" + (e.features[0].properties["DATE"]) +
                  "<br><b>" +
                  "Cause of Death: " + "</b>" + (e.features[0].properties["CAUSE"]) +
                  "<br><b>" +
                  "Description: " + "</b>" + (e.features[0].properties["DESC"]) +
                  "</h4>")
                .addTo(map);
            });

            map.on("mouseleave", "deaths", function () {
              map.getCanvas().style.cursor = "";
              popup.remove();
            });
          });
        });