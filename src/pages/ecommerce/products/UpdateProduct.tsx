import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash } from "lucide-react";
import { useEffect } from "react";
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
import { addProductSchema, UpdateProductFormValues } from "@/utils/product";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function EditProductPage() {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const {
    product,
    isLoading,
    colorVariations,
    setColorVariations,
    updateProduct,
    deleteProduct,
    isUpdating,
    isDeleting,
  } = useProduct(productId);

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

  if (isLoading || authLoading) {
    return <Loader />;
  }

  if (currentUser && currentUser.userType === "manager") {
    toast.error("Unauthorized. Only Admins can update products.");
    setTimeout(() => {
      navigate("/ecommerce/products");
    }, 2000);

    return null;
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
    const variantsSelected: Variation[] = [];
    for (const key in colorVariations) {
      const variant: Variation = {
        size: key,
        colors: colorVariations[key],
        id: "",
      };
      product.variations.forEach((variation) => {
        if (variation.size === key) {
          variant.id = variation.id;
        }
      });
      variantsSelected.push(variant);
    }
    try {
      updateProduct({ productData: data, variations: variantsSelected });
      toast.success("Product updated successfully!");
    } catch (error) {
      toast.error("Failed to update product!");
    }
  }

  const handleDelete = async () => {
    try {
      deleteProduct(undefined, {
        onSuccess: () => {
          toast.success("Product deleted successfully!");
          navigate("/ecommerce/products");
        },
      });
    } catch (error) {
      toast.error("Failed to delete product!");
    }
  };

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
                            isDeleting={isDeleting}
                            onDelete={handleDelete}
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
                <Button type="submit" disabled={isUpdating || isDeleting}>
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
