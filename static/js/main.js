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

    fetch('/save-email', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json' // Send data as JSON
        },
        body: JSON.stringify({ email: email }) // Convert data to JSON string as a key-value pair
    })
    .then(response => response.json()) // Handle the response from Flask
    .then(responseData => { // Using a more descriptive name for the response
        console.log('Success:', responseData); // Process response data here
    })
    .catch((error) => {
        console.error('Error:', error); // Handle any errors here
    });
}
