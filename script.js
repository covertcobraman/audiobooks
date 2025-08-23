
let chapterTitle;
let audio;
let select;

let data = { idx: 0, time: 0.0 };

let tracks;
let book;

function getSaveId() {
    return book + "Data"
}

function saveTime() {
    data.time = audio.currentTime;
    console.log("Saving: " + JSON.stringify(data));
    localStorage.setItem(getSaveId(), JSON.stringify(data));
}

function saveIdx() {
    data.time = 0;
    console.log("Saving: " + JSON.stringify(data));
    localStorage.setItem(getSaveId(), JSON.stringify(data));
}

function loadData() {
    let stored = localStorage.getItem(getSaveId());
    data = stored ? JSON.parse(stored) : { idx: 0, time: 0.0 };

    console.log("Loading: " + JSON.stringify(data));
    loadAudio(data.idx);
    audio.currentTime = data.time;
}

function loadBook() {
    book = localStorage.getItem("book") || select.value;
    console.log("Loading: " + book)
    select.value = book;
}

function loadAudio(idx) {
    idx = idx % library[book].tracks.length;
    console.log("Audio load index: " + idx);
    audio.src = library[book].baseUrl + library[book].tracks[idx];
    audio.load();
    chapterTitle.textContent = "Track " + idx;
    data.idx = idx;
}

function loadAudioOffset(offset) {
    let idx = (data.idx + library[book].tracks.length + offset) % library[book].tracks.length;
    loadAudio(idx);
    audio.play();
    saveIdx();
}

function skipAudioTime(offset) {
    audio.currentTime += offset;
    saveTime();
}

function selectBook() {
    book = select.value;
    console.log("Selected book: ", book);
    localStorage.setItem("book", book);
    loadData();
}

function setupSelect() {
    select = document.getElementById("select");
    let keys = Object.keys(library);
    keys.forEach(key => {
        const option = document.createElement("option");
        option.value = key; // value stored when selected
        option.textContent = key; // visible name
        select.appendChild(option);
    });

    select.addEventListener("change", selectBook);
}

function tick() {
    if (audio.paused) return;
    saveTime();
}

function playPauseAudio() {
    if (audio.paused)
        audio.play();
    else
        audio.pause();
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded");
    chapterTitle = document.getElementById("chapterTitle");
    audio = document.getElementById("audio");
    setupSelect();
    let previous = document.getElementById("previous");
    let next = document.getElementById("next");
    let rewind = document.getElementById("rewind");
    let forward = document.getElementById("forward");
    let playPause = document.getElementById("playPause");
    playPause.addEventListener("click", playPauseAudio);
    audio.addEventListener("ended", () => loadAudioOffset(1));
    previous.addEventListener("click", () => loadAudioOffset(-1));
    next.addEventListener("click", () => loadAudioOffset(1));
    rewind.addEventListener("click", () => skipAudioTime(-10));
    forward.addEventListener("click", () => skipAudioTime(10));
    loadBook();
    loadData();
    setInterval(tick, 2000);
});
