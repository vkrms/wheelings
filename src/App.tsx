import { useEffect, useState, useRef } from "react";
import "./App.scss";
import { ReactComponent as Text } from "../data/text.md";

import Wheel from "./Wheel";

import type { NodeHierarchy } from "./types";

function App() {
  let emotionsArr: string[] = [];
  // console.log("rerererendered");

  function parents({ data, parent }: NodeHierarchy) {
    let emotion = "%";
    switch (typeof data) {
      case "string":
        emotion = data;
        break;
      case "object":
        emotion = Object.keys(data || {})[0];
        break;
    }

    emotionsArr.push(emotion);

    if (parent) parents(parent);
  }

  const subject = useRef<HTMLDivElement | null>(null);

  const [emotions, setEmotions] = useState({
    top: "%%%",
    middle: "%%",
    base: "%",
  });

  const rotRef = useRef({
    angle: 0,
    rotation: 0,
    active: false,
    startAngle: 0,
    center: { x: 0, y: 0 },
  });

  useEffect(() => {
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

  const R2D = 180 / Math.PI;

  function mouseStart(e: React.MouseEvent<HTMLDivElement>) {
    rotRef.current.active = true;
    start(e.currentTarget as EventTarget & HTMLElement, e.clientX, e.clientY);
  }

  function touchStart(e: TouchEvent) {
    e.preventDefault();
    rotRef.current.active = true;
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
    rotRef.current.active = true;
    if (!el) return;
    const bb = el.getBoundingClientRect(),
      t = bb.top,
      l = bb.left,
      h = bb.height,
      w = bb.width;

    (rotRef.current.center.x = l + w / 2),
      (rotRef.current.center.y = t + h / 2);

    // console.log("start");
    const x = clientX - rotRef.current.center.x,
      y = clientY - rotRef.current.center.y;
    rotRef.current.startAngle = R2D * Math.atan2(y, x);
  }

  function mouseRotate(e: React.MouseEvent) {
    e.preventDefault();

    const x = e.clientX - rotRef.current.center.x,
      y = e.clientY - rotRef.current.center.y;

    rotate(e.currentTarget as EventTarget & HTMLElement, x, y);
  }

  function touchRotate(e: TouchEvent) {
    e.preventDefault();

    const touch = e.touches[0];
    const x = touch.clientX - rotRef.current.center.x,
      y = touch.clientY - rotRef.current.center.y;
    rotate(e.currentTarget as EventTarget & HTMLElement, x, y);
  }

  function rotate(el: EventTarget & HTMLElement, x: number, y: number) {
    if (!rotRef.current.active) return;
    const d = R2D * Math.atan2(y, x);

    rotRef.current.rotation = d - rotRef.current.startAngle;
    return (el.style.transform =
      "rotate(" + (rotRef.current.angle + rotRef.current.rotation + "deg"));
  }

  function stop() {
    rotRef.current.angle += rotRef.current.rotation;
    // console.log("stopped", rotRef.current.rotation);

    // get the top-most path from the wheel
    const paths = document.querySelectorAll("path");
    const sorted = Array.from(paths).sort((a, b) => {
      const aBB = a.getBoundingClientRect();
      const bBB = b.getBoundingClientRect();
      return aBB.top - bBB.top;
    });

    // set current emotion
    const topPath = sorted[0] as SVGPathElement & { __data__: NodeHierarchy };
    const datum = topPath.__data__;
    parents(datum);

    // console.log({ emotionsArr });
    const [top, middle, base] = emotionsArr;
    // manual flush due to a mobile version bug
    emotionsArr = [];

    setEmotions({ top, middle, base });

    return (rotRef.current.active = false);
  }

  const props = {
    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
      mouseStart(e);
    },
    onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => {
      mouseRotate(e);
    },
    onMouseUp: stop,
    className: "rotator",
    ref: subject,
  };

  return (
    <>
      <div className="flex">
        <div className="wheel-wrapper">
          <h1>{emotions.top}</h1>
          <h2>{emotions.middle}</h2>
          <h3>{emotions.base}</h3>

          <div className="arrow">&darr;</div>
          <div {...props}>
            <Wheel />
          </div>
        </div>
        <div className="text-wrapper">
          <Text />
        </div>
      </div>
    </>
  );
}

export default App;
