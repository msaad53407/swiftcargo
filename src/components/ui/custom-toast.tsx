// src/components/ui/custom-toast.tsx
import { toast as sonnerToast } from "sonner";
import { CheckCircle2, XCircle, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface ToastOptions {
    text: string;
    variant?: ToastVariant;
    duration?: number;
}

const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
};

const styles = {
    success: "border-l-4 border-green-500 bg-green-50",
    error: "border-l-4 border-red-500 bg-red-50",
    info: "border-l-4 border-blue-500 bg-blue-50"
};

export const useCustomToast = () => {
    const showToast = ({ text, variant = "info", duration = 3000 }: ToastOptions) => {
        sonnerToast.custom((id) => (
            <div className={`${styles[variant]} p-4 rounded-lg shadow-md`}>
                <div className="flex items-center gap-3">
                    {icons[variant]}
                    <p className="text-sm font-medium text-gray-900">{text}</p>
                </div>
            </div>
        ), {
            duration,
            closeButton: true,
        });
    };

    return {
        success: (text: string, duration?: number) =>
            showToast({ text, variant: "success", duration }),
        error: (text: string, duration?: number) =>
            showToast({ text, variant: "error", duration }),
        info: (text: string, duration?: number) =>
            showToast({ text, variant: "info", duration }),
        custom: showToast
    };
};