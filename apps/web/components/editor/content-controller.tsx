import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { contentTypes as contentTypesInit, useEditor, type Content } from "@/hooks/use-editor";
import { ArrowLeft, BookHeadphones, Columns4, Edit, GalleryHorizontal, GripVertical, LayoutList, Plus, Save, TicketX, Trash } from "lucide-react";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { ContentForm as ContentFormV2 } from "./content-form-v2";

import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const contentTypeIcons: Record<Content["content"]["type"], ReactNode> = {
    banner: <TicketX className="size-4" />,
    carousel: <GalleryHorizontal className="size-4" />,
    categories: <Columns4 className="size-4" />,
    collectionCarousel: <LayoutList className="size-4" />,
    productCarousel: <BookHeadphones className="size-4" />
}

export function SortableItem({ contentType, onClick, index, setActive }: { setActive: () => void, contentType: { icon: ReactNode, name: string }, onClick: () => void, index: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: index });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center border-t py-3">
            <GripVertical {...attributes} {...listeners} className="size-4 mr-4 hover:cursor-grab active:cursor-grabbing focus:outline-none" />
            <div className="flex gap-2 items-center w-full">
                {contentType.icon}
                <h1>{contentType.name}</h1>
                <button className="ml-auto mr-2 active:opacity-20 cursor-pointer">
                    <Edit onClick={setActive} className="size-4" />
                </button>
                <button onClick={onClick} className="mr-2 active:opacity-20 cursor-pointer">
                    <Trash className="size-4 text-destructive" />
                </button>
            </div>
        </div>
    )
}

export function ContentController() {
    const [activeTabIndex, setActiveTabIndex] = useState<number | null>(null);
    const { content, insertContent, removeContent, updateContent, moveContent } = useEditor();

    const contentTypes = contentTypesInit.map((contentType) => ({
        ...contentType,
        icon: contentTypeIcons[contentType.type]
    }))

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            moveContent(Number(active.id), Number(over.id));
        }
    }

    const handleInsertContentType = (type: Content["content"]["type"]) => {
        const index = crypto.randomUUID();
        insertContent(content.length, {
            id: index,
            content: contentTypesInit.find(contentType => contentType.type === type)!,
        })

        setActiveTabIndex(content.length);
    }

    const handleSubmit = (data: Content["content"], index: number) => {
        updateContent(index, { id: content[index].id, content: data })
        setActiveTabIndex(null);
    }

    if (activeTabIndex !== null) {
        const id = content[activeTabIndex].id;

        return (
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center border-b pb-2">
                    <Button onClick={() => setActiveTabIndex(null)} size="icon" variant="ghost">
                        <ArrowLeft className="size-4" />
                    </Button>
                    <p className="flex items-center gap-2">
                        {contentTypeIcons[content.find(content => content.id === id)!.content.type]}
                        {contentTypes.find(contentType => contentType.type === content.find(content => content.id === id)!.content.type)!.name}
                    </p>
                    <Button size="icon" variant="ghost">
                        <Save className="size-4" />
                    </Button>
                </div>
                <div className="flex flex-col gap-2">
                    <ContentForm defaultValues={content.find(content => content.id === id)!.content} onSubmit={(data) => handleSubmit(data, activeTabIndex)} />
                </div>
            </div>
        )
    }

    return (<div className="flex flex-col gap-2">
        <div className="flex justify-between">
            {/* <div className="flex gap-0.5">
                <Button size="icon" variant="ghost">
                    <Undo2 className="size-4" />
                </Button>
                <Button size="icon" variant="ghost">
                    <Redo2 className="size-4" />
                </Button>
            </div> */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                        <Plus className="size-4" /> Add Component
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {contentTypes.map((contentType, index) => (
                        <DropdownMenuItem key={index} onClick={() => handleInsertContentType(contentType.type)}>
                            {contentType.icon}{contentType.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={content.map((_, index) => index)} strategy={verticalListSortingStrategy}>
                {content.map((item, index) => (
                    <SortableItem
                        key={item.id}
                        index={index}
                        contentType={{
                            icon: contentTypes.find(contentType => contentType.type === item.content.type)?.icon,
                            name: contentTypesInit.find(contentType => contentType.type === item.content.type)?.name ?? "",
                        }}
                        setActive={() => setActiveTabIndex(index)}
                        onClick={() => removeContent(index)}
                    />
                ))}
            </SortableContext>
        </DndContext>
    </div>)
}

const ContentForm = ({ defaultValues, onSubmit }: { defaultValues: Content["content"], onSubmit: (data: Content["content"]) => void }) => {
    const form = useForm<Content["content"]>({
        defaultValues,
    })

    return (
        <ContentFormV2 form={form} onSubmit={(data) => onSubmit(data)} type={defaultValues.type} />
    )
}