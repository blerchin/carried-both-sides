export default class Animation {
  constructor(container, spritesheet, frameCount, {speed = 1000, loop = false, wait = 0, spriteImage = null}) {
    this.el = container;
    this.spritesheet = spritesheet;
    this.speed = speed;
    this.loop = loop;
    this.forward = true;
    this.wait = wait;
    this.spriteImage = spriteImage || this.spritesheet.meta.image;
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
    el.style.backgroundImage = `url(img/${this.spriteImage})`;
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
    this.cur = this.forward ? 0 : this.frames.length - 1;
    for (let i = 0; i < this.frames.length; i++) {
      this.frames[i].classList.remove("in");
    }
    this.frames[this.cur].classList.add("in");
    this.interval = window.setInterval(this.tick.bind(this), this.speed);
  }
  stop() {
    window.clearInterval(this.interval);
  }
  loopEnd() {
    this.stop();
    if (this.loop) {
      window.setTimeout(() => {
        this.forward = !this.forward;
        this.start();
      }, this.wait);
    } else {
      this.done && this.done();
    }
  }
  tick() {
    this.cur += this.forward ? 1 : -1;
    if (this.cur < this.frames.length && this.cur > 0) {
      if (!this.forwards && this.cur < this.frames.length - 1) {
        this.frames[this.cur + 1].classList.remove("in");
      }
      this.frames[this.cur].classList.add("in");
    } else {
      this.loopEnd();
    }
  }
}
