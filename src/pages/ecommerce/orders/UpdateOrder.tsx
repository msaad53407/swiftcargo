import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import useOrder from "@/hooks/useOrder";
import { cn } from "@/lib/utils";
import { updateOrderSchema, UpdateOrderType } from "@/utils/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function UpdateOrderPage() {
  const { id: orderId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { order, isLoading: orderLoading, updateOrder, isUpdating } = useOrder(orderId);

  const { control, handleSubmit, setValue } = useForm<UpdateOrderType>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      product: {
        name: order?.product?.name,
        sku: order?.product?.sku,
      },
      status: order?.status,
      orderVariations: order?.orderVariations || [],
    },
  });

  useEffect(() => {
    if (order) {
      setValue("product.name", order.product.name);
      setValue("product.sku", order.product.sku);
      setValue("product.image", order.product.image);
      setValue("status", order.status);
      setValue("orderVariations", order.orderVariations);
      setValue("product.id", order.product.id);
    }
  }, [order, setValue]);

  const { fields, update } = useFieldArray({
    control,
    name: "orderVariations",
  });

  const onSubmit = async (data: UpdateOrderType) => {
    try {
      updateOrder(data, {
        onSuccess: () => {
          toast.success("Order updated successfully");
          navigate("/ecommerce/orders");
        },
        onError: () => {
          toast.error("Failed to update order");
        },
      });
    } catch (error) {
      toast.error("Failed to update order");
      console.error(error);
    }
  };

  const handleDateUpdate = (day: Date | undefined, index: number, field: any) => {
    if (!day || day.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
      toast.error("Date must be today or in the future");
      return;
    }
    update(index, {
      ...field,
      date: format(day, "dd-MM-yyyy"),
    });
  };

  if (!orderId) return null;

  if (orderLoading) return <Loader />;

  return (
    <div className="p-6 container space-y-10 bg-card border shadow-sm rounded-xl">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Update Order</h1>
          <p className="text-muted-foreground">
            Update order for <b>{order?.product.name}</b>
          </p>
          <img
            src={order?.product?.image || "/placeholder.svg"}
            alt={order?.product?.name}
            className="rounded-lg border mt-5"
            width={200}
            height={300}
          />
        </div>
        {/* {order && <OrderPrintButton order={order} />} */}
      </div>

      <form onSubmit={handleSubmit(onSubmit, (errors) => console.log(errors))} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">SKU</Label>
            <Controller
              name="product.sku"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  {error && <p className="text-sm text-red-500">{error.message}</p>}
                  <Input {...field} disabled placeholder="Enter SKU" />
                </div>
              )}
            />
          </div>
        </div>

        {fields.length > 0 && (
          <div className="space-y-4">
            {fields.map((field, index) => {
              const parsedDate = parse(field.date, "dd-MM-yyyy", new Date());
              return (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between flex-wrap">
                    <div className="flex items-center gap-4 flex-wrap">
                      <p>
                        Size: <span className="font-extrabold">{field.size}</span>
                      </p>
                      <p>
                        Color: <span className="font-extrabold">{field.color.name}</span>
                      </p>
                      <p>
                        Quantity: <span className="font-extrabold">{field.quantity}</span>
                      </p>
                      <div className="flex gap-2 items-center">
                        <p>Dispatch Date: </p>
                        <span
                          className={cn(
                            `p-2 border rounded-lg text-sm`,
                            parsedDate <= new Date() || parsedDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white",
                          )}
                        >
                          {field.date}
                        </span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-fit text-left font-normal")}>
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              today={parsedDate}
                              onSelect={(day) => handleDateUpdate(day, index, field)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    {/* <div className="flex items-center gap-2">
                      {currentUser?.userType === "admin" && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div> */}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Shipped Quantity</Label>
                      <Controller
                        name={`orderVariations.${index}.shippedQuantity`}
                        control={control}
                        rules={{
                          validate: (value) => {
                            if (Number(value) > field.quantity) {
                              return "Shipped quantity cannot be greater than order quantity";
                            }
                            return true;
                          },
                        }}
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
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link to="/ecommerce/orders">Cancel</Link>
          </Button>
          <Button type="submit" className="w-fit " disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
