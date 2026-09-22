export type DiagramNode = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
};

export type Point = {
  x: number;
  y: number;
};

export type ConnectionPoints = {
  start: Point;
  end: Point;
};

export type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Direction = "up" | "right" | "down" | "left";

type Anchor = {
  direction: Direction;
  boundary: Point;
  escape: Point;
};

type GraphNode = Point & {
  index: number;
  gridX: number;
  gridY: number;
};

type SearchState = {
  nodeIndex: number;
  direction: number;
  key: string;
};

type HeapItem<T> = {
  priority: number;
  value: T;
};

const EPSILON = 0.001;

/** Space kept between a routed line and an unrelated shape. */
const ROUTE_CLEARANCE = 14;

/** Distance from the exact shape boundary before routing may turn. */
const ANCHOR_ESCAPE = 22;

/** Short unobstructed diagonal connections stay straight. */
const MAX_DIRECT_DIAGONAL_LENGTH = 260;

/** A* tuning. */
const BEND_PENALTY = 180;
const WRONG_ANCHOR_PENALTY = 120;
const BACK_EDGE_PENALTY = 240;
const OUTER_LANE_BONUS = 1_000;
const MAX_GRAPH_NODES = 15_000;
const MAX_ASTAR_EXPANSIONS = 100_000;

const SEARCH_DIRECTIONS: Array<{
  dx: number;
  dy: number;
  direction: Direction;
}> = [
  { dx: 0, dy: -1, direction: "up" },
  { dx: 1, dy: 0, direction: "right" },
  { dx: 0, dy: 1, direction: "down" },
  { dx: -1, dy: 0, direction: "left" },
];

/* ============================================================
   BASIC GEOMETRY
   ============================================================ */

function getCenter(node: DiagramNode): Point {
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2,
  };
}

function isDiamond(node: DiagramNode): boolean {
  return node.type === "diamond" || node.type === "rhombus";
}

function isEllipse(node: DiagramNode): boolean {
  return node.type === "ellipse" || node.type === "circle";
}

function samePoint(a: Point, b: Point): boolean {
  return (
    Math.abs(a.x - b.x) < EPSILON &&
    Math.abs(a.y - b.y) < EPSILON
  );
}

function directionVector(direction: Direction): Point {
  switch (direction) {
    case "up":
      return { x: 0, y: -1 };
    case "right":
      return { x: 1, y: 0 };
    case "down":
      return { x: 0, y: 1 };
    case "left":
      return { x: -1, y: 0 };
  }
}

function directionBetween(
  a: Point,
  b: Point,
): Direction | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (
    Math.abs(dx) < EPSILON &&
    Math.abs(dy) < EPSILON
  ) {
    return null;
  }

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "right" : "left";
  }

  return dy >= 0 ? "down" : "up";
}

function directionIndex(direction: Direction | null): number {
  if (!direction) return -1;

  switch (direction) {
    case "up":
      return 0;
    case "right":
      return 1;
    case "down":
      return 2;
    case "left":
      return 3;
  }
}

