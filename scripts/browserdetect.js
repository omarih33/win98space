// Browser Detector
const userAgentData = navigator.userAgentData;
const browserName = userAgentData.brands.filter(b => b.brand !== 'Not Supported')[0].brand;
const fullVersion = userAgentData.brands.filter(b => b.brand === browserName)[0].version;
const majorVersion = parseInt(fullVersion, 10);

// Change Browser Logo
const imgChrome = document.getElementById("imgChrome");
const parChrome = document.getElementById("parChrome");

if (browserName === "Chrome") {
  imgChrome.setAttribute("src", "assets/chrome.png");
  parChrome.innerHTML = browserName;
}
if (browserName === "Firefox") {
  imgChrome.setAttribute("src", "assets/firefox.png");
  parChrome.innerHTML = browserName;
}
if (browserName === "Microsoft Edge") {
  imgChrome.setAttribute("src", "assets/edge.png");
  parChrome.innerHTML = browserName;
}
if (browserName === "Opera") {
  imgChrome.setAttribute("src", "assets/opera.png");
  parChrome.innerHTML = browserName;
}
if (browserName === "Safari") {
  imgChrome.setAttribute("src", "assets/safari.png");
  parChrome.innerHTML = browserName;
}

// Error message
const browserDetector = browserName || "";
let textChrome = document.getElementById("textChrome");
textChrome.innerHTML = `You are already in ${browserDetector}`;

// New Tab
let newtab = document.getElementById("newtab");
newtab.addEventListener("click", (evt) => {
  evt.preventDefault();
  window.open("https://www.google.it/");
});
