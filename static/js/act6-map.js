let lat = 0;
let lng = 0;
let alt = 0; // To store altitude
let map, marker;
let lastSpokenCity = ""; // To store the last spoken city name

// Initialize the map once
function initMap() {
    map = L.map('map').setView([lat, lng], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Initialize the marker at default coordinates with popup
    marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("You are <b>HERE!</b>"); // Bind the popup once during initialization

    // Fetch and display the initial city name
    getCityName(lat, lng, true); // Pass 'true' to indicate this is the initial load
}

// Text-to-Speech function
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text); // Create a new speech utterance
        speechSynthesis.speak(utterance); // Speak the text
    } else {
        console.error('Text-to-Speech is not supported in this browser.');
    }
}

// Fetch the city name using Nominatim Reverse Geocoding API
function getCityName(lat, lng, isInitialLoad = false) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            const city = data.display_name;
            document.getElementById('localPlace').innerText = city;

            // Trigger TTS for the first load or if the city changes
            if (isInitialLoad || city !== lastSpokenCity) {
                speakText(`You are in ${city}`);
                lastSpokenCity = city; // Update the last spoken city
            }
        })
        .catch(error => {
            console.error('Error fetching city name:', error);
            document.getElementById('localPlace').innerText = "Unknown";
        });
}

// Fetch the altitude using Open-Elevation API
function getAltitude(lat, lng) {
    fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`)
        .then(response => response.json())
        .then(data => {
            alt = data.results[0].elevation;
            document.getElementById('alti').innerText = alt + ' meters';

            // Update the marker popup with altitude
            marker.bindPopup(`You are <b>HERE!</b><br>Altitude: ${alt} meters`).openPopup();
        })
        .catch(error => {
            console.error('Error fetching altitude:', error);
        });
}

function updateMap() {
    if (map && marker) {
        // Force the map to recenter, optionally tweak zoom level for better effect
        map.setView([lat, lng], map.getZoom(), { animate: true });  // Ensure the map recenters

        // Update marker position
        marker.setLatLng([lat, lng]);

        // Open existing popup
        marker.openPopup();

        // Fetch and display the updated city name
        getCityName(lat, lng);

        // Fetch and display the updated altitude
        getAltitude(lat, lng);
    }
}

function fetchData() {
    fetch('/data')  // Make sure '/data' endpoint is working and returning valid lat/lng data
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            lat = data.latitude;
            lng = data.longitude;

            // Update the map and marker with new data
            updateMap();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Initialize the map on page load
initMap();

// Fetch data every 1 second and update the map
setInterval(fetchData, 1000);
