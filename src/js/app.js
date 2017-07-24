import "../scss/main.scss";
import SunCalc from "suncalc";
import Masonry from "masonry-layout";
import imagesLoaded from "imagesloaded";
import getParams from "./getParams";
import Animation from "./animation";
import splashSpritesheet from "../data/amphora512x512";
import ampersandSpritesheet from "../data/amphora_at";
import mobileCheck from "./mobileCheck";

if (getParams().openContact) {
  document.getElementById("contact-overlay").classList.add("open");
}

var gallery = document.querySelector(".gallery");
var imageGrid = new Masonry(gallery);
imagesLoaded(gallery, () =>  {
  imageGrid.layout();
});

/******* Create Splash Animation *******/
let splashStarted = false;
function startSplash() {
  splashStarted = true;
  const hour = getParams().animLength || (new Date()).getHours();
  const intro = document.getElementById("intro");
  const animEl = document.getElementById("amphoraAnimation");
  const spriteImage = `amphora-fill-sprites--${isDay() ? "day" : "night"}.svg`;
  const splash = animEl && new Animation(animEl, splashSpritesheet, hour, {spriteImage});
  setTimeout(() => {
    splash.start(() => {
      onIntroClosed();
      intro.classList.remove("open");
    });
  }, 3000);
}
/******* Create ampersand animation *********/
const ampersandEl = document.getElementById("ampersandAnimation");

const ampAnim = new Animation(ampersandEl, ampersandSpritesheet, null, {loop: true, speed: 150, wait: 3000});
/******* Day/Night Logic *******/
const DEBUG_STATE = getParams().time;
const VIDEO_DIMS = [1280, 720];
const player = document.querySelector(".video-wrap video");
const playButton = document.querySelector(".video-wrap .play-button");
player.volume = 1;

player.loop = true;
if (!mobileCheck()) {
  player.muted = false;
}
player.addEventListener("click", () => {
  player.muted = false;
  player.play();
});

playButton.addEventListener("click", () => {
  player.play();
  playButton.classList.remove("open");
});

function onIntroClosed() {
  if (isDay()) {
    ampAnim.start();
  } else {
    setTimeout(startVideo, 1000);
  }
}

function startVideo() {
  const res = player && player.play();
  res.catch((err) => {
    console.warn(err); //eslint-disable-line no-console
    playButton.classList.add("open");
  });
}

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
  }
  splashStarted || startSplash();
  imageGrid.layout();
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
getSunTimes();
setInterval(function() {
  window.dispatchEvent(new Event("applyTime"));
}, 60 * 1000);
window.addEventListener("applyTime", () => applyTime(isDay()), {passive: true});
window.addEventListener("resize", sizeIframe);

/************ Contact Overlay ************/
const toggle = document.querySelector("[data-toggle]");
const close = document.querySelector("a[data-close]");
toggle.addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById(toggle.dataset.toggle).classList.add("open");
  close.classList.add("open");
});
close.addEventListener("click", (e) => {
  e.preventDefault();
  const node = document.getElementById(close.dataset.close);
  node.classList.remove("open");
  close.classList.remove("open");
});
