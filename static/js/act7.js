document.addEventListener('DOMContentLoaded', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        const startBtn = document.getElementById('start-btn');
        const output = document.getElementById('textpanel');
        const feedback = document.getElementById('commandFeedback');

        // LED elements
        const leds = {
            green: document.getElementById('indicatorGreen'),
            red: document.getElementById('indicatorRed'),
            yellow: document.getElementById('indicatorYellow'),
            blue: document.getElementById('indicatorBlue'),
            white: document.getElementById('indicatorWhite'),
            rgb: document.getElementById('indicatorRGB')
        };

        // Blink intervals map to control each LED's blink process
        let blinkIntervals = {};

        // Load LED statuses from local storage
        loadLedStatuses();

        startBtn.addEventListener('mousedown', () => {
            recognition.start();
            startBtn.textContent = "Listening...";
            output.textContent = "";
            startBtn.style.backgroundColor = 'rgb(255, 142, 185)';
        });

        startBtn.addEventListener('mouseup', () => {
            recognition.stop();
            startBtn.textContent = "Push to talk";
            startBtn.style.backgroundColor = '#1aaab2';
        });

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript.toLowerCase();
            if (handleVoiceCommand(speechResult)) {                
                output.textContent = speechResult.toUpperCase();
                feedback.textContent = ''
            } else {
                output.textContent = speechResult.toUpperCase();
                feedback.textContent = errorReason
            }
        };

        recognition.onerror = (event) => {
            output.textContent = `Error occurred: ${event.error}`;
        };

        let errorReason = '';

        function handleVoiceCommand(command) {
            const turnOnOffRegex = /turn (green|red|yellow|blue|white|rgb|all) led (on|off)/;
            const changeRGBColorRegex = /change rgb to (green|red|yellow|blue|white)/;
            const blinkStartRegex = /blink (green|red|yellow|blue|white|rgb|all) led/;
            const blinkStopRegex = /stop blink (green|red|yellow|blue|white|rgb|all) led/;

            const validColor = ['green', 'red', 'blue', 'white', 'yellow', 'rgb'];
            const validRGB = ['green', 'red', 'blue'];

            // Match 'Turn [color] LED on/off' or 'Turn all LEDs on/off'
            const turnOnOffMatch = command.match(turnOnOffRegex);
            if (turnOnOffMatch) {
                const color = turnOnOffMatch[1];
                const action = turnOnOffMatch[2];
                if (color === 'all') {
                    toggleAllLeds(action);
                    return true;
                } else {
                    if (!validColor.includes(color)) {
                        errorReason = `Invalid Command: ${color} is not a valid color.`;
                        return false;
                    } else {                        
                        toggleLed(leds[color], color, action);
                        return true;
                    }
                }
            }

            // Handle 'change rgb to [color]' command
            const changeRGBMatch = command.match(changeRGBColorRegex);
            if (changeRGBMatch) {
                const color = changeRGBMatch[1];
                if (validRGB.includes(color)) {
                    changeRGBLed(color);
                    return true;
                } else {
                    errorReason = `Invalid Command: ${color} is not a valid RGB color.`;
                    return false;
                }
            }

            // Match 'Blink [color] LED' or 'Blink all LEDs'
            const blinkStartMatch = command.match(blinkStartRegex);
            if (blinkStartMatch) {
                const color = blinkStartMatch[1];
                if (color === 'all') {
                    startBlinkingAll();
                } else if (color === 'rgb') {                        
                    startBlinking(leds[color], color);
                } else if (!validColor.includes(color)) {
                    errorReason = `Invalid Command: ${color} is not a valid color.`;
                    return false;
                } else {
                    startBlinking(leds[color], color);
                }
                return true; // Moved outside the conditionals for clarity
            }

            // Match 'Stop blink [color] LED' or 'Stop blink all LEDs'
            const blinkStopMatch = command.match(blinkStopRegex);
            if (blinkStopMatch) {
                const color = blinkStopMatch[1];
                if (color === 'all') {
                    stopBlinkingAll();
                } else if (color === 'rgb') {                        
                    stopBlinking(leds[color], color);
                } else if (!validColor.includes(color)) {
                    errorReason = `Invalid Command: ${color} is not a valid color.`;
                    return false;
                } else {                        
                    stopBlinking(leds[color], color);
                }
                return true; // Moved outside the conditionals for clarity
            }

            errorReason = 'Invalid Command: No matching command found.';
            return false;
        }

        function toggleLed(ledElement, color, action) {
            if (action === 'on') {
                // Clear any existing blink interval when turning the LED on
                if (blinkIntervals[color]) {
                    clearInterval(blinkIntervals[color]);
                    blinkIntervals[color] = null;
                }
                ledElement.style.opacity = '1';  // Turn on the LED
                saveLedStatus(color, 'on');
            } else if (action === 'off') {
                // Stop blinking if the LED is set to off
                if (blinkIntervals[color]) {
                    clearInterval(blinkIntervals[color]);
                    blinkIntervals[color] = null;
                }
                ledElement.style.opacity = '0.3';  // Turn off the LED
                saveLedStatus(color, 'off');
            }
        }

        function toggleAllLeds(action) {
            for (const color in leds) {
                toggleLed(leds[color], color, action);
            }
        }

        function changeRGBLed(color) {
            const rgbColors = {
                green: 'green',
                red: 'red',
                blue: 'blue'
            };

            // Only allow changing to red, blue, or green
            if (rgbColors[color]) {
                leds.rgb.style.backgroundColor = rgbColors[color];
                localStorage.setItem('rgbColor', color);  // Save the selected RGB LED color
                // Do not change rgbStatus here
            }
        }

        function startBlinking(ledElement, color) {
            // If the LED is already blinking, do nothing
            if (blinkIntervals[color]) return;

            blinkIntervals[color] = setInterval(() => {
                ledElement.style.opacity = (ledElement.style.opacity === '1') ? '0.3' : '1';
            }, 500);  // Blink every 500ms
            saveLedStatus(color, 'blinking');  // Save blinking status
        }

        function startBlinkingAll() {
            for (const color in leds) {
                startBlinking(leds[color], color);
            }
        }

        function stopBlinking(ledElement, color) {
            // Clear the interval to stop blinking
            if (blinkIntervals[color]) {
                clearInterval(blinkIntervals[color]);
                blinkIntervals[color] = null;
            }
            ledElement.style.opacity = '1';  // Ensure the LED stays on
            saveLedStatus(color, 'on');  // Reset to 'on' after blinking stops
        }

        function stopBlinkingAll() {
            for (const color in leds) {
                stopBlinking(leds[color], color);
            }
        }

        // Save the status of a specific LED to local storage
        function saveLedStatus(color, status) {
            localStorage.setItem(`led-${color}`, status);
            if (color === 'rgb') {
                localStorage.setItem('rgbStatus', status);
            }
        }

        // Load the saved status of the LEDs and apply them
        function loadLedStatuses() {
            for (const color in leds) {
                const status = localStorage.getItem(`led-${color}`);
                if (status === 'on') {
                    leds[color].style.opacity = '1';
                } else if (status === 'off') {
                    leds[color].style.opacity = '0.3';
                } else if (status === 'blinking') {
                    startBlinking(leds[color], color);
                }

                // Handle RGB LED color and status
                if (color === 'rgb') {
                    const rgbColor = localStorage.getItem('rgbColor') || 'green';
                    leds.rgb.style.backgroundColor = rgbColor;

                    // Ensure RGB status reflects current state
                    const rgbStatus = localStorage.getItem('rgbStatus') || 'off';
                    if (rgbStatus === 'on') {
                        leds.rgb.style.opacity = '1';
                    } else if (rgbStatus === 'off') {
                        leds.rgb.style.opacity = '0.3';
                    }
                }
            }
        }

        function getLedStatusesAsJson() {
            const ledStatuses = {};

            for (const color in leds) {
                let status = localStorage.getItem(`led-${color}`) || 'off';

                // Handle RGB separately to include the color
                if (color === 'rgb') {
                    ledStatuses['rgbColor'] = localStorage.getItem('rgbColor') || 'green';
                    ledStatuses['rgbStatus'] = localStorage.getItem('rgbStatus') || (blinkIntervals['rgb'] ? 'blinking' : 'off');
                } else {
                    ledStatuses[color] = status;
                }
            }

            return JSON.stringify(ledStatuses, null, 2);  // Pretty print JSON
        }

        function postLedStatuses() {
            const ledStatusesJson = getLedStatusesAsJson();

            // Post the JSON to the /led-status route
            fetch('/led-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: ledStatusesJson
            })
            .then(response => {
                if (response.ok) {
                    console.log('LED statuses successfully posted!');
                } else {
                    console.log('Failed to post LED statuses.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
        
        // Example: Call this function when needed
        setInterval(postLedStatuses, 1000);
    } else {
        alert("Sorry, your browser doesn't support speech recognition.");
    }
});
