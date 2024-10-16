let accelX;
let accelY;
let accelZ;
let gyroX;
let gyroY;
let gyroZ;
let latitude;
let longitude;
let altitude;


let emailStatus;

function fetchData() {
    fetch('/data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            accelX = data.accel_x;
            accelY = data.accel_y;
            accelZ = data.accel_z;
            gyroX = data.gyro_x;
            gyroY = data.gyro_y;
            gyroZ = data.gyro_z;
            latitude = data.latitude;
            longitude = data.longitude;
            altitude = data.altitude;
            emailStatus = data.email;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            accelX = 0;
            accelY = 0;
            accelZ = 0;
            gyroX = 0;
            gyroY = 0;
            gyroZ = 0;
            latitude = 0;
            longitude = 0;
            altitude = 0;
            emailStatus = False;
        });


        // Show popup if emailStatus is true and it's a new event
        if (emailStatus && !previousWarningState) {
            showPopup();
        }

        // Update the previous warning state
        previousWarningState = emailStatus;
}
setInterval(fetchData, 500);

function getCardinalDirections(lat, lng) {
    const latDirection = lat >= 0 ? 'N' : 'S';
    const lngDirection = lng >= 0 ? 'E' : 'W';
    
    // Format the latitude and longitude values to 5 decimal places
    const formattedLatitude = Math.abs(lat).toFixed(5);
    const formattedLongitude = Math.abs(lng).toFixed(5);
    
    return `${formattedLatitude},${latDirection},${formattedLongitude},${lngDirection}`;
}

// Convert decimal degrees to DMS format
function toDMS(degrees) {
    const d = Math.floor(Math.abs(degrees));
    const minFloat = (Math.abs(degrees) - d) * 60;
    const m = Math.floor(minFloat);
    const s = ((minFloat - m) * 60).toFixed(1);
    return `${d}°${m}'${s}"`;
}

function postData() {
    // Get formatted coordinates with cardinal directions
    const formattedCoordinates = getCardinalDirections(latitude, longitude);
    const [formattedLat, latDir, formattedLng, lngDir] = formattedCoordinates.split(',');

    // Update the GPS data display
    document.getElementById('longi').textContent = longitude;
    document.getElementById('lati').textContent = latitude;

    // Convert to DMS format
    const dmsLat = toDMS(latitude) + latDir;
    const dmsLng = toDMS(longitude) + lngDir;

    // Display the DMS coordinates in a different element
    document.getElementById('dmsCoordinates').textContent = `${dmsLat} ${dmsLng}`;

    // Accelerometer
    document.getElementById('acceX').textContent = 'X: ' + accelX.toFixed(3) + 'g';
    document.getElementById('acceY').textContent = 'Y: ' + accelY.toFixed(3) + 'g';
    document.getElementById('acceZ').textContent = 'Z: ' + accelZ.toFixed(3) + 'g';

    // Gyroscope
    document.getElementById('gyroX').textContent = 'X: ' + gyroX.toFixed(3) + '°/s';
    document.getElementById('gyroY').textContent = 'Y: ' + gyroY.toFixed(3) + '°/s';
    document.getElementById('gyroZ').textContent = 'Z: ' + gyroZ.toFixed(3) + '°/s';
}

setInterval(postData, 500);


function validateEmail() {
    var email = document.getElementById("email").value;
    var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Validate the email format
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
        error: function(xhr) {
            var errorMessage = xhr.responseJSON ? xhr.responseJSON.message : "Error saving email.";
            alert(errorMessage);
        }
    });
}

// Add event listener to form submission
$(document).ready(function() {
    $('#emailForm').on('submit', function(e) {
        e.preventDefault();  // Prevent default form submission
        validateEmail();     // Call the email validation and submission
    });
});


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
