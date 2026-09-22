'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
// import { convertToExcalidrawElements } from '@excalidraw/excalidraw/types'
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { convertToExcalidrawElements } from '@excalidraw/excalidraw'
import {
    Monitor,
    Network,
    PencilRuler,
    Smartphone,
    Sparkles,
    Workflow,
    X,
    ChevronRight,
    Loader2Icon,
} from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import {
  convertDiagramToExcalidraw,
} from "@/lib/excalidraw";

type Props ={
    excalidrawApi : ExcalidrawImperativeAPI | null,
    onClose: () => void;
}

const AISidebar = ({excalidrawApi, onClose} : Props) => {

    const Aitools = [
        {
            name: 'Generate Diagrams',
            desc: 'Generate diagrams in seconds',
            icon: PencilRuler,
            color: 'text-blue-600 bg-blue-100',
        },
        {
            name: 'Flowchart',
            desc: 'Turn ideas into visual workflows',
            icon: Workflow,
            color: 'text-purple-600 bg-purple-100',
        },
        {
            name: 'Architecture',
            desc: 'Generate system architecture diagrams',
            icon: Network,
            color: 'text-orange-600 bg-orange-100',
        },
        {
            name: 'Web Mockup',
            desc: 'Generate website wireframes and layouts',
            icon: Monitor,
            color: 'text-cyan-600 bg-cyan-100',
        },
        {
            name: 'Mobile Mockup',
            desc: 'Generate mobile app wireframes',
            icon: Smartphone,
            color: 'text-pink-600 bg-pink-100',
        },
    ] 

    const [selectedTool, setSelectedTool] = useState<string | null>(null)
    const [userInput, setUserInput] = useState('');
    const AI_PLACEHOLDER_PREFIX = 'ai-placeholder-';
    const [loading, setLoading] = useState(false);


    const AiPrompts = [{
        name: "Generate Diagrams",
        desc: "Create visual diagrams",
        icon: PencilRuler,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        prompt: `
        You are an expert visual diagram generation agent.
        Your task is to convert the user's idea into a clear, structured, professional diagram.
        Instructions:
        Understand the user's intent before generating.
        Identify the main entities, concepts, steps, and relationships.
        Create a clean visual hierarchy.
        Use rectangles for main concepts or processes.
        Use diamonds only for decisions.
        Use arrows to show relationships or direction.
        Keep labels short and readable.
        Avoid overlapping elements.
        Maintain consistent spacing between elements.
        Organize the diagram from left-to-right or top-to-bottom depending on what is easiest to understand.
        Add groups or sections when the diagram contains multiple categories.
        Prefer simple layouts over overly complex diagrams.
        Output only valid Excalidraw-compatible JSON elements.
        Do not include markdown, explanations, or additional text outside the JSON.
        `
        }, {
        name: "Flowchart",
        desc: "Visualize workflows",
        icon: Workflow,
        color: "text-violet-600",
        bgColor: "bg-violet-50",
        prompt: `
        You are an expert flowchart generation agent.
        Convert the user's description into a professional flowchart.
        Instructions:
        Identify the starting point, actions, decisions, branches, and ending points.
        Use rounded rectangles for start and end nodes.
        Use rectangles for actions or processes.
        Use diamonds for decisions.
        Use arrows to connect nodes in the correct logical order.
        Label decision arrows clearly, such as "Yes" and "No".
        Keep the primary workflow flowing from top to bottom.
        Branch secondary flows to the left or right.
        Keep node labels concise.
        Avoid crossing arrows whenever possible.
        Maintain consistent node dimensions and spacing.
        Make the flowchart understandable without additional explanation.
        If the user's description is incomplete, infer the most logical workflow.
        Output only valid Excalidraw-compatible JSON elements.
        Do not return markdown or explanatory text.
        `
        }, {
        name: "Architecture",
        desc: "Design system architecture",
        icon: Network,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        prompt: `
            You are a senior software architect and system design visualization agent.

            Convert the user's application or system description into a clean,
            professional, layered system architecture diagram.

            The diagram must be easy to understand visually without additional explanation.

            FAN-OUT RULES:

            When one node connects to multiple nodes in the next layer:

            - Place the destination nodes in the same next layer.
            - Spread them horizontally.
            - Keep them at least 80 pixels apart.
            - Prefer short diagonal or vertical arrows.
            - Do not stack several destination nodes directly above/below one another.
            - Avoid arrows crossing each other.

            FAN-IN RULES:

            When several nodes connect to one node:

            - Place the source nodes in the same layer.
            - Spread them horizontally.
            - Put the destination node in the next layer.
            - Avoid crossing arrows.

            NODE SIZE RULES:

            - Every node must be large enough to comfortably contain its text.
            - Never allow text to overflow outside a node.
            - Keep at least 25 pixels of horizontal padding inside nodes.
            - Keep at least 15 pixels of vertical padding inside nodes.
            - Use wider nodes for long labels.
            - Similar node types should have similar dimensions.

            CONNECTION RULES:

            - Use arrows for directional data flow.
            - Label only important connections.
            - Keep connection labels short.
            - Do not create unnecessary labels.
            - Do not calculate arrow x, y, width, or height.
            - The frontend will calculate connection geometry from the connected nodes.

            SHAPE RULES:

            - Use rectangles for services and components.
            - Use diamonds only for decisions.
            - Use ellipses for users or external entities when appropriate.
            - Use text elements only for standalone titles or annotations.

            POSITION RULES:

            - x increases from left to right.
            - y increases from top to bottom.
            - Never overlap elements.
            - Keep the entire diagram within a reasonable canvas.
            - Use consistent spacing.
            - Use clean rows and columns.
            - Prefer simple layouts over complex layouts.
            `,
        }, {
        name: "Web Mockup",
        desc: "Generate web wireframes",
        icon: Monitor,
        color: "text-cyan-600",
        bgColor: "bg-cyan-50",
        prompt: `
        You are an expert product designer and web UI wireframe generation agent.
        Convert the user's description into a professional desktop web application wireframe.
        Instructions:
        Create the interface using simple wireframe-style Excalidraw elements.
        Assume a desktop viewport unless the user specifies otherwise.
        Identify the main page structure and user goals.
        Include relevant UI sections such as:
        Navbar or header
        Sidebar
        Page title
        Search
        Filters
        Cards
        Tables
        Forms
        Buttons
        Content panels
        Footer
        Use rectangles for containers, cards, buttons, images, and input fields.
        Use text elements for labels and content.
        Maintain strong spacing, alignment, and visual hierarchy.
        Use realistic dashboard or SaaS layout conventions.
        Keep the design low-fidelity and wireframe oriented.
        Do not create decorative artwork unless specifically requested.
        Keep the page within a reasonable desktop canvas size.
        Group related UI sections visually.
        Make important primary actions easy to identify.
        Output only valid Excalidraw-compatible JSON elements.
        Do not return markdown or explanations.
        `
        }, {
        name: "Mobile Mockup",
        desc: "Generate app wireframes",
        icon: Smartphone,
        color: "text-pink-600",
        bgColor: "bg-pink-50",
        prompt: `
        You are an expert mobile product designer and mobile wireframe generation agent.
        Convert the user's app idea into a professional mobile app wireframe.
        Instructions:
        Design for a standard mobile screen size.
        Create a phone frame or clear screen boundary.
        Focus on the primary user experience described by the user.
        Include relevant mobile UI patterns such as:
        App header
        Search
        Cards
        Lists
        Forms
        Bottom navigation
        Floating action buttons
        Tabs
        Profile sections
        Modals or sheets when necessary
        Use rectangles for UI containers and controls.
        Use text elements for labels.
        Maintain consistent padding and spacing.
        Use a vertical layout optimized for mobile interaction.
        Keep buttons large enough to represent touch-friendly controls.
        Keep the design low-fidelity and wireframe focused.
        If multiple screens are needed, arrange them horizontally with clear spacing.
        Label each screen clearly.
        Prioritize usability and simple navigation.
        Output only valid Excalidraw-compatible JSON elements.
        Do not return markdown, explanations, or commentary.
        `
    }]

    
    const getEmptyCanvasPosition = () =>{

        if (!excalidrawApi){
            return {x : 100, y : 100};
        }

        const elements = excalidrawApi.getSceneElements().filter(element => !element.isDeleted)
    
        if(elements.length == 0){
            return {x: 100, y: 100};
        }
        const maxRight = Math.max(...elements.map((element) => element.x+element.width))

        const minTop = Math.min(...elements.map((element) => element.y))

        return {
            x : maxRight + 150,
            y : minTop
        }
    }

    const addAiPlaceholder = () => {
    if (!excalidrawApi) return null;

    const position = getEmptyCanvasPosition();

    const placeholderElements =
        convertToExcalidrawElements([
            {
                id: `${AI_PLACEHOLDER_PREFIX}background`,
                type: 'rectangle',

                x: position.x,
                y: position.y,

                width: 450,
                height: 250,

                backgroundColor: '#f5f3ff',
                strokeColor: '#8b5cf6',

                fillStyle: 'solid',
                strokeWidth: 2,

                roundness: {
                    type: 3,
                },
            },

            {
                id: `${AI_PLACEHOLDER_PREFIX}title`,
                type: 'text',

                x: position.x + 25,
                y: position.y + 22,

                text: '✨ AI is generating...',

                fontSize: 20,
                fontFamily: 1,

                strokeColor: '#6d28d9',
                backgroundColor: 'transparent',
            },

            {
                id: `${AI_PLACEHOLDER_PREFIX}bar-1`,
                type: 'rectangle',

                x: position.x + 25,
                y: position.y + 70,

                width: 180,
                height: 14,

                backgroundColor: '#ddd6fe',
                strokeColor: 'transparent',

                fillStyle: 'solid',
                strokeWidth: 0,

                roundness: {
                    type: 3,
                },
            },

            {
                id: `${AI_PLACEHOLDER_PREFIX}bar-2`,
                type: 'rectangle',

                x: position.x + 25,
                y: position.y + 105,

                width: 350,
                height: 12,

                backgroundColor: '#e9e5ff',
                strokeColor: 'transparent',

                fillStyle: 'solid',
                strokeWidth: 0,

                roundness: {
                    type: 3,
                },
            },

            {
                id: `${AI_PLACEHOLDER_PREFIX}bar-3`,
                type: 'rectangle',

                x: position.x + 25,
                y: position.y + 130,

                width: 300,
                height: 12,

                backgroundColor: '#e9e5ff',
                strokeColor: 'transparent',

                fillStyle: 'solid',
                strokeWidth: 0,

                roundness: {
                    type: 3,
                },
            },

            {
                id: `${AI_PLACEHOLDER_PREFIX}bar-4`,
                type: 'rectangle',

                x: position.x + 25,
                y: position.y + 155,

                width: 330,
                height: 12,

                backgroundColor: '#e9e5ff',
                strokeColor: 'transparent',

                fillStyle: 'solid',
                strokeWidth: 0,

                roundness: {
                    type: 3,
                },
            },

            {
                id: `${AI_PLACEHOLDER_PREFIX}bar-5`,
                type: 'rectangle',

                x: position.x + 25,
                y: position.y + 195,

                width: 120,
                height: 10,

                backgroundColor: '#ddd6fe',
                strokeColor: 'transparent',

                fillStyle: 'solid',
                strokeWidth: 0,

                roundness: {
                    type: 3,
                },
            },

            {
                id: `${AI_PLACEHOLDER_PREFIX}footer`,
                type: 'text',

                x: position.x + 25,
                y: position.y + 215,

                text: 'Creating your visual...',

                fontSize: 13,
                fontFamily: 1,

                strokeColor: '#8b7bb8',
                backgroundColor: 'transparent',
            },
        ]);

    const currentElements =
        excalidrawApi.getSceneElements();

    excalidrawApi.updateScene({
        elements: [
            ...currentElements,
            ...placeholderElements,
        ],
    });

    /*
     * convertToExcalidrawElements may generate IDs instead of preserving
     * the skeleton IDs above, so retain the actual IDs for cleanup.
     */
    return {
        position,
        placeholderIds: new Set(
            placeholderElements.map((element) => element.id)
        ),
    };
};

    const removeAiPlaceholder = () => {
    if (!excalidrawApi) return;

    const elements =
        excalidrawApi.getSceneElements();

    const updatedElements =
        elements.filter(
            element =>
                !element.id.startsWith(
                    AI_PLACEHOLDER_PREFIX
                )
        );

    excalidrawApi.updateScene({
        elements: updatedElements,
    });
};

    //find Right most element

    const activeTool = Aitools.find(
        (tool) => tool.name === selectedTool
    )

    const onClickGenerate = async () => {
    const currentAiTool = AiPrompts.find(
        tool => tool.name === selectedTool
    );

    if (!currentAiTool) {
        console.error("No AI tool selected");
        return;
    }

    if (!excalidrawApi) {
        console.error("Excalidraw API not available");
        return;
    }

    let placeholderIds: Set<string> | null = null;

    try {
        setLoading(true);

        // 1. Add placeholder and remember its position
        const placeholder = addAiPlaceholder();

        if (!placeholder) {
            throw new Error("Could not create AI placeholder");
        }

        const { position: placeholderPosition } = placeholder;
        placeholderIds = placeholder.placeholderIds;

        // 2. Generate diagram
        const result = await axios.post("/api/ai", {
            userInput,
            type: currentAiTool.name,
            prompt: currentAiTool.prompt,
        });

        const diagramResult = result.data.diagramResult;

        console.log("AI Diagram:", diagramResult);

        // 3. Convert generated diagram using placeholder position
        const generatedElements =
            convertDiagramToExcalidraw(
                diagramResult,
                {
                    offsetX: placeholderPosition.x,
                    offsetY: placeholderPosition.y,
                }
            );

        // 4. Get the CURRENT scene
        const currentElements =
            excalidrawApi.getSceneElements();

        // 5. Remove every placeholder element
        const elementsWithoutPlaceholder =
            currentElements.filter(
                element =>
                    !placeholderIds?.has(element.id)
            );

        console.log(
            "Placeholder elements found:",
            currentElements
                .filter(element => placeholderIds?.has(element.id))
                .map(element => element.id)
        );

        // 6. ONE update:
        // remove placeholder + insert diagram
        excalidrawApi.updateScene({
            elements: [
                ...elementsWithoutPlaceholder,
                ...generatedElements,
            ],
        });

    } catch (error) {

        // If generation fails, remove placeholder
        if (excalidrawApi) {
            const currentElements =
                excalidrawApi.getSceneElements();

            const cleanedElements =
                currentElements.filter(
                    element => !placeholderIds?.has(element.id)
                );

            excalidrawApi.updateScene({
                elements: cleanedElements,
            });
        }

        if (axios.isAxiosError(error)) {
            console.error(
                "AI API Error:",
                error.response?.data ||
                error.message
            );
        } else {
            console.error(
                "Unexpected Error:",
                error
            );
        }

    } finally {
        setLoading(false);
    }
};
    return (
        <div className="absolute right-6 bottom-24 z-50 flex w-95 max-h-155 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

            {/* Header */}
            <div className="border-b border-gray-100 px-5 py-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                <Sparkles size={17} />
                            </div>

                            <h2 className="text-base font-semibold text-gray-900">
                                AI Helper
                            </h2>
                        </div>

                        <p className="mt-1 text-xs text-gray-400">
                            Turn ideas into visuals in seconds
                        </p>
                    </div>

                    <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* AI Tools */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    AI Tools
                </p>

                <div className="flex flex-col gap-1.5">
                    {Aitools.map((tool) => {
                        const Icon = tool.icon
                        const isSelected = selectedTool === tool.name

                        return (
                            <button
                                key={tool.name}
                                type="button"
                                onClick={() =>
                                    setSelectedTool(
                                        isSelected ? null : tool.name
                                    )
                                }
                                className={`
                                    group
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    rounded-xl
                                    border
                                    p-2.5
                                    text-left
                                    transition-all
                                    duration-150
                                    ${
                                        isSelected
                                            ? 'border-blue-200 bg-blue-50'
                                            : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div
                                    className={`
                                        flex
                                        h-10
                                        w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        ${tool.color}
                                    `}
                                >
                                    <Icon size={19} strokeWidth={2} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3
                                        className={`
                                            text-sm font-medium
                                            ${
                                                isSelected
                                                    ? 'text-blue-700'
                                                    : 'text-gray-800'
                                            }
                                        `}
                                    >
                                        {tool.name}
                                    </h3>

                                    <p className="mt-0.5 truncate text-xs text-gray-400">
                                        {tool.desc}
                                    </p>
                                </div>

                                <ChevronRight
                                    size={16}
                                    className={`
                                        shrink-0 transition-all
                                        ${
                                            isSelected
                                                ? 'translate-x-0.5 text-blue-500'
                                                : 'text-gray-300 group-hover:translate-x-0.5 group-hover:text-gray-500'
                                        }
                                    `}
                                />
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Prompt Area */}
            <div className="border-t border-gray-100 bg-gray-50/70 p-4">
                <div className="mb-2">
                    <h3 className="text-sm font-medium text-gray-800">
                        Describe what you want to create
                    </h3>

                    <p className="mt-0.5 text-xs text-gray-400">
                        Tell AI what you want to visualize
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm focus-within:ring-1 focus-within:ring-blue-500">

                    {/* Textarea */}
                    <Textarea
                        placeholder="e.g. Generate a system architecture for WhatsApp"
                        className="
                            min-h-20
                            resize-none
                            border-0
                            shadow-none
                            focus-visible:ring-0
                        "
                        onChange={(e) => setUserInput(e.target.value)}
                    />

                    {/* Bottom Controls */}
                    <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5">

                        {/* Selected Tool */}
                        <div className="min-w-0 flex-1">
                            {activeTool && (
                                <div className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1">

                                    <div
                                        className={`
                                            flex
                                            h-5
                                            w-5
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded
                                            ${activeTool.color}
                                        `}
                                    >
                                        <activeTool.icon
                                            size={12}
                                            strokeWidth={2}
                                        />
                                    </div>

                                    <span className="truncate text-xs font-medium text-gray-600">
                                        {activeTool.name}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedTool(null)}
                                        className="ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                                    >
                                        <X size={11} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Generate */}
                        <Button
                            className="
                                h-8
                                shrink-0
                                gap-1.5
                                rounded-lg
                                px-3
                                text-xs
                                font-medium
                                bg-gradient-to-r
                                from-blue-600
                                to-purple-600
                                hover:opacity-90
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "

                            disabled = {loading}
                            onClick={onClickGenerate}
                        >
                           {loading && <Loader2Icon className='animate-spin' />} <Sparkles size={14} />
                            Generate
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AISidebar
