import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import useColors from "@/hooks/useColors";

export default function ColorPickerModal() {
  const [colorName, setColorName] = useState("");
  const [colorCode, setColorCode] = useState("#000000");
  const [open, setOpen] = useState(false);

  const { addColor, isAddingColor } = useColors();

  const handleSubmit = () => {
    try {
      addColor(
        {
          hexCode: colorCode,
          name: colorName,
        },
        {
          onSuccess: () => {
            toast.success("Color added successfully!");
            setOpen(false);
            setColorName("");
            setColorCode("#000000");
          },
        },
      );
    } catch (error) {
      toast.error("Something went wrong! Please Try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild>
        <Button>Add Color</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Color</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Color Name</Label>
            <Input
              id="name"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="e.g. Forest Green"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="code">Color Code</Label>
            <Input id="code" value={colorCode} onChange={(e) => setColorCode(e.target.value)} placeholder="#000000" />
          </div>
          <HexColorPicker color={colorCode} onChange={setColorCode} className="w-full" />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isAddingColor}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!colorName || !colorCode || isAddingColor}>
            {isAddingColor ? "Adding..." : "Add Color"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
