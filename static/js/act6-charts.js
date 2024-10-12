// Initialize timeArray with the last 60 seconds (reverse order)
let timeArray = Array.from({ length: 60 }, (_, i) => i + 1);  // Newest on the left
let longiArray = [];
let latiArray = [];
let altiArray = [];



// Create the chart
const ctxGPS = document.getElementById('gpsChart').getContext('2d');
const gpsChart = new Chart(ctxGPS, {
    type: 'line',
    data: {
        labels: timeArray.reverse(),  // Reverse the labels to display newest first
        datasets: [{
            label: 'Latitude',
            data: latiArray,
            borderColor: '#e750e8',
            backgroundColor: 'rgba(231, 80, 232, 0.5)',
            fill: true
        }, {
            label: 'Longitude',
            data: longiArray,
            borderColor: '#ff5733',
            backgroundColor: 'rgba(255, 87, 51, 0.5)',
            fill: true
        }, {
            label: 'Altitude',
            data: altiArray,
            borderColor: '#5051e8',
            backgroundColor: 'rgba(80, 81, 232, 0.5)',
            fill: true
        }]
    },
    options: {
        responsive: true,
        animation: false,
        plugins: {
            legend: { position: 'top' },
        },
        scales: {
            x: {
                reverse: true  // Reverse the x-axis to display new data on the left
            }
        }
    }
});

function fetchData() {
    fetch('/data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const latitude = data.latitude;
            const longitude = data.longitude;
            const altitude = data.altitude;

            // Update arrays
            updateArrays(latitude, longitude, altitude);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            const latitude = 0; // Default value on error
            const longitude = 0; // Default value on error
            const altitude = 0; // Default value on error

            // Update arrays
            updateArrays(latitude, longitude, altitude);
        });
}

function updateArrays(latitude, longitude, altitude) {
    latiArray.push(latitude);
    longiArray.push(longitude);
    altiArray.push(altitude);

    // Keep array length to a maximum of 60
    if (latiArray.length > 60) latiArray.shift();
    if (longiArray.length > 60) longiArray.shift();
    if (altiArray.length > 60) altiArray.shift();

    // Update chart
    gpsChart.update();
}

// Fetch data every second
setInterval(fetchData, 1000);
