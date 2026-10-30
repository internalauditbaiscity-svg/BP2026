import jsPDF from 'jspdf';
import { 
  CheckInRecord, 
  TrainingRecord, 
  HealthRecord, 
  WinLossRecord, 
  MealRecord, 
  DelegationMember, 
  AuditRecord 
} from '../types';

/**
 * Triggers a download of a generated CSV string.
 */
function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(field: any): string {
  if (field === null || field === undefined) return '';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export Check-ins CSV
 */
export function exportCheckInsCSV(records: CheckInRecord[], dateFilter?: string) {
  const filtered = dateFilter ? records.filter(r => r.date === dateFilter) : records;
  const headers = ['Date', 'Time Window', 'Sport', 'Location', 'Activity', 'Participants Count', 'Athletes', 'Submitted By', 'Role', 'Remarks', 'Environment'];
  const rows = filtered.map(r => [
    escapeCSV(r.date),
    escapeCSV(r.timeWindow),
    escapeCSV(r.sport),
    escapeCSV(r.location),
    escapeCSV(r.activity),
    escapeCSV(r.participantNames?.length || 0),
    escapeCSV((r.participantNames || []).join('; ')),
    escapeCSV(r.submittedBy),
    escapeCSV(r.submittedByRole),
    escapeCSV(r.remarks),
    escapeCSV(r.env),
  ]);

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadCSV(csv, `BaisCity_BatangPinoy2026_Whereabouts_${dateFilter || 'All'}.csv`);
}

/**
 * Export Training CSV
 */
export function exportTrainingCSV(records: TrainingRecord[]) {
  const headers = ['Date', 'Sport', 'Drill / Focus', 'Start Time', 'End Time', 'Duration (Mins)', 'Venue', 'Participants', 'Coach in Charge', 'Notes', 'Environment'];
  const rows = records.map(r => [
    escapeCSV(r.date),
    escapeCSV(r.sport),
    escapeCSV(r.drillFocus),
    escapeCSV(r.startTime),
    escapeCSV(r.endTime),
    escapeCSV(r.durationMinutes),
    escapeCSV(r.venue),
    escapeCSV(r.participantCount || (r.participatingAthletes?.length || 0)),
    escapeCSV(r.coachInCharge),
    escapeCSV(r.notes),
    escapeCSV(r.env),
  ]);

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadCSV(csv, `BaisCity_BatangPinoy2026_Training_Report.csv`);
}

/**
 * Export Health & Temperature CSV
 */
export function exportHealthCSV(records: HealthRecord[]) {
  const headers = ['Date', 'Time', 'Member Name', 'Sport', 'Temp (°C)', 'Injury Reported', 'Injury Type', 'Severity', 'Body Part', 'Cleared to Play', 'Logged By', 'Notes'];
  const rows = records.map(r => [
    escapeCSV(r.date),
    escapeCSV(r.time),
    escapeCSV(r.memberName),
    escapeCSV(r.sport),
    escapeCSV(r.temperature),
    escapeCSV(r.hasInjury ? 'Yes' : 'No'),
    escapeCSV(r.injuryType || 'None'),
    escapeCSV(r.severity),
    escapeCSV(r.bodyPart || 'N/A'),
    escapeCSV(r.clearedToPlay ? 'Cleared' : 'Medical Hold'),
    escapeCSV(r.loggedBy),
    escapeCSV(r.notes),
  ]);

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadCSV(csv, `BaisCity_BatangPinoy2026_Medical_Report.csv`);
}

/**
 * Export Win/Loss Records CSV
 */
export function exportWinLossCSV(records: WinLossRecord[]) {
  const headers = ['Date', 'Sport', 'Athlete / Team', 'Opponent', 'Stage', 'Score', 'Result', 'Logged By', 'Remarks'];
  const rows = records.map(r => [
    escapeCSV(r.date),
    escapeCSV(r.sport),
    escapeCSV(r.athleteOrTeam),
    escapeCSV(r.opponent),
    escapeCSV(r.roundStage),
    escapeCSV(r.score),
    escapeCSV(r.result),
    escapeCSV(r.loggedBy),
    escapeCSV(r.remarks),
  ]);

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadCSV(csv, `BaisCity_BatangPinoy2026_MatchResults.csv`);
}

/**
 * Export Meal Claims CSV
 */
export function exportMealCSV(records: MealRecord[], dateFilter?: string) {
  const filtered = dateFilter ? records.filter(r => r.date === dateFilter) : records;
  const headers = ['Date', 'Meal Type', 'Member Name', 'Role', 'Sport', 'Status', 'Claimed At', 'Claimed By', 'Dietary Notes'];
  const rows = filtered.map(r => [
    escapeCSV(r.date),
    escapeCSV(r.mealType),
    escapeCSV(r.memberName),
    escapeCSV(r.memberRole),
    escapeCSV(r.sport),
    escapeCSV(r.claimed ? 'CLAIMED' : 'UNCLAIMED'),
    escapeCSV(r.claimedAt || 'Pending'),
    escapeCSV(r.claimedBy || ''),
    escapeCSV(r.dietaryNotes || 'Normal'),
  ]);

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadCSV(csv, `BaisCity_BatangPinoy2026_Meals_${dateFilter || 'All'}.csv`);
}

/**
 * Export Audit Logs CSV
 */
export function exportAuditCSV(records: AuditRecord[]) {
  const headers = ['Timestamp', 'User Email', 'Name', 'Role', 'Action', 'Target Entity', 'Details', 'Environment'];
  const rows = records.map(r => [
    escapeCSV(r.timestamp),
    escapeCSV(r.userEmail),
    escapeCSV(r.userName),
    escapeCSV(r.userRole),
    escapeCSV(r.actionType),
    escapeCSV(r.targetEntity),
    escapeCSV(r.details),
    escapeCSV(r.env),
  ]);

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadCSV(csv, `BaisCity_BatangPinoy2026_AuditTrail.csv`);
}

/**
 * Export Official PDF Report with Bais City delegation branding
 */
export function generateDelegationPDFReport(params: {
  reportTitle: string;
  env: string;
  adminName: string;
  adminEmail: string;
  sections: {
    heading: string;
    columns: string[];
    rows: (string | number)[][];
  }[];
  summaryNotes?: string[];
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 18;

  // Header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CITY OF BAIS - 2026 BATANG PINOY DELEGATION', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Tournament Period: December 10 - 19, 2026 | Sports Commission & Delegation Office', 14, 18);
  doc.text(`Database: ${params.env.toUpperCase()} | Generated: ${new Date().toLocaleString()}`, 14, 23);

  currentY = 36;

  // Document Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(params.reportTitle, 14, currentY);
  currentY += 6;

  // Metadata block
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Authorized Officer: ${params.adminName} (${params.adminEmail})`, 14, currentY);
  currentY += 8;

  // Summary highlights if any
  if (params.summaryNotes && params.summaryNotes.length > 0) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, currentY, pageWidth - 28, params.summaryNotes.length * 5 + 4, 2, 2, 'F');
    currentY += 4;
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    for (const note of params.summaryNotes) {
      doc.text(`• ${note}`, 18, currentY);
      currentY += 5;
    }
    currentY += 4;
  }

  // Draw Sections
  for (const section of params.sections) {
    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(section.heading, 14, currentY);
    currentY += 5;

    // Table Header
    const colCount = section.columns.length;
    const colWidth = (pageWidth - 28) / colCount;

    doc.setFillColor(226, 232, 240);
    doc.rect(14, currentY, pageWidth - 28, 6, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);

    section.columns.forEach((col, i) => {
      doc.text(col, 16 + i * colWidth, currentY + 4.5);
    });
    currentY += 7;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    if (section.rows.length === 0) {
      doc.setTextColor(148, 163, 184);
      doc.text('No entries recorded in this category.', 16, currentY + 4);
      currentY += 8;
    } else {
      section.rows.forEach((row, rowIndex) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }

        if (rowIndex % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, currentY - 1, pageWidth - 28, 5.5, 'F');
        }

        doc.setTextColor(30, 41, 59);
        row.forEach((cell, cellIndex) => {
          const val = String(cell);
          const truncated = val.length > 25 ? val.substring(0, 23) + '..' : val;
          doc.text(truncated, 16 + cellIndex * colWidth, currentY + 3.2);
        });
        currentY += 5.5;
      });
      currentY += 4;
    }
  }

  // Footer / Certification Sign-off
  if (currentY > 250) {
    doc.addPage();
    currentY = 30;
  } else {
    currentY += 10;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY, pageWidth - 14, currentY);
  currentY += 8;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Official Document - City Government of Bais Sports Delegation Committee.', 14, currentY);
  doc.text('Verified & Authenticated by Internal Audit & Delegation Secretariat', pageWidth - 14, currentY, { align: 'right' });

  doc.save(`${params.reportTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`);
}
