import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Trash } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { ImageDropzone } from "@/components/ImageDropzone";
import Loader from "@/components/Loader";
import DeleteAlertModal from "@/components/products/DeleteAlertModal";
import Variations from "@/components/products/Variations";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import useProduct from "@/hooks/useProduct";
import { Variation } from "@/types/product";
import { addProductSchema, UpdateProductFormValues, uploadImage } from "@/utils/product";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function EditProductPage() {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();

  const { product, isLoading, colorVariations, setColorVariations, updateProduct, isUpdating, isDeleting } =
    useProduct(productId);

  const form = useForm<UpdateProductFormValues>({
    resolver: zodResolver(addProductSchema),
  });

  useEffect(() => {
    if (product) {
      form.reset({
        id: `#${product.numericalId}`,
        name: product.name,
        sku: product.sku,
        description: product.description,
        weight: product.weight,
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
      updateProduct(
        { productData: data, variations: variantsSelected },
        {
          onSettled(data) {
            if (data?.success) {
              toast.success("Product updated successfully!");
              navigate("/ecommerce/products");
              return;
            }

            console.error(data?.error);
            toast.error("Failed to update product!");
          },
        },
      );
    } catch (error) {
      toast.error("Failed to update product!");
    }
  }

  const handleImageDelete = async () => {
    try {
      form.setValue("image", "");
      toast.success("Image deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete image!");
    }
  };

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
                      {!form.getValues("image") ? (
                        <ImageDropzone value={field.value} onChange={uploadImageToStorage} />
                      ) : (
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
                              onDelete={handleImageDelete}
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
                                if (file) uploadImageToStorage(file);
                              }}
                            />
                          </div>
                        </div>
                      )}
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

              <div className="flex gap-2 items-end">
                <FormField
                  control={form.control}
                  name="weight.value"
                  rules={{ min: 0 }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary-text">Product Weight</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="Enter product weight" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight.unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange} defaultValue="g">
                          <SelectTrigger>
                            <SelectValue placeholder="Select weight unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="kg">Kg</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Product"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
