// SCRIPT FOR GAUGE
let gasGauge; // Declare gauge variable for gas
let vibrationGauge; // Declare gauge variable for vibration

let gasValue; // Example gas value
let vibrationValue; // Example vibration value
let emailStatus;
let previousWarningState = false; // To track the previous warning state


document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize JustGage for gas
    gasGauge = new JustGage({
        id: 'gasGauge',
        value: gasValue,
        hideValue: true,
        min: 0,
        max: 60,
        pointer: true,
        gaugeWidthScale: 1,
        counter: true
    });

    // Initialize JustGage for vibration
    vibrationGauge = new JustGage({
        id: 'vibrationGauge',
        value: vibrationValue,
        hideValue: true,
        min: 0,
        max: 1,
        pointer: true,
        gaugeWidthScale: 1,
        counter: true
    });
});

// CODE FOR DISPLAYING VALUE
async function updateValueAct4() {

    try {
        const response = await fetch('/data');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Store the data into variables
        gasValue = data.Gas;
        vibrationValue = data.Vibration;
        emailStatus = data.Email;

    } catch (error) {
        console.error('Error fetching data:', error);
        
        gasValue = 33;
        vibrationValue = true;
        emailStatus= 'Nan';
    }

    document.getElementById('gasAnalogValue').textContent = `${gasValue} ppm`; // Set gas value
    document.getElementById('vibrationValue').textContent = vibrationValue ? 'Vibration Detected' : 'No Vibration Detected'; // Set vibration status

    const gasDescription = document.getElementById('gasDescription'); // Corrected: getElementById (singular)
    const vibrationDescription = document.getElementById('vibrationValue'); // Get vibration description element


    // Change the gasDescription text and style based on the gas concentration value
    if (gasValue < 20) {
        // Normal
        gasDescription.textContent = 'Normal: Gas concentration is within safe levels.';
        gasDescription.style.color = '#008000'; // Green for safe
        gasDescription.style.backgroundColor = '#E0FFE0'; // Light green background
    } else if (gasValue >= 20 && gasValue <= 60) {
        // Warning
        gasDescription.textContent = 'Warning: Gas concentration is approaching a potentially unsafe level.';
        gasDescription.style.color = '#FFA500'; // Orange for warning
        gasDescription.style.backgroundColor = '#FFF5E0'; // Light orange background
    } else if (gasValue > 60) {
        // Danger
        gasDescription.textContent = 'Danger: Gas concentration has reached a critical level and requires immediate action.';
        gasDescription.style.color = '#FF0000'; // Red for danger
        gasDescription.style.backgroundColor = '#FFE0E0'; // Light red background
    } else {
        // Default in case of invalid gas concentration value
        gasDescription.textContent = 'Out of Range';
        gasDescription.style.color = '#fff'; // Default text color
        gasDescription.style.backgroundColor = '#cccccc'; // Default background color
    }

    // Update vibration description based on the vibration value
    if (vibrationValue == false) {
        vibrationDescription.textContent = 'No Vibration Detected';
        vibrationDescription.style.color = '#00bf63'; // Green for safe
        vibrationDescription.style.backgroundColor = '#E0FFE0'; // Light green background
    } else if (vibrationValue == true) {
        vibrationDescription.textContent = 'Vibration Detected';
        vibrationDescription.style.color = '#ff5757'; // Red for alert
        vibrationDescription.style.backgroundColor = '#FFE0E0'; // Light red background
    } else {        
        vibrationDescription.textContent = 'Out of Range';
        vibrationDescription.style.color = '#fff'; // Red for alert
        vibrationDescription.style.backgroundColor = '#cccccc'; // Light red background
    }

    // Update the gauge values dynamically if gasValue or vibrationValue changes
    gasGauge.refresh(gasValue);
    vibrationGauge.refresh(vibrationValue);

    // Show popup if emailStatus is true and it's a new event
    if (emailStatus && !previousWarningState) {
        showPopup();
    }

    // Update the previous warning state
    previousWarningState = emailStatus;
}

setInterval(updateValueAct4, 500); // Call update every 500ms
