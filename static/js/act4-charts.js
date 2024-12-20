// Initial temperature and humidity data
let motionArray = [];

// Initialize timeArray with the last 60 seconds
let timeArray = Array.from({ length: 60 }, (_, i) => -(i + 1));

// Create the chart
const ctxDHT = document.getElementById('act4Chart').getContext('2d');
const dhtChart = new Chart(ctxDHT, {
    type: 'line',
    data: {
        labels: timeArray,  // Format time for display (newest on the left)
        datasets: [{
            label: 'MQ-2 Gas Sensor',
            data: motionArray,
            borderColor: '#33ffbd',
            backgroundColor: 'rgba(51, 255, 189, 0.5)',
            fill: true
        },{
            label: 'SW-420 Vibration Sensor',
            data: motionArray,
            borderColor: '#ff5733',
            backgroundColor: 'rgba(255, 87, 51, 0.5)',
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