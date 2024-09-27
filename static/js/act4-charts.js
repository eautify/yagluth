document.addEventListener("DOMContentLoaded", function() {
    // Initialize chart variables
    let gasChart;
    let vibrationChart;

    function fetchAndUpdateCharts() {
        // Fetch historical gas data from the Flask endpoint
        fetch('/history-gas')
            .then(response => response.json())
            .then(data => {
                // Extract gas levels and times, and reverse the order
                const gasLevels = data.map(entry => entry.gas).reverse();
                const times = data.map(entry => entry.time).reverse();

                // Find highest and lowest gas levels
                const maxGas = Math.max(...gasLevels);
                const minGas = Math.min(...gasLevels);

                // Prepare colors and point sizes for gas levels
                const gasColors = gasLevels.map((gas, index) => {
                    // Highlight only the newest occurrence of max and min gas levels
                    if (gas === maxGas && index === gasLevels.lastIndexOf(maxGas)) {
                        return 'rgba(255, 0, 0, 1)'; // Red for highest
                    }
                    if (gas === minGas && index === gasLevels.lastIndexOf(minGas)) {
                        return 'rgba(0, 255, 0, 1)'; // Green for lowest
                    }
                    return 'rgba(75, 192, 192, 1)'; // Default color
                });

                const pointSizes = gasLevels.map((gas, index) => {
                    // Set larger radius for highest and lowest points, smaller for others
                    if (gas === maxGas && index === gasLevels.lastIndexOf(maxGas)) {
                        return 6; // Larger point for highest
                    }
                    if (gas === minGas && index === gasLevels.lastIndexOf(minGas)) {
                        return 6; // Larger point for lowest
                    }
                    return 2; // Smaller point for others
                });

                if (!gasChart) {
                    // Create the gas chart if it doesn't exist
                    const ctx = document.getElementById('gasChart').getContext('2d');
                    gasChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: times,
                            datasets: [{
                                label: 'Gas Levels',
                                data: gasLevels,
                                borderColor: 'rgba(75, 192, 192, 1)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                borderWidth: 2,
                                fill: true,
                                pointBackgroundColor: gasColors, // Set point color based on gas level
                                pointRadius: pointSizes, // Set point sizes based on gas level
                                tension: .3,
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Time'
                                    },
                                    reverse: false, // Do not flip the x-axis here
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Gas Level'
                                    }
                                }
                            }
                        }
                    });
                } else {
                    // Update existing gas chart data
                    gasChart.data.labels = times;
                    gasChart.data.datasets[0].data = gasLevels;
                    gasChart.data.datasets[0].pointBackgroundColor = gasColors; // Update point colors
                    gasChart.data.datasets[0].pointRadius = pointSizes; // Update point sizes
                    gasChart.update(); // Refresh the chart
                }
            })
            .catch(error => console.error('Error fetching gas data:', error));

        // Fetch historical vibration data from the Flask endpoint
        fetch('/history-vibration')
            .then(response => response.json())
            .then(data => {
                // Extract vibration levels and times, and reverse the order
                const vibrationLevels = data.map(entry => entry.vibration).reverse();
                const times = data.map(entry => entry.time).reverse();

                if (!vibrationChart) {
                    // Create the vibration chart if it doesn't exist
                    const ctx = document.getElementById('vibrationChart').getContext('2d');
                    vibrationChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: times,
                            datasets: [{
                                label: 'Vibration Levels',
                                data: vibrationLevels,
                                borderColor: 'rgba(255, 99, 132, 1)',
                                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                                borderWidth: 2,
                                fill: true,
                                stepped: true,
                                pointRadius: 0, // Remove data point markers
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Time'
                                    },
                                    reverse: false, // Do not flip the x-axis here
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Vibration Level'
                                    },
                                    min: 0, // Set minimum value to 0
                                    max: 1.5, // Set maximum value to 1
                                    ticks: {
                                        // Only show 0 and 1 on the y-axis
                                        callback: function(value) {
                                            if (value === 0 || value === 1) {
                                                return value; // Only display 0 and 1
                                            }
                                            return ''; // Do not display other values
                                        }
                                    }
                                }
                                
                            }
                        }
                    });
                } else {
                    // Update existing vibration chart data
                    vibrationChart.data.labels = times;
                    vibrationChart.data.datasets[0].data = vibrationLevels;
                    vibrationChart.update(); // Refresh the chart
                }
            })
            .catch(error => console.error('Error fetching vibration data:', error));
    }

    // Initial fetch and chart creation
    fetchAndUpdateCharts();

    // Set interval to refresh the charts every second
    setInterval(fetchAndUpdateCharts, 1000); // 1000 milliseconds = 1 second
});
