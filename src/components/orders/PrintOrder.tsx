import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";
import { Printer } from "lucide-react";

type Props = {
  order: Order;
};

const PrintOrder = ({ order }: Props) => {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const currentDate = new Date().toLocaleDateString();

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bazar Al Haya Management - Shipment ${order.numericalId}</title>
          <style>
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
              position: relative;
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
              padding: 20px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
            }
            .section {
              background: white;
              padding: 20px;
              border-radius: 6px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
              grid-template-columns: 140px 1fr;
              gap: 8px;
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
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
              background: #e2e8f0;
            }
            .qr-placeholder {
              position: absolute;
              top: 20px;
              right: 20px;
              width: 100px;
              height: 100px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: #6b7280;
            }
            @media print {
              .no-print { display: none; }
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="header">
              <div class="logo-section">
                <div>
                  <div class="logo">BAZAR AL HAYA MANAGEMENT</div>
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
                  <div class="value">${order.product.sku}</div>
                  <div class="label">Weight:</div>
                  <div class="value">${order.product?.weight.value} ${order.product?.weight.unit}</div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Order Information</div>
                <div class="details-grid">
                  <div class="label">Status:</div>
                  <div class="status-badge">${order.status.toUpperCase()}</div>
                  <div class="label">Created At:</div>
                  <div class="value">${new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              
            </div>
            <div class="section">
                <div class="section-title">Order Variations</div>
                <div style="display: flex; flex-direction: column; gap: 25px;">
                  ${order.orderVariations
                    .map(
                      (variation) => `
                    <div class="details-grid" style="grid-template-columns: repeat(2, 1fr); border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                      <div class="label">Size:</div>
                      <div class="value">${variation.size}</div>
                      <div class="label">Color:</div>
                      <div class="value">${variation.color.name}</div>
                      <div class="label">Quantity:</div>
                      <div class="value">${variation.quantity}</div>
                      <div class="label">Shipped Quantity:</div>
                      <div class="value">${variation.shippedQuantity || "N/A"}</div>
                      <div class="label">Dispatched Date:</div>
                      <div class="value">${variation.date}</div>
                    </div>
                    `,
                    )
                    .join("")}
                </div>
                  </div>
            
            </div>

            <div class="footer">
              <div style="margin-bottom: 10px;">
                Last Updated: ${new Date(order.updatedAt).toLocaleDateString() || "N/A"} 
              </div>
              <div>Document ID: ${order.id} • Generated on ${currentDate}</div>
              <div style="margin-top: 5px;">Bazar Al Haya Management</div>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow?.document.write(printContent);
    printWindow?.document.close();
  };

  return (
    <Button onClick={handlePrint}>
      <Printer className="h-4 w-4" />
      <span>Print</span>
    </Button>
  );
};

export default PrintOrder;
