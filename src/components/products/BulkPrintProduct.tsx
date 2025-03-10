import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import { Printer } from "lucide-react";

export const handleBulkPrint = (products: Product[]) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const currentDate = new Date().toLocaleDateString();

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bazar Al Haya Management - Products List</title>
        <style>
          @page { margin: 0; }
          body { 
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .page-container {
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #1e3a8a;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1e3a8a;
            margin-bottom: 5px;
          }
          .date {
            font-size: 14px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th, td {
            border: 1px solid #e2e8f0;
            padding: 12px;
            text-align: left;
            font-size: 14px;
          }
          th {
            background-color: #f8fafc;
            font-weight: 600;
            color: #1e3a8a;
          }
          .product-cell {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .product-image {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
          }
          .visibility {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          }
          .visibility-visible { background: #dcfce7; color: #166534; }
          .visibility-hidden { background: #fee2e2; color: #991b1b; }
          .variations {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
          }
          .variation-item {
            display: block;
            margin-top: 2px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          @media print {
            .no-print { display: none; }
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body class="page-container">
        <div class="header">
          <div class="logo">BAZAR AL HAYA MANAGEMENT</div>
          <div class="date">Products List - Generated on ${currentDate}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Details</th>
              <th>SKU</th>
              <th>Weight</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            ${products
              .map(
                (product) => `
              <tr>
                <td>#${product.numericalId}</td>
                <td>
                  <div class="product-cell">
                    ${product.image ? `<img src="${product.image}" alt="" class="product-image" />` : ""}
                    <div>
                      <div style="font-weight: semibold;">${product.name}</div>
                      <div class="variations">
                        ${
                          product.variations
                            ?.map(
                              (v) =>
                                `<span class="variation-item"><b>${v.size}</b> - <b>${v.colors.map((c) => c.name).join(", ")}</b></span>`,
                            )
                            .join("") || "No variations"
                        }
                      </div>
                    </div>
                  </div>
                </td>
                <td>#${product.sku}</td>
                <td>${product.weight.value}${product.weight.unit}</td>
                <td>${new Date(product.createdAt).toLocaleDateString()}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <div>Total Products: ${products.length}</div>
          <div>Bazar Al Haya Management</div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
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
