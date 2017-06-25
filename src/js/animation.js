export default class Animation {
  constructor(container, spritesheet, frameCount, {speed = 1000, loop = false, wait = 0}) {
    this.el = container;
    this.spritesheet = spritesheet;
    this.speed = speed;
    this.loop = loop;
    this.wait = wait;
    if (!frameCount) {
      frameCount = this.spritesheet.frames.length;
    }
    this.frames = [];
    this.cur = 0;
    this.el.style.width = `${this.spritesheet.frames[0].sourceSize.w}px`;
    this.el.style.height = `${this.spritesheet.frames[0].sourceSize.h}px`;
    this.el.style.position = "relative";
    this.el.style.top = `${this.spritesheet.frames[0].spriteSourceSize.y}px`;
    this.el.style.left = `${this.spritesheet.frames[0].spriteSourceSize.x}px`;
    for (let i = 0; i < frameCount; i++) {
      this.frames.push(this.createFrame(i));
    }
  }
  createFrame(index) {
    const el = document.createElement("div");
    el.dataset.frameIndex = index;
    el.classList.add("animation-frame");
    const frame = this.spritesheet.frames[index];
    el.style.backgroundImage = `url(img/${this.spritesheet.meta.image})`;
    el.style.backgroundPosition = `-${frame.frame.x - 1}px -${frame.frame.y - 1}px`;
    el.style.backgroundSize = `${this.spritesheet.meta.size.w}px ${this.spritesheet.meta.size.h}px`;
    el.style.position = "absolute";
    if (frame.rotated) {
      el.style.width = `${frame.spriteSourceSize.h}px`;
      el.style.height = `${frame.spriteSourceSize.w}px`;
      el.style.transform = "rotate(-90deg)";
      el.style.transformOrigin = "0 0";
      el.style.top = `${frame.spriteSourceSize.h}px`;
      el.style.left = "0";
    } else {
      el.style.width = `${frame.spriteSourceSize.w}px`;
      el.style.height = `${frame.spriteSourceSize.h}px`;
      el.style.top = "0";
      el.style.left = "0";
    }
    this.el.append(el);
    return el;
  }

  start(done) {
    if (done) {
      this.done = done;
    }
    this.cur = 0;
    for (let i = 0; i < this.frames.length; i++) {
      this.frames[i].classList.remove("in");
    }
    this.frames[0].classList.add("in");
    this.interval = window.setInterval(this.tick.bind(this), this.speed);
  }
  stop() {
    window.clearInterval(this.interval);
  }
  loopEnd() {
    this.stop();
    if (this.loop) {
      window.setTimeout(() => {
        this.start();
      }, this.wait);
    } else {
      this.done && this.done();
    }
  }
  tick() {
    if (this.cur < this.frames.length - 1) {
      this.frames[++this.cur].classList.add("in");
    } else {
      this.loopEnd();
    }
  }
}