function manhattan(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/* ============================================================
   SHAPE BOUNDARIES
   ============================================================ */

/**
 * Find where a ray from a shape's center intersects its boundary.
 *
 * Rectangle:
 *   normal rectangle/ray intersection.
 *
 * Diamond:
 *   |x|/a + |y|/b = 1
 *
 * Ellipse:
 *   x²/a² + y²/b² = 1
 */
function getOrthogonalBoundaryPoint(
  node: DiagramNode,
  target: Point,
): Point {
  const center = getCenter(node);

  const dx = target.x - center.x;
  const dy = target.y - center.y;

  const halfWidth = node.width / 2;
  const halfHeight = node.height / 2;

  /*
   * Choose the side based on the dominant direction.
   *
   * More horizontal than vertical:
   *   attach left/right
   *
   * More vertical than horizontal:
   *   attach top/bottom
   */
  if (Math.abs(dx) >= Math.abs(dy)) {
    /*
     * RIGHT
     */
    if (dx >= 0) {
      return getHorizontalBoundaryPoint(
        node,
        "right",
      );
    }

    /*
     * LEFT
     */
    return getHorizontalBoundaryPoint(
      node,
      "left",
    );
  }

  /*
   * DOWN
   */
  if (dy >= 0) {
    return getVerticalBoundaryPoint(
      node,
      "bottom",
    );
  }

  /*
   * UP
   */
  return getVerticalBoundaryPoint(
    node,
    "top",
  );
}

function getHorizontalBoundaryPoint(
  node: DiagramNode,
  side: "left" | "right",
): Point {
  const center = getCenter(node);

  /*
   * Rectangle
   */
  if (
    node.type !== "circle" &&
    node.type !== "ellipse" &&
    node.type !== "diamond" &&
    node.type !== "rhombus"
  ) {
    return {
      x:
        side === "right"
          ? node.x + node.width
          : node.x,

      y: center.y,
    };
  }

  /*
   * Ellipse / circle
   *
   * Exact circumference point.
   */
  if (
    node.type === "circle" ||
    node.type === "ellipse"
  ) {
    return {
      x:
        side === "right"
          ? center.x + node.width / 2
          : center.x - node.width / 2,

      y: center.y,
    };
  }

  /*
   * Diamond / rhombus
   *
   * Right/left vertex.
   */
  return {
    x:
      side === "right"
        ? center.x + node.width / 2
        : center.x - node.width / 2,

    y: center.y,
  };
}

function getVerticalBoundaryPoint(
  node: DiagramNode,
  side: "top" | "bottom",
): Point {
  const center = getCenter(node);

  /*
   * Rectangle
   */
  if (
    node.type !== "circle" &&
    node.type !== "ellipse" &&
    node.type !== "diamond" &&
    node.type !== "rhombus"
  ) {
    return {
      x: center.x,

      y:
        side === "bottom"
          ? node.y + node.height
          : node.y,
    };
  }

  /*
   * Ellipse / circle
   *
   * Exact circumference point.
   */
  if (
    node.type === "circle" ||
    node.type === "ellipse"
  ) {
    return {
      x: center.x,

      y:
        side === "bottom"
          ? center.y + node.height / 2
          : center.y - node.height / 2,
    };
  }

  /*
   * Diamond / rhombus
   *
   * Top/bottom vertex.
   */
  return {
    x: center.x,

    y:
      side === "bottom"
        ? center.y + node.height / 2
        : center.y - node.height / 2,
  };
}

export function calculateConnectionPoints(
  fromNode: DiagramNode,
  toNode: DiagramNode,
): ConnectionPoints {
  const fromCenter =
    getCenter(fromNode);

  const toCenter =
    getCenter(toNode);

  const start =
    getOrthogonalBoundaryPoint(
      fromNode,
      toCenter,
    );

  const end =
    getOrthogonalBoundaryPoint(
      toNode,
      fromCenter,
    );

  return {
    start,
    end,
  };
}

/**
 * Kept as a public helper for callers that only need exact
 * source/destination boundary points.
 */

/* ============================================================
   CARDINAL PORTS / EXACT ATTACHMENT
   ============================================================ */

function oppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case "up":
      return "down";
    case "right":
      return "left";
    case "down":
      return "up";
    case "left":
      return "right";
  }
}

function dominantDirection(from: Point, to: Point): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (
    Math.abs(dx) < EPSILON &&
    Math.abs(dy) < EPSILON
  ) {
    return "down";
  }

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "right" : "left";
  }

  return dy >= 0 ? "down" : "up";
}

