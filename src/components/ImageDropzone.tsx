import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { ImagePlus } from "lucide-react";

interface ImageDropzoneProps {
	value: any;
	onChange: (file: any) => void;
}

export function ImageDropzone({ value, onChange }: ImageDropzoneProps) {
	const onDrop = useCallback(
		(acceptedFiles: any[]) => {
			// Only take the first file
			if (acceptedFiles.length > 0) {
				onChange(acceptedFiles[0]);
			}
		},
		[onChange]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/*": [".jpeg", ".jpg", ".png", ".webp"],
		},
		multiple: false,
		maxFiles: 1,
	});

	return (
		<div className="space-y-4">
			<div
				{...getRootProps()}
				className={cn(
					"border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ease-in-out cursor-pointer",
					"hover:border-primary/50 hover:bg-muted/50",
					isDragActive && "border-primary bg-muted",
					"flex flex-col items-center justify-center gap-2 text-center"
				)}>
				<input {...getInputProps()} />
				<ImagePlus className="h-10 w-10 text-muted-foreground" />
				<div>
					<p className="text-sm font-medium">
						Drop your image here, or{" "}
						<span className="text-primary">click to browse</span>
					</p>
					<p className="text-xs text-muted-foreground mt-1">
						Supports: JPG, JPEG, PNG, WEBP
					</p>
				</div>
			</div>

			{value && (
				<div className="relative aspect-square rounded-lg overflow-hidden border bg-muted w-full max-w-[200px]">
					<img
						src={value}
						alt="Preview"
						className="h-full w-full object-cover transition-all hover:scale-105"
					/>
				</div>
			)}
		</div>
	);
}
