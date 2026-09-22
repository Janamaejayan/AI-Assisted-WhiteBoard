'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import axios from 'axios'
import { useParams } from 'next/navigation'

import {
    ArrowRight,
    Circle,
    Diamond,
    Eraser,
    Hand,
    Image,
    LucideSparkles,
    Minus,
    MousePointer2,
    Pencil,
    ScanLine,
    Square,
    Type,
} from 'lucide-react'

import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'

import './whiteboard.css'
import FloatingProperties from './FloatingProperties'
import { version } from 'os'
import { Button } from '@/components/ui/button'
import AISidebar from './AISidebar'

type Props = {
    onApiReady : ( api :ExcalidrawImperativeAPI ) => void;
}

type ToolName =
    | 'hand'
    | 'selection'
    | 'rectangle'
    | 'diamond'
    | 'ellipse'
    | 'arrow'
    | 'line'
    | 'freedraw'
    | 'text'
    | 'image'
    | 'eraser'
    | 'laser'

type Tool = {
    name: ToolName
    icon: React.ElementType
    color: string
    shortcut?: string
}

const tools: Tool[] = [
    {
        name: 'hand',
        icon: Hand,
        color: 'text-cyan-500',
    },
    {
        name: 'selection',
        icon: MousePointer2,
        color: 'text-blue-500',
        shortcut: '1',
    },
    {
        name: 'rectangle',
        icon: Square,
        color: 'text-red-500',
        shortcut: '2',
    },
    {
        name: 'diamond',
        icon: Diamond,
        color: 'text-purple-500',
        shortcut: '3',
    },
    {
        name: 'ellipse',
        icon: Circle,
        color: 'text-green-500',
        shortcut: '4',
    },
    {
        name: 'arrow',
        icon: ArrowRight,
        color: 'text-orange-500',
        shortcut: '5',
    },
    {
        name: 'line',
        icon: Minus,
        color: 'text-yellow-600',
        shortcut: '6',
    },
    {
        name: 'freedraw',
        icon: Pencil,
        color: 'text-pink-500',
        shortcut: '7',
    },
    {
        name: 'text',
        icon: Type,
        color: 'text-indigo-500',
        shortcut: '8',
    },
    {
        name: 'image',
        icon: Image,
        color: 'text-emerald-500',
        shortcut: '9',
    },
    {
        name: 'eraser',
        icon: Eraser,
        color: 'text-gray-500',
        shortcut: '0',
    },
    {
        name: 'laser',
        icon: ScanLine,
        color: 'text-red-600',
        shortcut: 'k'
    },
]

