import { Button } from "@/components/ui/button";
import { Order, OrderVariation } from "@/types/order";
import { Printer } from "lucide-react";

// Single order print layout
const generateOrderHTML = (order: Order, currentDate: string) => `
  <div class="page-container" style="page-break-after: always;">
    <div class="header">
      <div class="logo-section">
        <div>
          <div class="logo">Bazar Al Haya Management</div>
        </div>
        <div class="document-type">
          <div>Order Details</div>
          <div style="font-size: 14px; color: #6b7280;">Date: ${currentDate}</div>
        </div>
      </div>
    </div>

    <div class="barcode">*${order.numericalId}*</div>

    <div class="main-grid">
      <div class="section">
        <div class="section-title">Product Information</div>
        <div class="details-grid">
          <div class="label">Name:</div>
          <div class="value">${order.product.name}</div>
          <div class="label">SKU:</div>
          <div class="value">#${order.product.sku}</div>
          ${
            order.product.image
              ? `<div class="label">Image:</div>
          <div class="value">
            <img src="${order.product.image}" alt="${order.product.name}" style="max-width: 100px; max-height: 100px; object-fit: cover; border-radius: 5px;" />
          </div>`
              : ""
          }
        </div>
      </div>

      <div class="section">
        <div class="section-title">Order Details</div>
        <div class="details-grid">
          <div class="label">Order ID:</div>
          <div class="value">#${order.numericalId}</div>
        </div>
      </div>
    </div>

    ${
      order.orderVariations.length > 0
        ? `<div class="section">
      <div class="section-title">Order Variations</div>
      <div class="variations-grid">
        ${order.orderVariations
          .map(
            (variation: OrderVariation) => `
          <div class="variation-item">
            <div class="details-grid" style="grid-template-columns: repeat(2, 1fr);">
              <div>
                <div class="label">Size:</div>
                <div class="value">${variation.size}</div>
              </div>
              <div>
                <div class="label">Color:</div>
                <div class="value">${variation.color.name}</div>
              </div>
              <div>
                <div class="label">Ordered:</div>
                <div class="value">${variation.quantity}</div>
              </div>
              <div>
                <div class="label">Shipped:</div>
                <div class="value">${variation.shippedQuantity || "0"}</div>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>`
        : `<div class="section">
      <div class="section-title">Order Variations</div>
      <div class="details-grid">
        <div class="label">No variations found</div>
      </div>
    </div>
      `
    }

    <div class="footer">
      <div>Order ID: #${order.numericalId} • Generated on ${currentDate}</div>
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
  .barcode {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    letter-spacing: 5px;
    margin-top: 10px;
    text-align: center;
    padding: 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }
  .main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-bottom: 30px;
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
  .variations-grid {
    display: grid;
    gap: 16px;
  }
  .variation-item {
    padding: 12px;
    background: #f8fafc;
    border-radius: 4px;
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
export const handleBulkPrint = (orders: Order[]) => {
  const printWindow = window.open("", "_blank");
  const currentDate = new Date().toLocaleDateString();

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bazar Al Haya Management - Bulk Order Details</title>
        <style>${getCommonStyles()}</style>
      </head>
      <body>
        ${orders.map((order) => generateOrderHTML(order, currentDate)).join("")}
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  }
};

// Single order print component
const OrderPrintButton = ({ order }: { order: Order }) => {
  const handlePrint = () => handleBulkPrint([order]);

  return (
    <Button onClick={handlePrint} className="flex items-center gap-2">
      <Printer className="h-4 w-4" />
      <span>Print Order Details</span>
    </Button>
  );
};

export default OrderPrintButton;
