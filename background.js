let stream;
let audioContext;
let wet;
let mixValue = 1.0;

function mix(value) {
    if (wet) {
        wet.gain.value = value * 9.0;
    }
}

function loadImpulse(audioContext, url, cb) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = () => {
        audioContext.decodeAudioData(request.response, function (buffer) {
            cb(buffer);
        }, err => { console.log(err); });
    };
    request.onerror = err => {
        console.log(err);
    };
    request.send();
};

function startEq() {
    if (stream) return;
    chrome.tabCapture.capture({ audio: true, video: false }, mediaStream => {
        if (!mediaStream) {
            console.log(chrome.runtime.lastError.message);
            return;
        }
        stream = mediaStream;
        audioContext = new AudioContext({latencyHint: "playback", sampleRate: 44100});
        const mediaStreamSource = audioContext.createMediaStreamSource(stream);
        const convolver = audioContext.createConvolver();
        const impulseUrl = "https://rawcdn.githack.com/jaakkopasanen/AutoEq/9b0471dc92dc84dfe955518bae6861de114f6945/results/oratory1990/harman_over-ear_2018/Beyerdynamic DT 880 250 Ohm/Beyerdynamic DT 880 250 Ohm minimum phase 44100Hz.wav";
        loadImpulse(audioContext, impulseUrl, buffer => {
            convolver.buffer = buffer;
            convolver.normalize = false;
            wet = audioContext.createGain();
            mix(mixValue);
            mediaStreamSource.connect(convolver);
            convolver.connect(wet);
            wet.connect(audioContext.destination);
        });
    });
}

function stopEq() {
    if (stream) {
        stream.getAudioTracks()[0].stop();
        audioContext.close();
        stream = null;
        audioContext = null;
        wet = null;
    }
}

chrome.runtime.onMessage.addListener(function (element) {
    if (element.type === "enabled") {
        if (element.value) {
            startEq();
        } else {
            stopEq();
        }
    }
    if (element.type === "mix") {
        mixValue = element.value;
        mix(mixValue);
    }
});