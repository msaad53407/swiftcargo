import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import Loader from "@/components/Loader";
import DeleteAlertModal from "@/components/products/DeleteAlertModal";
import Variations from "@/components/products/Variations";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useProduct from "@/hooks/useProduct";
import { Variation } from "@/types/product";
import { addProductSchema, updateProduct, UpdateProductFormValues } from "@/utils/product";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function EditProductPage() {
  const { id: productId } = useParams<{ id: string }>();

  const [submitting, setSubmitting] = useState(false);
  const { colorVariations, loading, product, setColorVariations, variations } = useProduct(productId);

  const form = useForm<UpdateProductFormValues>({
    resolver: zodResolver(addProductSchema),
  });

  useEffect(() => {
    if (product) {
      form.reset({
        id: `#${product.id}`,
        name: product.name,
        sku: product.sku,
        supplier: product.supplier,
        description: product.description,
        image: product.image,
      });
    }
  }, [product, form]);

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return (
      <div className="container py-10 flex h-screen justify-center items-center">
        <p>Product not found</p>
      </div>
    );
  }

  async function onSubmit(data: UpdateProductFormValues) {
    if (!product) return;
    let variantsSelected: Variation[] = [];
    // adding id to each variation
    for (const key in colorVariations) {
      const variant: Variation = {
        size: key,
        colors: colorVariations[key],
        id: "",
      };
      variations.forEach((variation) => {
        if (variation.size === key) {
          variant.id = variation.id;
        }
      });
      variantsSelected.push(variant);
    }
    try {
      setSubmitting(true);
      const result = await updateProduct(product.id, data, variantsSelected);
      if (!result?.success) {
        toast.error("Failed to update product!");
        return;
      }

      toast.success("Product updated successfully!");
    } finally {
      setSubmitting(false);
    }
  }

  const handleImageUpload = async (file: File) => {
    // Add your image upload logic here
    console.log(file);
  };

  return (
    <div className="container py-10 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Product Detail</h1>
          <p className="text-sm text-muted-foreground">Manage shipments, clients, and finances.</p>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Package Information</h2>
          <p className="text-sm text-muted-foreground mb-6">Basic info, like your name and colors etc.</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-4">
                        <img
                          src={field.value || "/placeholder.svg"}
                          alt="Product"
                          width={200}
                          height={300}
                          className="rounded-lg border"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("image-upload")?.click()}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Image
                          </Button>
                          <DeleteAlertModal
                            id={product.id}
                            trigger={
                              <Button type="button" variant="destructive">
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            }
                          />
                          <input
                            id="image-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Product Id.</FormLabel>
                    <FormControl>
                      <Input value={form.getValues("id")} disabled />
                    </FormControl>
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU #</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-text">Supplier</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                <Button variant="outline" type="button" asChild>
                  <Link to="/ecommerce/products">Cancel</Link>
                </Button>
                <Button type="submit" disabled={submitting}>
                  Update Product
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
