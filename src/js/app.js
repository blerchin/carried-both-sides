import SunCalc from "suncalc";
function getParams() {
  var query = window.location.search.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

/******* Day/Night Logic *******/
const DEBUG_STATE = getParams().time;
const VIDEO_DIMS = [1280, 720];
const player = document.querySelector(".video-wrap video");
player.volume = 0;
player.loop = true;

function sizeIframe() {
  const el = player;
  const ratio = VIDEO_DIMS[0] / VIDEO_DIMS[1];
  const ph = el.parentNode.offsetHeight;
  const pw = el.parentNode.offsetWidth;
  let w = pw;
  let h = (w / ratio);
  if (pw / ph < ratio) {
    h = ph;
    w = (h * ratio);
  }
  el.setAttribute("height", h);
  el.setAttribute("width", w);
}
function onTimeChanged(isDay) {
  if (!isDay) {
    sizeIframe();
    player && player.play();
  } else {
    player && player.pause();
  }
}
let times = null;
let timesErr = null;
function getSunTimes() {
  fetch("https://freegeoip.net/json/").then((res) => res.json())
    .then((data) => {
      const {latitude, longitude} = data;
      times = SunCalc.getTimes((new Date()), latitude, longitude);
      applyTime(isDay());
    }).catch((err) => {
      timesErr = err;
      applyTime(isDay());
    });
}
function isDay() {
  if (DEBUG_STATE) {
    return DEBUG_STATE === "day";
  } else if (timesErr) {
    const hour = (new Date()).getHours();
    return hour > 7 && hour < 19;
  } else if (times) {
    const now = (new Date());
    return now > times.sunrise && now < times.sunsetStart;
  } else {
    return true;
  }
}
function applyTime(isDay) {
  document.querySelector("[data-time]").dataset.time = isDay ? "day" : "night";
  onTimeChanged(isDay);
}
applyTime(isDay());
getSunTimes();
setInterval(function() {
  window.dispatchEvent(new Event("applyTime"));
}, 60 * 1000);
window.addEventListener("applyTime", () => applyTime(isDay()), {passive: true});
window.addEventListener("resize", sizeIframe);

/************ Contact Overlay ************/
const toggle = document.querySelector("[data-toggle]");
toggle.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById(toggle.dataset.toggle).classList.add("open");
});
const close = document.querySelector("a[data-close=parent]");
close.addEventListener("click", (e) => {
  e.preventDefault();
  close.parentNode.classList.remove("open");
});