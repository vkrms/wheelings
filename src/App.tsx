import { useEffect, useState, useRef } from "react";
import "./App.css";
import { ReactComponent as Text } from "../data/text.md";

import { wheel } from "./wheel";

type TouchOrMouseEvent<T> = React.MouseEvent<T> | React.TouchEvent<T>;

function App() {
  console.log("rererendered");
  const [visual, setVisual] = useState<SVGSVGElement | void | null>();

  const subject = useRef<HTMLDivElement | void | null>(null);

  useEffect(() => {
    // console.log("useEffect");
    wheel().then(setVisual);

    const wheelRef = subject.current;

    if (wheelRef) {
      wheelRef.addEventListener("touchstart", start, false);
      wheelRef.addEventListener("touchmove", rotate, false);
      wheelRef.addEventListener("touchend", stop, false);
    }

    return () => {
      if (wheelRef) {
        wheelRef.removeEventListener("touchstart", start, false);
        wheelRef.removeEventListener("touchmove", rotate, false);
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

  function start(e: TouchOrMouseEvent<HTMLDivElement>) {
    active = true;
    let clientX: number = 0,
      clientY: number = 0;

    if (e instanceof TouchEvent) {
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    console.log("start");

    // e.preventDefault();

    const bb = e.currentTarget.getBoundingClientRect(),
      t = bb.top,
      l = bb.left,
      h = bb.height,
      w = bb.width;

    (center.x = l + w / 2), (center.y = t + h / 2);

    const x = clientX - center.x,
      y = clientY - center.y;
    startAngle = R2D * Math.atan2(y, x);
    return;
  }

  function rotate(e: TouchOrMouseEvent<HTMLDivElement>) {
    if (!active) return;

    e.preventDefault();
    let x: number = 0,
      y: number = 0;

    // const instance = typeof e;
    console.log(e);

    if (e instanceof TouchEvent) {
      const touch = e.touches[0];
      console.log("yep", touch.clientX, touch.clientY);
      x = touch.clientX - center.x;
      y = touch.clientY - center.y;
    } else {
      console.log("sup", e.clientX, e.clientY);
      x = e.clientX - center.x;
      y = e.clientY - center.y;
    }

    // normal values
    //rotate 6.388436526322213 -29.43183432514928 -35.82027085147149

    // i got
    //rotate 111.31790302279376 -23.68209697720624 -135

    const d = R2D * Math.atan2(y, x);

    rotation = d - startAngle;
    console.log("rotate", rotation, d, startAngle, x, y);
    return (e.currentTarget.style.transform =
      "rotate(" + (angle + rotation + "deg"));
  }

  function stop() {
    angle += rotation;
    console.log("stopped", rotation);
    return (active = false);
  }

  const props = {
    // onTouchStart: start,
    onMouseDown: start,
    onMouseMove: rotate,
    onMouseUp: stop,
    // onTouchEnd: stop,
    ref: subject,
  };

  const otherProps = {
    dangerouslySetInnerHTML: { __html: visual?.outerHTML || "" },
    className: "wheel",
  };

  return (
    <>
      <div className="flex">
        <div className="wheel-wrapper">
          <div {...{ ...props, ...otherProps }} />
        </div>
        <div className="text-wrapper">
          <Text />
        </div>
      </div>
    </>
  );
}

export default App;