function getAnchorForDirection(
  node: DiagramNode,
  direction: Direction,
): Anchor {
  const center = getCenter(node);
  const vector = directionVector(direction);

  /*
   * Sending a ray exactly along a cardinal direction gives:
   * - rectangle: side midpoint
   * - ellipse: side extreme
   * - diamond: vertex
   */
  const boundary = getOrthogonalBoundaryPoint(
  node,
  {
    x:
      center.x +
      vector.x * 1_000_000,

    y:
      center.y +
      vector.y * 1_000_000,
  },
);

  /*
   * The escape point is deliberately outside the node. This is the
   * crucial part that stops an orthogonal route from turning back into
   * a diamond/rectangle immediately after touching it.
   */
  const escape = {
    x: boundary.x + vector.x * ANCHOR_ESCAPE,
    y: boundary.y + vector.y * ANCHOR_ESCAPE,
  };

  return {
    direction,
    boundary,
    escape,
  };
}

function getAnchorDirections(
  node: DiagramNode,
  otherNode: DiagramNode,
  preferOuter: boolean,
): Direction[] {
  const preferred = dominantDirection(
    getCenter(node),
    getCenter(otherNode),
  );

  const opposite = oppositeDirection(preferred);
  const horizontal =
    preferred === "left" || preferred === "right";

  const perpendicular: Direction[] = horizontal
    ? ["down", "up"]
    : ["right", "left"];

  if (preferOuter) {
    /* Back/upward edges look much better on the outside. */
    return Array.from(
      new Set([
        "left",
        "right",
        ...perpendicular,
        preferred,
        opposite,
      ]),
    );
  }

  return Array.from(
    new Set([
      preferred,
      ...perpendicular,
      opposite,
    ]),
  );
}

function getAnchorCandidates(
  node: DiagramNode,
  otherNode: DiagramNode,
  preferOuter: boolean,
): Anchor[] {
  return getAnchorDirections(
    node,
    otherNode,
    preferOuter,
  ).map(direction =>
    getAnchorForDirection(node, direction),
  );
}

/* ============================================================
   COLLISION HELPERS
   ============================================================ */

function expandBox(box: Box, padding = ROUTE_CLEARANCE): Box {
  return {
    x: box.x - padding,
    y: box.y - padding,
    width: box.width + padding * 2,
    height: box.height + padding * 2,
  };
}

function pointStrictlyInsideBox(point: Point, box: Box): boolean {
  return (
    point.x > box.x + EPSILON &&
    point.x < box.x + box.width - EPSILON &&
    point.y > box.y + EPSILON &&
    point.y < box.y + box.height - EPSILON
  );
}

/**
 * For axis-aligned segments, touching an obstacle boundary is allowed.
 * Crossing through the interior is not.
 */
function segmentBlocked(
  a: Point,
  b: Point,
  obstacle: Box,
): boolean {
  const horizontal =
    Math.abs(a.y - b.y) < EPSILON;
  const vertical =
    Math.abs(a.x - b.x) < EPSILON;

  if (horizontal) {
    const y = a.y;

    if (
      y <= obstacle.y + EPSILON ||
      y >= obstacle.y + obstacle.height - EPSILON
    ) {
      return false;
    }

    const minX = Math.min(a.x, b.x);
    const maxX = Math.max(a.x, b.x);

    const overlap =
      Math.min(maxX, obstacle.x + obstacle.width) -
      Math.max(minX, obstacle.x);

    return overlap > EPSILON;
  }

  if (vertical) {
    const x = a.x;

    if (
      x <= obstacle.x + EPSILON ||
      x >= obstacle.x + obstacle.width - EPSILON
    ) {
      return false;
    }

    const minY = Math.min(a.y, b.y);
    const maxY = Math.max(a.y, b.y);

    const overlap =
      Math.min(maxY, obstacle.y + obstacle.height) -
      Math.max(minY, obstacle.y);

    return overlap > EPSILON;
  }

  /* Conservative fallback for an unexpected diagonal segment. */
  const steps = 50;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const point = {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };

    if (pointStrictlyInsideBox(point, obstacle)) {
      return true;
    }
  }

  return false;
}

function pathBlocked(
  path: Point[],
  obstacles: Box[],
): boolean {
  for (let i = 0; i < path.length - 1; i++) {
    for (const obstacle of obstacles) {
      if (segmentBlocked(path[i], path[i + 1], obstacle)) {
        return true;
      }
    }
  }

  return false;
}

