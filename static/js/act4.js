let gasValue;
let myChart; // Declare a global variable for the chart instance
let popupShown = false;  // Flag to track if popup has been shown
let previousWarningState = false; // To track the previous warning state

// Function to update the semicircle meter
function updateSemicircleMeter(value) {
    const ctx = document.getElementById('semicircleMeter').getContext('2d');

    // Determine the background color based on the gas value
    let backgroundColor;
    if (value < 20) {
        backgroundColor = '#4CAF50'; // Normal: below 20 ppm
    } else if (value >= 20 && value <= 60) {
        backgroundColor = '#ffbd59'; // Warning: 20 - 60 ppm
    } else {
        backgroundColor = '#ff5757'; // Danger: above 60 ppm
    }

    if (myChart) {
        // Update the chart data and background color if the chart already exists
        myChart.data.datasets[0].data = [value, 100 - value];
        myChart.data.datasets[0].backgroundColor = [backgroundColor, '#ddd'];
        myChart.update(); // Refresh the chart with the new data
    } else {
        // Create the chart for the first time
        const data = {
            datasets: [{
                data: [value, 100 - value],
                backgroundColor: [backgroundColor, '#ddd'], // Set initial background color
                borderWidth: 0,
                cutout: '75%',
                circumference: 180,
                rotation: 270,
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: { enabled: false },
                legend: { display: false },
            },
            rotation: -Math.PI, // Start angle (270 degrees)
            circumference: Math.PI, // End angle (180 degrees)
        };

        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: options
        });
    }

    // Update the displayed value
    document.getElementById('meterValue').textContent = value;
}

// Function to fetch data from the server
async function fetchData() {
    try {
        const response = await fetch('/data'); // Fetch the data from the /data endpoint
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json(); // Parse the JSON response

        gasValue = data.Gas; // Update gasValue with the fetched data.Gas
        vibrationValue = data.Vibration;
        warningNotif = data.Warning;

        // Update the HTML elements with the fetched data
        document.getElementById('gasAnalogValue').textContent = gasValue; // Set gas value
        document.getElementById('vibrationValue').textContent = data.Vibration ? 'Vibration Detected' : 'No Vibration Detected'; // Set vibration status

        const gasDescriptionElement = document.getElementById('gasDescription');
        const vibrationValueElement = document.getElementById('vibrationValue');

        // Use if-else instead of switch-case for conditions
        if (gasValue < 20) {
            gasDescriptionElement.textContent = 'Safe';
            gasDescriptionElement.style.backgroundColor = '#4CAF50'; // Green for Safe
        } else if (gasValue >= 20 && gasValue <= 60) {
            gasDescriptionElement.textContent = 'Warning';
            gasDescriptionElement.style.backgroundColor = '#ffbd59'; // Yellow for Warning
        } else {
            gasDescriptionElement.textContent = 'Danger';
            gasDescriptionElement.style.backgroundColor = '#ff5757'; // Red for Danger
        }

        if (!vibrationValue){
            vibrationValueElement.style.backgroundColor = '#4CAF50'; // Green for No Vibration
        } else {
            vibrationValueElement.style.backgroundColor = '#ff5757'; // Red for Vibration Detected
        }

        // Show popup if warningNotif is true and it's a new event (previous state was false)
        if (warningNotif && !previousWarningState) {
            showPopup();
        }

        // Update the previous warning state
        previousWarningState = warningNotif;

        // Update the semicircle meter with the fetched gas value
        updateSemicircleMeter(gasValue);

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Function to show the popup
function showPopup() {
    document.getElementById("popup").style.display = "block";
    popupShown = true;  // Set the flag once the popup is shown
}

// Function to close the popup and reset the flag
function closePopup() {
    document.getElementById("popup").style.display = "none";
    popupShown = false;  // Reset the flag so popup can show again for a new event
}

function validateEmail() {
    var email = document.getElementById("email").value;
    var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
        alert("Invalid Email Address");
        return;
    }

    // Send the email to Flask for saving
    $.ajax({
        type: 'POST',
        url: '/save-email',
        data: JSON.stringify({email: email}),
        contentType: 'application/json',
        success: function(response) {
            alert(response.message);
        },
        error: function() {
            alert("Error saving email.");
        }
    });
}



// Call the fetchData function when the page loads
window.onload = fetchData;

// Refresh the data and chart every 500ms
setInterval(fetchData, 500);
