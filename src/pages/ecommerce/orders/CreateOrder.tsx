import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { OrderVariation } from "@/types/order";
import type { Color } from "@/types/product";
import { format } from "date-fns";
import { CalendarIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Label } from "../../../components/ui/label";

export const mockColorVariations: Record<string, Color[]> = {
  S: [
    { id: "1", name: "Red", hexCode: "#FF0000" },
    { id: "2", name: "Blue", hexCode: "#0000FF" },
    { id: "3", name: "Green", hexCode: "#00FF00" },
    { id: "4", name: "Yellow", hexCode: "#FFFF00" },
    { id: "5", name: "Purple", hexCode: "#800080" },
    { id: "6", name: "Gray", hexCode: "#808080" },
  ],
  M: [
    { id: "1", name: "Red", hexCode: "#FF0000" },
    { id: "2", name: "Blue", hexCode: "#0000FF" },
    { id: "3", name: "Green", hexCode: "#00FF00" },
    { id: "4", name: "Yellow", hexCode: "#FFFF00" },
    { id: "5", name: "Purple", hexCode: "#800080" },
    { id: "6", name: "Gray", hexCode: "#808080" },
  ],
  XL: [
    { id: "1", name: "Red", hexCode: "#FF0000" },
    { id: "2", name: "Blue", hexCode: "#0000FF" },
  ],
};

export default function CreateOrderPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product");
  const navigation = useNavigate();

  const [supplierName, setSupplierName] = useState("John Martin");
  const [sku, setSku] = useState("J01");
  const [variations, setVariations] = useState<OrderVariation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    if (!productId) {
      toast.error("Product not found");
      setTimeout(() => navigation("/ecommerce/orders"), 1000);
    }
  }, []);

  const handleAddVariation = () => {
    if (!selectedSize || !selectedColor || !quantity || !selectedDate) return;

    setVariations((prev) => [
      ...prev,
      {
        size: selectedSize as any,
        color: selectedColor,
        quantity: Number.parseInt(quantity),
        date: format(selectedDate, "dd-MM-yyyy"),
      },
    ]);

    setAddModalOpen(false);
    setSelectedSize("");
    setSelectedColor(null);
    setQuantity("");
    setSelectedDate(undefined);
  };

  const handleUpdateVariation = (index: number, data: Partial<OrderVariation>) => {
    setVariations((prev) => prev.map((v, i) => (i === index ? { ...v, ...data } : v)));
  };

  const handleDeleteVariation = (index: number) => {
    setVariations((prev) => prev.filter((_, i) => i !== index));
  };

  if (!productId) return null;

  return (
    <div className="p-6 container space-y-10 bg-card border shadow-sm rounded-xl">
      <div>
        <h1 className="text-2xl font-semibold">Create Order</h1>
        <p className="text-muted-foreground">
          Create a new order for product with id: <b>{productId}</b>
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Supplier Name</Label>
            <Input
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Enter supplier name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Search SKU</Label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Enter SKU" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-medium">Colors in Available Sizes:</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(mockColorVariations).map(
              ([size, sizeColors], index) =>
                sizeColors.length > 0 && (
                  <div key={size + index.toString()} className="flex flex-col gap-4 border rounded-lg p-4">
                    <div className="w-12 border p-2 rounded-lg text-center font-medium bg-gray-200">{size}</div>
                    <div className="flex gap-2 flex-wrap">
                      {sizeColors.map((color) => (
                        <div key={color.id} className="relative group">
                          <div
                            className="w-6 h-6 rounded-full border cursor-pointer"
                            style={{ backgroundColor: color.hexCode }}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-4 w-4 absolute -top-2 -right-2 rounded-full hidden group-hover:flex items-center justify-center"
                            onClick={() => {
                              setSelectedSize(size);
                              setSelectedColor(color);
                              setAddModalOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>

        {variations.length > 0 && (
          <div className="space-y-4">
            {variations.map((variation, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Input type="radio" className="w-4 h-4" />
                    <span className="text-sm">Size: {variation.size}</span>
                    <div className="flex items-center gap-2">
                      <span>color:</span>
                      <div
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: variation.color.hexCode }}
                      />
                    </div>
                    <span>Quantity: {variation.quantity}</span>
                    <span>{variation.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteVariation(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Shipped Quantity</Label>
                    <Input
                      type="number"
                      placeholder="Ex.100pc"
                      value={variation.shippedQuantity || ""}
                      onChange={(e) =>
                        handleUpdateVariation(index, { shippedQuantity: Number.parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Comments</Label>
                    <Textarea
                      placeholder="Write Comments"
                      value={variation.comments || ""}
                      onChange={(e) => handleUpdateVariation(index, { comments: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Update</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Size</Label>
              <Input value={selectedSize} disabled />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Color</Label>
              <div className="flex items-center gap-2">
                {selectedColor && (
                  <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: selectedColor.hexCode }} />
                )}
                <Input value={selectedColor?.name || ""} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quantity</Label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(day) => {
                      if (!day || day.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
                        toast.error("Date must be today or in the future");
                        return;
                      }
                      setSelectedDate(day);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button
              className="w-full"
              onClick={handleAddVariation}
              disabled={!selectedSize || !selectedColor || !quantity || !selectedDate}
            >
              Add to list
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
