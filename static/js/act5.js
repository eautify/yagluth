let previousWarningState = false; // To track the previous warning state
// Store the data into variables
let emailStatus = 0;
let rainAmount = 0;
let soundLevel = 0;

let soundGauge; // Declare gauge variable for sound
let rainGauge; // Declare gauge variable for rain

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
        data: JSON.stringify({ email: email }),
        contentType: 'application/json',
        success: function(response) {
            alert(response.message);
        },
        error: function() {
            alert("Error saving email.");
        }
    });
}

async function fetchData() {
    try {
        const response = await fetch('/data');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Store the data into variables
        emailStatus = data.Email;
        rainAmount = data.Rain;
        soundLevel = data.Sound;

        // Update displayed values
        document.getElementsByClassName('holder soundAnalogValue')[0].textContent = soundLevel + ' dB';
        document.getElementsByClassName('holder rainAnalogValue')[0].textContent = rainAmount + '%';

        // Update sound description and gauge color
        const soundDescriptionElement = document.querySelector('.holder.soundDescription');
        if (soundLevel >= 0 && soundLevel <= 50) {
            soundDescriptionElement.textContent = 'Quiet'; 
            soundDescriptionElement.style.backgroundColor = '#00bf63'; 
            soundGauge.config.customSectors[1].color = '#00bf63'; // Green
        } else if (soundLevel >= 51 && soundLevel <= 90) {
            soundDescriptionElement.textContent = 'Moderate'; 
            soundDescriptionElement.style.backgroundColor = '#ffbd59'; 
            soundGauge.config.customSectors[1].color = '#ffbd59'; // Yellow
        } else if (soundLevel >= 91 && soundLevel <= 120) {
            soundDescriptionElement.textContent = 'Very Loud'; 
            soundDescriptionElement.style.backgroundColor = '#ff5757'; 
            soundGauge.config.customSectors[1].color = '#ff5757'; // Red
        } else {
            soundDescriptionElement.textContent = 'Out of Range'; 
            soundDescriptionElement.style.backgroundColor = '#cccccc'; 
            soundGauge.config.customSectors[1].color = '#cccccc'; // Gray
        }

        // Update rain description and gauge color
        const rainDescriptionElement = document.querySelector('.holder.rainDescription');
        if (rainAmount >= 0 && rainAmount <= 40) {
            rainDescriptionElement.textContent = 'Light Rain'; 
            rainDescriptionElement.style.backgroundColor = '#00bf63'; 
            rainGauge.config.customSectors[0].color = '#00bf63'; // Green
        } else if (rainAmount >= 41 && rainAmount <= 80) {
            rainDescriptionElement.textContent = 'Moderate Rain'; 
            rainDescriptionElement.style.backgroundColor = '#ffbd59'; 
            rainGauge.config.customSectors[1].color = '#ffbd59'; // Yellow
        } else if (rainAmount >= 81 && rainAmount <= 100) {
            rainDescriptionElement.textContent = 'Very Heavy Rain'; 
            rainDescriptionElement.style.backgroundColor = '#ff5757'; 
            rainGauge.config.customSectors[2].color = '#ff5757'; // Red
        } else {
            rainDescriptionElement.textContent = 'Out of Range'; 
            rainDescriptionElement.style.backgroundColor = '#cccccc'; 
            rainGauge.config.customSectors[0].color = '#cccccc'; // Gray
        }

        // Refresh the gauges with updated colors
        soundGauge.refresh(soundLevel);
        rainGauge.refresh(rainAmount);

        // Show popup if emailStatus is true and it's a new event
        if (emailStatus && !previousWarningState) {
            showPopup();
        }

        // Update the previous warning state
        previousWarningState = emailStatus;

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize JustGage for sound
    soundGauge = new JustGage({
        id: 'sound',
        value: soundLevel,
        hideValue: true,
        min: 0,
        max: 120,
        symbol: ' dB',
        pointer: true,
        gaugeWidthScale: 1,
        customSectors: [{
            color: '#ff5757', // Red for very heavy rain
            lo: 91,
            hi: 120
        }, {
            color: '#00bf63', // Green for light rain
            lo: 0,
            hi: 50
        }, {
            color: '#ffbd59', // Yellow for moderate rain
            lo: 51,
            hi: 90
        }],
        counter: true
    });

    // Initialize JustGage for rain
    rainGauge = new JustGage({
        id: 'rain',
        value: rainAmount,
        hideValue: true,
        min: 0,
        max: 100,
        symbol: '%',
        pointer: true,
        gaugeWidthScale: 1,
        customSectors: [{
            color: '#ff5757', // Red for very heavy rain
            lo: 81,
            hi: 100
        }, {
            color: '#00bf63', // Green for light rain
            lo: 0,
            hi: 40
        }, {
            color: '#ffbd59', // Yellow for moderate rain
            lo: 41,
            hi: 80
        }],
        counter: true
    });

});

// Call the function
// Refresh the data and chart every 500ms
setInterval(fetchData, 500);


