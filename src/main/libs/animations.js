import {
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce
} from 'js-easing-functions';

const jsEasing = {
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce
};
export const showAndAnimate = (appState, win, appDef) => {
  win.setPosition(appState.primaryDisplay.width + appDef.startLeftOffset, appState.primaryDisplay.width + appDef.startLeftOffset);
  const tick = (win, myAppDef, easing, startTime) => {
    const startX = appState.primaryDisplay.width + myAppDef.startLeftOffset;
    const endX = appState.primaryDisplay.width + myAppDef.endLeftOffset;
    const startY = appState.primaryDisplay.height + myAppDef.startTopOffset;
    const endY = appState.primaryDisplay.height + myAppDef.endTopOffset;
    const elapsed = Date.now() - startTime;
    const duration = myAppDef.animationDuration;
    const xAbsOffset = jsEasing[easing](elapsed, 0, Math.abs(startX - endX), duration);
    const yAbsOffset = jsEasing[easing](elapsed, 0, Math.abs(startY - endY), duration);

    const xOffset = startX > endX ? -1 * xAbsOffset : xAbsOffset;
    const newX = startX + xOffset;

    const yOffset = startY > endY ? -1 * yAbsOffset : yAbsOffset;
    const newY = startY + yOffset;

    // console.log('Moving window to x', parseInt(newX), 'y', parseInt(newY));
    win.setPosition(parseInt(newX), parseInt(newY));
    if (elapsed < duration) {
      setTimeout(() => {
        tick(win, myAppDef, easing, startTime);
      }, 17);
    }
  };
  win.show();
  tick(win, appDef, appDef.animation, Date.now());
}

export const animateAndClose = (appState, win, appDef) => {
  const tick = (win, myAppDef, easing, startTime) => {
    const startX = appState.primaryDisplay.width + myAppDef.endLeftOffset;
    const endX = appState.primaryDisplay.width + myAppDef.startLeftOffset;
    const startY = appState.primaryDisplay.height + myAppDef.endTopOffset;
    const endY = appState.primaryDisplay.height + myAppDef.startTopOffset;
    const elapsed = Date.now() - startTime;
    const duration = myAppDef.animationDuration;
    const xAbsOffset = jsEasing[easing](elapsed, 0, Math.abs(startX - endX), duration);
    const yAbsOffset = jsEasing[easing](elapsed, 0, Math.abs(startY - endY), duration);

    const xOffset = startX > endX ? -1 * xAbsOffset : xAbsOffset;
    const newX = startX + xOffset;

    const yOffset = startY > endY ? -1 * yAbsOffset : yAbsOffset;
    const newY = startY + yOffset;

    // console.log('Moving window to x', parseInt(newX), 'y', parseInt(newY));
    win.setPosition(parseInt(newX), parseInt(newY));
    if (elapsed < duration) {
      setTimeout(() => {
        tick(win, myAppDef, easing, startTime);
      }, 17);
    } else {
      win.close();
    }
  };
  tick(win, appDef, appDef.animation, Date.now());
}
export default showAndAnimate;