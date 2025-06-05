import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

// Single package print layout
const generatePackageHTML = (pkg, currentDate) => `
  <div class="page-container" style="page-break-after: always;">
    <div class="header">
      <div class="logo-section">
        <div>
          <div class="logo">UMMAH CARGO</div>
          <div style="color: #4b5563; font-size: 14px;">International Shipping & Logistics</div>
        </div>
        <div class="document-type">
          <div>Package Details</div>
          <div style="font-size: 14px; color: #6b7280;">Date: ${currentDate}</div>
        </div>
      </div>
      
    </div>

    <div class="barcode">*${pkg.id}*</div>

    <div class="main-grid">
      <div class="section">
        <div class="section-title">Sender Information</div>
        <div class="details-grid">
          <div class="label">Name:</div>
          <div class="value">${pkg.sender.name}</div>
          <div class="label">Phone:</div>
          <div class="value">${pkg.sender.phone}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Receiver Information</div>
        <div class="details-grid">
          <div class="label">Name:</div>
          <div class="value">${pkg.receiver.name}</div>
          <div class="label">Address:</div>
          <div class="value">${pkg.receiver.address}</div>
          <div class="label">Phone:</div>
          <div class="value">${pkg.receiver.phone}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Shipment Details</div>
      <div class="details-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div>
          <div class="label">Invoice No:</div>
          <div class="value">${pkg.invoiceNo}</div>
        </div>
        <div>
          <div class="label">Package Weight:</div>
          <div class="value">${pkg.packageWeight}</div>
        </div>
        <div>
          <div class="label">Date Accepted:</div>
          <div class="value">${pkg.dateOfAcceptance}</div>
        </div>
        <div>
          <div class="label">Status:</div>
          <div class="value">
            <span class="status-badge">${pkg.status || "N/A"}</span>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 20px;">
        <div class="label">Content Detail:</div>
        <div class="value" style="margin-top: 5px;">${pkg.contentDetail}</div>
      </div>
    </div>

          <div class="section" style="margin-top: 20px;">
                <div class="section-title">Payment Information</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                    <!-- Left Column -->
                    <div class="details-grid" style="gap: 8px;">
                        <div class="label">Total Amount:</div>
                        <div class="value">$${pkg.amount.total.toFixed(2)}</div>
                        
                        <div class="label">Pending Amount:</div>
                        <div class="value">$${pkg.amount.pending.toFixed(2)}</div>
                        
                        <div class="label">Payment Status:</div>
                        <div class="value">${pkg.paymentStatus}</div>
                    </div>
                    
                    <!-- Right Column -->
                    <div class="details-grid" style="gap: 8px;">
                        <div class="label">Cargo Fee:</div>
                        <div class="value">$${pkg.amount.cargoFee.toFixed(2)}</div>
                        
                        <div class="label">Shipping Fee:</div>
                        <div class="value">$${pkg.amount.shippingFee.toFixed(2)}</div>
                        
                        <div class="label">Total Fees:</div>
                        <div class="value">$${(pkg.amount.cargoFee + pkg.amount.shippingFee).toFixed(2)}</div>
                    </div>
                </div>
            </div>

    <div class="footer">
      <div style="margin-bottom: 10px;">
        Last Updated: ${pkg.updatedAt || "N/A"} 
        ${pkg.updatedBy ? `by ${pkg.updatedBy.name}` : ""}
      </div>
      <div>Document ID: ${pkg.id} • Generated on ${currentDate}</div>
      <div style="margin-top: 5px;">Ummah Cargo International Shipping & Logistics Services</div>
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
`;

// Function to handle bulk printing
export const handleBulkPrint = (packages) => {
  const printWindow = window.open("", "_blank");
  const currentDate = new Date().toLocaleDateString();
  console.log(packages);
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ummah Cargo - Bulk Package Detailss</title>
        <style>${getCommonStyles()}</style>
      </head>
      <body>
        ${packages.map((pkg) => generatePackageHTML(pkg, currentDate)).join("")}
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
};

// Single package print component (for backwards compatibility)
const PkgPrintButton = ({ pkg }) => {
  const handlePrint = () => handleBulkPrint([pkg]);

  return (
    <Button onClick={handlePrint} className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800">
      <Printer className="h-4 w-4" />
      <span>Print Package Details</span>
    </Button>
  );
};

export default PkgPrintButton;
