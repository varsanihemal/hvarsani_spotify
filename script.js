document.addEventListener("DOMContentLoaded", async () => {
    let currentSong = new Audio;
    let songs;
    let crrFolder;

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return "00:00";
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');

        return `${formattedMinutes}:${formattedSeconds}`;
    }

    async function getSongs(folder) {
        crrFolder = folder;
        let a = await fetch(`${folder}/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/${folder}/`)[1]);
            }
        }

        let songUL = document.querySelector(".songList ul");
        songUL.innerHTML = "";
        for (const song of songs) {
            let decodedSong = decodeURIComponent(song);
            songUL.innerHTML += `<li><img class="invert" src="img/music.svg" alt="">
                                    <div class="info">
                                        <p class="">${decodedSong}</p>
                                        <p class="">Hemal</p>
                                    </div>
                                    <div class="playnow">
                                        <span>Play Now</span>
                                        <img class="invert" src="img/play.svg" alt="">
                                    </div></li>`;
        }

        Array.from(document.querySelectorAll(".songList li")).forEach(e => {
            e.addEventListener("click", element => {
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            });
        });

        return songs;
    }

    const playMusic = (track, pause = false) => {
        currentSong.src = `/${crrFolder}/` + track;
        if (!pause) {
            currentSong.play();
            document.getElementById("play").src = "img/pause.svg";
        }
        document.querySelector(".song-info").innerHTML = `<p>${decodeURI(track)}</p>`;
        document.querySelector(".song-time").innerHTML = "00:00/00:00";
    }

    async function displayAlbums() {
        let a = await fetch(`songs/`);
        let response = await a.text();
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");
        let array = Array.from(anchors);

        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            if (e.href.includes("/songs/")) {
                let folderIndex = e.href.indexOf("/songs/") + 7;
                let folder = e.href.substring(folderIndex);

                if (folder && folder.trim() && folder !== "songs") {
                    try {
                        let infoUrl = `songs/${folder}/info.json`;
                        let infoResponse = await fetch(infoUrl);

                        let response = await infoResponse.json();

                        cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card">
                            <div class="play">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" fill="#000000" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <img src="songs/${folder}/cover.jpg" alt="">
                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>`;
                    } catch (error) {
                        console.error("Error parsing JSON:", error);
                    }
                }
            }
        }

        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0]);
            });
        });
    }

    async function main() {
        // grabbing the list
        await getSongs("songs/Love");
        playMusic(songs[0], true);

        await displayAlbums();
        let playPauseButton = document.getElementById("play");
        playPauseButton.addEventListener("click", () => {
            if (currentSong.paused) {
                playMusic(decodeURIComponent(currentSong.src.split('/').pop()));
            } else {
                playMusic(decodeURIComponent(currentSong.src.split('/').pop()), true);
                currentSong.pause();
                playPauseButton.src = "img/play.svg";
            }
        });

        currentSong.addEventListener("timeupdate", () => {
            const currentTime = currentSong.currentTime;
            const duration = currentSong.duration;
            document.querySelector(".song-time").innerHTML = `${formatTime(currentTime)}/${formatTime(duration)}`;
        });
    }

    main();
});
