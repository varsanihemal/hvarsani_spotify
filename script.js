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

        const formatedMinutes = String(minutes).padStart(2, '0');
        const formatedSeconds = String(remainingSeconds).padStart(2, '0');

        return `${formatedMinutes}:${formatedSeconds}`;
    }

    async function getSongs(folder) {
        crrFolder = folder;
        let a = await fetch(`/${folder}/`);
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

        {/* <p class="">${song.replaceAll("%20", " ")}</p> */ }

        // show all songs
        let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
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

        // Attaching event listener to every song
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
                let folderIndex = e.href.indexOf("/songs/") + 7; // Index of the start of the folder name
                let folder = e.href.substring(folderIndex); // Extract the folder name

                if (folder && folder.trim() && folder !== "songs") {
                    // console.log(folder);

                    // Grab metadata of the folders
                    let infoUrl = `songs/${folder}/info.json`;
                    let infoResponse = await fetch(infoUrl);
                    // console.log(infoResponse);

                    try {
                        let response = await infoResponse.json();
                        // console.log(response);

                        cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card">
                            <div class="play">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" fill="#000000" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <img src="/songs/${folder}/cover.jpg" alt="">
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

        // display all albums
        displayAlbums()

        // Ataching event listener to play, next and previous
        let playButton = document.getElementById("play");
        if (playButton) {
            playButton.addEventListener("click", () => {
                if (currentSong.paused) {
                    currentSong.play();
                    playButton.src = "img/pause.svg";
                } else {
                    currentSong.pause();
                    playButton.src = "img/play.svg";
                }
            });
        } else {
            console.error("Play button not found.");
        }

        // Event listener for when the current song ends
        currentSong.addEventListener("ended", () => {
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1]);
            }
        });

        // listening time update event
        currentSong.addEventListener("timeupdate", () => {
            document.querySelector(".song-time").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
            document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        });

        // add event listener to seek bar
        document.querySelector(".seekbar").addEventListener("click", (e) => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentSong.currentTime = ((currentSong.duration) * percent) / 100;
        })

        // add event listener for burger
        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = "0";
        })

        // add event listener for close
        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-120%"
        })

        // event listener for next and prvs
        previous.addEventListener("click", () => {
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1])
            }
        })

        next.addEventListener("click", () => {
            currentSong.pause()
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1])
            }
        })

        // add event listener to vol
        document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
            currentSong.volume = parseInt(e.target.value) / 100
            if (currentSong.volume > 0) {
                document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
            }
        })

        // Load library depending on user click
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            })
        })

        // add event listener to mute
        document.querySelector(".volume>img").addEventListener("click", e => {
            if (e.target.src.includes("volume.svg")) {
                e.target.src = e.target.src.replace("volume.svg", "mute.svg")
                currentSong.volume = 0;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            } else {
                e.target.src = e.target.src.replace("mute.svg", "volume.svg")
                currentSong.volume = .10;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 10
            }
        })
    }

    await main();
});
