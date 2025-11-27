import jsPDF from "jspdf";

export const generateReceipt = (purchase) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(220, 38, 38); // Red color
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, "bold");
  doc.text("BloodBridge", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  doc.text("Blood Purchase Receipt", 105, 30, { align: "center" });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Tracking Number
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Tracking Number:", 20, 55);
  doc.setFont(undefined, "normal");
  doc.text(purchase.trackingNumber || "N/A", 70, 55);
  
  // Date
  doc.setFont(undefined, "bold");
  doc.text("Date:", 20, 65);
  doc.setFont(undefined, "normal");
  doc.text(new Date(purchase.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }), 70, 65);
  
  // Status
  doc.setFont(undefined, "bold");
  doc.text("Status:", 20, 75);
  doc.setFont(undefined, "normal");
  doc.text(purchase.status.toUpperCase(), 70, 75);
  
  // Expiry Date
  doc.setFont(undefined, "bold");
  doc.text("Expiry Date:", 20, 85);
  doc.setFont(undefined, "normal");
  doc.setTextColor(255, 140, 0); // Orange color
  doc.text(purchase.expiryDate ? new Date(purchase.expiryDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }) : "N/A", 70, 85);
  doc.setTextColor(0, 0, 0); // Reset to black
  
  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 92, 190, 92);
  
  // Source Information
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Source Information", 20, 102);;
  
  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  doc.text(`Name: ${purchase.sourceName}`, 20, 112);
  doc.text(`Type: ${purchase.sourceType === "organization" ? "Organization" : "Hospital"}`, 20, 120);
  
  // Divider line
  doc.line(20, 127, 190, 127);
  
  // Blood Details
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Blood Details", 20, 137);
  
  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  doc.text(`Blood Type: ${purchase.bloodType}`, 20, 147);
  doc.text(`Units: ${purchase.units}`, 20, 155);
  doc.text(`Urgency: ${purchase.urgency.toUpperCase()}`, 20, 163);
  
  // Divider line
  doc.line(20, 170, 190, 170);
  
  // Patient Information
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Patient Information", 20, 180);
  
  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  doc.text(`Patient Name: ${purchase.patientName}`, 20, 190);
  if (purchase.patientAge) {
    doc.text(`Patient Age: ${purchase.patientAge}`, 20, 198);
  }
  if (purchase.patientCondition) {
    doc.text(`Condition: ${purchase.patientCondition}`, 20, 206);
  }
  
  // Divider line
  doc.line(20, 213, 190, 213);
  
  // Contact Information
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Contact Information", 20, 223);
  
  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  doc.text(`Contact Name: ${purchase.contactName}`, 20, 233);
  doc.text(`Phone: ${purchase.contactPhone}`, 20, 241);
  if (purchase.contactEmail) {
    doc.text(`Email: ${purchase.contactEmail}`, 20, 249);
  }
  
  // Divider line
  doc.line(20, 256, 190, 256);
  
  // Pricing Breakdown
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Pricing Breakdown", 20, 256);
  
  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  
  let yPosition = 266;
  
  // Blood Price
  doc.text(`Blood Price (${purchase.units} units x ৳${purchase.pricing.bloodPrice}):`, 20, yPosition);
  doc.text(`৳${purchase.pricing.bloodPrice * purchase.units}`, 160, yPosition, { align: "right" });
  yPosition += 8;
  
  // Processing Fee
  doc.text("Processing Fee:", 20, yPosition);
  doc.text(`৳${purchase.pricing.processingFee}`, 160, yPosition, { align: "right" });
  yPosition += 8;
  
  // Screening Fee
  doc.text("Screening Fee:", 20, yPosition);
  doc.text(`৳${purchase.pricing.screeningFee}`, 160, yPosition, { align: "right" });
  yPosition += 8;
  
  // Service Charge
  doc.text("Service Charge:", 20, yPosition);
  doc.text(`৳${purchase.pricing.serviceCharge}`, 160, yPosition, { align: "right" });
  yPosition += 8;
  
  // Additional Fees
  if (purchase.pricing.additionalFees && Object.keys(purchase.pricing.additionalFees).length > 0) {
    Object.entries(purchase.pricing.additionalFees).forEach(([key, value]) => {
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
      doc.text(`${formattedKey}:`, 20, yPosition);
      doc.text(`৳${value}`, 160, yPosition, { align: "right" });
      yPosition += 8;
    });
  }
  
  // Total line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;
  
  // Total Cost
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Total Cost:", 20, yPosition);
  doc.setTextColor(22, 163, 74); // Green color
  doc.text(`৳${purchase.pricing.totalCost.toLocaleString()}`, 160, yPosition, { align: "right" });
  
  // Footer
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text("Thank you for using BloodBridge!", 105, 285, { align: "center" });
  doc.text("For support, contact: support@bloodbridge.bd", 105, 292, { align: "center" });
  
  // Save the PDF
  const fileName = `BloodBridge_Receipt_${purchase.trackingNumber || purchase._id}.pdf`;
  doc.save(fileName);
};
