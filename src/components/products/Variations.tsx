import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useColors from "@/hooks/useColors";
import { Color } from "@/types/product";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Separator } from "../ui/separator";
import ColorPickerModal from "./ColorPickerModal";
import Loader from "../Loader";

interface VariationsProps {
  colors: Record<string, Color[]>;
  onChange: (colors: Record<string, Color[]>) => void;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export default function Variations({ colors, onChange }: VariationsProps) {
  const [selectedSize, setSelectedSize] = useState("XS");

  const { colors: predefinedColors, loading } = useColors();

  const addColor = (color: Color) => {
    const existingColor = colors[selectedSize as keyof typeof colors];
    if (existingColor) {
      return;
    }
    const newColors = {
      ...colors,
      [selectedSize]: [...(colors[selectedSize] || []), color],
    };
    onChange(newColors);
  };

  const removeColor = (size: string, colorToRemove: Color) => {
    const newColors = {
      ...colors,
      [size]: colors[size].filter((color) => color.id !== colorToRemove.id),
    };
    onChange(newColors);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Variations</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Variations
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[400px] p-4" align="end" sideOffset={8}>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm text-muted-foreground">Select colors for each size</h4>
                <ColorPickerModal />
              </div>

              <Tabs defaultValue="XS" value={selectedSize} onValueChange={setSelectedSize} className="w-full">
                <TabsList className="w-full justify-start">
                  {SIZES.map((size) => (
                    <TabsTrigger key={size} value={size} className="relative">
                      {size}
                      {colors[size]?.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {SIZES.map((size) => (
                  <TabsContent key={size} value={size} className="mt-4">
                    {colors[size]?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {colors[size].map((color, index) => (
                          <div key={`${color}-${index}`} className="relative group">
                            <div
                              className="w-6 h-6 rounded-full border cursor-pointer group-hover:ring-2 ring-offset-2"
                              style={{ backgroundColor: color.hexCode }}
                              onClick={() => removeColor(size, color)}
                            />
                          </div>
                        ))}
                        <Separator className="bg-primary my-1" />
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>

              <div className="grid grid-cols-7 gap-2">
                {predefinedColors.length > 0 ? (
                  predefinedColors.map((color, index) => (
                    <button
                      key={`${color.hexCode}-${index}`}
                      className="w-8 h-8 rounded-full border hover:ring-2 ring-offset-2 transition-all"
                      style={{ backgroundColor: color.hexCode }}
                      onClick={() => addColor(color)}
                    />
                  ))
                ) : (
                  <h4 className="text-sm text-muted-foreground">No Colors found. Start by adding a new Color</h4>
                )}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {Object.keys(colors).length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(colors).map(
            ([size, sizeColors]) =>
              sizeColors.length > 0 && (
                <div key={size} className="flex flex-col gap-4 border rounded-lg p-4">
                  <div className="w-12 border p-2 rounded-lg text-center font-medium bg-gray-200">{size}</div>
                  <div className="flex gap-2 flex-wrap">
                    {sizeColors.map((color, index) => (
                      <div
                        key={`${color}-${index}`}
                        className="w-8 h-8 rounded-lg border relative"
                        style={{ backgroundColor: color.hexCode }}
                      >
                        <span
                          className="absolute -top-1 -right-1 h-4 w-4 text-xs flex justify-center items-center bg-red-500 text-white p-1 rounded-full cursor-pointer"
                          onClick={() => removeColor(size, color)}
                        >
                          X
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
}
