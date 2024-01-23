// select the dropdown
let dropdown = d3.select("#dropdown");

// add an event listener for a CHANGE
dropdown.on("change", function () {
  //  console.log("Event Listener heard!! YAY!");

  // on change, do work
  doWork();
});

// get the new data
function doWork() {
  let inp_time = dropdown.property("value");

  // grab the data
  let url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_${inp_time}.geojson`;

  // make request
  d3.json(url).then(function (data) {
    console.log(data);

    makeMap(data);
    makeBar(data);
    makeBar2(data);
  });
}

function makeMap(data) {
  // Step 0: recreate the map html
  // Select the map_container div
  let mapContainer = d3.select("#map_container");

  // Empty the map_container div
  mapContainer.html("");

  // Append a div with id "map" inside the map_container div
  mapContainer.append("div").attr("id", "map");

  // Step 1: Define your BASE Layers

  // Define variables for our tile layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Step 2: Create the OVERLAY (DATA) Layers
  // Create a new marker cluster group.
  let markerLayer = L.markerClusterGroup();
  let markers = [];

  // Loop through the data.
  for (let i = 0; i < data.features.length; i++){

    // Set the data location property to a variable.
    let row = data.features[i];

    // Check for the location property.
    if (row.geometry) {
      let latitude = row.geometry.coordinates[1];
      let longitude = row.geometry.coordinates[0];
      let location = [latitude, longitude];

      // Add a new marker to the cluster group, and bind a popup.
      let marker = L.marker(location).bindPopup(`<h1>${row.properties.title}</h1><hr><a href="${row.properties.url}" target="_blank">Link</a>`);
      markerLayer.addLayer(marker);

      // for the heatmap
      markers.push(location);
    }
  }

  let heatLayer = L.heatLayer(markers);

  // Step 3: Create the MAP object

  // Create a map object, and set the default layers.
  let myMap = L.map("map", {
    center: [32.7767, -96.7970],
    zoom: 4,
    layers: [street, markerLayer]
  });

  // Step 4: Add the Layer Controls (Legend goes here too)

  // Only one base layer can be shown at a time.
  let baseMaps = {
    Street: street,
    Topography: topo
  };

  // Overlays that can be toggled on or off
  let overlayMaps = {
    Markers: markerLayer,
    HeatMap: heatLayer
  };

  // Pass our map layers into our layer control.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);
}

function makeBar(data) {
  // sort by magnitude
  let df = data.features;
  df = df.sort((a, b) => b.properties.mag - a.properties.mag);

  // Slice the first 10 objects for plotting
  let num_quakes = 10;
  let df_slice = df.slice(0, num_quakes);

  // Reverse the array to accommodate Plotly's defaults
  df_slice.reverse();

  // Trace for the Data
  let trace = {
    x: df_slice.map(row => row.properties.mag),
    y: df_slice.map(row => row.properties.place),
    type: "bar",
    orientation: "h"
  }

  // Data array
  let traces = [trace];

  // Apply a title to the layout
  let layout = {title: `Top ${num_quakes} Earthquakes by Magnitude`}

  // Render the plot to the div tag with id "plot"
  Plotly.newPlot("bar", traces, layout);

}

function makeBar2(data) {
  // sort by significance
  let df = data.features;
  df = df.sort((a, b) => b.properties.sig - a.properties.sig);

  // Slice the first 10 objects for plotting
  let num_quakes = 10;
  let df_slice = df.slice(0, num_quakes);

  // Reverse the array to accommodate Plotly's defaults
  df_slice.reverse();

  // Trace for the Data
  let trace = {
    x: df_slice.map(row => row.properties.sig),
    y: df_slice.map(row => row.properties.place),
    type: "bar",
    orientation: "h"
  }

  // Data array
  let traces = [trace];

  // Apply a title to the layout
  let layout = {title: `Top ${num_quakes} Earthquakes by Significance`}

  // Render the plot to the div tag with id "plot"
  Plotly.newPlot("bubble", traces, layout);

}

// INITIALIZE plot on page load load
doWork();