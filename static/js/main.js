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