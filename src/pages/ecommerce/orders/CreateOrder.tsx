import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import useProduct from "@/hooks/useProduct";
import { cn } from "@/lib/utils";
import { OrderStatus, Size } from "@/types/order";
import { Color } from "@/types/product";
import { addOrderSchema } from "@/utils/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

export default function CreateOrderPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product");
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState("");

  const { isLoading: loading, colorVariations, product } = useProduct(productId || "");
  const { addOrder, isAdding } = useOrders();

  const { control, handleSubmit, setValue, watch } = useForm<z.infer<typeof addOrderSchema>>({
    resolver: zodResolver(addOrderSchema),
    defaultValues: {
      product: {
        id: productId || "",
        name: product?.name,
        weight: {
          unit: "g",
          value: "0.0",
        },
        sku: product?.sku,
      },
      status: OrderStatus.PENDING,
      orderVariations: [],
    },
  });

  useEffect(() => {
    if (product) {
      setValue("product.name", product.name);
      setValue("product.sku", product.sku);
      setValue("product.image", product.image);
      setValue("product.weight.value", product.weight.value);
      setValue("product.weight.unit", product.weight.unit);
    }
  }, [product]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "orderVariations",
  });

  useEffect(() => {
    if (!productId) {
      toast.error("Product not found");
      setTimeout(() => navigate("/ecommerce/orders"), 1000);
    }
  }, [productId, navigate]);

  const onSubmit = async (data: z.infer<typeof addOrderSchema>) => {
    addOrder(data, {
      onSuccess(result) {
        if (result.success) {
          toast.success("Order added successfully!");
          navigate("/ecommerce/orders");
        } else {
          console.error(result.errors);
          toast.error("Failed to add order");
        }
      },
      onError(result) {
        toast.error("Failed to add order");
        console.error(result);
      },
    });
  };

  const handleAddVariation = () => {
    if (!selectedSize || !selectedColor || !watch("product.sku")) return;

    if (!selectedQuantity || parseInt(selectedQuantity) <= 0 || isNaN(parseInt(selectedQuantity))) {
      toast.error("Invalid Quantity value");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    append({
      size: selectedSize,
      color: selectedColor,
      date: format(selectedDate, "dd-MM-yyyy"),
      shippedQuantity: "0",
      comments: "",
      quantity: parseInt(selectedQuantity),
    });

    setAddModalOpen(false);
    setSelectedSize(null);
    setSelectedColor(null);
    setSelectedQuantity("");
  };

  if (currentUser && currentUser.userType === "manager") {
    toast.error("Unauthorized. Only Admins can add orders.");
    setTimeout(() => navigate("/ecommerce/orders"), 2000);
    return null;
  }

  if (!productId) return null;

  if (loading || authLoading) return <Loader />;

  return (
    <div className="p-6 container space-y-10 bg-card border shadow-sm rounded-xl">
      <div>
        <h1 className="text-2xl font-semibold">Create Order</h1>
        <p className="text-muted-foreground">
          Create a new order for <b className="text-black text-xl">{product?.name}</b>
        </p>
        <img
          src={product?.image || "/placeholder.svg"}
          alt={product?.name}
          className="rounded-lg border mt-5"
          width={200}
          height={300}
        />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          if (errors) {
            console.log(errors);
          }
        })}
        className="space-y-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">SKU</Label>
            <Controller
              name="product.sku"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  {error && <p className="text-xs text-red-500">{error.message}</p>}
                  <Input {...field} disabled placeholder="Enter SKU" />
                </div>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-medium">Colors in Available Sizes:</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(colorVariations).map(
              ([size, sizeColors], index) =>
                sizeColors.length > 0 && (
                  <div key={size + index.toString()} className="flex flex-col gap-4 border rounded-lg p-4">
                    <div className="w-12 border p-2 rounded-lg text-center font-medium bg-gray-200">{size}</div>
                    <div className="flex gap-4 flex-wrap">
                      {sizeColors.map((color, index) => (
                        <div key={index} className="relative group">
                          <p className="px-2 py-1 border rounded-lg">{color.name}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-4 w-4 absolute -top-2 -right-2 rounded-full flex items-center justify-center"
                            onClick={() => {
                              setSelectedSize(size as Size);
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

        {fields.length > 0 && (
          <div className="w-fit grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fields.map((field, index) => {
              // const parsedDate = parse(field.date, "dd-MM-yyyy", new Date());
              return (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between flex-wrap">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-sm">Size: {field.size}</span>
                      <span className="text-sm">Color: {field.color.name}</span>
                      <span>Quantity: {field.quantity}</span>
                      {/* <div className="flex gap-1 items-center">
                        <p>Dispatch Date: </p>
                        <span
                          className={cn(
                            `px-2 py-1 border rounded-lg`,
                            parsedDate <= new Date() || parsedDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white",
                          )}
                        >
                          {field.date}
                        </span>
                      </div> */}
                    </div>
                    <div className="flex items-center gap-2">
                      {currentUser?.userType === "admin" && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Shipped Quantity</Label>
                      <Controller
                        name={`orderVariations.${index}.shippedQuantity`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            {error && <p className="text-sm text-red-500">{error.message}</p>}
                            <Input {...field} type="number" placeholder="Enter Shipped Quantity" />
                          </div>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Comments</Label>
                      <Controller
                        name={`orderVariations.${index}.comments`}
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            {error && <p className="text-sm text-red-500">{error.message}</p>}
                            <Textarea {...field} placeholder="Enter Comments" />
                          </div>
                        )}
                      />
                    </div>
                  </div> */}
                </div>
              );
            })}
          </div>
        )}

        <Button type="submit" className="w-fit mx-auto" disabled={isAdding}>
          {isAdding ? "Creating..." : "Create Order"}
        </Button>
      </form>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Size</Label>
              <Input value={selectedSize ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Color</Label>
              <div className="flex items-center gap-2">
                <Input value={selectedColor?.name || ""} disabled />
              </div>
            </div>
            <div className="space-y-2">
              {/* {errors.orderVariations} */}
              <Label className="text-sm font-medium">Quantity</Label>
              <Input
                type="number"
                placeholder="Ex.100pc"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
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
              type="button"
              className="w-full"
              onClick={handleAddVariation}
              disabled={!selectedSize || !selectedColor || !selectedQuantity || !watch("product.sku")}
            >
              Add to list
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
