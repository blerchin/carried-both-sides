import SunCalc from "suncalc";

//const DEBUG_STATE = "night";
const DEBUG_STATE = null;
let player = null;
const VIDEO_DIMS = [1280, 720];
function initYtApi() {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/player_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // Replace the 'ytplayer' element with an <iframe> and
  // YouTube player after the API code downloads.
  function ready(e) {
    sizeIframe();
    player = e.target;
    e.target.playVideo();
    e.target.setVolume(0);
  }
  window.onYouTubePlayerAPIReady = function() {
    new YT.Player("ytplayer", { //eslint-disable-line no-undef
      height: VIDEO_DIMS[0],
      events: {
        onReady: ready
      },
      playerVars: {
        controls: 0,
        modestbranding: 1,
        loop: 1
      },
      width: VIDEO_DIMS[1],
      videoId: "aAWyRlX3tcQ"
    });
  };
}
function sizeIframe() {
  const el = document.getElementById("ytplayer");
  const ratio = VIDEO_DIMS[0] / VIDEO_DIMS[1];
  const ph = el.parentNode.offsetHeight;
  const pw = el.parentNode.offsetWidth;
  let w = pw;
  let h = (w / ratio);
  if (pw < ph) {
    h = ph;
    w = (h * ratio);
  }
  el.setAttribute("height", h);
  el.setAttribute("width", w);
}
function onTimeChanged(isDay) {
  if (!isDay) {
    sizeIframe();
    player && player.playVideo();
  } else {
    player && player.stopVideo();
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
initYtApi();
