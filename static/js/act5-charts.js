let rainArray = [];
let soundArray = [];
let timeArray = [];
const ctxSound = document.getElementById('soundChart');

const soundChart = new Chart(ctxSound, {
    type: 'line',
    data: {
        labels: timeArray,  // Format time for display
        datasets: [{
            label: 'Sound Intensity',
            data: soundArray,
            borderColor: '#2b32b2',
            backgroundColor: 'rgba(20, 136, 204, 0.5)',
            fill: true,
            pointBackgroundColor: [], // To be populated dynamically
            pointRadius: []
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

const ctxRain = document.getElementById('rainChart');

const rainChart = new Chart(ctxRain, {
    type: 'line',
    data: {
        labels: timeArray,  // Format time for display
        datasets: [{
            label: 'Rain Intensity',
            data: rainArray,
            borderColor: '#FF0844',
            backgroundColor: 'rgba(255, 177, 153, 0.5)',
            fill: true,
            pointBackgroundColor: [], // To be populated dynamically
            pointRadius: [], // To be populated dynamically
            tension: 0.4, // Smooth lines
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

let rain;
let sound;

function fetchDatas() {
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            const currentTime = new Date();
            const formattedTime = currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });

            rain = data.Rain;
            sound = data.Sound;

            // Add new data to arrays
            rainArray.push(rain);
            soundArray.push(sound);
            timeArray.push(formattedTime);

            // Ensure the arrays stay at size 60 (FIFO)
            if (rainArray.length > 60) rainArray.shift();
            if (soundArray.length > 60) soundArray.shift();
            if (timeArray.length > 60) timeArray.shift();

            // Find the most recent max and min values
            const maxSound = Math.max(...soundArray);
            const minSound = Math.min(...soundArray);
            const maxRain = Math.max(...rainArray);
            const minRain = Math.min(...rainArray);

            // Find the latest indices of the max and min values
            const latestMaxSoundIndex = soundArray.lastIndexOf(maxSound);
            const latestMinSoundIndex = soundArray.lastIndexOf(minSound);
            const latestMaxRainIndex = rainArray.lastIndexOf(maxRain);
            const latestMinRainIndex = rainArray.lastIndexOf(minRain);

            // Update pointBackgroundColor and pointRadius for sound
            soundChart.data.datasets[0].pointBackgroundColor = soundArray.map((value, index) => {
                if (index === latestMaxSoundIndex) return 'red'; // Highlight the latest max in red
                if (index === latestMinSoundIndex) return 'green'; // Highlight the latest min in green
                return 'rgba(20, 136, 204, 1)'; // Default color
            });

            soundChart.data.datasets[0].pointRadius = soundArray.map((value, index) => {
                return (index === latestMaxSoundIndex || index === latestMinSoundIndex) ? 8 : 4; // Enlarged for max/min
            });

            // Update pointBackgroundColor and pointRadius for rain
            rainChart.data.datasets[0].pointBackgroundColor = rainArray.map((value, index) => {
                if (index === latestMaxRainIndex) return 'red'; // Highlight the latest max in red
                if (index === latestMinRainIndex) return 'green'; // Highlight the latest min in green
                return 'rgba(255, 177, 153, 1)'; // Default color
            });

            rainChart.data.datasets[0].pointRadius = rainArray.map((value, index) => {
                return (index === latestMaxRainIndex || index === latestMinRainIndex) ? 8 : 4; // Enlarged for max/min
            });

            // Update the charts to reflect new data
            soundChart.update();
            rainChart.update();
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Example of calling fetchDatas every second (or desired interval)
setInterval(fetchDatas, 1000); // Adjust the interval as needed (e.g., 1000ms = 1 second)
