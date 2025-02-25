import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import { Printer } from "lucide-react";

// Single product print layout
const generateProductHTML = (product: Product, currentDate: string) => `
    <div class="page-container" style="page-break-after: always;">
        <div class="header">
            <div class="logo-section">
                <div>
                    <div class="logo">Bazar Al Haya Management</div>
                </div>
                <div class="document-type">
                    <div>Product Details</div>
                    <div style="font-size: 14px; color: #6b7280;">Date: ${currentDate}</div>
                </div>
            </div>
        </div>

        <div class="main-content">
            <div class="product-header">
                ${
                  product?.image
                    ? `<img src="${product.image}" alt="${product.name}" class="product-image" />`
                    : '<div class="product-image-placeholder">No Image Available</div>'
                }
                <div class="product-title">
                    <h1>${product.name}</h1>
                    <div class="sku">SKU: #${product.sku}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Product Information</div>
                <div class="details-grid">
                    <div class="label">Created Date:</div>
                    <div class="value">${new Date(product.createdAt).toLocaleDateString()}</div>
                    
                    <div class="label">Weight:</div>
                    <div class="value">${product.weight.value} ${product.weight.unit}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Description</div>
                <div class="description">
                    ${product.description || "No description available"}
                </div>
            </div>

            ${
              product.variations?.length
                ? `
                <div class="section">
                    <div class="section-title">Product Variations</div>
                    <div class="variations-grid">
                        ${product.variations
                          .map(
                            (variation) => `
                            <div class="variation-item">
                                <div class="variation-details">
                                    <div class="label">Size:</div>
                                    <div class="value">${variation.size}</div>
                                    
                                    <div class="label">Colors:</div>
                                    <div class="value">
                                        ${variation.colors
                                          .map(
                                            (color) =>
                                              `<span style="padding: 2px 6px; border-radius: 4px; color: black; margin-right: 4px;">${color.name}</span>`,
                                          )
                                          .join("")}
                                    </div>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            `
                : ""
            }
        </div>

        <div class="footer">
            <div>Product ID: ${product.numericalId} • Generated on ${currentDate}</div>
            <div style="margin-top: 5px;">Bazar Al Haya Management</div>
        </div>
    </div>
`;

// Common styles for both single and bulk printing
const getCommonStyles = () => `
  @page { margin: 0; }
  body { 
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    color: #333;
  }
  .page-container {
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
  }
  .header {
    border-bottom: 2px solid #1e3a8a;
    padding-bottom: 20px;
    margin-bottom: 30px;
  }
  .logo-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .logo {
    font-size: 32px;
    font-weight: bold;
    color: #1e3a8a;
  }
  .document-type {
    font-size: 24px;
    color: #1e3a8a;
    text-align: right;
  }
  .product-header {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
  }
  .product-image {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
  }
  .product-image-placeholder {
    width: 200px;
    height: 200px;
    background: #f3f4f6;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    font-size: 14px;
  }
  .product-title {
    flex: 1;
  }
  .product-title h1 {
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 8px 0;
  }
  .sku {
    font-size: 14px;
    color: #6b7280;
  }
  .section {
    background: white;
    padding: 20px;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 20px;
  }
  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #1e3a8a;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 1px solid #e2e8f0;
  }
  .details-grid {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 8px;
    font-size: 14px;
  }
  .description {
    font-size: 14px;
    line-height: 1.6;
    color: #4b5563;
  }
  .variations-grid {
    display: grid;
    gap: 16px;
  }
  .variation-item {
    padding: 12px;
    background: #f8fafc;
    border-radius: 4px;
  }
  .variation-details {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 16px;
    font-size: 14px;
  }
  .label {
    font-weight: 600;
    color: #4b5563;
  }
  .value {
    color: #111827;
  }
  .footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
    font-size: 12px;
    color: #6b7280;
    text-align: center;
  }
  @media print {
    .no-print { display: none; }
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  }
`;

// Function to handle bulk printing
export const handleBulkPrint = (products: Product[]) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const currentDate = new Date().toLocaleDateString();

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bazar Al Haya Management - Bulk Product Details</title>
        <style>${getCommonStyles()}</style>
      </head>
      <body>
        ${products.map((product) => generateProductHTML(product, currentDate)).join("")}
      </body>
    </html>
  `;

  printWindow.document.write(printContent);

  // Wait for images to load before printing
  const images = Array.from(printWindow.document.getElementsByTagName("img"));
  if (images.length > 0) {
    Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(false);
            }
          }),
      ),
    ).then(() => {
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    });
  } else {
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

// Single product print component
const BulkPrintProduct = ({ product }: { product: Product }) => {
  const handlePrint = () => handleBulkPrint([product]);

  return (
    <Button onClick={handlePrint} className="flex items-center gap-2">
      <Printer className="h-4 w-4" />
      <span>Print Product Details</span>
    </Button>
  );
};

export default BulkPrintProduct;
