// SCRIPT FOR GAUGE
let distance1Gauge; // Declare gauge variable for sound
let distance2Gauge; // Declare gauge variable for rain

let distance1;
let distance2;


document.addEventListener("DOMContentLoaded", function(event) {
    // Initialize JustGage for sound
    distance1Gauge = new JustGage({
        id: 'distanceGauge1',
        value: distance1,
        hideValue: true,
        min: 0,
        max: 400,
        pointer: true,
        gaugeWidthScale: 1,
        counter: true
    });

    // Initialize JustGage for rain
    distance2Gauge = new JustGage({
        id: 'distanceGauge2',
        value: distance2,
        hideValue: true,
        min: 0,
        max: 400,
        pointer: true,
        gaugeWidthScale: 1,
        counter: true
    });

});

async function updateValueAct2() {        
    try {
        const response = await fetch('/data');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Store the data into variables
        distance1 = data.Distance1;
        distance2 = data.Distance2;

    } catch (error) {
        console.error('Error fetching data:', error);
        
        distance1 = 'NaN';
        distance2 = 'NaN';
    } 

    const distance1Update = document.getElementsByClassName('distanceValue1')[0];
    const distance2Update = document.getElementsByClassName('distanceValue2')[0];
   
    
    const cmDiv = document.getElementById('cm');
    const mmDiv = document.getElementById('mm');
    const mDiv = document.getElementById('m');
    const kmDiv = document.getElementById('km');
    const inDiv = document.getElementById('in');
    const ftDiv = document.getElementById('ft');
    const ydDiv = document.getElementById('yd');
    const miDiv = document.getElementById('mi');


    cmDiv.style.display = 'none';
    mmDiv.style.display = 'none';
    mDiv.style.display = 'none';
    kmDiv.style.display = 'none';
    inDiv.style.display = 'none';
    ftDiv.style.display = 'none';
    ydDiv.style.display = 'none';
    miDiv.style.display = 'none';

    // Get the selected unit from the dropdown
    const unit = document.getElementById('unit-distance').value;

    let distance1R;
    let distance2R;

    switch (unit) {
        case 'mm':
            distance1R = distance1 * 10; // 1 cm = 10 mm
            distance1R = `${distance1R.toFixed(2)} mm`;
            distance2R = distance2 * 10; // 1 cm = 10 mm
            distance2R = `${distance2R.toFixed(2)} mm`;
            mmDiv.style.display = 'block';   
            break;
        case 'cm':
            distance1R = `${distance1.toFixed(2)} cm`; // Already in cm
            distance2R = `${distance2.toFixed(2)} cm`; // Already in cm
            cmDiv.style.display = 'block';   
            break;
        case 'meter':
            distance1R = distance1 / 100; // 1 m = 100 cm
            distance1R = `${distance1R.toFixed(2)} m`;
            distance2R = distance2 / 100; // 1 m = 100 cm
            distance2R = `${distance2R.toFixed(2)} m`;
            mDiv.style.display = 'block';   
            break;
        case 'km':
            distance1R = distance1 / 100000; // 1 km = 100000 cm
            distance1R = `${distance1R.toFixed(6)} km`;
            distance2R = distance2 / 100000; // 1 km = 100000 cm
            distance2R = `${distance2R.toFixed(6)} km`;
            kmDiv.style.display = 'block';   
            break;
        case 'inch':
            distance1R = distance1 * 0.393701; // 1 cm = 0.393701 inches
            distance1R = `${distance1R.toFixed(2)} in`;
            distance2R = distance2 * 0.393701; // 1 cm = 0.393701 inches
            distance2R = `${distance2R.toFixed(2)} in`;
            inDiv.style.display = 'block';   
            break;
        case 'feet':
            distance1R = distance1 * 0.0328084; // 1 cm = 0.0328084 feet
            distance1R = `${distance1R.toFixed(2)} ft`;
            distance2R = distance2 * 0.0328084; // 1 cm = 0.0328084 feet
            distance2R = `${distance2R.toFixed(2)} ft`;
            ftDiv.style.display = 'block';   
            break;
        case 'yard':
            distance1R = distance1 * 0.0109361; // 1 cm = 0.0109361 yards
            distance1R = `${distance1R.toFixed(2)} yd`;
            distance2R = distance2 * 0.0109361; // 1 cm = 0.0109361 yards
            distance2R = `${distance2R.toFixed(2)} yd`;
            ydDiv.style.display = 'block';   
            break;
        case 'mile':
            distance1R = distance1 * 0.0000062137; // 1 cm = 0.0000062137 miles
            distance1R = `${distance1R.toFixed(6)} mi`;
            distance2R = distance2 * 0.0000062137; // 1 cm = 0.0000062137 miles
            distance2R = `${distance2R.toFixed(6)} mi`;
            miDiv.style.display = 'block';   
            break;
        default:
            distance1R = `${distance1.toFixed(2)} cm`; // Default to cm if no match
            distance2R = `${distance2.toFixed(2)} cm`;
            cmDiv.style.display = 'block';   
            break;
    }

    distance1Update.textContent = distance1R
    distance2Update.textContent = distance2R

    const distance1Description = document.getElementsByClassName('holderDesc distanceDescription1')[0];

    // Assuming you have a variable named distanceValue1 that contains the distance
    if (distance1 >= 0 && distance1 <= 10) {
        // Very Close
        distance1Description.textContent = 'Very Close';
        distance1Description.style.color = '#FF4500'; // Text color
        distance1Description.style.backgroundColor = '#FFD3D3'; // Background color (optional)
    } else if (distance1 >= 11 && distance1 <= 50) {
        // Close
        distance1Description.textContent = 'Close';
        distance1Description.style.color = '#FFD700'; // Text color
        distance1Description.style.backgroundColor = '#FFF7E0'; // Background color (optional)
    } else if (distance1 >= 51 && distance1 <= 100) {
        // Moderate
        distance1Description.textContent = 'Moderate';
        distance1Description.style.color = '#00BFFF'; // Text color
        distance1Description.style.backgroundColor = '#7FFFD4'; // Background color (optional)
    } else if (distance1 > 100) {
        // Far
        distance1Description.textContent = 'Far';
        distance1Description.style.color = '#004ddd'; // Text color
        distance1Description.style.backgroundColor = '#E0F7FF'; // Background color (optional)
    } else {
        // Default case for invalid distance
        distance1Description.textContent = '--';
        distance1Description.style.color = '#000'; // Default text color
        distance1Description.style.backgroundColor = '#FFF'; // Default background color
    }

    const distance2Description = document.getElementsByClassName('holderDesc distanceDescription2')[0];

    // Assuming you have a variable named distanceValue2 that contains the distance
    if (distance2 >= 0 && distance2 <= 10) {
        // Very Close
        distance2Description.textContent = 'Very Close';
        distance2Description.style.color = '#FF4500'; // Text color
        distance2Description.style.backgroundColor = '#FFD3D3'; // Background color (optional)
    } else if (distance2 >= 11 && distance2 <= 50) {
        // Close
        distance2Description.textContent = 'Close';
        distance2Description.style.color = '#FFD700'; // Text color
        distance2Description.style.backgroundColor = '#FFF7E0'; // Background color (optional)
    } else if (distance2 >= 51 && distance2 <= 100) {
        // Moderate
        distance2Description.textContent = 'Moderate';
        distance2Description.style.color = '#00BFFF'; // Text color
        distance2Description.style.backgroundColor = '#7FFFD4'; // Background color (optional)
    } else if (distance2 > 100) {
        // Far
        distance2Description.textContent = 'Far';
        distance2Description.style.color = '#004ddd'; // Text color
        distance2Description.style.backgroundColor = '#E0F7FF'; // Background color (optional)
    } else {
        // Default case for invalid distance
        distance2Description.textContent = '--';
        distance2Description.style.color = '#000'; // Default text color
        distance2Description.style.backgroundColor = '#FFF'; // Default background color
    }

}

setInterval(updateValueAct2, 500)