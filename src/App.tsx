import { useEffect, useState, useRef } from "react";
import "./App.css";
import { ReactComponent as Text } from "../data/text.md";

import { wheel } from "./wheel";

function App() {
  console.log("rererendered");
  const [visual, setVisual] = useState<SVGSVGElement | void | null>();

  const subject = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // console.log("useEffect");
    wheel().then(setVisual);

    const wheelRef = subject.current;

    if (wheelRef) {
      wheelRef.addEventListener("touchstart", touchStart, false);
      wheelRef.addEventListener("touchmove", touchRotate, false);
      wheelRef.addEventListener("touchend", stop, false);
    }

    return () => {
      if (wheelRef) {
        wheelRef.removeEventListener("touchstart", touchStart, false);
        wheelRef.removeEventListener("touchmove", touchRotate, false);
        wheelRef.removeEventListener("touchend", stop, false);
      }
    };
  }, []);

  let angle = 0,
    rotation = 0,
    active = false,
    startAngle = 0;

  const center = {
    x: 0,
    y: 0,
  };

  const R2D = 180 / Math.PI;

  function mouseStart(e: React.MouseEvent<HTMLDivElement>) {
    start(e.currentTarget as EventTarget & HTMLElement, e.clientX, e.clientY);
  }

  function touchStart(e: TouchEvent) {
    e.preventDefault();
    active = true;
    const touch = e.touches[0];

    start(
      e.currentTarget as EventTarget & HTMLElement,
      touch.clientX,
      touch.clientY
    );
  }

  function start(
    el: (EventTarget & HTMLElement) | null,
    clientX: number,
    clientY: number
  ) {
    active = true;
    if (!el) return;
    const bb = el.getBoundingClientRect(),
      t = bb.top,
      l = bb.left,
      h = bb.height,
      w = bb.width;

    (center.x = l + w / 2), (center.y = t + h / 2);

    console.log("start");
    const x = clientX - center.x,
      y = clientY - center.y;
    startAngle = R2D * Math.atan2(y, x);
  }

  function mouseRotate(e: React.MouseEvent) {
    e.preventDefault();

    const x = e.clientX - center.x,
      y = e.clientY - center.y;

    rotate(e.currentTarget as EventTarget & HTMLElement, x, y);
  }

  function touchRotate(e: TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    const x = touch.clientX - center.x,
      y = touch.clientY - center.y;
    rotate(e.currentTarget as HTMLBaseElement, x, y);
  }

  function rotate(el: EventTarget & HTMLElement, x: number, y: number) {
    if (!active) return;
    const d = R2D * Math.atan2(y, x);

    rotation = d - startAngle;
    console.log("rotate", rotation, d, startAngle, x, y);
    return (el.style.transform = "rotate(" + (angle + rotation + "deg"));
  }

  function stop() {
    angle += rotation;
    console.log("stopped", rotation);
    return (active = false);
  }

  const props = {
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
      mouseStart(e);
    },
    // onMouseMove: mouseRotate,
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
      mouseRotate(e);
    },
    onMouseUp: stop,
    ref: subject,
    dangerouslySetInnerHTML: { __html: visual?.outerHTML || "" },
    className: "wheel",
  };

  return (
    <>
      <div className="flex">
        <div className="wheel-wrapper">
          <div {...props} />
        </div>
        <div className="text-wrapper">
          <Text />
        </div>
      </div>
    </>
  );
}

export default App;