function pointInsideAnyBox(
  point: Point,
  boxes: Box[],
): boolean {
  return boxes.some(box => pointStrictlyInsideBox(point, box));
}

function boxMatchesNode(box: Box, node: DiagramNode): boolean {
  return (
    Math.abs(box.x - node.x) < EPSILON &&
    Math.abs(box.y - node.y) < EPSILON &&
    Math.abs(box.width - node.width) < EPSILON &&
    Math.abs(box.height - node.height) < EPSILON
  );
}

function removeSourceAndTargetBoxes(
  allShapeBoxes: Box[],
  source: DiagramNode,
  target: DiagramNode,
): Box[] {
  return allShapeBoxes.filter(
    box =>
      !boxMatchesNode(box, source) &&
      !boxMatchesNode(box, target),
  );
}

/* ============================================================
   PATH UTILITIES
   ============================================================ */

function isHorizontal(a: Point, b: Point): boolean {
  return Math.abs(a.y - b.y) < EPSILON;
}

function isVertical(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) < EPSILON;
}

function simplifyPath(path: Point[]): Point[] {
  if (path.length <= 2) {
    return path.slice();
  }

  const deduped: Point[] = [];

  for (const point of path) {
    if (
      deduped.length === 0 ||
      !samePoint(deduped[deduped.length - 1], point)
    ) {
      deduped.push({ x: point.x, y: point.y });
    }
  }

  let result = deduped;
  let changed = true;

  while (changed && result.length >= 3) {
    changed = false;

    for (let i = 1; i < result.length - 1; i++) {
      const prev = result[i - 1];
      const current = result[i];
      const next = result[i + 1];

      const horizontal =
        isHorizontal(prev, current) &&
        isHorizontal(current, next);

      const vertical =
        isVertical(prev, current) &&
        isVertical(current, next);

      if (horizontal || vertical) {
        result = [
          ...result.slice(0, i),
          ...result.slice(i + 1),
        ];
        changed = true;
        break;
      }
    }
  }

  return result;
}

function routeLength(path: Point[]): number {
  let length = 0;

  for (let i = 0; i < path.length - 1; i++) {
    length += manhattan(path[i], path[i + 1]);
  }

  return length;
}

function countBends(path: Point[]): number {
  let bends = 0;

  for (let i = 1; i < path.length - 1; i++) {
    const before = directionBetween(path[i - 1], path[i]);
    const after = directionBetween(path[i], path[i + 1]);

    if (before && after && before !== after) {
      bends++;
    }
  }

  return bends;
}

/* ============================================================
   MIN HEAP
   ============================================================ */

class MinHeap<T> {
  private items: HeapItem<T>[] = [];

  get size(): number {
    return this.items.length;
  }

  push(value: T, priority: number): void {
    const item = { value, priority };
    this.items.push(item);

    let index = this.items.length - 1;

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (this.items[parent].priority <= priority) {
        break;
      }

      this.items[index] = this.items[parent];
      index = parent;
    }

    this.items[index] = item;
  }

  pop(): T | undefined {
    if (this.items.length === 0) {
      return undefined;
    }

    const root = this.items[0];
    const last = this.items.pop()!;

    if (this.items.length > 0) {
      let index = 0;

      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;

        if (left >= this.items.length) {
          break;
        }

        let smaller = left;

        if (
          right < this.items.length &&
          this.items[right].priority <
            this.items[left].priority
        ) {
          smaller = right;
        }

        if (
          this.items[smaller].priority >=
          last.priority
        ) {
          break;
        }

        this.items[index] = this.items[smaller];
        index = smaller;
      }

      this.items[index] = last;
    }

    return root.value;
  }
}

/* ============================================================
   VISIBILITY GRAPH
   ============================================================ */

function uniqueSorted(values: number[]): number[] {
  return Array.from(
    new Set(values.map(value => Number(value.toFixed(3)))),
  ).sort((a, b) => a - b);
}

