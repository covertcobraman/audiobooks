
// library object loaded from index.html

let chapterTitle;
let audio;
let select;
let playPause;

// index starts at 1
let data = { idx: 1, time: 0.0 };

// key for library
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
    Object.assign(data, stored ? JSON.parse(stored) : { idx: 1, time: 0 });

    console.log("Loading: " + JSON.stringify(data));
    audio.addEventListener("loadedmetadata", () => {
        audio.currentTime = data.time;
    }, { once: true });
    loadAudio(data.idx);
}

function loadBook() {
    book = localStorage.getItem("book") || select.value;
    console.log("Loading: " + book)
    select.value = book;
}

function loadAudio(idx) {
    audio.src = getAduioUrl(idx)
    console.log("Audio load index: " + idx);
    console.log("Audio load url: " + getAduioUrl(idx));
    audio.load();
    chapterTitle.textContent = "Track " + idx;
    data.idx = idx;
}

function loadAudioOffset(offset) {
    // Loop index (its one based)
    let max = library[book].trackCount
    let idx = ((data.idx - 1 + offset + max) % max) + 1
    loadAudio(idx);
    audio.addEventListener("loadedmetadata", () => {
        audio.play();
    }, { once: true });
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

function getAduioUrl(idx) {
    // ex: https://audio.naudios.com/audios.php?no=4&postID=202603068037
    let url = "https://audio.naudios.com/audios.php?no=";
    url += idx
    url += "&postID=";
    url += library[book].postID;
    return url
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

function onPlay() {
    playPause.textContent = "Pause";
}

function onPause() {
    playPause.textContent = "Play";
    saveTime();
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded");
    chapterTitle = document.getElementById("chapterTitle");
    audio = document.getElementById("audio");
    audio.addEventListener("seeked", saveTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    setupSelect();
    let previous = document.getElementById("previous");
    let next = document.getElementById("next");
    let rewind = document.getElementById("rewind");
    let forward = document.getElementById("forward");
    playPause = document.getElementById("playPause");
    playPause.addEventListener("click", playPauseAudio);
    audio.addEventListener("ended", () => loadAudioOffset(1));
    previous.addEventListener("click", () => loadAudioOffset(-1));
    next.addEventListener("click", () => loadAudioOffset(1));
    rewind.addEventListener("click", () => skipAudioTime(-10));
    forward.addEventListener("click", () => skipAudioTime(10));
    loadBook();
    loadData();
    setInterval(tick, 10000);
});
