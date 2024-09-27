let distanceChart; // Variable to hold the chart instance

function fetchDataAndUpdateChart() {
    fetch('/history-distances')
        .then(response => response.json())
        .then(data => {
            // Reverse the order of data
            const dates = data.map(entry => `${entry.date} ${entry.time}`).reverse();
            const distances1 = data.map(entry => entry.distance1).reverse();
            const distances2 = data.map(entry => entry.distance2).reverse();

            if (distanceChart) {
                // Update existing chart
                distanceChart.data.labels = dates;
                distanceChart.data.datasets[0].data = distances1;
                distanceChart.data.datasets[1].data = distances2;
                distanceChart.update();
            } else {
                // Create new chart
                const ctx = document.getElementById('distanceChart').getContext('2d');
                distanceChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [
                            {
                                label: 'HC-SR04 #1',
                                data: distances1,
                                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'HC-SR04 #2',
                                data: distances2,
                                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                beginAtZero: true,
                                ticks: {
                                    maxRotation: 90,
                                    minRotation: 45
                                },
                                reverse: false // Ensure x-axis starts from the left
                            },
                            y: {
                                beginAtZero: true
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(tooltipItem) {
                                        return `${tooltipItem.dataset.label}: ${tooltipItem.raw} cm`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function fetchLiveReadings() {
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            const distance1 = data.distance1 !== null ? data.distance1 : '--';
            const distance2 = data.distance2 !== null ? data.distance2 : '--';

            // Get the selected unit from the dropdown
            const unit = document.getElementById('unit-distance').value;

            let distance1R;
            let distance2R;

            switch (unit) {
                case 'mm':
                    distance1R = distance1 * 10; // 1 cm = 10 mm
                    distance1R = `${distance1R.toFixed(2)} mm`;
                    distance2R = distance2 * 10; // 1 cm = 10 mm
                    distance2R = `${distance2R.toFixed(2)} mm`;
                    break;
                case 'cm':
                    distance1R = `${distance1.toFixed(2)} cm`; // Already in cm
                    distance2R = `${distance2.toFixed(2)} cm`; // Already in cm
                    break;
                case 'meter':
                    distance1R = distance1 / 100; // 1 m = 100 cm
                    distance1R = `${distance1R.toFixed(2)} m`;
                    distance2R = distance2 / 100; // 1 m = 100 cm
                    distance2R = `${distance2R.toFixed(2)} m`;
                    break;
                case 'km':
                    distance1R = distance1 / 100000; // 1 km = 100000 cm
                    distance1R = `${distance1R.toFixed(6)} km`;
                    distance2R = distance2 / 100000; // 1 km = 100000 cm
                    distance2R = `${distance2R.toFixed(6)} km`;
                    break;
                case 'inch':
                    distance1R = distance1 * 0.393701; // 1 cm = 0.393701 inches
                    distance1R = `${distance1R.toFixed(2)} in`;
                    distance2R = distance2 * 0.393701; // 1 cm = 0.393701 inches
                    distance2R = `${distance2R.toFixed(2)} in`;
                    break;
                case 'feet':
                    distance1R = distance1 * 0.0328084; // 1 cm = 0.0328084 feet
                    distance1R = `${distance1R.toFixed(2)} ft`;
                    distance2R = distance2 * 0.0328084; // 1 cm = 0.0328084 feet
                    distance2R = `${distance2R.toFixed(2)} ft`;
                    break;
                case 'yard':
                    distance1R = distance1 * 0.0109361; // 1 cm = 0.0109361 yards
                    distance1R = `${distance1R.toFixed(2)} yd`;
                    distance2R = distance2 * 0.0109361; // 1 cm = 0.0109361 yards
                    distance2R = `${distance2R.toFixed(2)} yd`;
                    break;
                case 'mile':
                    distance1R = distance1 * 0.0000062137; // 1 cm = 0.0000062137 miles
                    distance1R = `${distance1R.toFixed(6)} mi`;
                    distance2R = distance2 * 0.0000062137; // 1 cm = 0.0000062137 miles
                    distance2R = `${distance2R.toFixed(6)} mi`;
                    break;
                default:
                    distance1R = `${distance1.toFixed(2)} cm`; // Default to cm if no match
                    distance2R = `${distance2.toFixed(2)} cm`;
                    break;
            }

            // Update the live readings
            document.getElementById('distanceSensor1').textContent = `${distance1R}`;
            document.getElementById('distanceSensor2').textContent = `${distance2R}`;

            // Check if distance1 is greater than 12 cm
            if (distance1 > 12) {
                document.getElementById('buzzerImage1').src = '../../../static/assets/images/buzzer_on.png';
                document.getElementById('sensor1').querySelector('.messageDistance').textContent = 'Warning: Distance #1 exceeds 12 cm';
            } else {
                document.getElementById('buzzerImage1').src = '../../../static/assets/images/buzzer_off.png';
                document.getElementById('sensor1').querySelector('.messageDistance').textContent = 'Distance is safe';
            }

            // Check if distance2 is greater than 12 cm
            if (distance2 > 12) {
                document.getElementById('buzzerImage2').src = '../../../static/assets/images/buzzer_on.png';
                document.getElementById('sensor2').querySelector('.messageDistance').textContent = 'Warning: Distance #2 exceeds 12 cm';
            } else {
                document.getElementById('buzzerImage2').src = '../../../static/assets/images/buzzer_off.png';
                document.getElementById('sensor2').querySelector('.messageDistance').textContent = 'Distance is safe';
            }
        })
        .catch(error => console.error('Error fetching live readings:', error));
}



// Fetch initial data and create/update chart and live readings
fetchDataAndUpdateChart();
fetchLiveReadings();

// Set intervals to refresh chart and live readings every 3 seconds
setInterval(fetchDataAndUpdateChart, 3000);
setInterval(fetchLiveReadings, 500);