function buildVisibilityGraph(
  start: Point,
  end: Point,
  obstacles: Box[],
): {
  nodes: GraphNode[];
  indexByGrid: Map<string, number>;
  indexByCoordinate: Map<string, number>;
} | null {
  const xs: number[] = [start.x, end.x];
  const ys: number[] = [start.y, end.y];

  for (const obstacle of obstacles) {
    xs.push(obstacle.x, obstacle.x + obstacle.width);
    ys.push(obstacle.y, obstacle.y + obstacle.height);
  }

  /*
   * Outer frame gives back-edges somewhere safe to travel around
   * the main diagram.
   */
  const outerMargin = 90;

  const minX = Math.min(...xs) - outerMargin;
  const maxX = Math.max(...xs) + outerMargin;
  const minY = Math.min(...ys) - outerMargin;
  const maxY = Math.max(...ys) + outerMargin;

  xs.push(minX, maxX);
  ys.push(minY, maxY);

  const xCoords = uniqueSorted(xs);
  const yCoords = uniqueSorted(ys);

  if (xCoords.length * yCoords.length > MAX_GRAPH_NODES) {
    return null;
  }

  const nodes: GraphNode[] = [];
  const indexByGrid = new Map<string, number>();
  const indexByCoordinate = new Map<string, number>();

  for (let gridX = 0; gridX < xCoords.length; gridX++) {
    for (let gridY = 0; gridY < yCoords.length; gridY++) {
      const point = {
        x: xCoords[gridX],
        y: yCoords[gridY],
      };

      if (pointInsideAnyBox(point, obstacles)) {
        continue;
      }

      const index = nodes.length;

      nodes.push({
        ...point,
        index,
        gridX,
        gridY,
      });

      indexByGrid.set(`${gridX},${gridY}`, index);
      indexByCoordinate.set(
        `${point.x.toFixed(3)},${point.y.toFixed(3)}`,
        index,
      );
    }
  }

  return {
    nodes,
    indexByGrid,
    indexByCoordinate,
  };
}

function reconstructPath(
  finalState: SearchState,
  nodes: GraphNode[],
  cameFrom: Map<string, string>,
): Point[] {
  const points: Point[] = [];
  let currentKey = finalState.key;

  while (true) {
    const [nodeIndexText] = currentKey.split(":");
    const nodeIndex = Number(nodeIndexText);
    const node = nodes[nodeIndex];

    if (!node) {
      break;
    }

    points.push({ x: node.x, y: node.y });

    const previous = cameFrom.get(currentKey);
    if (!previous) {
      break;
    }

    currentKey = previous;
  }

  points.reverse();
  return simplifyPath(points);
}

