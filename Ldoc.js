const videos = [
    {   
        id: 1, 
        name: "He Spent 40 Years Alone in the Woods,", 
        artist: "and Now Scientists Love Him", 
        img: "40YearsIntheWoodsPic.jpg", 
        video: "He Spent 40 Years Alone in the Woods- (720p, h264, youtube).mp4" 
    },
    {   
        id: 2, 
        name: "109-Year-Old Veteran and", 
        artist: " His Secrets to Life", 
        img: "109-Year-Old-Veteran-Pic.jpg", 
        video: "109-Year-Old Veteran and His Secrets to Life.mp4" 
    },
];

const searchInput = document.getElementById("search-input");
const videoList = document.getElementById("video-list");
const videoPlayer = document.getElementById("video-player");
const videoSource = document.getElementById("video-source");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const randomButton = document.getElementById("random-button");
const playPauseButton = document.getElementById("play-pause-button");
const progressBar = document.getElementById("progress-bar");
const volumeSlider = document.getElementById("volume-slider");
const muteButton = document.getElementById("mute-button");

let isPlaying = false;
let currentVideoId = null;
let isMuted = false;

// Load the notification sound
const notificationSound = new Audio('notification.mp3'); // Replace with the path to your sound file

function renderVideos(filteredVideos = videos) {
    videoList.innerHTML = "";

    filteredVideos.forEach(video => {
        const videoItem = document.createElement("div");
        videoItem.classList.add("video-item");
        videoItem.dataset.videoId = video.id;
        videoItem.innerHTML = `
            <img src="${video.img}" alt="${video.name}">
            <span>${video.name} - ${video.artist}</span>
            <button class="play-button"><i class="fas fa-play"></i></button>
        `;
        const playButton = videoItem.querySelector(".play-button");
        playButton.addEventListener("click", () => {
            playOrPauseVideo(video, playButton);
        });

        videoList.appendChild(videoItem);
    });
}

function playOrPauseVideo(video, button) {
    if (isPlaying && currentVideoId === video.id) {
        videoPlayer.pause();
        button.querySelector("i").classList.replace("fa-pause", "fa-play");
        playPauseButton.querySelector("i").classList.replace("fa-pause", "fa-play");
        isPlaying = false;
    } else {
        videoSource.src = video.video;
        videoSource.dataset.videoId = video.id;
        videoPlayer.load();
        videoPlayer.play();
        button.querySelector("i").classList.replace("fa-play", "fa-pause");
        playPauseButton.querySelector("i").classList.replace("fa-play", "fa-pause");
        isPlaying = true;
        currentVideoId = video.id;
    }
}

videoPlayer.addEventListener("ended", function() {
    const currentVideoIndex = videos.findIndex(video => video.id === parseInt(videoSource.dataset.videoId));
    const nextVideoIndex = (currentVideoIndex + 1) % videos.length;
    playOrPauseVideo(videos[nextVideoIndex], document.querySelector(`[data-video-id="${videos[nextVideoIndex].id}"] .play-button`));
});

function playNextVideo() {
    const currentVideoIndex = videos.findIndex(video => video.id === parseInt(videoSource.dataset.videoId));
    const nextVideoIndex = (currentVideoIndex + 1) % videos.length;
    playOrPauseVideo(videos[nextVideoIndex], document.querySelector(`[data-video-id="${videos[nextVideoIndex].id}"] .play-button`));
}

function playPrevVideo() {
    const currentVideoIndex = videos.findIndex(video => video.id === parseInt(videoSource.dataset.videoId));
    const prevVideoIndex = (currentVideoIndex - 1 + videos.length) % videos.length;
    playOrPauseVideo(videos[prevVideoIndex], document.querySelector(`[data-video-id="${videos[prevVideoIndex].id}"] .play-button`));
}

function playRandomVideo() {
    const randomIndex = Math.floor(Math.random() * videos.length);
    playOrPauseVideo(videos[randomIndex], document.querySelector(`[data-video-id="${videos[randomIndex].id}"] .play-button`));
}

prevButton.addEventListener("click", playPrevVideo);
nextButton.addEventListener("click", playNextVideo);
randomButton.addEventListener("click", playRandomVideo);

