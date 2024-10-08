let temperature;
let motionDetected;
let emailStatus;
let previousWarningState = false; // To track the previous warning state

async function updateValueAct3() {    
    try {
        const response = await fetch('/data');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Store the data into variables
        temperature = data.Temperature;
        motionDetected = data.Motion;
        emailStatus = data.Email;

    } catch (error) {
        console.error('Error fetching data:', error);
        
        temperature = 'NaN';
        motionDetected = 'NaN';
        emailStatus= 'Nan';
    }

    const tempStatus = document.getElementById('temperature');
    const motionStatusElement = document.getElementById('motion'); // Renamed to avoid conflict

    // Update temperature value
    tempStatus.textContent = `${temperature} °C`;

    // Update motion status
    motionStatusElement.textContent = motionDetected;

    // Change temperature text color based on the value
    if (temperature >= 30) {
        tempStatus.style.color = '#ffae9c'; // Orange for high temperature
    } else {
        tempStatus.style.color = '#FFF'; // Default color (white)
    }

    // Change motion status color based on motion detection
    if (motionDetected == true) {
        motionStatusElement.style.color = '#ffae9c'; // Orange if motion detected
        motionStatusElement.textContent = 'Activated'
    } else if (motionDetected == false){
        motionStatusElement.style.color = '#FFF'; // Default color (white)
        motionStatusElement.textContent = 'Deactivated'
    } else {
        motionStatusElement.textContent = 'Out of Range'
        motionStatusElement.style.color = '#FFF'; // Default color (white)
    }


    // Show popup if emailStatus is true and it's a new event
    if (emailStatus && !previousWarningState) {
        showPopup();
    }

    // Update the previous warning state
    previousWarningState = emailStatus;
}

setInterval(updateValueAct3, 500);
