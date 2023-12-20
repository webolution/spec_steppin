// Declare a variable to hold the audio element
let audio = null;

// Add an event listener to the button with the id "audio"
document.querySelector("#audio").addEventListener("click", async () => {
    // Get a reference to the button
    const button = document.querySelector("#audio");

    // Check if the selectAudioOutput method is available
    if (!navigator.mediaDevices.selectAudioOutput) {
        console.log("selectAudioOutput() not supported or not in secure context.");
        return;
    }

    // If an audio element has already been created
    if (audio) {
        // If the audio is currently playing, pause it and change the button text
        if (!audio.paused) {
            audio.pause();
            button.textContent = "Play Audio";
        } else {
            // If the audio is currently paused, play it and change the button text
            audio.play();
            button.textContent = "Stop Audio";
        }
        // Exit the function since we've handled the audio play/pause functionality
        return;
    }

    // If this is the first time the button has been clicked, prompt the user to select an audio output device
    const audioDevice = await navigator.mediaDevices.selectAudioOutput();

    // Create a new audio element and start playing a sound file
    audio = document.createElement("audio");
    audio.src = "groovin.wav";
    audio.play();

    // Set the output device for the audio to the device selected by the user
    audio.setSinkId(audioDevice.deviceId);

    // Change the button text to indicate that the audio is currently playing
    button.textContent = "Stop Audio";
});
