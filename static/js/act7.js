document.addEventListener('DOMContentLoaded', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        const startBtn = document.getElementById('start-btn');
        const output = document.getElementById('textpanel');

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
            output.textContent = "Listening...";
            startBtn.style.backgroundColor = 'rgb(255, 142, 185)';
        });

        startBtn.addEventListener('mouseup', () => {
            recognition.stop();
            startBtn.style.backgroundColor = '#1aaab2';
        });

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript.toLowerCase();
            output.textContent = `You said: ${speechResult}`;
            handleVoiceCommand(speechResult);
        };

        recognition.onerror = (event) => {
            output.textContent = `Error occurred: ${event.error}`;
        };

        function handleVoiceCommand(command) {
            const turnOnOffRegex = /turn (green|red|yellow|blue|white|rgb|all) led (on|off)/;
            const changeRGBColorRegex = /change rgb to (green|red|yellow|blue|white)/;
            const blinkStartRegex = /blink (green|red|yellow|blue|white|rgb|all) led/;
            const blinkStopRegex = /stop blink (green|red|yellow|blue|white|rgb|all) led/;

            // Match 'Turn [color] LED on/off' or 'Turn all LEDs on/off'
            const turnOnOffMatch = command.match(turnOnOffRegex);
            if (turnOnOffMatch) {
                const color = turnOnOffMatch[1];
                const action = turnOnOffMatch[2];
                if (color === 'all') {
                    toggleAllLeds(action);
                } else {
                    toggleLed(leds[color], color, action);
                }
            }

            // Match 'Change RGB to [color]'
            const changeRGBMatch = command.match(changeRGBColorRegex);
            if (changeRGBMatch) {
                const color = changeRGBMatch[1];
                changeRGBLed(color);
            }

            // Match 'Blink [color] LED' or 'Blink all LEDs'
            const blinkStartMatch = command.match(blinkStartRegex);
            if (blinkStartMatch) {
                const color = blinkStartMatch[1];
                if (color === 'all') {
                    startBlinkingAll();
                } else {
                    startBlinking(leds[color], color);
                }
            }

            // Match 'Stop blink [color] LED' or 'Stop blink all LEDs'
            const blinkStopMatch = command.match(blinkStopRegex);
            if (blinkStopMatch) {
                const color = blinkStopMatch[1];
                if (color === 'all') {
                    stopBlinkingAll();
                } else {
                    stopBlinking(leds[color], color);
                }
            }
        }

        function toggleLed(ledElement, color, action) {
            if (action === 'on') {
                ledElement.style.opacity = '1';  // Turn on
                saveLedStatus(color, 'on');
            } else {
                ledElement.style.opacity = '0.3';  // Turn off
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
                yellow: 'yellow',
                blue: 'blue',
                white: 'whitesmoke'
            };
            leds.rgb.style.backgroundColor = rgbColors[color] || 'rgb(214, 0, 221)';  // Default to original RGB color
            saveLedStatus('rgb', color);  // Save RGB LED color
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
            clearInterval(blinkIntervals[color]);
            blinkIntervals[color] = null;
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

                // Handle RGB LED color
                if (color === 'rgb' && status) {
                    leds.rgb.style.backgroundColor = status;
                }
            }
        }

        function getLedStatusesAsJson() {
            const ledStatuses = {};
            for (const color in leds) {
                let status = localStorage.getItem(`led-${color}`);
                if (!status) status = 'off';  // Default to 'off' if no status is found
                ledStatuses[color] = status;
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
        setInterval(postLedStatuses, 500);
    } else {
        alert("Sorry, your browser doesn't support speech recognition.");
    }
});
