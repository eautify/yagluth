let lat = 0;
let lng = 0;
let map, marker;

// Initialize the map once
function initMap() {
    map = L.map('map').setView([lat, lng], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Initialize the marker at default coordinates
    marker = L.marker([lat, lng]).addTo(map);

    // Fetch and display the initial city name
    getCityName(lat, lng);
}

// Fetch the city name using Nominatim Reverse Geocoding API
function getCityName(lat, lng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            const city = data.display_name;
            document.getElementById('localPlace').innerText = city;
        })
        .catch(error => {
            console.error('Error fetching city name:', error);
            document.getElementById('localPlace').innerText = "Unknown";
        });
}

// Update map view and marker position with new coordinates
function updateMap() {
    if (map && marker) {
        map.setView([lat, lng]);  // Update map center
        marker.setLatLng([lat, lng]); // Update marker position

        // Fetch and display the updated city name
        getCityName(lat, lng);
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