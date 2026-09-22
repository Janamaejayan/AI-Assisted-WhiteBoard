import {
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";

import {
  routeConnection,
  type DiagramNode,
  type Box,
  type Point,
} from "./geometry";

/* ============================================================
   TYPES
   ============================================================ */

export type DiagramElement = {
  id: string;

  type:
    | "rectangle"
    | "diamond"
    | "ellipse"
    | "circle"
    | "rhombus"
    | "text"
    | "arrow"
    | "line";

  x: number;
  y: number;
  width: number;
  height: number;

  text: string;

  from: string | null;
  to: string | null;

  label: string | null;
};

export type DiagramResult = {
  type: string;
  elements: DiagramElement[];
};

export type ConvertOptions = {
  offsetX?: number;
  offsetY?: number;
  idPrefix?: string;
};

type ExcalidrawSkeleton = Parameters<
  typeof convertToExcalidrawElements
>[0][number];

/* ============================================================
   BASIC HELPERS
   ============================================================ */

function createId(
  originalId: string,
  prefix: string,
): string {
  return `${prefix}-${originalId}`;
}

function isConnection(
  element: DiagramElement,
): boolean {
  return (
    element.type === "arrow" ||
    element.type === "line"
  );
}

function isShape(
  element: DiagramElement,
): boolean {
  return (
    element.type === "rectangle" ||
    element.type === "diamond" ||
    element.type === "ellipse" ||
    element.type === "circle" ||
    element.type === "rhombus"
  );
}

/* ============================================================
   BOX HELPERS
   ============================================================
 */

function boxesOverlap(
  a: Box,
  b: Box,
  padding = 0,
): boolean {
  return !(
    a.x + a.width + padding < b.x ||
    a.x > b.x + b.width + padding ||
    a.y + a.height + padding < b.y ||
    a.y > b.y + b.height + padding
  );
}

function getElementBox(
  element: DiagramElement,
  offsetX: number,
  offsetY: number,
): Box {
  return {
    x: element.x + offsetX,
    y: element.y + offsetY,
    width: element.width,
    height: element.height,
  };
}

/* ============================================================
   TEXT WIDTH
   ============================================================ */

function estimateTextWidth(
  text: string,
  fontSize: number,
): number {
  const averageCharacterWidth =
    fontSize * 0.55;

  return Math.max(
    60,
    text.length *
      averageCharacterWidth +
      20,
  );
}

/* ============================================================
   LABEL POSITIONING
   ============================================================ */

type LabelPosition = {
  x: number;
  y: number;
};

function segmentLength(
  a: Point,
  b: Point,
): number {
  return Math.sqrt(
    (b.x - a.x) ** 2 +
      (b.y - a.y) ** 2,
  );
}

/**
 * Find the longest useful segment of the actual routed path.
 * Tiny source/target escape segments are ignored where possible.
 */
function getBestLabelSegment(
  route: Point[],
): {
  start: Point;
  end: Point;
} {
  if (route.length < 2) {
    const point = route[0] ?? {
      x: 0,
      y: 0,
    };

    return {
      start: point,
      end: {
        x: point.x + 1,
        y: point.y,
      },
    };
  }

  let bestIndex = 0;
  let bestLength = -1;

  for (
    let i = 0;
    i < route.length - 1;
    i++
  ) {
    const length = segmentLength(
      route[i],
      route[i + 1],
    );

    const useful =
      length >= 30 ||
      route.length <= 3;

    if (
      useful &&
      length > bestLength
    ) {
      bestLength = length;
      bestIndex = i;
    }
  }

  return {
    start: route[bestIndex],
    end: route[bestIndex + 1],
  };
}

function getLabelCandidatesForRoute(
  route: Point[],
  labelWidth: number,
  labelHeight: number,
): LabelPosition[] {
  const segment =
    getBestLabelSegment(route);

  const start = segment.start;
  const end = segment.end;

  const centerX =
    (start.x + end.x) / 2;
  const centerY =
    (start.y + end.y) / 2;

  const horizontal =
    Math.abs(start.y - end.y) <
    0.001;

  const GAP = 12;

  if (horizontal) {
    return [
      {
        x:
          centerX -
          labelWidth / 2,
        y:
          centerY -
          labelHeight -
          GAP,
      },
      {
        x:
          centerX -
          labelWidth / 2,
        y:
          centerY + GAP,
      },
      {
        x: centerX + GAP,
        y:
          centerY -
          labelHeight -
          GAP,
      },
      {
        x: centerX + GAP,
        y:
          centerY + GAP,
      },
      {
        x:
          centerX -
          labelWidth -
          GAP,
        y:
          centerY -
          labelHeight -
          GAP,
      },
      {
        x:
          centerX -
          labelWidth -
          GAP,
        y:
          centerY + GAP,
      },
    ];
  }

  return [
    {
      x: centerX + GAP,
      y:
        centerY -
        labelHeight / 2,
    },
    {
      x:
        centerX -
        labelWidth -
        GAP,
      y:
        centerY -
        labelHeight / 2,
    },
    {
      x: centerX + GAP,
      y:
        centerY -
        labelHeight -
        GAP,
    },
    {
      x: centerX + GAP,
      y: centerY + GAP,
    },
    {
      x:
        centerX -
        labelWidth -
        GAP,
      y:
        centerY -
        labelHeight -
        GAP,
    },
    {
      x:
        centerX -
        labelWidth -
        GAP,
      y: centerY + GAP,
    },
  ];
}

function findBestLabelPosition(
  candidates: LabelPosition[],
  labelWidth: number,
  labelHeight: number,
  nodeBoxes: Box[],
  existingLabels: Box[],
): LabelPosition {
  const LABEL_PADDING = 6;

  for (const candidate of candidates) {
    const candidateBox: Box = {
      x: candidate.x,
      y: candidate.y,
      width: labelWidth,
      height: labelHeight,
    };

    const hitsNode = nodeBoxes.some(node =>
      boxesOverlap(
        candidateBox,
        node,
        LABEL_PADDING,
      ),
    );

    if (hitsNode) {
      continue;
    }

    const hitsLabel = existingLabels.some(label =>
      boxesOverlap(
        candidateBox,
        label,
        LABEL_PADDING,
      ),
    );

    if (hitsLabel) {
      continue;
    }

    return candidate;
  }

  return candidates[0] ?? {
    x: 0,
    y: 0,
  };
}

/* ============================================================
   MAIN CONVERTER
   ============================================================ */

export function convertDiagramToExcalidraw(
  diagram: DiagramResult,
  options: ConvertOptions = {},
) {
  const {
    offsetX = 0,
    offsetY = 0,
    idPrefix = `ai-${Date.now()}`,
  } = options;

  const elements = diagram.elements;

  /* ==========================================================
     NODE MAP
     ========================================================== */

  const nodeMap =
    new Map<string, DiagramElement>();

  for (const element of elements) {
    if (!isConnection(element)) {
      nodeMap.set(
        element.id,
        element,
      );
    }
  }

  /* ==========================================================
     UNIQUE IDs
     ========================================================== */

  const idMap =
    new Map<string, string>();

  for (const element of elements) {
    idMap.set(
      element.id,
      createId(
        element.id,
        idPrefix,
      ),
    );
  }

  /* ==========================================================
     SHAPE ELEMENTS
     ========================================================== */

  const shapeElements =
    elements.filter(element =>
      isShape(element),
    );

  /* ==========================================================
     COLLISION BOXES
     ========================================================== */

  const nodeBoxes: Box[] =
    shapeElements.map(element =>
      getElementBox(
        element,
        offsetX,
        offsetY,
      ),
    );

  /* ==========================================================
     LABEL TRACKING
     ========================================================== */

  const placedLabelBoxes: Box[] = [];

  /* ==========================================================
     EXCALIDRAW SKELETONS
     ========================================================== */

  const skeletons:
    ExcalidrawSkeleton[] = [];

  /* ==========================================================
     1. SHAPES AND TEXT
     ========================================================== */

  for (const element of elements) {
    if (isConnection(element)) {
      continue;
    }

    /* ========================================================
       STANDALONE TEXT
       ======================================================== */

    if (element.type === "text") {
      skeletons.push({
        id:
          idMap.get(
            element.id,
          )!,
        type: "text",
        x:
          element.x + offsetX,
        y:
          element.y + offsetY,
        width:
          element.width || 150,
        height:
          element.height || 30,
        text: element.text,
        fontSize: 20,
        fontFamily: 1,
        strokeColor: "#1e1e1e",
        backgroundColor:
          "transparent",
        textAlign: "left",
        verticalAlign: "top",
        containerId: null,
        originalText:
          element.text,
        autoResize: true,
        lineHeight: 1.25,
      } as ExcalidrawSkeleton);

      continue;
    }

    /* ========================================================
       SHAPES
       ======================================================== */

    if (!isShape(element)) {
      continue;
    }

    let shapeType:
      | "rectangle"
      | "diamond"
      | "ellipse";

    if (
      element.type === "ellipse" ||
      element.type === "circle"
    ) {
      shapeType = "ellipse";
    } else if (
      element.type === "diamond" ||
      element.type === "rhombus"
    ) {
      shapeType = "diamond";
    } else {
      shapeType = "rectangle";
    }

    const shape: any = {
      id:
        idMap.get(
          element.id,
        )!,
      type: shapeType,
      x:
        element.x + offsetX,
      y:
        element.y + offsetY,
      width: element.width,
      height: element.height,
      strokeColor: "#1e1e1e",
      backgroundColor: "#ffffff",
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
    };

    if (
      shapeType === "rectangle"
    ) {
      shape.roundness = {
        type: 3,
      };
    }

    if (
      element.text &&
      element.text.trim()
    ) {
      shape.label = {
        text: element.text,
        fontSize: 18,
        fontFamily: 1,
        textAlign: "center",
        verticalAlign: "middle",
      };
    }

    skeletons.push(
      shape as ExcalidrawSkeleton,
    );
  }

  /* ==========================================================
     2. CONNECTIONS
     ========================================================== */

  for (const connection of elements) {
    if (!isConnection(connection)) {
      continue;
    }

    if (
      !connection.from ||
      !connection.to
    ) {
      console.warn(
        `[DiagramConverter] Connection ${connection.id} has missing from/to`,
      );
      continue;
    }

    const fromNode =
      nodeMap.get(connection.from);

    const toNode =
      nodeMap.get(connection.to);

    if (!fromNode || !toNode) {
      console.warn(
        `[DiagramConverter] Could not resolve connection ${connection.id}`,
        {
          from: connection.from,
          to: connection.to,
        },
      );
      continue;
    }

    /* ========================================================
       GEOMETRY NODES WITH OFFSETS
       ======================================================== */

    const sourceGeometryNode: DiagramNode = {
      id: fromNode.id,
      type: fromNode.type,
      x:
        fromNode.x + offsetX,
      y:
        fromNode.y + offsetY,
      width: fromNode.width,
      height: fromNode.height,
      text: fromNode.text,
    };

    const targetGeometryNode: DiagramNode = {
      id: toNode.id,
      type: toNode.type,
      x:
        toNode.x + offsetX,
      y:
        toNode.y + offsetY,
      width: toNode.width,
      height: toNode.height,
      text: toNode.text,
    };

    /* ========================================================
       ROUTING
       ======================================================== */

    const route =
      routeConnection(
        sourceGeometryNode,
        targetGeometryNode,
        nodeBoxes,
      );

    if (
      route.length < 2
    ) {
      console.warn(
        `[DiagramConverter] Invalid route for connection ${connection.id}`,
      );
      continue;
    }

    /* ========================================================
   EXCALIDRAW ROUTE COORDINATES
   ======================================================== */

/*
 * IMPORTANT:
 *
 * route[0] is the EXACT source boundary point.
 * route[last] is the EXACT target boundary point.
 *
 * Keep Excalidraw's x/y anchored at route[0].
 * Do NOT move the origin to minX/minY.
 */
const routeOrigin = route[0];

/*
 * Convert absolute points to coordinates
 * relative to the exact source boundary.
 *
 * Therefore:
 *
 * relativePoints[0] === [0, 0]
 */
const relativePoints: [
  number,
  number,
][] = route.map(
  point =>
    [
      point.x -
        routeOrigin.x,

      point.y -
        routeOrigin.y,
    ] as [
      number,
      number,
    ],
);

/*
 * Calculate the actual route bounds.
 *
 * These are used only for width/height.
 * They must NOT be used as the element origin.
 */
const minX =
  Math.min(
    ...relativePoints.map(
      point => point[0],
    ),
  );

const maxX =
  Math.max(
    ...relativePoints.map(
      point => point[0],
    ),
  );

const minY =
  Math.min(
    ...relativePoints.map(
      point => point[1],
    ),
  );

const maxY =
  Math.max(
    ...relativePoints.map(
      point => point[1],
    ),
  );

const routeWidth =
  maxX - minX;

const routeHeight =
  maxY - minY;

console.debug(
  `[DiagramConverter] Routed connection ${connection.id}`,
  {
    from:
      connection.from,

    to:
      connection.to,

    start:
      route[0],

    end:
      route[route.length - 1],

    route,

    relativePoints,
  },
);

/* ========================================================
   CREATE ARROW / LINE
   ======================================================== */

skeletons.push({
  id:
    idMap.get(
      connection.id,
    )!,

  type:
    connection.type ===
    "arrow"
      ? "arrow"
      : "line",

  /*
   * VERY IMPORTANT:
   *
   * The element origin is the exact
   * source boundary point.
   */
  x:
    routeOrigin.x,

  y:
    routeOrigin.y,

  width:
    Math.max(
      1,
      routeWidth,
    ),

  height:
    Math.max(
      1,
      routeHeight,
    ),

  /*
   * The first point is [0, 0],
   * so the line physically begins
   * at the source boundary.
   */
  points:
    relativePoints,

  strokeColor:
    "#1e1e1e",

  backgroundColor:
    "transparent",

  fillStyle:
    "solid",

  strokeWidth:
    2,

  strokeStyle:
    "solid",

  roughness:
    1,

  opacity:
    100,

  startArrowhead:
    null,

  endArrowhead:
    connection.type ===
    "arrow"
      ? "arrow"
      : null,

} as ExcalidrawSkeleton);

    /* ========================================================
       CONNECTION LABEL
       ======================================================== */

    if (
      connection.label &&
      connection.label.trim()
    ) {
      const fontSize = 16;
      const labelHeight = 24;
      const labelWidth =
        estimateTextWidth(
          connection.label,
          fontSize,
        );

      const candidates =
        getLabelCandidatesForRoute(
          route,
          labelWidth,
          labelHeight,
        );

      const position =
        findBestLabelPosition(
          candidates,
          labelWidth,
          labelHeight,
          nodeBoxes,
          placedLabelBoxes,
        );

      placedLabelBoxes.push({
        x: position.x,
        y: position.y,
        width: labelWidth,
        height: labelHeight,
      });

      skeletons.push({
        id:
          `${idMap.get(
            connection.id,
          )}-label`,
        type: "text",
        x: position.x,
        y: position.y,
        width: labelWidth,
        height: labelHeight,
        text: connection.label,
        fontSize,
        fontFamily: 1,
        strokeColor: "#1e1e1e",
        backgroundColor:
          "#ffffff",
        textAlign: "center",
        verticalAlign: "middle",
        containerId: null,
        originalText:
          connection.label,
        autoResize: false,
        lineHeight: 1.25,
      } as ExcalidrawSkeleton);
    }
  }

  /* ==========================================================
     FINAL EXCALIDRAW ELEMENTS
     ========================================================== */

  return convertToExcalidrawElements(
    skeletons,
  );
}