const WhiteBoard = ({ onApiReady }: Props) => {
        const [excalidrawAPI, setExcalidrawAPI] =
        useState<ExcalidrawImperativeAPI | null>(null)

    // Selection is active initially
    const [activeTool, setActiveTool] =
        useState<ToolName>('selection')
    
    const [selectedElement, setSelectedElement] = useState <any> (null);

    const [canvasState, setCanvasState] = useState <any> (null);

    const saveTimeRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const [showAISidebar, setShowAISidebar] = useState(false);

    const { projectId } = useParams()

    /**
     * Change the active Excalidraw tool.
     *
     * This is the single function used by:
     * - Mouse clicks
     * - Keyboard shortcuts
     */
    const changeTool = (tool: ToolName) => {
        if (!excalidrawAPI) return

        // Update custom toolbar highlight
        setActiveTool(tool)

        // Update actual Excalidraw tool
        excalidrawAPI.setActiveTool({
            type: tool,
        })
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null

            // Don't activate shortcuts while typing
            if (
                target?.tagName === 'INPUT' ||
                target?.tagName === 'TEXTAREA' ||
                target?.isContentEditable
            ) {
                return
            }

            // Find the tool associated with the pressed key
            const tool = tools.find(
                (tool) => tool.shortcut === event.key
            )

            if (!tool) return

            // Stop Excalidraw/browser from handling the key
            event.preventDefault()
            event.stopPropagation()

            // This updates BOTH:
            // 1. Excalidraw's active tool
            // 2. Our toolbar's active highlight
            changeTool(tool.name)
        }

        /**
         * Use capture phase.
         *
         * Excalidraw has its own keyboard handlers, so a normal
         * bubbling listener can sometimes not receive the event.
         */
        document.addEventListener(
            'keydown',
            handleKeyDown,
            true
        )

        return () => {
            document.removeEventListener(
                'keydown',
                handleKeyDown,
                true
            )
        }
    }, [excalidrawAPI])

    /**
     * Canvas change handler
     */
    const handleCanvasChange = (
        elements: readonly any[],
        appState: any,
        files: any
    ) => {

        setCanvasState(appState);

        const selectedIds = Object.keys(
            appState.selectedElementIds || {}
        )

        if (selectedIds?.length == 1){
            const element = elements.find(
                (element) => element.id == selectedIds[0]
            )
            setSelectedElement(element)
        } else{
            setSelectedElement(null);
        }
  
        if (saveTimeRef.current) {
            clearTimeout(saveTimeRef.current)
        }

        saveTimeRef.current = setTimeout(() => {
            saveCanvasChanges(elements, appState, files)
        }, 10000)
    }

    const getFloatingPosition = () =>{
        if (!selectedElement || !canvasState){
            return {left: 0, top: 0}
        }

        const zoom = canvasState.zoom?.value ?? 1

        const scrollX = canvasState.scrollX ?? 0

        const scrollY = canvasState.scrollY ?? 0

        const centerX = selectedElement.x + selectedElement.width / 2

        const screenX = (centerX + scrollX) * zoom;

        const screenY = (selectedElement.y + scrollY) * zoom;

        return {
            left: screenX,
            top: screenY - 60
        }

    }

    const floatingPosition = getFloatingPosition();
    //console.log(floatingPosition);

    /**
     * Save canvas changes
     */
    const saveCanvasChanges = async (
        elements: readonly any[],
        appState: any,
        files: any
    ) => {
        const res = await axios.post('/api/whiteboard', {
            elements,
            appState,
            files,
            projectId,
        })

        if(res){
            console.log('saved successfully');
        }
    }

    const handlePropertyChange = (property: string, value: any) =>{
        if(!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements();

        const updatedElement = elements.map((element) =>{
            if (element.id != selectedElement.id){
                return element;
            }
            return {
                ...element, [property] : value, version : element.version + 1,
                updated: Date.now()
            }
        });

        excalidrawAPI.updateScene({
            elements : updatedElement
        })

    }

    const handleDeleteElement = () =>{
        if(!excalidrawAPI || !selectedElement) return;

        const element = excalidrawAPI.getSceneElements();

        const updatedElements = element.map((element) =>{
            if (element.id === selectedElement.id){
                return {
                    ...element, isDeleted: true, version : element.version + 1,
                    updated: Date.now()
                }
            }

            return element;
        });

        excalidrawAPI.updateScene({
            elements : updatedElements
        });

        setSelectedElement(null);
    }

    const handleDuplicate = () =>{
        if(!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements();

        const duplicateElement = {
            ...selectedElement,
            id: crypto.randomUUID(),
            x : selectedElement.x + 25,
            y : selectedElement.y + 25,
            seed: Math.floor(Math.random() * 1000000),
            version: 1,
            updated: Date.now(),
            isDeleted: false
        };

        excalidrawAPI.updateScene({
            elements: [...elements, duplicateElement],
            appState: {
            selectedElementIds: {
                [duplicateElement.id]: true,
            },
        },
        })

        setSelectedElement(duplicateElement);
    }

    const handleBringFront = (str : string) =>{
        if(!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements();

        const selected = elements.find((element) => element.id == selectedElement.id);

        if (!selected) return;

        const remElements =  elements.filter((element) =>
            element.id != selectedElement.id)

        if (str === 'front'){
            excalidrawAPI.updateScene({
                elements: [                    
                    ...remElements,
                    selected
                ]
            })
        }else{
            excalidrawAPI.updateScene({
                elements: [  
                    selected,                  
                    ...remElements,
                    
                ]
            })
        }
    }

    const handleLock = () => {
        if (!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements();

        const updatedElements = elements.map((element) => {
            if (element.id === selectedElement.id) {
                return {
                    ...element,
                    locked: !element.locked,
                    version: element.version + 1,
                    updated: Date.now(),
                };
            }

            return element;
        });

        excalidrawAPI.updateScene({
            elements: updatedElements,
        });

        setSelectedElement((prev: any) => ({
            ...prev,
            locked: !prev.locked,
        }));
    };

    const handleCloseSideBar = () => {
        setShowAISidebar(false);
    };

    return (
        <div className="relative h-[90vh]">
            <Excalidraw
                // @ts-ignore
                excalidrawAPI={(api) => {
                    setExcalidrawAPI(api);
                    onApiReady(api);

                    // Default tool
                    api.setActiveTool({
                        type: 'selection',
                    })
                }}
                onChange={handleCanvasChange}
            />

            {/* ================================
                Custom Top Toolbar
            ================================= */}
            <div
                className="
                    absolute
                    left-1/2
                    top-3
                    z-50
                    -translate-x-1/2

                    flex
                    items-center
                    gap-1

                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    p-1.5

                    shadow-lg
                "
            >
                {tools.map((tool) => {
                    const Icon = tool.icon

                    const isActive =
                        activeTool === tool.name

                    return (
                        <button
                            key={tool.name}
                            type="button"
                            onClick={() => changeTool(tool.name)}
                            title={
                                tool.shortcut
                                    ? `${tool.name} (${tool.shortcut})`
                                    : tool.name
                            }
                            className={`
                                group
                                relative

                                flex
                                h-10
                                w-10
                                items-center
                                justify-center

                                rounded-lg

                                transition-all
                                duration-150

                                active:scale-95

                                ${
                                    isActive
                                        ? 'bg-blue-100'
                                        : 'hover:bg-gray-100'
                                }
                            `}
                        >
                            {/* Tool Icon */}
                            <Icon
                                size={19}
                                strokeWidth={2}
                                className={`
                                    ${tool.color}

                                    transition-transform
                                    duration-150

                                    group-hover:scale-110
                                `}
                            />

                            {/* Shortcut
                                Bottom-right corner
                                No border / no separate box
                            */}
                            {tool.shortcut && (
                                <span
                                    className={`
                                        pointer-events-none

                                        absolute
                                        bottom-0.5
                                        right-1

                                        text-[9px]
                                        font-semibold
                                        leading-none

                                        ${
                                            isActive
                                                ? 'text-blue-600'
                                                : 'text-gray-400'
                                        }
                                    `}
                                >
                                    {tool.shortcut}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            <FloatingProperties selectedElement={selectedElement} position={floatingPosition}
                onPropertyChange = {(propertyName, value) => handlePropertyChange(propertyName, value)}
                onDelete={handleDeleteElement}
                onDuplicate={handleDuplicate}
                onBringToFront={() => handleBringFront('front')}
                onSendToBack={() => handleBringFront('back')}
                onLock={handleLock}
                
            />

            <div className='absolute right-15 bottom-3 z-50'>
                <Button size = {'lg'} onClick={() => setShowAISidebar(!showAISidebar)}>
                    < LucideSparkles /> AI
                </Button>
            </div>

            {showAISidebar && < AISidebar excalidrawApi={excalidrawAPI} onClose={handleCloseSideBar}/>}
        </div>
    )
}

export default WhiteBoard