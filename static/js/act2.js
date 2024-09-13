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
                    type: 'bar',
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

            // Update the live readings
            document.getElementById('distanceSensor1').textContent = `${distance1} cm`;
            document.getElementById('distanceSensor2').textContent = `${distance2} cm`;

            // Check if distance1 is greater than 12 cm
            if (distance1 > 12) {
                document.getElementById('buzzerImage1').src = '../../../static/assets/images/buzzer_on.png';
                document.getElementById('sensor1').querySelector('.message').textContent = 'Warning: Distance #1 exceeds 12 cm';
            } else {
                document.getElementById('buzzerImage').src = '../../../static/assets/images/buzzer_off.png';
                document.getElementById('sensor1').querySelector('.message').textContent = 'Distance is safe';
            }

            // Check if distance2 is greater than 12 cm
            if (distance2 > 12) {
                document.getElementById('buzzerImage2').src = '../../../static/assets/images/buzzer_on.png';
                document.getElementById('sensor2').querySelector('.message').textContent = 'Warning: Distance #2 exceeds 12 cm';
            } else {
                document.getElementById('buzzerImage2').src = '../../../static/assets/images/buzzer_on.png';
                document.getElementById('sensor2').querySelector('.message').textContent = 'Distance is safe';
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
