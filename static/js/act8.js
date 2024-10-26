document.addEventListener('DOMContentLoaded', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech Recognition API is not supported in this browser.");
        return; // Exit if the API is not supported
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false; // Set to true for partial results
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        document.getElementById("input-textarea").value += speechResult + ' '; // Append the result to the textarea
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
        console.log("Speech recognition ended.");
    };

    const talkButton = document.getElementById("talkButton");
    talkButton.addEventListener("mousedown", () => {
        recognition.start(); // Start recognition on button press
        talkButton.textContent = "Listening...";
        talkButton.style.backgroundColor = 'rgb(255, 142, 185)';
    });

    talkButton.addEventListener("mouseup", () => {
        recognition.stop(); // Stop recognition on button release
        talkButton.textContent = "Push to talk";
        talkButton.style.backgroundColor = '#1aaab2';
    });

    // Get reference to audio player
    const audioPlayer = document.getElementById('audioPlayer');

    // Seek functions
    function seekForward() {
        audioPlayer.currentTime += 10; // Seek forward by 10 seconds
    }

    function seekBackward() {
        audioPlayer.currentTime -= 10; // Seek backward by 10 seconds
    }

    // Attach event listeners to the seek buttons
    const seekBackwardBtn = document.getElementById('backward');
    const seekForwardBtn = document.getElementById('forward');

    seekBackwardBtn.addEventListener('click', seekBackward);
    seekForwardBtn.addEventListener('click', seekForward);

    // Loop toggle functionality
    const loopToggle = document.getElementById('loop-toggle');
    let isLoop = false;

    function loopAudio() {
        isLoop = !isLoop;
        audioPlayer.loop = isLoop;
        loopToggle.style.backgroundColor = isLoop ? '#00a3ac' : ''; // Toggle background color
    }

    loopToggle.addEventListener('click', loopAudio);

    // Playback speed control
    const playbackSpeedSlider = document.getElementById('playbackSpeed');
    const speedValueDisplay = document.getElementById('speedValue');

    playbackSpeedSlider.addEventListener('input', () => {
        audioPlayer.playbackRate = playbackSpeedSlider.value; // Set playback speed
        speedValueDisplay.textContent = `${playbackSpeedSlider.value}x`; // Update displayed speed
    });


    document.getElementById('generateSpeech').addEventListener('click', function() {
        const textareaValue = document.getElementById('input-textarea').value;
        const selectValue = document.getElementById('mySelect').value;
        
        const inappropriateWords = ['badword1', 'badword2', 'badword3']; // List of inappropriate words
    
        // Check if any inappropriate words are found
        const foundWords = inappropriateWords.filter(word => textareaValue.includes(word));
    
        // Display a message based on the result
        const messageElement = document.getElementById('message');
        if (foundWords.length > 0) {
            messageElement.textContent = `Inappropriate words found: ${foundWords.join(', ')}`;
            messageElement.style.color = 'red';

            const data = {
                textarea: 'BADWORD DETECTED',
                select: selectValue
            };
    
            // Send data to Flask using fetch
            fetch('/txtPython', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        } else {
            messageElement.textContent = ''; // Clear the message
    
            // Create a data object to send
            const data = {
                textarea: textareaValue,
                select: selectValue
            };
    
            // Send data to Flask using fetch
            fetch('/txtPython', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    });
    
    

});
