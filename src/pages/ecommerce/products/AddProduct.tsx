import { ImageDropzone } from "@/components/ImageDropzone";
import Variations from "@/components/products/Variations";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AddProductErrorType, Color, Variation } from "@/types/product";
import { addProduct, addProductSchema, ProductFormValues, uploadImage } from "@/utils/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AddProduct() {
  const [colorVariations, setColorVariations] = useState<Record<string, Color[]>>({});
  const [formErrors, setFormErrors] = useState<AddProductErrorType>({
    product: null,
    variations: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      name: "",
      sku: "",
      image: "",
      supplier: "",
      description: "",
      visibility: true,
    },
  });

  async function uploadImageToStorage(file: File) {
    toast.promise(uploadImage(file), {
      loading: "Uploading image...",
      success(data) {
        if (!data) {
          throw new Error("Image upload failed");
        }
        form.setValue("image", data);
        return "Image uploaded successfully!";
      },
      error: "Failed to upload image",
    });
  }

  async function onSubmit(data: ProductFormValues) {
    let variantsSelected: Omit<Variation, "id">[] = [];
    for (const key in colorVariations) {
      const variant = {
        size: key,
        colors: colorVariations[key],
      };
      variantsSelected.push(variant);
    }
    setSubmitting(true);
    const result = await addProduct(data, variantsSelected);
    if (!result?.success) {
      if (typeof result.error === "object") {
        setFormErrors({
          product: result.error?.product,
          variations: result.error?.variations || [],
        });
      }
      toast.error("Failed to add product");
      setSubmitting(false);
      return;
    }
    toast.success("Product added successfully!");

    setSubmitting(false);

    navigate({ pathname: "/ecommerce/products" });
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary-text">Add New Product</h1>
          <p className="text-sm text-muted-foreground">Add a new product to your store</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageDropzone value={field.value} onChange={uploadImageToStorage} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-text">Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-text">SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter SKU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary-text">Supplier</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter supplier name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Variations colors={colorVariations} onChange={setColorVariations} />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary-text">Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter product description" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="submit" disabled={submitting}>
                Create Product
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