// Handle play/pause button toggle
playPauseButton.addEventListener("click", () => {
    if (isPlaying) {
        videoPlayer.pause();
        playPauseButton.querySelector("i").classList.replace("fa-pause", "fa-play");
        isPlaying = false;
    } else {
        if (currentVideoId === null) {
            // If no video is playing, start the first video
            playOrPauseVideo(videos[0], document.querySelector(`[data-video-id="${videos[0].id}"] .play-button`));
        } else {
            videoPlayer.play();
            playPauseButton.querySelector("i").classList.replace("fa-play", "fa-pause");
            isPlaying = true;
        }
    }
});

// Progress Bar update
videoPlayer.addEventListener("timeupdate", () => {
    if (videoPlayer.duration) {
        const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        progressBar.value = progress;
    }
});

// Seek functionality
progressBar.addEventListener("click", (event) => {
    const seekTime = (event.offsetX / progressBar.offsetWidth) * videoPlayer.duration;
    videoPlayer.currentTime = seekTime;
});

// Handle volume control slider
volumeSlider.addEventListener("input", (event) => {
    videoPlayer.volume = event.target.value;
});

// Handle mute/unmute button
muteButton.addEventListener("click", () => {
    if (isMuted) {
        videoPlayer.muted = false;
        volumeSlider.value = videoPlayer.volume;
        muteButton.querySelector("i").classList.replace("fa-volume-mute", "fa-volume-up");
    } else {
        videoPlayer.muted = true;
        muteButton.querySelector("i").classList.replace("fa-volume-up", "fa-volume-mute");
    }
    isMuted = !isMuted;
});

videoPlayer.addEventListener("play", () => {
    playPauseButton.querySelector("i").classList.replace("fa-play", "fa-pause");
    isPlaying = true;
});

videoPlayer.addEventListener("pause", () => {
    playPauseButton.querySelector("i").classList.replace("fa-pause", "fa-play");
    isPlaying = false;
});

renderVideos();

// Search functionality
searchInput.addEventListener("input", function() {
    const searchQuery = searchInput.value.toLowerCase();

    const filteredVideos = videos.filter(video =>
        video.name.toLowerCase().includes(searchQuery) ||
        video.artist.toLowerCase().includes(searchQuery)
    );

    renderVideos(filteredVideos);

    // Play the sound if videos are found
    if (filteredVideos.length > 0) {
        notificationSound.play(); // Play sound when search results are available
    }
});

// ////Voice Search Functionality//////////////////////////////
const voiceSearchButton = document.getElementById("voice-search-button");

// Check if the SpeechRecognition API is available
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "es-ES"; // Set language for recognition (you can change this to other languages)
    recognition.continuous = false; // Only listen for a single command
    recognition.interimResults = false; // No need for interim results

    // Function to start the voice recognition when the button is clicked
    voiceSearchButton.addEventListener("click", () => {
        recognition.start();
    });
     
    ////Notification Sound/////
    const notificationSound = new Audio('Cut-Voice-Notification-Sound.mp3'); // Notification sound path
    recognition.addEventListener("result", (event) => {
        let transcript = event.results[0][0].transcript.toLowerCase(); // Convert to lowercase to match the video names/artists
        transcript = transcript.replace(/\.$/, ""); // Remove the period if it's at the end of the string
       
        searchInput.value = transcript; // Set the search input to the recognized speech

        // Filter the videos based on the recognized voice input
        const filteredVideos = videos.filter(video =>
            video.name.toLowerCase().includes(transcript) ||
            video.artist.toLowerCase().includes(transcript)
        );

        renderVideos(filteredVideos); // Render the filtered video list

        // Play the sound notification if videos are found
        if (filteredVideos.length > 0) {
            notificationSound.play(); // Play sound if matches are found
        } else {
            // Play a different sound if no videos match
            notificationSound.play();
        }
    });

    // Handle speech recognition errors
    recognition.addEventListener("error", (event) => {
        console.error("Speech recognition error:", event.error);
    });

    // Optionally, handle the end of recognition
    recognition.addEventListener("end", () => {
        console.log("Voice search ended");
    });
} else {
    console.error("Sorry, your browser does not support voice recognition");
}

// Lights Section //////////////////////////////////
function toggleClassPlayer(){

    const body = document.querySelector('body');
    body.classList.toggle('lightPlayer');
    
    }

//////Hide And Show Section //////////

const myButton = document.getElementById("HideShow-Btn");
const myImg = document.getElementById("video-player");

myButton.addEventListener("click", event => {

   if
   (myImg.style.display === "none"){
    myImg.style.display = "block";
    myButton.textContent ="Hide Screen";
     }
   else{
        myImg.style.display = "none";
        myButton.textContent = "Screen";
}   
});