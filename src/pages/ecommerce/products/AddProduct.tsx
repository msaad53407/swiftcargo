import { ImageDropzone } from "@/components/ImageDropzone";
import Loader from "@/components/Loader";
import Variations from "@/components/products/Variations";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Color, Variation } from "@/types/product";
import { addProduct, addProductSchema, ProductFormValues, uploadImage } from "@/utils/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AddProduct() {
  const [colorVariations, setColorVariations] = useState<Record<string, Color[]>>({});
  const { currentUser, loading: authLoading } = useAuth();

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

  const queryClient = useQueryClient();

  const addProductMutation = useMutation({
    mutationFn: (data: { productData: ProductFormValues; variations: Omit<Variation, "id">[] }) =>
      addProduct(data.productData, data.variations),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", 1, null],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ["productsCount"],
        exact: true,
      });
      toast.success("Product added successfully!");
      navigate("/ecommerce/products");
    },
    onError: (error) => {
      // if (typeof error === "object" && error !== null) {
      //   setFormErrors({
      //     product: (error as any).product,
      //     variations: (error as any).variations || [],
      //   });
      // }
      toast.error("Failed to add product");
      console.error(error);
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
    addProductMutation.mutate({ productData: data, variations: variantsSelected });
  }

  if (authLoading) return <Loader />;

  if (currentUser && currentUser.userType === "manager") {
    toast.error("Unauthorized. Only Admins can add products.");
    setTimeout(() => {
      navigate("/ecommerce/products");
    }, 2000);
    return null;
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
              <Button type="submit" disabled={addProductMutation.isPending}>
                Create Product
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
