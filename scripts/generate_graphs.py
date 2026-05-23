from __future__ import annotations

import json
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "problems.json"
OUTPUT_DIR = ROOT / "public" / "graphs"

WIDTH = 520
HEIGHT = 390
PADDING_X = 44
PADDING_Y = 30

SAFE_GLOBALS = {
    "__builtins__": {},
    "abs": abs,
    "cos": math.cos,
    "e": math.e,
    "exp": math.exp,
    "log": math.log,
    "pi": math.pi,
    "sin": math.sin,
    "sqrt": math.sqrt,
    "tan": math.tan,
}


def evaluate(expression: str, x_value: float) -> float:
    return float(eval(expression, SAFE_GLOBALS, {"x": x_value}))


def map_x(x_value: float, x_range: tuple[float, float]) -> float:
    x_min, x_max = x_range
    usable_width = WIDTH - (2 * PADDING_X)
    return PADDING_X + ((x_value - x_min) / (x_max - x_min)) * usable_width


def map_y(y_value: float, y_range: tuple[float, float]) -> float:
    y_min, y_max = y_range
    usable_height = HEIGHT - (2 * PADDING_Y)
    return HEIGHT - PADDING_Y - ((y_value - y_min) / (y_max - y_min)) * usable_height


def build_ticks(start: float, end: float, rough_count: int = 6) -> list[float]:
    span = end - start
    if span <= 0:
        return []

    step_base = span / rough_count
    magnitude = 10 ** math.floor(math.log10(step_base))
    for factor in (1, 2, 5, 10):
        step = magnitude * factor
        if step >= step_base:
            break

    ticks: list[float] = []
    current = math.ceil(start / step) * step
    while current <= end + (step * 0.5):
        ticks.append(round(current, 8))
        current += step
    return ticks


def build_path_segments(problem: dict) -> list[str]:
    x_range = tuple(problem["x_range"])
    y_range = tuple(problem["y_range"])
    segments: list[str] = []

    for sample_start, sample_end in problem["sample_ranges"]:
        samples = 360
        active_points: list[tuple[float, float]] = []

        for index in range(samples + 1):
            ratio = index / samples
            x_value = sample_start + ((sample_end - sample_start) * ratio)

            try:
                y_value = evaluate(problem["formula_python"], x_value)
            except (ValueError, ZeroDivisionError, OverflowError):
                y_value = math.nan

            if not math.isfinite(y_value):
                if active_points:
                    segments.append(points_to_path(active_points))
                    active_points = []
                continue

            if y_value < y_range[0] - 1 or y_value > y_range[1] + 1:
                if active_points:
                    segments.append(points_to_path(active_points))
                    active_points = []
                continue

            point = (map_x(x_value, x_range), map_y(y_value, y_range))
            active_points.append(point)

        if active_points:
            segments.append(points_to_path(active_points))

    return segments


def points_to_path(points: list[tuple[float, float]]) -> str:
    if not points:
        return ""

    head_x, head_y = points[0]
    commands = [f"M {head_x:.2f} {head_y:.2f}"]
    for x_value, y_value in points[1:]:
        commands.append(f"L {x_value:.2f} {y_value:.2f}")
    return " ".join(commands)


def axis_line(value: float, axis: str, span_range: tuple[float, float]) -> str | None:
    if value < span_range[0] or value > span_range[1]:
        return None

    if axis == "x":
        mapped = map_x(value, span_range)
        return f'<line x1="{mapped:.2f}" y1="{PADDING_Y}" x2="{mapped:.2f}" y2="{HEIGHT - PADDING_Y}" class="axis" />'

    mapped = map_y(value, span_range)
    return f'<line x1="{PADDING_X}" y1="{mapped:.2f}" x2="{WIDTH - PADDING_X}" y2="{mapped:.2f}" class="axis" />'


def build_svg(problem: dict) -> str:
    x_range = tuple(problem["x_range"])
    y_range = tuple(problem["y_range"])
    x_ticks = build_ticks(x_range[0], x_range[1])
    y_ticks = build_ticks(y_range[0], y_range[1])
    x_axis = axis_line(0, "y", y_range)
    y_axis = axis_line(0, "x", x_range)
    paths = build_path_segments(problem)

    grid_x = "\n".join(
        f'<line x1="{map_x(tick, x_range):.2f}" y1="{PADDING_Y}" x2="{map_x(tick, x_range):.2f}" y2="{HEIGHT - PADDING_Y}" class="grid" />'
        for tick in x_ticks
    )
    grid_y = "\n".join(
        f'<line x1="{PADDING_X}" y1="{map_y(tick, y_range):.2f}" x2="{WIDTH - PADDING_X}" y2="{map_y(tick, y_range):.2f}" class="grid" />'
        for tick in y_ticks
    )
    tick_marks_x = "\n".join(
        f'<line x1="{map_x(tick, x_range):.2f}" y1="{map_y(0, y_range) - 5:.2f}" x2="{map_x(tick, x_range):.2f}" y2="{map_y(0, y_range) + 5:.2f}" class="tick" />'
        for tick in x_ticks
        if y_range[0] <= 0 <= y_range[1]
    )
    tick_marks_y = "\n".join(
        f'<line x1="{map_x(0, x_range) - 5:.2f}" y1="{map_y(tick, y_range):.2f}" x2="{map_x(0, x_range) + 5:.2f}" y2="{map_y(tick, y_range):.2f}" class="tick" />'
        for tick in y_ticks
        if x_range[0] <= 0 <= x_range[1]
    )
    graph_paths = "\n".join(f'<path d="{path}" class="curve" />' for path in paths if path)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" fill="none" role="img" aria-label="function graph">
  <defs>
    <linearGradient id="graph-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fbff" />
      <stop offset="100%" stop-color="#ecf4ff" />
    </linearGradient>
  </defs>
  <style>
    .frame {{ fill: url(#graph-bg); stroke: rgba(39, 93, 208, 0.18); stroke-width: 1.5; }}
    .grid {{ stroke: rgba(39, 93, 208, 0.08); stroke-width: 1; }}
    .axis {{ stroke: rgba(20, 33, 61, 0.78); stroke-width: 1.5; }}
    .tick {{ stroke: rgba(20, 33, 61, 0.68); stroke-width: 1; }}
    .curve {{ stroke: #2563eb; stroke-width: 3.4; stroke-linecap: round; stroke-linejoin: round; fill: none; }}
  </style>
  <rect x="8" y="8" width="{WIDTH - 16}" height="{HEIGHT - 16}" rx="26" class="frame" />
  <g>
    {grid_x}
    {grid_y}
  </g>
  <g>
    {x_axis or ""}
    {y_axis or ""}
    {tick_marks_x}
    {tick_marks_y}
  </g>
  <g>
    {graph_paths}
  </g>
</svg>
"""


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    problems = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    for problem in problems:
        svg = build_svg(problem)
        (OUTPUT_DIR / f"{problem['id']}.svg").write_text(svg, encoding="utf-8")

    print(f"Generated {len(problems)} SVG graphs in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
