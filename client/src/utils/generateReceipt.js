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
  
  // Status - highlighted
  doc.setFont(undefined, "bold");
  doc.text("Status:", 20, 75);
  const statusColor = purchase.status === "completed" ? [34, 197, 94] : [249, 115, 22];
  doc.setTextColor(...statusColor);
  doc.setFont(undefined, "bold");
  doc.text(purchase.status.toUpperCase(), 70, 75);
  doc.setTextColor(0, 0, 0);
  
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
  
  // Blood Details - with emphasis on Blood Type
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Blood Details", 20, 137);
  
  doc.setFontSize(12);
  doc.setFont(undefined, "normal");
  
  // Blood Type - highlighted with box
  doc.setDrawColor(220, 38, 38);
  doc.setFillColor(255, 240, 240);
  doc.rect(20, 141, 170, 10, "F");
  doc.setTextColor(220, 38, 38);
  doc.setFont(undefined, "bold");
  doc.text(`Blood Type: ${purchase.bloodType}`, 23, 148);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "normal");
  
  doc.text(`Units: ${purchase.units}`, 20, 157);
  doc.text(`Urgency: ${purchase.urgency.toUpperCase()}`, 20, 165);
  
  // Divider line
  doc.line(20, 172, 190, 172);
  
  // Patient Information and Contact Information - Two Columns
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Patient Information", 20, 182);
  doc.text("Contact Information", 110, 182);
  
  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  
  // Left Column - Patient Information
  let leftY = 192;
  doc.text(`Patient Name:`, 20, leftY);
  doc.setFont(undefined, "normal");
  doc.text(`${purchase.patientName}`, 20, leftY + 5);
  leftY += 12;
  
  if (purchase.patientAge) {
    doc.setFont(undefined, "bold");
    doc.text(`Patient Age:`, 20, leftY);
    doc.setFont(undefined, "normal");
    doc.text(`${purchase.patientAge}`, 20, leftY + 5);
    leftY += 12;
  }
  
  if (purchase.patientCondition) {
    doc.setFont(undefined, "bold");
    doc.text(`Condition:`, 20, leftY);
    doc.setFont(undefined, "normal");
    doc.text(`${purchase.patientCondition}`, 20, leftY + 5);
    leftY += 12;
  }
  
  // Right Column - Contact Information
  let rightY = 192;
  doc.setFont(undefined, "bold");
  doc.text(`Contact Name:`, 110, rightY);
  doc.setFont(undefined, "normal");
  doc.text(`${purchase.contactName}`, 110, rightY + 5);
  rightY += 12;
  
  doc.setFont(undefined, "bold");
  doc.text(`Phone:`, 110, rightY);
  doc.setFont(undefined, "normal");
  doc.text(`${purchase.contactPhone}`, 110, rightY + 5);
  rightY += 12;
  
  if (purchase.contactEmail) {
    doc.setFont(undefined, "bold");
    doc.text(`Email:`, 110, rightY);
    doc.setFont(undefined, "normal");
    doc.text(`${purchase.contactEmail}`, 110, rightY + 5);
    rightY += 12;
  }
  
  // Use the maximum Y position from both columns
  const maxColumnY = Math.max(leftY, rightY);
  
  // Divider line
  doc.line(20, maxColumnY + 3, 190, maxColumnY + 3);
  
  // Pricing Breakdown - clean UI (NO border)
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setFillColor(255, 250, 250);
  doc.rect(15, maxColumnY + 6, 180, 8, "F"); // subtle header background
  doc.text("Pricing Breakdown", 20, maxColumnY + 12);

  doc.setFontSize(11);
  doc.setFont(undefined, "normal");

  let yPosition = maxColumnY + 20;

  // Blood Price
  doc.text(
    `Blood Price (${purchase.units} units × ৳${purchase.pricing.bloodPrice})`,
    25,
    yPosition
  );
  doc.text(
    `৳${(purchase.pricing.bloodPrice * purchase.units).toLocaleString()}`,
    170,
    yPosition,
    { align: "right" }
  );
  yPosition += 7;

  // Processing Fee
  doc.text("Processing Fee", 25, yPosition);
  doc.text(`৳${purchase.pricing.processingFee.toLocaleString()}`, 170, yPosition, {
    align: "right",
  });
  yPosition += 7;

  // Screening Fee
  doc.text("Screening Fee", 25, yPosition);
  doc.text(`৳${purchase.pricing.screeningFee.toLocaleString()}`, 170, yPosition, {
    align: "right",
  });
  yPosition += 7;

  // Service Charge
  doc.text("Service Charge", 25, yPosition);
  doc.text(`৳${purchase.pricing.serviceCharge.toLocaleString()}`, 170, yPosition, {
    align: "right",
  });
  yPosition += 7;

  // Additional Fees (if any)
  if (
    purchase.pricing.additionalFees &&
    Object.keys(purchase.pricing.additionalFees).length > 0
  ) {
    Object.entries(purchase.pricing.additionalFees).forEach(([key, value]) => {
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (c) => c.toUpperCase());

      doc.text(label, 25, yPosition);
      doc.text(`৳${value.toLocaleString()}`, 170, yPosition, { align: "right" });
      yPosition += 7;
    });
  }

  // Divider before total
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.line(25, yPosition + 2, 190, yPosition + 2);
  yPosition += 8;

  // Total Cost (highlighted)
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.setFillColor(34, 197, 94); // green
  doc.setTextColor(255, 255, 255);
  doc.rect(17, yPosition - 6, 176, 9, "F");

  doc.text("Total Cost", 25, yPosition);
  doc.text(`৳${purchase.pricing.totalCost.toLocaleString()}`, 170, yPosition, {
    align: "right",
  });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Footer
  const footerStartY = yPosition + 15;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text("Thank you for using BloodBridge!", 105, footerStartY, {
    align: "center",
  });
  doc.text(
    "For support, contact: support@bloodbridge.bd",
    105,
    footerStartY + 5,
    { align: "center" }
  );
  
  // Save the PDF
  const fileName = `BloodBridge_Receipt_${purchase.trackingNumber || purchase._id}.pdf`;
  doc.save(fileName);
};