function findOrthogonalPath(
  start: Point,
  end: Point,
  obstacles: Box[],
): Point[] | null {
  if (samePoint(start, end)) {
    return [start];
  }

  const graph = buildVisibilityGraph(
    start,
    end,
    obstacles,
  );

  if (!graph) {
    return null;
  }

  const {
    nodes,
    indexByCoordinate,
    indexByGrid,
  } = graph;

  const startIndex = indexByCoordinate.get(
    `${start.x.toFixed(3)},${start.y.toFixed(3)}`,
  );

  const endIndex = indexByCoordinate.get(
    `${end.x.toFixed(3)},${end.y.toFixed(3)}`,
  );

  if (
    startIndex === undefined ||
    endIndex === undefined
  ) {
    return null;
  }

  const heap = new MinHeap<SearchState>();
  const gScore = new Map<string, number>();
  const cameFrom = new Map<string, string>();

  const startKey = `${startIndex}:-1`;
  gScore.set(startKey, 0);

  heap.push(
    {
      nodeIndex: startIndex,
      direction: -1,
      key: startKey,
    },
    manhattan(nodes[startIndex], nodes[endIndex]),
  );

  let expansions = 0;

  while (heap.size > 0) {
    const current = heap.pop();
    if (!current) break;

    const currentG = gScore.get(current.key);
    if (currentG === undefined) continue;

    if (current.nodeIndex === endIndex) {
      return reconstructPath(
        current,
        nodes,
        cameFrom,
      );
    }

    expansions++;
    if (expansions > MAX_ASTAR_EXPANSIONS) {
      return null;
    }

    const currentNode = nodes[current.nodeIndex];

    for (const move of SEARCH_DIRECTIONS) {
      const nextGridX = currentNode.gridX + move.dx;
      const nextGridY = currentNode.gridY + move.dy;

      if (nextGridX < 0 || nextGridY < 0) {
        continue;
      }

      const nextIndex = indexByGrid.get(
        `${nextGridX},${nextGridY}`,
      );

      if (nextIndex === undefined) {
        continue;
      }

      const nextNode = nodes[nextIndex];

      if (
        segmentBlocked(
          currentNode,
          nextNode,
          obstacles[0] ?? {
            x: Infinity,
            y: Infinity,
            width: 0,
            height: 0,
          },
        )
      ) {
        /* The loop below does the full check. */
      }

      if (
        obstacles.some(obstacle =>
          segmentBlocked(
            currentNode,
            nextNode,
            obstacle,
          ),
        )
      ) {
        continue;
      }

      const nextDirection = directionIndex(
        move.direction,
      );

      const bendCost =
        current.direction !== -1 &&
        current.direction !== nextDirection
          ? BEND_PENALTY
          : 0;

      const tentativeG =
        currentG +
        manhattan(currentNode, nextNode) +
        bendCost;

      const nextKey = `${nextIndex}:${nextDirection}`;
      const previousG = gScore.get(nextKey);

      if (
        previousG !== undefined &&
        tentativeG >= previousG
      ) {
        continue;
      }

      cameFrom.set(nextKey, current.key);
      gScore.set(nextKey, tentativeG);

      heap.push(
        {
          nodeIndex: nextIndex,
          direction: nextDirection,
          key: nextKey,
        },
        tentativeG +
          manhattan(nextNode, nodes[endIndex]),
      );
    }
  }

  return null;
}

/* ============================================================
   ROUTE SCORING / OUTER LANES
   ============================================================ */

function routeUsesVerticalLane(
  route: Point[],
  laneX: number,
): boolean {
  return route.some(point =>
    Math.abs(point.x - laneX) < EPSILON,
  );
}

function routeScore(
  route: Point[],
  sourceDirection: Direction,
  targetDirection: Direction,
  preferOuter: boolean,
  outerLaneX?: number,
): number {
  const first =
    route.length >= 2
      ? directionBetween(route[0], route[1])
      : null;

  const last =
    route.length >= 2
      ? directionBetween(
          route[route.length - 2],
          route[route.length - 1],
        )
      : null;

  let score =
    routeLength(route) +
    countBends(route) * BEND_PENALTY;

  if (
    first &&
    first !== sourceDirection
  ) {
    score += WRONG_ANCHOR_PENALTY;
  }

  /*
   * At the target, the final segment must point towards the target
   * boundary. The target anchor direction is the outward direction,
   * therefore the final path direction is its opposite.
   */
  if (
    last &&
    last !== oppositeDirection(targetDirection)
  ) {
    score += WRONG_ANCHOR_PENALTY;
  }

  if (preferOuter) {
    score += BACK_EDGE_PENALTY;

    if (
      outerLaneX !== undefined &&
      routeUsesVerticalLane(route, outerLaneX)
    ) {
      score -= OUTER_LANE_BONUS;
    }
  }

  return score;
}

