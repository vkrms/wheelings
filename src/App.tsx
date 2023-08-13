import { useEffect, useState, useRef } from "react";
import "./App.css";
import { ReactComponent as Text } from "../data/text.md";

import { wheel } from "./wheel";

function App() {
  console.log("rererendered");
  const [temp, setTemp] = useState(null);

  useEffect(() => {
    console.log("useEffect");
    wheel().then((visual) => {
      console.log({ visual, status: "setTemp" });
      setTemp(visual);
    });
  }, []);

  let angle = 0,
    rotation = 0,
    startAngle = 0,
    active = false,
    center = {
      x: 0,
      y: 0,
    };

  const R2D = 180 / Math.PI;

  function start(e) {
    console.log("start");
    e.preventDefault();
    let bb = e.currentTarget.getBoundingClientRect(),
      t = bb.top,
      l = bb.left,
      h = bb.height,
      w = bb.width,
      x,
      y;
    center = {
      x: l + w / 2,
      y: t + h / 2,
    };
    x = e.clientX - center.x;
    y = e.clientY - center.y;
    startAngle = R2D * Math.atan2(y, x);
    return (active = true);
  }

  function rotate(e) {
    if (!active) return;

    // console.log(e)
    e.preventDefault();
    const x = e.clientX - center.x,
      y = e.clientY - center.y,
      d = R2D * Math.atan2(y, x);
    rotation = d - startAngle;

    console.log({
      angle: angle + rotation,
      x,
      y,
    });

    return (e.currentTarget.style.transform =
      "rotate(" + (angle + rotation) + "deg)");
  }

  function stop(e) {
    angle += rotation;
    return (active = false);
  }

  const subject = useRef(null);

  const props = {
    onMouseDown: start,
    onMouseMove: rotate,
    onMouseUp: stop,
    ref: subject,
  };

  const otherProps = {
    dangerouslySetInnerHTML: { __html: temp?.outerHTML || "" },
    className: "wheel",
  };

  return (
    <>
      {/* <div className="square" {...props}></div> */}
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
