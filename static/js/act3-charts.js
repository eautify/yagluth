// Initial temperature and humidity data
let motionArray = [];

// Initialize timeArray with the last 60 seconds
let timeArray = Array.from({ length: 60 }, (_, i) => -(i + 1));

// Create the chart
const ctxDHT = document.getElementById('distanceChart').getContext('2d');
const act3Chart = new Chart(ctxDHT, {
    type: 'line',
    data: {
        labels: timeArray,  // Format time for display (newest on the left)
        datasets: [{
            label: 'HC-SR501',
            data: motionArray,
            borderColor: '#696eff',
            backgroundColor: 'rgba(105, 110, 255, 0.5)',
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