function getOverallBounds(
  boxes: Box[],
  start: Point,
  end: Point,
): Box {
  const left = Math.min(
    start.x,
    end.x,
    ...boxes.map(box => box.x),
  );

  const top = Math.min(
    start.y,
    end.y,
    ...boxes.map(box => box.y),
  );

  const right = Math.max(
    start.x,
    end.x,
    ...boxes.map(box => box.x + box.width),
  );

  const bottom = Math.max(
    start.y,
    end.y,
    ...boxes.map(box => box.y + box.height),
  );

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

function createOuterLanePath(
  start: Point,
  end: Point,
  laneX: number,
): Point[] {
  return [
    start,
    { x: laneX, y: start.y },
    { x: laneX, y: end.y },
    end,
  ];
}

/* ============================================================
   ENDPOINT VALIDATION
   ============================================================ */

/**
 * Verify that a route still starts/ends exactly at the boundary points.
 * This protects the most important user-visible property: no gaps.
 */
function enforceExactEndpoints(
  route: Point[],
  startBoundary: Point,
  endBoundary: Point,
): Point[] {
  if (route.length === 0) {
    return [startBoundary, endBoundary];
  }

  const result = route.slice();
  result[0] = { ...startBoundary };
  result[result.length - 1] = {
    ...endBoundary,
  };

  return result;
}

/* ============================================================
   MAIN ROUTER
   ============================================================ */

/**
 * Main connection router.
 *
 * Guarantees:
 * - every normal connector starts exactly on the source boundary;
 * - every connector ends exactly on the target boundary;
 * - first/last routing segments escape/approach the node correctly;
 * - diamonds/rhombi use cardinal ports, so a connector cannot turn back
 *   through the diamond;
 * - other shapes are treated as obstacles with clearance;
 * - long/back connections prefer clean orthogonal/outer-lane routes;
 * - short unobstructed connections can remain straight.
 */
export function routeConnection(
  fromNode: DiagramNode,
  toNode: DiagramNode,
  allShapeBoxes: Box[],
): Point[] {
  const direct = calculateConnectionPoints(
    fromNode,
    toNode,
  );

  const fromCenter = getCenter(fromNode);
  const toCenter = getCenter(toNode);

  const dx = direct.end.x - direct.start.x;
  const dy = direct.end.y - direct.start.y;

  const directLength = Math.sqrt(
    dx * dx + dy * dy,
  );

  const directIsStraight =
    Math.abs(dx) < EPSILON ||
    Math.abs(dy) < EPSILON;

  /*
   * Direct-line collision only needs to consider unrelated shapes.
   * Source/target are intentionally excluded because the line begins
   * exactly at their boundaries.
   */
  const otherBoxes = removeSourceAndTargetBoxes(
    allShapeBoxes,
    fromNode,
    toNode,
  );

  const expandedOtherBoxes = otherBoxes.map(box =>
    expandBox(box),
  );

  const directIsClear = !pathBlocked(
    [direct.start, direct.end],
    expandedOtherBoxes,
  );

  /*
   * Keep simple connections simple.
   * This also means short diagonal relationships retain a natural
   * hand-drawn Excalidraw appearance.
   */
  if (
    directIsClear &&
    (directIsStraight ||
      directLength <= MAX_DIRECT_DIAGONAL_LENGTH)
  ) {
    return enforceExactEndpoints(
      [direct.start, direct.end],
      direct.start,
      direct.end,
    );
  }

  const preferOuter =
    toCenter.y < fromCenter.y - 20;

  const sourceCandidates = getAnchorCandidates(
    fromNode,
    toNode,
    preferOuter,
  );

  const targetCandidates = getAnchorCandidates(
    toNode,
    fromNode,
    preferOuter,
  );

  /*
   * For the middle routing area, ALL shapes are obstacles. The source
   * and target are included here because the escape points must be
   * outside their clearance boxes. The boundary -> escape segment is
   * validated separately against unrelated boxes only; otherwise the
   * deliberate escape segment would be falsely considered a collision
   * with its own source shape's clearance box.
   */
  const expandedAllBoxes = allShapeBoxes.map(box =>
    expandBox(box),
  );

  let bestRoute: Point[] | null = null;
  let bestScore = Infinity;

  for (const source of sourceCandidates) {
    if (
      pointInsideAnyBox(
        source.escape,
        expandedAllBoxes,
      )
    ) {
      continue;
    }

    for (const target of targetCandidates) {
      if (
        pointInsideAnyBox(
          target.escape,
          expandedAllBoxes,
        )
      ) {
        continue;
      }

      const middle = findOrthogonalPath(
        source.escape,
        target.escape,
        expandedAllBoxes,
      );

      if (!middle || middle.length === 0) {
        continue;
      }

      const combined = simplifyPath([
        source.boundary,
        source.escape,
        ...middle.slice(1, -1),
        target.escape,
        target.boundary,
      ]);

      /*
       * IMPORTANT: validate the complete route only against unrelated
       * shapes. The source->escape and escape->target portions are
       * intentionally inside the source/target clearance regions.
       */
      if (
        pathBlocked(
          combined,
          expandedOtherBoxes,
        )
      ) {
        continue;
      }

      const score = routeScore(
        combined,
        source.direction,
        target.direction,
        preferOuter,
      );

      if (score < bestScore) {
        bestScore = score;
        bestRoute = combined;
      }
    }
  }

  /* ============================================================
     EXPLICIT OUTER LANES FOR BACK EDGES
     ============================================================ */

  if (preferOuter) {
    const bounds = getOverallBounds(
      expandedAllBoxes,
      fromCenter,
      toCenter,
    );

    const laneGap = 34;
    const leftLane = bounds.x - laneGap;
    const rightLane = bounds.x + bounds.width + laneGap;

    for (const source of sourceCandidates) {
      if (
        pointInsideAnyBox(
          source.escape,
          expandedAllBoxes,
        )
      ) {
        continue;
      }

      for (const target of targetCandidates) {
        if (
          pointInsideAnyBox(
            target.escape,
            expandedAllBoxes,
          )
        ) {
          continue;
        }

        for (const laneX of [leftLane, rightLane]) {
          const outer = createOuterLanePath(
            source.escape,
            target.escape,
            laneX,
          );

          if (
            pathBlocked(
              outer,
              expandedAllBoxes,
            )
          ) {
            continue;
          }

          const complete = simplifyPath([
            source.boundary,
            source.escape,
            ...outer.slice(1, -1),
            target.escape,
            target.boundary,
          ]);

          if (
            pathBlocked(
              complete,
              expandedOtherBoxes,
            )
          ) {
            continue;
          }

          const score = routeScore(
            complete,
            source.direction,
            target.direction,
            true,
            laneX,
          );

          if (score < bestScore) {
            bestScore = score;
            bestRoute = complete;
          }
        }
      }
    }
  }

  if (bestRoute) {
    return enforceExactEndpoints(
      simplifyPath(bestRoute),
      bestRoute[0],
      bestRoute[bestRoute.length - 1],
    );
  }

  /* ============================================================
     SAFE FINAL FALLBACK
     ============================================================ */

  const fallbackSource =
    sourceCandidates[0] ??
    getAnchorForDirection(
      fromNode,
      dominantDirection(
        fromCenter,
        toCenter,
      ),
    );

  const fallbackTarget =
    targetCandidates[0] ??
    getAnchorForDirection(
      toNode,
      dominantDirection(
        toCenter,
        fromCenter,
      ),
    );

  const fallbackMiddle = findOrthogonalPath(
    fallbackSource.escape,
    fallbackTarget.escape,
    expandedAllBoxes,
  );

  if (fallbackMiddle) {
    return enforceExactEndpoints(
      simplifyPath([
        fallbackSource.boundary,
        fallbackSource.escape,
        ...fallbackMiddle.slice(1, -1),
        fallbackTarget.escape,
        fallbackTarget.boundary,
      ]),
      fallbackSource.boundary,
      fallbackTarget.boundary,
    );
  }

  /* Last resort: clean two-bend orthogonal connection. */
  const lastResort = simplifyPath([
    fallbackSource.boundary,
    fallbackSource.escape,
    {
      x: fallbackSource.escape.x,
      y: fallbackTarget.escape.y,
    },
    fallbackTarget.escape,
    fallbackTarget.boundary,
  ]);

  return enforceExactEndpoints(
    lastResort,
    fallbackSource.boundary,
    fallbackTarget.boundary,
  );
}
