import * as d3 from "d3";
import { useRef, useEffect } from "react";

import type { NodeData, NodeHierarchy } from "./types";

interface ArcData extends d3.DefaultArcObject {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

async function getData() {
  const wheelData: NodeData[] = [];

  const promises = [
    "Angry",
    "Bad",
    "Disgusted",
    "Surprised",
    "Happy",
    "Sad",
  ].map((path) => import(`../data/${path}.yml`));

  return Promise.all(promises)
    .then((imported) => {
      imported.forEach((data) => {
        wheelData.push(...data.default);
      });
      return wheelData;
    })
    .catch((error) => {
      console.error(error);
    });
}

const accessor = (d: NodeHierarchy) => {
  // array
  if (Array.isArray(d)) {
    return d;
  }

  // final node
  if (typeof d === "string") {
    return false;
  }

  // nested array
  return Object.values(d)[0];
};

const sumBody = (d: NodeData) => {
  return typeof d === "string" ? 1 : 0;
};

function bar(wheelData: NodeData[], svgRef: SVGSVGElement | null) {
  // Specify the chart’s colors and approximate radius (it will be adjusted at the end).
  const color = d3.scaleOrdinal(
    d3.quantize(d3.interpolateRainbow, wheelData.length + 1)
  );
  const radius = 928 / 2;

  // Prepare the layout.
  const partition = (data: NodeData[]) =>
    d3.partition().size([2 * Math.PI, radius])(
      //@ts-expect-error it works fine!
      d3.hierarchy(data, accessor).sum(sumBody)
    );

  // Create the arc
  const arc = d3
    .arc<ArcData>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius / 2)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1 - 1);

  const root = partition(wheelData);

  const data = root
    .descendants()
    .filter((d) => d.depth && ((d.y0 + d.y1) / 2) * (d.x1 - d.x0) > 10);

  const dataB = root.descendants().filter((d) => d.depth);

  // Select the SVG container.
  const svg = d3.select(svgRef);

  // Add an arc for each element
  svg
    .append("g")
    .attr("fill-opacity", 0.7)
    .selectAll("path")
    .data(dataB)
    .join("path")
    .attr("fill", (d) => {
      while (d.depth > 1) d = d.parent!;
      return color(getKey(d));
    })

    // @ts-expect-error it works fine!
    .attr("d", arc);

  // Add a label for each element.
  svg
    .append("g")
    // .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .attr("font-family", "sans-serif")
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("transform", function (d) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = (d.y0 + d.y1) / 2;
      return `rotate(${x - 90}) translate(${y},0) rotate(0)`;
    })
    .attr("dy", "0.35em")
    .text(getKey)
    .attr("class", "wheel-label");
  // The autoBox function adjusts the SVG’s viewBox to the dimensions of its contents.
  svg.attr("viewBox", autoBox);
}

function getKey(arg: d3.HierarchyRectangularNode<unknown>): string {
  const nodeData = arg.data as NodeData;
  return typeof nodeData === "string" ? nodeData : Object.keys(nodeData)[0];
}

function autoBox(this: SVGGraphicsElement | null) {
  if (this === null) return false;
  const { x, y, width, height } = this.getBBox();
  return [x, y, width, height];
}

const Wheel = () => {
  const wheel = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    getData().then((data) => {
      if (data) bar(data, wheel.current);
    });
  }, []);

  return (
    <div className="lol">
      <svg ref={wheel} className="wheel"></svg>
    </div>
  );
};

export default Wheel;
