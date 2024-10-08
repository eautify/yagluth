// Initial temperature and humidity data
let distanceArray1 = [];
let distanceArray2 = [];

// Initialize timeArray with the last 60 seconds
let timeArray = Array.from({ length: 60 }, (_, i) => -(i + 1));

// Create the chart
const ctxDHT = document.getElementById('distanceChart').getContext('2d');
const dhtChart = new Chart(ctxDHT, {
    type: 'line',
    data: {
        labels: timeArray,  // Format time for display (newest on the left)
        datasets: [{
            label: 'HC-SR04 #1',
            data: distanceArray1,
            borderColor: '#696eff',
            backgroundColor: 'rgba(105, 110, 255, 0.5)',
            fill: true
        },{
            label: 'HC-SR04 #2',
            data: distanceArray2,
            borderColor: '#42047e',
            backgroundColor: 'rgba(7, 244, 158, 0.5)',
            fill: true
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
        },
        scales: {
            y: { beginAtZero: true }
        }
    }
});