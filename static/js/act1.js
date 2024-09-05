let temperatureChart, humidityChart;
let notificationVisible = false; // To track if the notification is currently visible

// Function to fetch and update real-time sensor data
async function fetchSensorData() {
    try {
        const response = await fetch('/data');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        // Get the selected unit from the dropdown
        const unit = document.getElementById('unit').value;

        // Convert the temperature based on the selected unit
        let temperature;
        switch (unit) {
            case 'kelvin':
                temperature = data.temperature + 273.15;
                temperature = `${temperature.toFixed(2)} K`;
                break;
            case 'fahrenheit':
                temperature = (data.temperature * 9/5) + 32;
                temperature = `${temperature.toFixed(2)} °F`;
                break;
            default: // Celsius
                temperature = `${data.temperature.toFixed(2)} °C`;
                break;
        }

        // Update readings
        document.getElementById('temperature').textContent = `Temperature: ${temperature}`;
        document.getElementById('humidity').textContent = `Humidity: ${data.humidity} %`;

        // Update bar meters
        updateBarMeter('temperature-bar', data.temperature, 0, 40, ['cold', 'hot']); // Example range
        updateBarMeter('humidity-bar', data.humidity, 0, 100, ['dry', 'wet']); // Example range

        // Check temperature and trigger notification
        handleTemperatureNotification(data.temperature);

    } catch (error) {
        console.error('Error fetching sensor data:', error);
    }
}

// Function to update the bar meter's width and color
function updateBarMeter(barId, value, min, max, colorClasses) {
    const bar = document.querySelector(`#${barId}`);
    if (!bar) return;

    const percentage = ((value - min) / (max - min)) * 100;
    bar.style.width = `${Math.min(Math.max(percentage, 0), 100)}%`; // Ensure percentage is within 0-100%

    // Remove all color classes
    colorClasses.forEach(colorClass => bar.classList.remove(colorClass));

    // Add appropriate color class based on value
    if (value < (max - min) / 2) {
        bar.classList.add(colorClasses[0]);
    } else {
        bar.classList.add(colorClasses[1]);
    }
}

// Function to handle temperature notification
function handleTemperatureNotification(temperature) {
    const buzzerImage = document.getElementById('buzzerImage');
    const message = document.querySelector('.message');

    if (temperature >= 32) {
        buzzerImage.src = '../../../static/assets/images/buzzer_on.png';
        message.textContent = 'Temperature is above 32°C!';
    } else {
        buzzerImage.src = '../../../static/assets/images/buzzer_off.png';
        message.textContent = 'Temperature is normal';
    }
}

// Function to fetch and render historical data charts
async function fetchAndRenderHistory() {
    try {
        const response = await fetch('/history-dht');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        const labels = data.map(item => item.time); // Time labels
        const temperatureData = data.map(item => item.temperature);
        const humidityData = data.map(item => item.humidity);

        // Helper function to find the index of the newest highest value
        function findNewestHighestIndex(data) {
            const maxValue = Math.max(...data);
            return data.lastIndexOf(maxValue);
        }

        // Helper function to find the index of the newest lowest value
        function findNewestLowestIndex(data) {
            const minValue = Math.min(...data);
            return data.lastIndexOf(minValue);
        }

        // Find the indices of the highest and lowest temperature points
        const maxTempIndex = findNewestHighestIndex(temperatureData);
        const minTempIndex = findNewestLowestIndex(temperatureData);

        // Find the indices of the highest and lowest humidity points
        const maxHumidityIndex = findNewestHighestIndex(humidityData);
        const minHumidityIndex = findNewestLowestIndex(humidityData);

        // Update Temperature Chart
        if (temperatureChart) {
            temperatureChart.data.labels = labels;
            temperatureChart.data.datasets[0].data = temperatureData;
            temperatureChart.data.datasets[0].pointBackgroundColor = temperatureData.map((_, index) => {
                if (index === maxTempIndex) return 'red'; // Newest highest point
                if (index === minTempIndex) return 'blue'; // Newest lowest point
                return 'green'; // Default point color
            });
            temperatureChart.data.datasets[0].pointRadius = temperatureData.map((_, index) => {
                if (index === maxTempIndex || index === minTempIndex) return 7; // Larger radius for highlighted points
                return 3; // Default point radius
            });
            temperatureChart.update();
        } else {
            const tempCtx = document.getElementById('temperatureChart').getContext('2d');
            temperatureChart = new Chart(tempCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Temperature (°C)',
                        data: temperatureData,
                        borderColor: 'green', // Line color
                        fill: false,
                        tension: 0.1,
                        pointBackgroundColor: temperatureData.map((_, index) => {
                            if (index === maxTempIndex) return 'red'; // Newest highest point
                            if (index === minTempIndex) return 'blue'; // Newest lowest point
                            return 'green'; // Default point color
                        }),
                        pointRadius: temperatureData.map((_, index) => {
                            if (index === maxTempIndex || index === minTempIndex) return 7; // Larger radius for highlighted points
                            return 3; // Default point radius
                        })
                    }]
                },
                options: {
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Time'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Temperature (°C)'
                            }
                        }
                    }
                }
            });
        }

        // Update Humidity Chart
        if (humidityChart) {
            humidityChart.data.labels = labels;
            humidityChart.data.datasets[0].data = humidityData;
            humidityChart.data.datasets[0].pointBackgroundColor = humidityData.map((_, index) => {
                if (index === maxHumidityIndex) return 'red'; // Newest highest point
                if (index === minHumidityIndex) return 'blue'; // Newest lowest point
                return 'orange'; // Default point color
            });
            humidityChart.data.datasets[0].pointRadius = humidityData.map((_, index) => {
                if (index === maxHumidityIndex || index === minHumidityIndex) return 7; // Larger radius for highlighted points
                return 3; // Default point radius
            });
            humidityChart.update();
        } else {
            const humidityCtx = document.getElementById('humidityChart').getContext('2d');
            humidityChart = new Chart(humidityCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Humidity (%)',
                        data: humidityData,
                        borderColor: 'orange', // Line color
                        fill: false,
                        tension: 0.1,
                        pointBackgroundColor: humidityData.map((_, index) => {
                            if (index === maxHumidityIndex) return 'red'; // Newest highest point
                            if (index === minHumidityIndex) return 'blue'; // Newest lowest point
                            return 'orange'; // Default point color
                        }),
                        pointRadius: humidityData.map((_, index) => {
                            if (index === maxHumidityIndex || index === minHumidityIndex) return 7; // Larger radius for highlighted points
                            return 3; // Default point radius
                        })
                    }]
                },
                options: {
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Time'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Humidity (%)'
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error fetching historical data:', error);
    }
}


// Fetch real-time data every 1 seconds
setInterval(fetchSensorData, 1000);

// Fetch and refresh historical data charts every 1 seconds
setInterval(fetchAndRenderHistory, 1000);

// Initial fetch for real-time data and historical data
fetchSensorData();
fetchAndRenderHistory();
