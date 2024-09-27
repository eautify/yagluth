$(document).ready(function() {
    fetchMotionData();
    fetchSensorData(); // Fetch sensor data on page load
    setInterval(fetchMotionData, 3000); // Refresh motion data every 3 seconds
    setInterval(fetchSensorData, 500); // Refresh sensor data every 0.5 seconds
});

function fetchMotionData() {
    $.ajax({
        url: '/history-motion',
        method: 'GET',
        success: function(data) {
            const labels = [];
            const motionData = [];

            // Process the fetched data
            data.forEach(item => {
                labels.push(item.date + ' ' + item.time);
                motionData.push(item.motion === "Motion Detected!" ? 1 : 0); // 1 for motion, 0 for no motion
            });

            // Create the chart
            createMotionChart(labels, motionData);
        },
        error: function(error) {
            console.error('Error fetching motion data:', error);
        }
    });
}


function fetchSensorData() {
    $.ajax({
        url: '/data',
        method: 'GET',
        success: function(data) {
            // Update Temperature
            $('.result.Temperature').text(data.temperature !== null ? data.temperature + ' °C' : '--');
            
            // Update Humidity
            $('.result.Humidity').text(data.humidity !== null ? data.humidity + ' %' : '--');
            
            // Update Motion State
            $('.result.Motion').text(data.motion ? 'Motion Detected!' : 'No Motion');
            
            // Update Buzzer State using if...else
            const buzzerIcon = $('.buzzerIcon');
            if (data.motion) {
                $('.buzzerText').text('Buzzer is active');          
                buzzerIcon.attr('src', '../../../static/assets/images/buzzer_on.png');
                $('.emailNotif').show(); // Show the div when motion is detected
            } else {
                $('.buzzerText').text('Buzzer inactive');
                buzzerIcon.attr('src', '../../../static/assets/images/buzzer_off.png');
                $('.emailNotif').hide(); // Hide the div when no motion is detected

            }
        },
        error: function(error) {
            console.error('Error fetching sensor data:', error);
        }
    });
}




function createMotionChart(labels, motionData) {
    const ctx = document.getElementById('motionChart').getContext('2d');
    const motionChart = new Chart(ctx, {
        type: 'line', // Use 'line' type for stepped chart
        data: {
            labels: labels,
            datasets: [{
                label: 'Motion State',
                data: motionData,
                fill: false, // Disable fill
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                stepped: true // Enable stepped line
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Motion State'
                    },
                    ticks: {
                        // Set fixed labels for the Y-axis
                        callback: function(value) {
                            if (value === 1) return 'Motion Detected!';
                            if (value === 0) return 'No Motion';
                        },
                        // Ensure only two ticks appear
                        autoSkip: false,
                        maxTicksLimit: 2
                    },
                    min: 0,
                    max: 1
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            }
        }
    });
}
