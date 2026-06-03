"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface StepChartPoint {
  label: string;
  value: number;
}

interface ChartAreaStepProps {
  title?: string;
  eyebrow?: string;
  data: StepChartPoint[];
  className?: string;
}

const WIDTH = 720;
const HEIGHT = 320;
const PADDING = { top: 26, right: 28, bottom: 42, left: 42 };

function buildScale(data: StepChartPoint[]) {
  const maxDataValue = Math.max(1, ...data.map((item) => item.value));
  return Math.max(10, Math.ceil(maxDataValue / 10) * 10);
}

function point(
  index: number,
  value: number,
  dataLength: number,
  maxValue: number
) {
  const innerWidth = WIDTH - PADDING.left - PADDING.right;
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const denominator = Math.max(1, dataLength - 1);

  return {
    x: PADDING.left + (innerWidth / denominator) * index,
    y: PADDING.top + innerHeight - (value / maxValue) * innerHeight,
  };
}

function stepPath(data: StepChartPoint[], maxValue: number) {
  const points = data.map((item, index) =>
    point(index, item.value, data.length, maxValue)
  );

  return points
    .map((p, index) => {
      if (index === 0) return `M ${p.x} ${p.y}`;
      return `H ${p.x} V ${p.y}`;
    })
    .join(" ");
}

function areaPath(data: StepChartPoint[], maxValue: number) {
  const points = data.map((item, index) =>
    point(index, item.value, data.length, maxValue)
  );
  const baseY = HEIGHT - PADDING.bottom;

  return `${stepPath(data, maxValue)} L ${
    points[points.length - 1].x
  } ${baseY} H ${points[0].x} Z`;
}

export function ChartAreaStep({
  title = "Actividad semanal",
  eyebrow = "Leads detectados",
  data,
  className,
}: ChartAreaStepProps) {
  const patternId = React.useId();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const maxValue = buildScale(data);
  const active = data[activeIndex] ?? data[0];
  const activePoint = active
    ? point(activeIndex, active.value, data.length, maxValue)
    : { x: PADDING.left, y: PADDING.top };
  const chartPath = data.length ? stepPath(data, maxValue) : "";
  const fillPath = data.length ? areaPath(data, maxValue) : "";
  const yTicks = [0, maxValue / 2, maxValue].map(Math.round);

  return (
    <div className={cn("pixel-card-sm bg-white p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
            {eyebrow}
          </p>
          <h2
            className="retro pixel-text-sm mt-2 font-black uppercase"
            style={{ color: "var(--text)" }}
          >
            {title}
          </h2>
        </div>

        {active && (
          <div className="pixel-inset min-w-24 bg-white px-3 py-2 text-right">
            <span className="block text-xs font-medium" style={{ color: "var(--text-3)" }}>
              {active.label}
            </span>
            <span className="retro pixel-text-sm" style={{ color: "var(--text)" }}>
              {active.value}
            </span>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`${title}: ${eyebrow}`}
      >
        <defs>
          <pattern id={patternId} width="18" height="18" patternUnits="userSpaceOnUse">
            <path
              d="M 18 0 L 0 0 0 18"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>

        <rect
          x={PADDING.left}
          y={PADDING.top}
          width={WIDTH - PADDING.left - PADDING.right}
          height={HEIGHT - PADDING.top - PADDING.bottom}
          fill={`url(#${patternId})`}
          stroke="var(--border)"
          strokeWidth="2"
          opacity="0.95"
        />

        {yTicks.map((tick) => {
          const y = point(0, tick, data.length, maxValue).y;
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={y}
                y2={y}
                stroke="var(--text-3)"
                strokeOpacity="0.24"
                strokeDasharray="6 6"
              />
              <text
                x={PADDING.left - 12}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--text-3)"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {fillPath && (
          <path d={fillPath} fill="var(--surface-2)" opacity="0.75" />
        )}
        {chartPath && (
          <path
            d={chartPath}
            fill="none"
            stroke="var(--text)"
            strokeWidth="5"
            strokeLinejoin="miter"
            strokeLinecap="square"
          />
        )}

        {data.map((item, index) => {
          const p = point(index, item.value, data.length, maxValue);
          const isActive = index === activeIndex;

          return (
            <g
              key={item.label}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              tabIndex={0}
              className="cursor-pointer outline-none"
            >
              <line
                x1={p.x}
                x2={p.x}
                y1={PADDING.top}
                y2={HEIGHT - PADDING.bottom}
                stroke="transparent"
                strokeWidth="44"
              />
              <rect
                x={p.x - 6}
                y={p.y - 6}
                width="12"
                height="12"
                fill={isActive ? "var(--text)" : "var(--surface)"}
                stroke="var(--border)"
                strokeWidth="3"
              />
            </g>
          );
        })}

        {data.map((item, index) => {
          const tick = point(index, 0, data.length, maxValue);
          return (
            <text
              key={item.label}
              x={tick.x}
              y={HEIGHT - 16}
              textAnchor="middle"
              fontSize="10"
              fill="var(--text-3)"
            >
              {item.label}
            </text>
          );
        })}

        {active && (
          <g
            transform={`translate(${Math.min(
              activePoint.x + 14,
              WIDTH - 150
            )} ${Math.max(activePoint.y - 56, 18)})`}
          >
            <rect
              width="136"
              height="42"
              fill="var(--surface)"
              stroke="var(--border)"
              strokeWidth="2"
            />
            <text x="10" y="17" fontSize="10" fill="var(--text-3)">
              {active.label}
            </text>
            <text x="10" y="32" fontSize="10" fill="var(--text)">
              Leads: {active.value}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default ChartAreaStep;
