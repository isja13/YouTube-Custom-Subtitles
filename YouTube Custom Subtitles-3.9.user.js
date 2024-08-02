// ==UserScript==
// @name         YouTube Custom Subtitles
// @namespace    http://tampermonkey.net/
// @version      3.9
// @description  Inject custom subtitles into specific YouTube videos with consistent positioning
// @author       Your Name
// @match        *://www.youtube.com/watch*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let subtitleDiv;
    let resizeTimeout;

    // Define your subtitle paths here
    const subtitlePaths = {
        'TlvJmpiCb3s': 'Galfy4.srt', // First video
        'CqfIEP_JKXE': 'iphone.srt' // Second video
    };

    // Wait for the video element to be available
    function waitForVideo() {
        const video = document.querySelector('video.video-stream.html5-main-video');
        if (video) {
            const videoId = getVideoId();
            if (subtitlePaths[videoId]) {
                addSubtitles(video, subtitlePaths[videoId]);
            } else {
                console.log("No custom subtitles for this video.");
            }
            handleResize(); // Set initial subtitle styles based on current mode
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(handleResize, 100); // Throttle resize
            });
            document.addEventListener('fullscreenchange', () => {
                handleResize();
                simulateResize(); // Simulate resize to ensure proper repositioning
            });
            document.addEventListener('webkitfullscreenchange', () => {
                handleResize();
                simulateResize(); // Simulate resize to ensure proper repositioning
            });
            document.addEventListener('yt-navigate-finish', () => {
                handleResize();
                simulateResize(); // Simulate resize to ensure proper repositioning
            });
            console.log("Video found and subtitle div added.");
        } else {
            setTimeout(waitForVideo, 500);
        }
    }

    // Extract the video ID from the URL
    function getVideoId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('v');
    }

    // Add custom subtitles to the video
    function addSubtitles(video, subtitleFile) {
        var track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = 'Japanese';
        track.srclang = 'ja';
        track.src = `http://127.0.0.1:8000/${subtitleFile}`; // Path to your SRT file
        track.default = true; // Attempt to set as default
        video.appendChild(track);

        console.log("Track added:", track);

        // Create a div for subtitles
        subtitleDiv = document.createElement('div');
        subtitleDiv.id = 'custom-subtitles';
        subtitleDiv.style.position = 'absolute';
        subtitleDiv.style.width = 'auto'; // Set width to auto to fit text
        subtitleDiv.style.maxWidth = '80%'; // Set max width to 80% of the video
        subtitleDiv.style.textAlign = 'center';
        subtitleDiv.style.color = 'white';
        subtitleDiv.style.textShadow = '2px 2px 4px #000';
        subtitleDiv.style.zIndex = '1000';
        subtitleDiv.style.pointerEvents = 'auto'; // Allow interaction with subtitles
        // New styles for background and padding
        subtitleDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Translucent dark gray
        subtitleDiv.style.padding = '0.2em 0.5em'; // Slight padding around text
        subtitleDiv.style.borderRadius = '5px'; // Rounded corners
        document.body.appendChild(subtitleDiv);

        // Load the subtitles from the SRT file
        fetch(track.src)
          .then(response => response.text())
          .then(text => {
            var subtitles = parseSRT(text);
            syncSubtitles(video, subtitles);
          });

        function parseSRT(srt) {
          // Simple SRT parsing function
          var lines = srt.split('\n');
          var entries = [];
          var entry = {};

          lines.forEach(line => {
            if (!line.trim()) {
              if (entry.start) {
                entries.push(entry);
                entry = {};
              }
            } else if (!entry.index) {
              entry.index = line.trim();
            } else if (!entry.start) {
              var times = line.split(' --> ');
              entry.start = timeStringToSeconds(times[0]);
              entry.end = timeStringToSeconds(times[1]);
            } else {
              entry.text = (entry.text ? entry.text + '\n' : '') + line.trim();
            }
          });
          return entries;
        }

        function timeStringToSeconds(timeString) {
          var parts = timeString.split(':');
          var seconds = parseFloat(parts[2].replace(',', '.'));
          seconds += parseInt(parts[1]) * 60;
          seconds += parseInt(parts[0]) * 3600;
          return seconds;
        }

        function syncSubtitles(video, subtitles) {
          video.ontimeupdate = () => {
            var currentTime = video.currentTime;
            var activeSubtitle = subtitles.find(sub => currentTime >= sub.start && currentTime <= sub.end);
            subtitleDiv.textContent = activeSubtitle ? activeSubtitle.text : '';
          };
        }
    }

    // Adjust subtitle styling based on the display mode
    function handleResize() {
        const video = document.querySelector('video.video-stream.html5-main-video');
        if (video) {
            // Recalculate the video's bounding box
            const rect = video.getBoundingClientRect();
            const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
            const isTheater = isTheaterMode();
            const isWindowed = !isFullscreen && !isTheater;

            console.log(`Mode detection - Fullscreen: ${isFullscreen}, Theater: ${isTheater}, Windowed: ${isWindowed}`);

            // Reset all styles
            subtitleDiv.style.left = '';
            subtitleDiv.style.transform = '';
            subtitleDiv.style.bottom = '';
            subtitleDiv.style.fontSize = '';

            // Calculate the left position for centering
            const leftPosition = rect.left + rect.width / 2;

            // Apply styles based on the mode
            if (isFullscreen) {
                applyFullscreenStyles(leftPosition);
            } else if (isTheater) {
                applyTheaterStyles(rect, leftPosition);
            } else if (isWindowed) {
                applyWindowedStyles(rect, leftPosition);
            }
        }
    }

    function applyFullscreenStyles(leftPosition) {
        subtitleDiv.style.fontSize = '3.5em';
        subtitleDiv.style.bottom = '5%'; // Positioned 5% above the bottom of the screen
        subtitleDiv.style.left = `${leftPosition}px`;
        subtitleDiv.style.transform = 'translateX(-50%)';
        console.log("Applied fullscreen styles.");
    }

    function applyTheaterStyles(rect, leftPosition) {
        subtitleDiv.style.fontSize = '2em';
        subtitleDiv.style.bottom = `${(window.innerHeight - rect.bottom) + 30}px`; // Adjust above video controls
        subtitleDiv.style.left = `${leftPosition}px`;
        subtitleDiv.style.transform = 'translateX(-50%)';
        console.log("Applied theater styles.");
    }

    function applyWindowedStyles(rect, leftPosition) {
        subtitleDiv.style.fontSize = '2em';
        subtitleDiv.style.bottom = `${(window.innerHeight - rect.bottom) + 50}px`; // Specific adjustment for windowed mode
        subtitleDiv.style.left = `${leftPosition}px`;
        subtitleDiv.style.transform = 'translateX(-50%)';
        console.log("Applied windowed styles.");
    }

    // Function to detect if the player is in theater mode
    function isTheaterMode() {
        return document.body.classList.contains('ytp-large-width-mode');
    }

    // Function to simulate a window resize event
    function simulateResize() {
        console.log("Simulating resize event.");
        window.dispatchEvent(new Event('resize'));
    }

    // Start the process
    waitForVideo();
})();
