"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Pencil, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "@/components/color-picker";
import { productSchema, type ProductFormValues } from "@/lib/schemas";

const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export default function EditProductPage() {
	const [submitting, setSubmitting] = useState(false);

	const form = useForm<ProductFormValues>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			id: "#567834",
			name: "Blue Zara Plain Dress in Cotton & Cashmere - Spring/Fall Outfit",
			sku: "#4555",
			image: "/placeholder.svg?height=400&width=300",
			variations: SIZES.map((size) => ({
				size,
				colors: [
					{ name: "Red", hexCode: "#FF0000" },
					{ name: "Blue", hexCode: "#0000FF" },
					{ name: "Green", hexCode: "#00FF00" },
				],
			})),
		},
	});

	async function onSubmit(data: ProductFormValues) {
		try {
			setSubmitting(true);
			console.log(data);
			// Add your update logic here
		} finally {
			setSubmitting(false);
		}
	}

	const handleImageUpload = async (file: File) => {
		// Add your image upload logic here
		console.log(file);
	};

	return (
		<div className="container max-w-3xl py-10">
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-semibold">Product Detail</h1>
					<p className="text-sm text-muted-foreground">
						Manage shipments, clients, and finances.
					</p>
				</div>

				<div className="border rounded-lg p-6">
					<h2 className="text-lg font-medium mb-4">Package Information</h2>
					<p className="text-sm text-muted-foreground mb-6">
						Basic info, like your name and colors etc.
					</p>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<FormField
								control={form.control}
								name="image"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<div className="space-y-4">
												<Image
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
														onClick={() =>
															document.getElementById("image-upload")?.click()
														}>
														<Pencil className="h-4 w-4 mr-2" />
														Edit Image
													</Button>
													<Button type="button" variant="destructive">
														<Trash className="h-4 w-4 mr-2" />
														Delete
													</Button>
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
												<FormLabel>SKU</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							<div>
								<h3 className="text-sm font-medium mb-4">
									Colors in Available Sizes:
								</h3>
								<div className="grid gap-6">
									{SIZES.map((size) => (
										<FormField
											key={size}
											control={form.control}
											name={`variations.${SIZES.indexOf(size)}.colors`}
											render={({ field }) => (
												<ColorPicker
													size={size}
													colors={field.value}
													onChange={field.onChange}
												/>
											)}
										/>
									))}
								</div>
							</div>

							<div className="flex justify-end gap-4">
								<Button variant="outline" type="button">
									Cancel
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
