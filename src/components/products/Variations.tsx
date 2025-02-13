import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Color } from "@/types/product";
import { Check, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface VariationsProps {
  colors: Record<string, Color[]>;
  onChange: (colors: Record<string, Color[]>) => void;
  // fieldErrors: VariationErrorType[];
}

export default function Variations({ colors, onChange }: VariationsProps) {
  const [selectedSize, setSelectedSize] = useState("");
  const [newVariantColors, setNewVariantColors] = useState<Color[]>([]);
  const [newColorsCount, setNewColorsCount] = useState(1);

  const addColor = () => {
    const newColors = {
      ...colors,
      [selectedSize]: [...(colors[selectedSize] || []), ...newVariantColors],
    };
    onChange(newColors);
    setNewVariantColors([{ name: "" }]);
    setNewColorsCount(1);
    setSelectedSize("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Variations</h3>
        <DropdownMenu>
          <div className="flex gap-2 items-center">
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Variations
              </Button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="w-[400px] p-4 max-h-[400px] overflow-y-auto" align="end" sideOffset={8}>
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
              <Button onClick={addColor}>Add</Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {Object.keys(colors).length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(colors).map(
            ([size, sizeColors]) =>
              sizeColors.length > 0 && (
                <VariationDisplay key={size} colors={sizeColors} variants={colors} size={size} onChange={onChange} />
              ),
          )}
        </div>
      )}
    </div>
  );
}

const VariationDisplay = ({
  colors,
  size,
  variants,
  onChange,
}: {
  colors: Color[];
  size: string;
  variants: Record<string, Color[]>;
  onChange: (colors: Record<string, Color[]>) => void;
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
        {!isEditMode ? (
          <div className="w-12 border p-2 rounded-lg text-center font-medium bg-gray-200">{size}</div>
        ) : (
          <p>Update Variation</p>
        )}
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
          {colors.map((color) => (
            <p className="px-2 py-1 border rounded-lg">{color.name}</p>
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
