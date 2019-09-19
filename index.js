class MouseScroll {
  constructor(ele) {
    this.target = ele || window;
  }

  timer = null;

  Target = [];

  nowTarget = null;

  get target() {
    return this.Target;
  }

  set target(element) {
    let result = null;
    if (typeof element === 'string') {
      result = document.querySelector(element);
    } else if (typeof element === 'object') {
      result = element;
    }
    this.Target.push(result);
    this.nowTarget = this.Target[this.Target.length - 1];
    this.init();
  }

  longClick = false;

  keep = false;

  latsetTouchPos = {};

  Mousemove = false;

  firstPos = {};

  get mousemove() {
    return this.Mousemove;
  }

  set mousemove(value) {
    this.timer = setTimeout(() => {
      this.Mousemove = value;
      this.clearTimeout();
    }, 100);
  }

  get scrollTarget() {
    return this.isWindow(this.nowTarget)
      ? document.documentElement
      : this.nowTarget;
  }

  swipe = null;

  smooth = 50;

  mousedownHandler = event => {
    this.checkElement();
    this.timer = setTimeout(() => {
      // longclick to trigger mousemove,It is simulate touch event
      this.longClick = true;
      const touchPos = {
        x: event.clientX,
        y: event.clientY,
      };
      this.latsetTouchPos = touchPos;
      this.firstPos = touchPos;
      this.nowTarget.onmousemove = moveEvent =>
        this.mousemoveHandler(touchPos, event, moveEvent);
    }, 300);
  };

  mousemoveHandler = (touchPos, event, moveEvent) => {
    const { y } = touchPos;
    const { y: latsetY } = this.latsetTouchPos;
    const { clientY: newPosY } = moveEvent;
    const { scrollTop, scrollHeight, offsetHeight } = this.scrollTarget;
    const canScroll = scrollHeight - offsetHeight;
    this.swipe = this.moveTouch(event, moveEvent);
    if ((this.swipe === 'up' || this.swipe === 'down') && canScroll > 0) {
      if (newPosY - y <= 0) {
        const scroll = latsetY ? -(newPosY - latsetY) : 0;
        if (scroll <= 100 && scroll >= -100) {
          this.nowTarget.scroll(0, scrollTop + scroll);
        }
      } else if (scrollTop > 0 && latsetY > 0) {
        const scroll = latsetY ? newPosY - latsetY : 0;
        if (scroll <= 100 && scroll >= -100) {
          this.nowTarget.scroll(0, scrollTop - scroll);
        }
      }
      this.latsetTouchPos = {
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      };
    }
    // if mousemove is triggered can be detect and cancel any other func
    this.mousemove = true;
  };

  mouseupHandler = event => {
    if (this.longClick) {
      // cancel longclick and cancel mousemove func
      this.longClick = false;
      this.nowTarget.onmousemove = null;
      this.scrollSmooth(this.firstPos, { x: event.clientX, y: event.clientY });
      event.stopPropagation();
      event.preventDefault();
    }
    this.clearTimeout();
    // when mousemove is end set it to be false
    this.mousemove = false;
  };

  scrollSmooth = (first, latest) => {
    const { y: firstY } = first;
    const { y: latestY } = latest;
    const distance = firstY - latestY;
    if (this.swipe === 'up') {
      if (distance > 300) {
        this.nowTarget.scroll({
          top: this.scrollTarget.scrollTop + this.judgeDistance(distance),
          behavior: 'smooth',
        });
      }
    } else if (this.swipe === 'down') {
      if (firstY - latestY < -300) {
        this.nowTarget.scroll({
          top: this.scrollTarget.scrollTop - this.judgeDistance(-distance),
          behavior: 'smooth',
        });
      }
    }
  };

  judgeDistance = distance => {
    let scrollResult = 0;
    if (distance >= 300) {
      scrollResult = 200;
    } else if (distance < 300 && distance >= 250) {
      scrollResult = 150;
    } else if (distance < 250 && distance >= 200) {
      scrollResult = 100;
    } else if (distance < 200 && distance >= 150) {
      scrollResult = 50;
    } else {
      scrollResult = 0;
    }
    return scrollResult;
  };

  isWindow = obj => {
    let result = null;
    if (typeof window.constructor === 'undefined') {
      result = obj instanceof window.constructor;
    } else {
      result = obj.window === obj;
    }
    return result;
  };

  moveTouch = (event, newEvent) => {
    // judge mousemove direction
    const { clientX: x, clientY: y } = event;
    const { clientX: newX, clientY: newY } = newEvent;
    const diffX = x - newX;
    const diffY = y - newY;
    let result = '';
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // sliding horizontally
      if (diffX > 0) {
        result = 'left';
      } else {
        result = 'right';
      }
    } else if (diffY > 0) {
      result = 'up';
    } else {
      result = 'down';
    }
    return result;
  };

  clearTimeout = () => {
    clearTimeout(this.timer);
    this.timer = null;
  };

  init = () => {
    if (this.nowTarget) {
      document.body.style.userSelect = 'none';
      this.nowTarget.onmousedown = event => this.mousedownHandler(event);
      this.nowTarget.onmouseup = event => this.mouseupHandler(event);
    }
  };

  checkElement = () => {
    if (!this.isWindow(this.nowTarget)) {
      const {
        bottom,
        top,
        left,
        right,
        width,
        height,
        x,
        y,
      } = this.nowTarget.getBoundingClientRect();
      if (
        bottom === 0 &&
        top === 0 &&
        left === 0 &&
        right === 0 &&
        width === 0 &&
        height === 0 &&
        x === 0 &&
        y === 0
      ) {
        this.destory();
        this.checkElement();
      }
    }
  };

  destory = () => {
    this.Target.splice(this.Target.length - 1, 1);
    this.nowTarget = this.Target[this.Target.length - 1];
  };
}

const scroll = new MouseScroll();

export default scroll;
export { MouseScroll };
