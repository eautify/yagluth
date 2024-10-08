let previousWarningState = false; // To track the previous warning state
// Store the data into variables
let emailStatus;
let rainAmount;
let soundLevel;

let soundGauge; // Declare gauge variable for sound
let rainGauge; // Declare gauge variable for rain

async function updateValueAct5() {
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

    } catch (error) {
        console.error('Error fetching data:', error);
        
        emailStatus = 'NaN';
        rainAmount = 'NaN';
        soundLevel = 'NaN';
    }

    soundpercentage = (soundLevel / 1023) * 100;
    rainPercentage = (rainAmount / 1023) * 100;

    // Update displayed values
    document.getElementsByClassName('holderS soundDecibelsValue')[0].textContent = soundLevel + ' dB';
    document.getElementsByClassName('holderS soundAnalogValue')[0].textContent = soundpercentage.toFixed(2) + ' %';

    document.getElementsByClassName('holderS rainAnalogValue')[0].textContent = rainAmount;
    document.getElementsByClassName('holderS rainPercentValue')[0].textContent = rainPercentage.toFixed(2) + ' %';

    // Update sound description and gauge color
    const soundDescriptionElement = document.querySelector('.holder.soundDescription'); // Ensure this class is defined in your HTML

    if (soundLevel >= 0 && soundLevel <= 50) {
        soundDescriptionElement.textContent = 'Quiet (0 - 50 dB):'; 
        soundDescriptionElement.style.backgroundColor = '#00bf63'; // Green background
        soundDescriptionElement.style.color = '#ffffff'; // White text for contrast
    } else if (soundLevel >= 51 && soundLevel <= 90) {
        soundDescriptionElement.textContent = 'Moderate (51 - 90 dB):'; 
        soundDescriptionElement.style.backgroundColor = '#ffbd59'; // Yellow background
        soundDescriptionElement.style.color = '#ffffff'; // White text for contrast
    } else if (soundLevel >= 91 && soundLevel <= 150) { // Adjusted upper limit to 150
        soundDescriptionElement.textContent = 'Very Loud (91 - 150 dB):'; 
        soundDescriptionElement.style.backgroundColor = '#ff5757'; // Red background
        soundDescriptionElement.style.color = '#ffffff'; // White text for contrast
    } else {
        soundDescriptionElement.textContent = 'Out of Range'; 
        soundDescriptionElement.style.backgroundColor = '#cccccc'; // Gray background
        soundDescriptionElement.style.color = '#000000'; // Black text
    }


    const categoryElement = document.querySelector('.holder.rainDescription'); // Make sure this class is defined in your HTML

    // Set category based on the rain percentage
    if (rainPercentage === 0) {
        categoryElement.textContent = "No Rain";
        categoryElement.style.backgroundColor = "#00bf63"; // Green color
    } else if (rainPercentage >= 1 && rainPercentage <= 10) {
        categoryElement.textContent = "Light Rain";
        categoryElement.style.backgroundColor = "#00bf63"; // Green color
    } else if (rainPercentage >= 11 && rainPercentage <= 25) {
        categoryElement.textContent = "Moderate Rain";
        categoryElement.style.backgroundColor = "#ffbd59"; // Yellow color
    } else if (rainPercentage >= 26 && rainPercentage <= 50) {
        categoryElement.textContent = "Heavy Rain";
        categoryElement.style.backgroundColor = "#ffbd59"; // Yellow color
    } else if (rainPercentage >= 51 && rainPercentage <= 80) {
        categoryElement.textContent = "Intense Rain";
        categoryElement.style.backgroundColor = "#ff5757"; // Red color
    } else if (rainPercentage >= 81 && rainPercentage <= 100) {
        categoryElement.textContent = "Torrential Rain";
        categoryElement.style.backgroundColor = "#ff5757"; // Red color
    } else {
        categoryElement.textContent = 'Out of Range'; 
        categoryElement.style.backgroundColor = '#cccccc'; // Gray background
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
}

document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize JustGage for sound
    soundGauge = new JustGage({
        id: 'sound',
        value: soundLevel,
        hideValue: true,
        min: 0,
        max: 200,
        symbol: ' dB',
        pointer: true,
        gaugeWidthScale: 1,
        customSectors: [{
            color: '#ff5757', // Red for very heavy rain
            lo: 101,
            hi: 200
        }, {
            color: '#00bf63', // Green for light rain
            lo: 0,
            hi: 50
        }, {
            color: '#ffbd59', // Yellow for moderate rain
            lo: 51,
            hi: 100
        }],
        counter: true
    });

    // Initialize JustGage for rain
    rainGauge = new JustGage({
        id: 'rain',
        value: rainAmount,
        hideValue: true,
        min: 0,
        max: 1000,
        symbol: '%',
        pointer: true,
        gaugeWidthScale: 1,
        customSectors: [{
            color: '#ff5757', // Red for very heavy rain
            lo: 801,
            hi: 1000
        }, {
            color: '#00bf63', // Green for light rain
            lo: 0,
            hi: 400
        }, {
            color: '#ffbd59', // Yellow for moderate rain
            lo: 401,
            hi: 800
        }],
        counter: true
    });

});

// Call the function
// Refresh the data and chart every 500ms
setInterval(updateValueAct5, 500);


