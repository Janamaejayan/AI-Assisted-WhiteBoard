//route.ts

import { NextRequest } from "next/server";
import { GoogleGenAI } from '@google/genai';


export async function POST(req : NextRequest) {
    const {userInput, type, prompt} = await req.json();

    const ai = new GoogleGenAI({
    apiKey: process.env['GEMINI_API_KEY'],

});

const outputInstructions = `
Return ONLY the JSON object matching the provided response schema.

Do not return Markdown.
Do not use code fences.
Do not include explanations.
Do not include comments.

The "type" field must contain exactly the diagram type provided by the user.

Generate a complete, logically connected diagram.

NODE SIZE RULES:

- Every node must be large enough to contain its text.
- Do not use fixed small widths for long labels.
- Short labels may use approximately 140–180px width.
- Medium labels may use approximately 180–240px width.
- Long labels should use approximately 240–320px width.
- Keep text centered within every shape.
- Do not allow text to overlap neighboring nodes or arrows.

GENERAL LAYOUT RULES:

1. Generate x and y coordinates for every visual node.
2. Use a consistent coordinate system where x increases from left to right
   and y increases from top to bottom.
3. Never overlap elements.
4. Use at least 70 pixels of horizontal spacing between neighboring nodes.
5. Use at least 100 pixels of vertical spacing between logical layers.
6. Keep related elements visually close.
7. Align elements in clear rows and columns.
8. Prefer a layered layout over a scattered layout.
9. Keep enough empty space for arrows and connection labels.
10. Do not place arrows through nodes.
11. Do not place text directly on top of arrows.
12. Keep similar nodes approximately the same size.
13. Every node must be large enough to contain its text.
14. Increase node width for long labels.
15. Avoid unnecessary diagonal connections.
16. Avoid crossing arrows whenever possible.
17. If a node has multiple outgoing connections, distribute its target nodes
    horizontally in the next logical layer.
18. If multiple nodes connect to one node, distribute the source nodes
    horizontally in the previous logical layer.

FLOWCHART LAYOUT:
- Prefer top-to-bottom.
- Start at the top.
- Decisions should branch clearly.
- Keep branches separated.

ARCHITECTURE LAYOUT:
- Prefer strict top-to-bottom layers.
- Clients/users at the top.
- CDN/load balancer/API gateway below clients.
- Backend/application services below the gateway.
- Databases/cache/message queues below application services.
- External APIs should generally be below or beside the service using them.
- Nodes in the same logical layer should have approximately the same Y coordinate.
- Next logical layer must have a clearly larger Y coordinate.
- Spread multiple services horizontally rather than stacking them vertically.
- Avoid crossing connections.

WEB MOCKUP:
- Arrange components according to screen hierarchy.

MOBILE MOCKUP:
- Arrange screens horizontally with clear spacing.

NODE REQUIREMENTS:

For every visual node, generate:
- id
- type
- x
- y
- width
- height
- text

For every arrow or line:
- id
- type
- from
- to
- label

Do not calculate arrow x, y, width, or height.
The frontend will calculate connection geometry from the connected nodes.

Every element must have a unique id.
Use null for properties that are not applicable.
`;

const finalPrompt = `
    ${prompt}

    Diagram Type: ${type}

    User Request:
    ${userInput}

    ${outputInstructions}
    `;
    const response = await ai.models.generateContent({
        model : 'gemini-3.5-flash-lite',
        contents: finalPrompt,
        config :{
            responseMimeType: 'application/json',
            responseSchema: responseSchema
        }
    })

    const diagramResult = JSON.parse(response.text || '{}');

    return Response.json({
        success: true,
        diagramResult
    })

}

const responseSchema = {
    type: "object",
    properties: {
        type: {
            type: "string",
            description: "The diagram type provided by the user. Return it exactly as provided."
        },

        elements: {
            type: "array",
            description: "Complete set of nodes and connections required for the diagram.",
            items: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        description: "Unique ID for this element."
                    },

                    type: {
                        type: "string",
                        enum: [
                            "rectangle",
                            "diamond",
                            "ellipse",
                            "text",
                            "arrow",
                            "line"
                        ],
                        description: "Visual type of the element."
                    },

                    x: {
                        type: "number",
                        description: "Horizontal position."
                    },

                    y: {
                        type: "number",
                        description: "Vertical position."
                    },

                    width: {
                        type: "number",
                        description: "Width of the element."
                    },

                    height: {
                        type: "number",
                        description: "Height of the element."
                    },

                    text: {
                        type: "string",
                        description: "Text displayed inside or alongside the element. Empty string when not applicable."
                    },

                    from: {
                        type: ["string", "null"],
                        description: "ID of the source element for an arrow or line. Null for non-connection elements."
                    },

                    to: {
                        type: ["string", "null"],
                        description: "ID of the destination element for an arrow or line. Null for non-connection elements."
                    },

                    label: {
                        type: ["string", "null"],
                        description: "Optional connection label such as Yes, No, Success, or Failure."
                    }
                },

                required: [
                    "id",
                    "type",
                    "x",
                    "y",
                    "width",
                    "height",
                    "text",
                    "from",
                    "to",
                    "label"
                ]
            }
        }
    },

    required: [
        "type",
        "elements"
    ]
};