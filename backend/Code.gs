/**
 * ==============================================================================
 * SAGARA BEACH STAY - GOOGLE APPS SCRIPT BACKEND API
 * ==============================================================================
 * Connects Google Spreadsheets (Database) & Google Drive (File Storage)
 * to the Sagara Beach Stay mobile frontend.
 *
 * HOW TO DEPLOY:
 * 1. Open Google Sheets (create a new sheet: "Sagara Beach Stay Database").
 * 2. Click Extensions > Apps Script.
 * 3. Delete existing code and paste this entire file.
 * 4. Create a folder in Google Drive named "Sagara Beach Stay - Media".
 *    Copy its Folder ID and paste it into DRIVE_FOLDER_ID below.
 * 5. Click "Deploy" > "New deployment" > Select type: "Web app".
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Copy the Web App URL and paste it into the Sagara Beach Stay Admin Settings!
 * ==============================================================================
 */

// CONFIGURATION
const SHEET_NAME = "Bookings";
const DRIVE_FOLDER_ID = "1gxqB5EsOPJfA-akAGaZpD23ov3w33s9l"; // Replace with your Drive folder ID

function doGet(e) {
  try {
    const action = e.parameter.action || "getBookings";
    const sheet = getOrCreateSheet();
    
    if (action === "getBookings") {
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return createJsonResponse({ status: "success", count: 0, data: [] });
      }
      
      const headers = data[0];
      const rows = data.slice(1);
      const bookings = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      
      return createJsonResponse({ status: "success", count: bookings.length, data: bookings });
    }
    
    if (action === "ping") {
      return createJsonResponse({ 
        status: "success", 
        message: "Sagara Beach Stay API is online and responding.",
        sheetName: sheet.getName(),
        timestamp: new Date().toISOString()
      });
    }

    return createJsonResponse({ status: "error", message: "Unknown action" });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const body = JSON.parse(rawData);
    const action = body.action || "createBooking";
    const sheet = getOrCreateSheet();

    // 1. Create new guest booking
    if (action === "createBooking") {
      const b = body.booking;
      
      // Upload Base64 media to Google Drive if provided
      let ktpDriveUrl = b.ktpImageUrl || "";
      let paymentProofDriveUrl = b.paymentProofUrl || "";

      if (b.ktpBase64 && DRIVE_FOLDER_ID !== "YOUR_GOOGLE_DRIVE_FOLDER_ID") {
        ktpDriveUrl = uploadBase64ToDrive(b.ktpBase64, `KTP_${b.guestNik}_${b.guestName}.jpg`);
      }
      if (b.paymentProofBase64 && DRIVE_FOLDER_ID !== "YOUR_GOOGLE_DRIVE_FOLDER_ID") {
        paymentProofDriveUrl = uploadBase64ToDrive(b.paymentProofBase64, `PAYMENT_${b.id || Date.now()}.jpg`);
      }

      const newRow = [
        b.id || "SGR-" + Math.floor(1000 + Math.random() * 9000),
        b.propertyId,
        b.propertyName,
        b.guestName,
        b.guestPhone,
        b.guestNik,
        ktpDriveUrl,
        b.checkInDate,
        b.checkOutDate,
        b.totalNights,
        b.guestsCount,
        b.totalAmount,
        paymentProofDriveUrl,
        b.paymentMethod,
        b.status || "pending_verification",
        new Date().toISOString(),
        "", // verifiedAt
        "", // checkedInAt
        b.adminNotes || ""
      ];

      sheet.appendRow(newRow);

      return createJsonResponse({
        status: "success",
        message: "Booking successfully saved to Google Spreadsheet & Drive",
        bookingId: newRow[0],
        ktpDriveUrl: ktpDriveUrl,
        paymentProofDriveUrl: paymentProofDriveUrl
      });
    }

    // 2. Admin verification (Approve / Reject)
    if (action === "updateBookingStatus") {
      const { bookingId, status, adminNotes } = body;
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idCol = headers.indexOf("id");
      const statusCol = headers.indexOf("status");
      const verifiedAtCol = headers.indexOf("verifiedAt");
      const notesCol = headers.indexOf("adminNotes");

      let updated = false;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] === bookingId) {
          sheet.getRange(i + 1, statusCol + 1).setValue(status);
          if (status === "verified") {
            sheet.getRange(i + 1, verifiedAtCol + 1).setValue(new Date().toISOString());
          }
          if (adminNotes) {
            sheet.getRange(i + 1, notesCol + 1).setValue(adminNotes);
          }
          updated = true;
          break;
        }
      }

      if (updated) {
        return createJsonResponse({ status: "success", message: `Booking ${bookingId} updated to ${status}` });
      } else {
        return createJsonResponse({ status: "error", message: "Booking ID not found" });
      }
    }

    // 3. Receptionist check-in confirmation
    if (action === "confirmCheckIn") {
      const { bookingId } = body;
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idCol = headers.indexOf("id");
      const statusCol = headers.indexOf("status");
      const checkedInAtCol = headers.indexOf("checkedInAt");

      let updated = false;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] === bookingId) {
          sheet.getRange(i + 1, statusCol + 1).setValue("checked_in");
          sheet.getRange(i + 1, checkedInAtCol + 1).setValue(new Date().toISOString());
          updated = true;
          break;
        }
      }

      if (updated) {
        return createJsonResponse({ status: "success", message: `Guest checked in for ${bookingId}` });
      } else {
        return createJsonResponse({ status: "error", message: "Booking ID not found" });
      }
    }

    return createJsonResponse({ status: "error", message: "Invalid action" });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * Initializes Google Sheet with standard columns if not already configured.
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      "id",
      "propertyId",
      "propertyName",
      "guestName",
      "guestPhone",
      "guestNik",
      "ktpImageUrl",
      "checkInDate",
      "checkOutDate",
      "totalNights",
      "guestsCount",
      "totalAmount",
      "paymentProofUrl",
      "paymentMethod",
      "status",
      "createdAt",
      "verifiedAt",
      "checkedInAt",
      "adminNotes"
    ];
    
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#003d79").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Uploads a base64 encoded image string to Google Drive folder and returns public view URL
 */
function uploadBase64ToDrive(base64Data, fileName) {
  try {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const decoded = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decoded, "image/jpeg", fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    Logger.log("Drive upload error: " + e.toString());
    return base64Data; // fallback
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
