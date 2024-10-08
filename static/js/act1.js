// SCRIPT FOR GAUGE
let temperatureGauge; // Declare gauge variable for sound
let humidityGauge; // Declare gauge variable for rain

let temperatureValue;
let humidityValue;

document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize JustGage for sound
    temperatureGauge = new JustGage({
        id: 'tempGauge',
        value: temperatureValue,
        hideValue: true,
        min: 0,
        max: 60,
        pointer: true,
        gaugeWidthScale: 1,
        counter: true
    });

    // Initialize JustGage for rain
    humidityGauge = new JustGage({
        id: 'humidGauge',
        value: humidityValue,
        hideValue: true,
        min: 0,
        max: 100,
        pointer: true,
        gaugeWidthScale: 1,
        counter: true
    });

});

// CODE FOR DISPLAYING VALUE
async function updateValueAct1() {
    try {
        const response = await fetch('/data');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

    const data = await response.json();

    // Store the data into variables
    temperatureValue = data.Temperature;
    humidityValue = data.Humidity;

    } catch (error) {
        console.error('Error fetching data:', error);
        
        temperatureValue = 'NaN';
        humidityValue = 'NaN';
    } 

    const tempUpdate = document.getElementsByClassName('tempValue')[0];
    const humidUpdate = document.getElementsByClassName('humidValue')[0];

    const tempDescription = document.getElementsByClassName('tempDescription')[0];
    const humidDescription = document.getElementsByClassName('humidDescription')[0];

    // Get the selected unit from the dropdown
    const unit = document.getElementById('idTemp').value;

    // Convert the temperature based on the selected unit
    let temperature;

    // Get all the div elements
    const celsiusDiv = document.getElementById('celcius');
    const kelvinDiv = document.getElementById('kelvin');
    const fahrenheitDiv = document.getElementById('fahrenheit');
    
    // Hide all divs first
    celsiusDiv.style.display = 'none';
    kelvinDiv.style.display = 'none';
    fahrenheitDiv.style.display = 'none';

    switch (unit) {
        case 'kelvin':
            temperature = temperatureValue + 273.15;
            temperature = `${temperature.toFixed(2)} K`; 
            kelvinDiv.style.display = 'block';      
            break;
        case 'fahrenheit':
            temperature = (temperatureValue * 9/5) + 32;
            temperature = `${temperature.toFixed(2)} °F`;
            fahrenheitDiv.style.display = 'block';
            break;
        default: // Celsius
            temperature = `${temperatureValue.toFixed(2)} °C`;     
            celsiusDiv.style.display = 'block';
            break;
    }
    
    tempUpdate.textContent = temperature;
    humidUpdate.textContent = humidityValue + ' %';


    // Change the tempDescription text and style based on the temperature value
    if (temperatureValue >= 0 && temperatureValue <= 10) {
        // Cold
        tempDescription.textContent = 'Cold, wear warm clothes.';
        tempDescription.style.color = '#00BFFF'; // Text color
        tempDescription.style.backgroundColor = '#E0F7FF'; // Background color (optional)
    } else if (temperatureValue >= 11 && temperatureValue <= 20) {
        // Cool
        tempDescription.textContent = 'Cool, light outerwear needed.';
        tempDescription.style.color = '#009aa5'; // Text color
        tempDescription.style.backgroundColor = '#DFF7F7'; // Background color (optional)
    } else if (temperatureValue >= 21 && temperatureValue <= 30) {
        // Warm
        tempDescription.textContent = 'Warm, comfortable ideal weather.';
        tempDescription.style.color = '#ffc400'; // Text color
        tempDescription.style.backgroundColor = '#FFF4D2'; // Background color (optional)
    } else if (temperatureValue >= 31) {
        // Hot
        tempDescription.textContent = 'Hot, avoid heat exposure.';
        tempDescription.style.color = '#FF4500'; // Text color
        tempDescription.style.backgroundColor = '#FFE0D6'; // Background color (optional)
    } else {
        // Default in case of invalid temperature
        tempDescription.textContent = '--';
        tempDescription.style.color = '#000'; // Default text color
        tempDescription.style.backgroundColor = '#FFF'; // Default background color
    }

    if (humidityValue >= 0 && humidityValue <= 30) {
        // Dry
        humidDescription.textContent = 'Dry, very low moisture.';
        humidDescription.style.color = '#00BFFF'; // Text color
        humidDescription.style.backgroundColor = '#E0F7FF'; // Background color (optional)
    } else if (humidityValue >= 31 && humidityValue <= 50) {
        // Comfortable
        humidDescription.textContent = 'Comfortable, ideal moisture level.';
        humidDescription.style.color = '#009aa5'; // Text color
        humidDescription.style.backgroundColor = '#DFF7F7'; // Background color (optional)
    } else if (humidityValue >= 51 && humidityValue <= 70) {
        // Humid
        humidDescription.textContent = 'Humid, noticeable moisture in the air.';
        humidDescription.style.color = '#FFD700'; // Text color
        humidDescription.style.backgroundColor = '#FFF7E0'; // Background color (optional)
    } else if (humidityValue >= 71) {
        // Very Humid
        humidDescription.textContent = 'Very Humid, sticky and heavy air.';
        humidDescription.style.color = '#FF6347'; // Text color
        humidDescription.style.backgroundColor = '#FFE0D6'; // Background color (optional)
    } else {
        // Default case for invalid humidity
        humidDescription.textContent = 'Humidity: --';
        humidDescription.style.color = '#000'; // Default text color
        humidDescription.style.backgroundColor = '#FFF'; // Default background color
    }
}




setInterval(updateValueAct1, 500);