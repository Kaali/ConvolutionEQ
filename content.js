document.addEventListener(
	"DOMContentLoaded",
	function () {
        document.getElementById("mix").addEventListener("click", e => {
            chrome.runtime.sendMessage({ type: "mix", value: e.target.value / 100.0 });
		});
        document.getElementById("enabled").addEventListener("click", e => {
            chrome.runtime.sendMessage({ type: "enabled", value: e.target.checked });
		});
    }
);