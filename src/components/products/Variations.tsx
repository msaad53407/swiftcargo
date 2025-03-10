import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Color } from "@/types/product";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Edit, GripVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface VariationsProps {
  colors: Record<string, Color[]>;
  onChange: (colors: Record<string, Color[]>) => void;
}

export default function Variations({ colors, onChange }: VariationsProps) {
  const [selectedSize, setSelectedSize] = useState("");
  const [newVariantColors, setNewVariantColors] = useState<Color[]>([]);
  const [newColorsCount, setNewColorsCount] = useState(1);
  const [open, setOpen] = useState(false);
  const [sizes, setSizes] = useState<string[]>(Object.keys(colors));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addColor = () => {
    const newColors = {
      ...colors,
      [selectedSize]: [...(colors[selectedSize] || []), ...newVariantColors],
    };
    onChange(newColors);
    setNewVariantColors([{ name: "" }]);
    setNewColorsCount(1);
    setSelectedSize("");
    setOpen(false);
    setSizes(Object.keys(newColors).filter((size) => newColors[size].length > 0));
  };

  useEffect(() => {
    // Keep sizes state in sync with colors prop
    const activeSizes = Object.keys(colors).filter((size) => colors[size] && colors[size].length > 0);
    setSizes((prevSizes) => {
      // Preserve the order of existing sizes and add any new ones
      const existingSizes = prevSizes.filter((size) => activeSizes.includes(size));
      const newSizes = activeSizes.filter((size) => !prevSizes.includes(size));
      return [...existingSizes, ...newSizes];
    });
  }, [colors]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sizes.indexOf(active.id as string);
      const newIndex = sizes.indexOf(over.id as string);

      const newSizes = arrayMove(sizes, oldIndex, newIndex);
      setSizes(newSizes);

      // Create a new colors object with the updated order
      const reorderedColors: Record<string, Color[]> = {};

      // First add all sizes in the new order
      newSizes.forEach((size) => {
        if (colors[size] && colors[size].length > 0) {
          reorderedColors[size] = [...colors[size]];
        }
      });

      // Then add any remaining sizes that aren't in the sorted list
      Object.keys(colors).forEach((size) => {
        if (!reorderedColors[size] && colors[size] && colors[size].length > 0) {
          reorderedColors[size] = [...colors[size]];
        }
      });
      // Update the parent component with the new order
      onChange(reorderedColors);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Variations</h3>
        <DropdownMenu open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
          <div className="flex gap-2 items-center">
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Variations
              </Button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent
            className="min-w-[300px] max-w-[400px] p-4 max-h-[400px] overflow-y-auto"
            align="end"
            sideOffset={8}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm text-muted-foreground">Add a New Variation</h4>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newVariant">Enter Size</Label>
                <Input id="newVariant" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Enter Color(s)</Label>
                  <div className="flex gap-2 items-center">
                    <Button
                      className="bg-transparent hover:bg-transparent p-2"
                      onClick={() => setNewColorsCount(newColorsCount + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {new Array(newColorsCount).fill(0).map((_, index) => (
                  <div key={index} className="relative">
                    <Input
                      value={newVariantColors[index]?.name}
                      onChange={(e) => {
                        const newColors = [...newVariantColors];
                        newColors[index] = { ...newColors[index], name: e.target.value };
                        setNewVariantColors(newColors);
                      }}
                    />
                    {newColorsCount > 1 && (
                      <Button
                        className="absolute right-2 top-0 bg-transparent hover:bg-transparent p-2"
                        onClick={() => {
                          setNewVariantColors(newVariantColors.filter((_, i) => i !== index));
                          setNewColorsCount(newColorsCount - 1);
                        }}
                      >
                        <Trash2 className="text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-4">
                <Button onClick={addColor}>Add</Button>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {Object.keys(colors).length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={Object.keys(colors)}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(colors).map(
                ([size, sizeColors]) =>
                  sizeColors.length > 0 && (
                    <SortableVariationDisplay
                      id={size}
                      key={size}
                      colors={sizeColors}
                      variants={colors}
                      size={size}
                      onChange={onChange}
                    />
                  ),
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

interface SortableVariationDisplayProps {
  id: string;
  colors: Color[];
  size: string;
  variants: Record<string, Color[]>;
  onChange: (colors: Record<string, Color[]>) => void;
}

const SortableVariationDisplay = ({ id, colors, size, variants, onChange }: SortableVariationDisplayProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative">
      <VariationDisplay
        colors={colors}
        size={size}
        variants={variants}
        onChange={onChange}
        dragHandleProps={listeners}
      />
    </div>
  );
};

const VariationDisplay = ({
  colors,
  size,
  variants,
  onChange,
  dragHandleProps,
}: {
  colors: Color[];
  size: string;
  variants: Record<string, Color[]>;
  onChange: (colors: Record<string, Color[]>) => void;
  dragHandleProps?: any;
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [newVariantColors, setNewVariantColors] = useState(colors);
  const [newColorsCount, setNewColorsCount] = useState(colors.length);
  const [selectedSize, setSelectedSize] = useState(size);

  const removeVariation = (size: string) => {
    const newVariants = { ...variants, [size]: [] };
    onChange(newVariants);
  };

  const updateVariation = () => {
    const newVariants = { ...variants, [selectedSize]: newVariantColors };
    onChange(newVariants);
    setIsEditMode(false);
  };

  return (
    <div key={size} className="flex flex-col gap-4 border rounded-lg p-4">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <div className="cursor-grab active:cursor-grabbing touch-none" {...dragHandleProps}>
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          {!isEditMode ? (
            <div className="w-fit min-w-12 border p-2 rounded-lg text-center font-medium bg-gray-200">{size}</div>
          ) : (
            <p>Update Variation</p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          {!isEditMode && (
            <Button
              className="p-2 bg-transparent hover:bg-transparent"
              type="button"
              onClick={() => setIsEditMode(true)}
            >
              <Edit className="text-green-500" />
            </Button>
          )}
          <Button
            type="button"
            className="p-2 bg-transparent hover:bg-transparent"
            onClick={() => (!isEditMode ? removeVariation(size) : updateVariation())}
          >
            {!isEditMode ? <Trash2 className="text-red-500" /> : <Check className="text-green-500" />}
          </Button>
        </div>
      </div>
      {!isEditMode ? (
        <div className="flex gap-2 flex-wrap">
          {colors.map((color, index) => (
            <p key={index} className="px-2 py-1 border rounded-lg">
              {color.name}
            </p>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newVariant">Enter Size</Label>
            <Input id="newVariant" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Enter Color(s)</Label>
              <div className="flex gap-2 items-center">
                <Button
                  type="button"
                  className="bg-transparent hover:bg-transparent p-2"
                  onClick={() => setNewColorsCount(newColorsCount + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {new Array(newColorsCount).fill(0).map((_, index) => (
              <div key={index} className="relative">
                <Input
                  value={newVariantColors[index]?.name}
                  onChange={(e) => {
                    const newColors = [...newVariantColors];
                    newColors[index] = { ...newColors[index], name: e.target.value };
                    setNewVariantColors(newColors);
                  }}
                />
                {newColorsCount > 1 && (
                  <Button
                    type="button"
                    className="absolute right-2 top-0 bg-transparent hover:bg-transparent p-0 shadow-none"
                    onClick={() => {
                      setNewVariantColors(newVariantColors.filter((_, i) => i !== index));
                      setNewColorsCount(newColorsCount - 1);
                    }}
                  >
                    <Trash2 className="text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
