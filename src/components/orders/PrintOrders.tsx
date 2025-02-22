import { Button } from "@/components/ui/button";
import type { Order } from "@/types/order";
import { Printer } from "lucide-react";

type Props = {
  orders: Order[];
};

const PrintOrders = ({ orders }: Props) => {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const currentDate = new Date().toLocaleDateString();

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bazar Al Haya Management - Orders List</title>
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
            .status {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
            }
            .status-completed { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef9c3; color: #854d0e; }
            .status-cancelled { background: #fee2e2; color: #991b1b; }
            .variations {
              font-size: 12px;
              color: #666;
              margin-top: 4px;
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
            <div class="date">Orders List - Generated on ${currentDate}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product Details</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Order Date</th>
              </tr>
            </thead>
            <tbody>
              ${orders
                .map(
                  (order) => `
                <tr>
                  <td>#${order.numericalId}</td>
                  <td>
                    <div class="product-cell">
                      ${order.product.image ? `<img src="${order.product.image}" alt="" class="product-image" />` : ""}
                      <div>
                        <div>${order.product.name}</div>
                        <div class="variations">
                          ${order.orderVariations
                            .map(
                              (v) =>
                                `${v.size} - ${v.color.name} (${v.quantity}${
                                  v.shippedQuantity ? ` / Shipped: ${v.shippedQuantity}` : ""
                                })`,
                            )
                            .join(", ")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>#${order.product.sku}</td>
                  <td>${order.orderVariations.reduce((total, variation) => total + variation.quantity, 0)} in stock</td>
                  <td>
                    <span class="status status-${order.status.toLowerCase()}">
                      ${order.status}
                    </span>
                  </td>
                  <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <div>Total Orders: ${orders.length}</div>
            <div>Bazar Al Haya Management</div>
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

export default PrintOrders;
