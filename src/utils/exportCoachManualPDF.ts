import jsPDF from 'jspdf';

/**
 * Generates an official, publication-grade 6-page printable PDF of the
 * Bais City Batang Pinoy 2026 Coach's Operations Manual & App Navigation Playbook.
 *
 * Designed with strict typographical uniformity and standardized 18mm side margins
 * for clean readability, binder hole-punching, and clipboard field usage.
 */
export function exportCoachManualPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 18; // Standard 18mm side margins for ease of printing, binding, and clipboard holding
  const contentWidth = pageWidth - (marginX * 2); // 174mm
  const totalPages = 6;

  // Strict Uniform Typographical System (pt)
  const FONT_CHAPTER_TITLE = 13;   // Major Chapter & Primary Headings (Font 13)
  const FONT_SECTION_TITLE = 10;   // Card Headers, Subheadings, Table Headers
  const FONT_BODY = 8.5;           // Uniform Body Text, Descriptions, Steps, FAQ Answers, and Callout Lines
  const FONT_HEADER_FOOTER = 7.5;  // Running Header & Footer Metadata

  // Helper for Header Banner on pages 2-6 (Observes exact marginX)
  const renderHeader = (doc: jsPDF, pageNum: number, sectionTitle: string) => {
    // Dark top band
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 18, 'F');

    // Amber trim accent line
    doc.setFillColor(217, 119, 6); // amber-600
    doc.rect(0, 18, pageWidth, 1.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_BODY);
    doc.text('BAIS CITY SPORTS DELEGATION • BATANG PINOY 2026', marginX, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_HEADER_FOOTER);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(sectionTitle, marginX, 15);

    doc.setTextColor(251, 191, 36); // amber-400
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_BODY);
    doc.text('COACH PLAYBOOK', pageWidth - marginX, 10, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_HEADER_FOOTER);
    doc.setTextColor(226, 232, 240);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - marginX, 15, { align: 'right' });
  };

  // Helper for Footer on pages 1-6 (Observes exact marginX)
  const renderFooter = (doc: jsPDF, pageNum: number) => {
    const footerY = pageHeight - 10;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 3, pageWidth - marginX, footerY - 3);

    doc.setFontSize(FONT_HEADER_FOOTER);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('City Government of Bais • Delegation Secretariat & Internal Audit • Batang Pinoy 2026', marginX, footerY);
    doc.text(`Doc Ref: BC-BP2026-MANUAL-REV1 | Pg ${pageNum}/${totalPages}`, pageWidth - marginX, footerY, { align: 'right' });
  };

  // Helper to draw Callout Box with uniform typography and exact marginX alignment
  const drawCalloutBox = (
    doc: jsPDF,
    y: number,
    title: string,
    bodyLines: string[],
    theme: 'danger' | 'warning' | 'info' | 'success'
  ): number => {
    let bgColor = [248, 250, 252];
    let borderColor = [203, 213, 225];
    let titleColor = [30, 41, 59];

    if (theme === 'danger') {
      bgColor = [254, 242, 242]; // red-50
      borderColor = [239, 68, 68]; // red-500
      titleColor = [185, 28, 28]; // red-700
    } else if (theme === 'warning') {
      bgColor = [254, 243, 199]; // amber-50
      borderColor = [245, 158, 11]; // amber-500
      titleColor = [180, 83, 9]; // amber-700
    } else if (theme === 'info') {
      bgColor = [239, 246, 255]; // blue-50
      borderColor = [59, 130, 246]; // blue-500
      titleColor = [29, 78, 216]; // blue-700
    } else if (theme === 'success') {
      bgColor = [236, 253, 245]; // emerald-50
      borderColor = [16, 185, 129]; // emerald-500
      titleColor = [4, 120, 87]; // emerald-700
    }

    const boxHeight = 8 + (bodyLines.length * 4.6) + 4;
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.6);
    doc.roundedRect(marginX, y, contentWidth, boxHeight, 1.5, 1.5, 'FD');

    // Title (Uniform Section Heading: 10 pt bold)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
    doc.text(title, marginX + 4, y + 5.5);

    // Body Lines (Uniform Body Text: 8.5 pt normal)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_BODY);
    doc.setTextColor(30, 41, 59);
    let curLineY = y + 10.5;
    bodyLines.forEach(line => {
      doc.text(line, marginX + 4, curLineY);
      curLineY += 4.6;
    });

    return y + boxHeight + 4;
  };

  // =========================================================================
  // PAGE 1: COVER PAGE & TABLE OF CONTENTS
  // =========================================================================
  {
    // Hero Cover Block
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 110, 'F');

    // Amber trim accent
    doc.setFillColor(217, 119, 6);
    doc.rect(0, 110, pageWidth, 3, 'F');

    // Emblem / Header text
    doc.setTextColor(251, 191, 36); // amber-400
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.text('REPUBLIC OF THE PHILIPPINES • CITY OF BAIS', marginX, 22);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('BATANG PINOY 2026', marginX, 34);

    doc.setFontSize(14);
    doc.setTextColor(226, 232, 240);
    doc.text('OFFICIAL DELEGATION MANAGEMENT HUB', marginX, 42);

    doc.setFillColor(30, 58, 138); // blue-900
    doc.roundedRect(marginX, 50, contentWidth, 22, 2, 2, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.roundedRect(marginX, 50, contentWidth, 22, 2, 2, 'S');

    doc.setFontSize(FONT_CHAPTER_TITLE);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text("COACH'S OPERATIONS MANUAL & APP PLAYBOOK", marginX + 5, 59);

    doc.setFontSize(FONT_BODY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(191, 219, 254); // blue-200
    doc.text('Field procedures for Whereabouts, Training Drills, Medical Holds, Bouts & Meal Claims', marginX + 5, 66);

    doc.setTextColor(203, 213, 225);
    doc.setFontSize(FONT_BODY);
    doc.text('Tournament Window: December 10 - 19, 2026 | Location: Official BP Competition Venues', marginX, 82);
    doc.text('Delegation Motto: "Matahum nga Bais • Pride, Discipline, Excellence"', marginX, 88);
    doc.text('Target Audience: Head Coaches, Assistant Coaches, Discipline Leads & Chaperones', marginX, 94);

    // Document Control & Authentication Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginX, 120, contentWidth, 27, 2, 2, 'FD');

    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('DOCUMENT CONTROL & AUTHENTICATION', marginX + 5, 126.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_BODY);
    doc.setTextColor(71, 85, 105);
    doc.text('• Issuing Authority: City Government of Bais - Delegation Secretariat & Internal Audit', marginX + 5, 132.5);
    doc.text('• Platform Ref: Bais City Batang Pinoy Delegation Cloud (Live PWA Hub)', marginX + 5, 137.5);
    doc.text('• Document Ref: BC-BP2026-MANUAL-REV1 • Standard Version 1.0 (Approved for Distribution)', marginX + 5, 142.5);

    // Table of Contents Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, 153, contentWidth, 122, 2, 2, 'FD');

    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, 153, contentWidth, 10, 'F');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('MANUAL INDEX & PLAYBOOK CONTENTS', marginX + 5, 160);

    const toc = [
      { page: 'PAGE 2', title: 'CHAPTER 1: PRE-GAME BRIEFING & THE GOLDEN RULE', desc: 'Coach mission, first login, credentials, Live vs. Practice environments, screen layout.' },
      { page: 'PAGE 3', title: 'CHAPTER 2: DAILY DRILL & FIELD TIMELINE PLAYBOOK', desc: 'Hour-by-hour operational cadence: 06:00 AM breakfast headcount to 10:00 PM curfew check.' },
      { page: 'PAGE 4', title: 'CHAPTER 3: MODULE-BY-MODULE STEP-BY-STEP FIELD GUIDES', desc: 'Check-in whereabouts, training logs, medical triage & holds, bout reporting, meal claims.' },
      { page: 'PAGE 5', title: 'CHAPTER 4 & 5: FIELD SCENARIOS & COACH FAQ', desc: 'Handling warm-up injuries, courtside offline cache, double-headers, and common questions.' },
      { page: 'PAGE 6', title: 'TEAR-OUT 1-PAGE POCKET QUICK-REFERENCE CARD', desc: 'Compact gameday reference card with touchpoint deadlines, button glossary, and core delegation rules.' },
    ];

    let tocY = 170;
    toc.forEach((item, index) => {
      doc.setFillColor(index % 2 === 0 ? 255 : 248, 250, 252);
      doc.rect(marginX + 2, tocY - 4, contentWidth - 4, 18, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(FONT_BODY);
      doc.setTextColor(30, 58, 138); // blue-900
      doc.text(item.page, marginX + 5, tocY + 1.5);

      doc.setTextColor(15, 23, 42);
      doc.text(item.title, marginX + 24, tocY + 1.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(FONT_BODY);
      doc.setTextColor(100, 116, 139);
      doc.text(item.desc, marginX + 24, tocY + 7);

      tocY += 21;
    });

    renderFooter(doc, 1);
  }

  // =========================================================================
  // PAGE 2: CHAPTER 1 - PRE-GAME BRIEFING & SYSTEM SETUP
  // =========================================================================
  {
    doc.addPage();
    renderHeader(doc, 2, 'CHAPTER 1: PRE-GAME BRIEFING & SYSTEM SETUP');

    let curY = 27;

    // Chapter Title (Uniform 13 pt bold)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_CHAPTER_TITLE);
    doc.setTextColor(15, 23, 42);
    doc.text('1.0 Welcome to the Bais City Delegation Hub', marginX, curY);
    curY += 6;

    // Body text (Uniform 8.5 pt normal)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_BODY);
    doc.setTextColor(51, 65, 85);
    const p1 = "Coach, out on the arena floor and playing fields, you manage tactics, execution, and spirit. In this app, you protect our athletes' whereabouts, verify their physical fitness, log training hours, and cement our city's medal triumphs in real time. The Bais City Delegation Secretariat and Internal Audit rely on your accurate inputs to coordinate logistics, meals, medical triage, and official press reports.";
    const p1Lines = doc.splitTextToSize(p1, contentWidth);
    doc.text(p1Lines, marginX, curY);
    curY += (p1Lines.length * 4.4) + 4;

    // THE GOLDEN RULE CALLOUT
    curY = drawCalloutBox(
      doc,
      curY,
      '[!] THE GOLDEN RULE: VERIFY YOUR DATABASE ENVIRONMENT TOGGLE',
      [
        'Before entering any data, look at the top-right header switcher:',
        '• [ LIVE ] (Green Shield Icon): OFFICIAL TOURNAMENT DATABASE. All records saved here are permanent',
        '  and transmitted directly to the City Secretariat, Medical Doctors, and Mayor\'s Sports Briefing.',
        '• [ PRACTICE ] (Amber Flask Icon): SANDBOX / SCRIMMAGE DATABASE. Used exclusively for dry-run training,',
        '  mock check-ins, and testing features. Data here DOES NOT affect city records or medal counts.',
        'ACTION: Verify that your header displays [ LIVE ] before logging real competition bouts or curfews!'
      ],
      'warning'
    );

    // Section 1.2: Logging In
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setTextColor(15, 23, 42);
    doc.text('1.2 Logging In & First-Time Access', marginX, curY);
    curY += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_BODY);
    doc.setTextColor(51, 65, 85);
    const stepsLogin = [
      '1. Open the official web link on your mobile phone browser (Google Chrome or Apple Safari recommended).',
      '2. If unauthenticated, the Secure Login Modal appears automatically on your screen.',
      '3. Select or enter your official assigned Coach Email (e.g., coach.arnis@baiscity.gov.ph).',
      '4. Enter your authorized credential PIN / Password and tap [ Enter Delegation Hub ].',
      '5. Once authenticated, your full name, sport discipline, and [ COACH ] badge will display in the header.'
    ];
    stepsLogin.forEach(st => {
      doc.text(st, marginX + 2, curY);
      curY += 4.6;
    });
    curY += 3;

    // Section 1.3: Interface Modes
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setTextColor(15, 23, 42);
    doc.text('1.3 Courtside Mobile Layout vs. Tablet / Laptop Layout', marginX, curY);
    curY += 5.5;

    // 2-Column Comparison Box
    const colW = (contentWidth - 6) / 2;

    // Left Box: Courtside Mobile
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginX, curY, colW, 46, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setTextColor(30, 58, 138);
    doc.text('MOBILE COURTSIDE (< 1024px)', marginX + 3.5, curY + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_BODY);
    doc.setTextColor(71, 85, 105);
    const mDesc = [
      '• Top Pill Bar: Fast horizontal scrolling tabs for',
      '  Whereabouts, Bouts, and Health logs.',
      '• Slide-Out Drawer: Tap top-left Menu icon [ = ]',
      '  to open the complete module drawer.',
      '• Quick Submit: Touch targets designed for rapid',
      '  one-thumb entry while standing courtside.'
    ];
    let mY = curY + 13;
    mDesc.forEach(l => { doc.text(l, marginX + 3.5, mY); mY += 4.6; });

    // Right Box: Quarters Desktop
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginX + colW + 6, curY, colW, 46, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setTextColor(180, 83, 9);
    doc.text('TABLET & DESKTOP (>= 1024px)', marginX + colW + 9.5, curY + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_BODY);
    doc.setTextColor(71, 85, 105);
    const dDesc = [
      '• Persistent Right Sidebar: Full command menu with',
      '  live counts and pulse warning badges.',
      '• Tabular Data Views: Expanded tables for team rosters,',
      '  bout bracket review, and batch operations.',
      '• Print / PDF Tools: Dedicated review modals for',
      '  delegation meetings and evening debriefs.'
    ];
    let dY = curY + 13;
    dDesc.forEach(l => { doc.text(l, marginX + colW + 9.5, dY); dY += 4.6; });

    curY += 52;

    // Cloud Sync Callout
    drawCalloutBox(
      doc,
      curY,
      'CLOUD SYNC STATUS INDICATORS (HEADER)',
      [
        '• [ Cloud Synced ] (Pulsing Green): All saved logs are safely backed up in the cloud database.',
        '• [ Syncing... ] (Pinging Amber): Currently uploading your data to the central delegation server.',
        '• [ Offline Cache ] (Gray): No internet at your venue. App keeps working locally and uploads on reconnect.'
      ],
      'info'
    );

    renderFooter(doc, 2);
  }

  // =========================================================================
  // PAGE 3: CHAPTER 2 - DAILY DRILL & FIELD TIMELINE
  // =========================================================================
  {
    doc.addPage();
    renderHeader(doc, 3, 'CHAPTER 2: DAILY DRILL & FIELD TIMELINE PLAYBOOK');

    let curY = 27;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_CHAPTER_TITLE);
    doc.setTextColor(15, 23, 42);
    doc.text('2.0 The Coach’s Daily Operational Cadence (Dec 10–19)', marginX, curY);
    curY += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_BODY);
    doc.setTextColor(71, 85, 105);
    doc.text('Every day of the Batang Pinoy National Championships follows a mandatory 6-checkpoint sequence.', marginX, curY);
    curY += 6;

    // Timeline Table
    const timeline = [
      {
        time: '06:00 AM',
        title: 'Morning Wakeup & Breakfast Headcount',
        tab: 'Whereabouts Tab',
        action: 'Location: "Billeting Quarters". Activity: "Morning Call & Breakfast Headcount". Visually confirm each athlete in dining hall. Tap [ Select All Sport Athletes ] and submit.',
      },
      {
        time: '08:30 AM',
        title: 'Morning Practice Drills or Arena Transit',
        tab: 'Training Drills Tab',
        action: 'Tap [ + Log Training Session ]. Enter drill focus, start/end times (hours auto-calculate), venue, and check attending athletes. If traveling by bus, log Whereabouts transit.',
      },
      {
        time: '12:00 PM',
        title: 'Midday Meal & Nutrition Verification',
        tab: 'Nutrition & Meals Tab',
        action: 'Switch to [ Lunch ] tab. Verify your athletes claimed their packed meal sets and electrolyte drinks. Report any dietary discomfort or allergies to Chaperone/Medical staff.',
      },
      {
        time: '02:00 PM',
        title: 'Pre-Competition Medical Clearance Check',
        tab: 'Medical & Temp Tab',
        action: 'CRITICAL: Filter by your sport. Confirm NO athlete displays a pulsing red [ MEDICAL HOLD ]. Athletes on hold CANNOT step onto the mat or court under any circumstances.',
      },
      {
        time: '05:30 PM',
        title: 'Post-Bout Result & Medal Reporting',
        tab: 'Tournament Bouts Tab',
        action: 'Tap [ + Record Bout Result ]. Log athlete/team name, opponent city, round stage, and exact score. Select Win/Loss or Gold/Silver/Bronze. Live medal standings update immediately.',
      },
      {
        time: '10:00 PM',
        title: 'Mandatory Night Curfew & Room Headcount',
        tab: 'Whereabouts Tab',
        action: 'Location: "Billeting Quarters". Activity: "Night Curfew & Billet Headcount (10:00 PM)". Walk room to room, physically sight every athlete in bed, check names, and submit.',
      },
    ];

    timeline.forEach((item, idx) => {
      // Row box
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(marginX, curY, contentWidth, 29, 1.5, 1.5, 'FD');

      // Left Accent Pill
      doc.setFillColor(30, 58, 138); // blue-900
      doc.roundedRect(marginX + 2, curY + 2.5, 24, 7.5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(FONT_BODY);
      doc.text(item.time, marginX + 14, curY + 7.5, { align: 'center' });

      // Title & Tab
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(FONT_SECTION_TITLE);
      doc.setFont('helvetica', 'bold');
      doc.text(item.title, marginX + 30, curY + 7.5);

      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(16, 185, 129);
      doc.roundedRect(pageWidth - marginX - 38, curY + 2.5, 36, 6.5, 1, 1, 'FD');
      doc.setFontSize(FONT_BODY);
      doc.setTextColor(4, 120, 87);
      doc.text(item.tab, pageWidth - marginX - 20, curY + 7, { align: 'center' });

      // Action Description
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(FONT_BODY);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(item.action, contentWidth - 8);
      doc.text(lines, marginX + 4, curY + 15);

      curY += 32;
    });

    // Curfew Warning Callout
    drawCalloutBox(
      doc,
      curY,
      '[!] CHILD PROTECTION & DISCIPLINARY COMPLIANCE AT 10:00 PM CURFEW',
      [
        'Under Philippine Sports Commission (PSC) and City Government of Bais Child Protection Policies,',
        'the 10:00 PM Night Curfew Headcount is legally binding. Never mark an athlete as present based on',
        'a teammate\'s word. You must physically confirm their presence inside their billeting room.'
      ],
      'danger'
    );

    renderFooter(doc, 3);
  }

  // =========================================================================
  // PAGE 4: CHAPTER 3 - MODULE-BY-MODULE STEP-BY-STEP GUIDES
  // =========================================================================
  {
    doc.addPage();
    renderHeader(doc, 4, 'CHAPTER 3: MODULE-BY-MODULE STEP-BY-STEP FIELD GUIDES');

    let curY = 27;

    // Section 3.1: Whereabouts
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setTextColor(15, 23, 42);
    doc.text('3.1 Whereabouts & Check-In Logs (Athlete Movement)', marginX, curY);
    curY += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_BODY);
    doc.setTextColor(51, 65, 85);
    const stepsCheckin = [
      '• Step 1: Tap Whereabouts from the top bar or slide drawer, then tap [ + Log Whereabouts ].',
      '• Step 2: Date pre-fills to today. Select Time Window (e.g., "06:00 AM - 07:30 AM") or enter custom hours.',
      '• Step 3: Select standard Location: Billeting Quarters, Main Stadium, Sports Complex, Coastal Court, or Dining Hall.',
      '• Step 4: Select Activity preset (Warm-up, Competition Match, Rest, Meal Claim, or Night Curfew).',
      '• Step 5: Tap athlete names or [ Select All Sport Athletes ] to mark present participants. Add transit bus remarks.',
      '• Step 6: Tap [ Submit Whereabouts Record ]. Syncs instantly to the central command dashboard.'
    ];
    stepsCheckin.forEach(s => { doc.text(s, marginX + 2, curY); curY += 4.5; });
    curY += 3;

    // Section 3.2: Training Drills
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setTextColor(15, 23, 42);
    doc.text('3.2 Training Drills & Practice Coverage', marginX, curY);
    curY += 5.5;

    const stepsTraining = [
      '• Step 1: Open Training Drills and tap [ + Log Training Session ].',
      '• Step 2: Drill Focus: Be specific (e.g., "Taekwondo Kyorugi Counter-attacks", "Futsal Set-Piece Defending").',
      '• Step 3: Pick Start Time & End Time. The system auto-calculates total training duration in minutes and hours.',
      '• Step 4: Enter Training Venue and check attending athletes to record individual practice attendance.',
      '• Step 5: Add conditioning remarks (e.g., "Hydration protocol enforced; weather 32°C") and tap [ Save Training Session ].'
    ];
    stepsTraining.forEach(s => { doc.text(s, marginX + 2, curY); curY += 4.5; });
    curY += 3;

    // Section 3.3: Medical & Temp
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setTextColor(15, 23, 42);
    doc.text('3.3 Medical & Temperature Monitoring (The "Medical Hold" Rule)', marginX, curY);
    curY += 5.5;

    curY = drawCalloutBox(
      doc,
      curY,
      '[!] CRITICAL RETURN-TO-PLAY RULE: MEDICAL HOLD BADGE',
      [
        '• If an athlete displays a pulsing red [ MEDICAL HOLD ] badge, they CANNOT compete or train.',
        '• Coaches CANNOT override medical holds. Clearance can ONLY be issued by the Bais Delegation Physician.',
        '• If an athlete twists a joint or feels faint, escort them to the venue clinic for evaluation immediately.'
      ],
      'danger'
    );

    // Section 3.4: Tournament Bouts
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setTextColor(15, 23, 42);
    doc.text('3.4 Tournament Bouts & Medal Reporting', marginX, curY);
    curY += 5.5;

    const stepsBouts = [
      '• Step 1: Open Tournament Bouts and tap [ + Record Bout Result ].',
      '• Step 2: Enter Athlete/Team Name (e.g., "Mark Arnaiz - Arnis Anyo") and Opponent City (e.g., "Cebu City").',
      '• Step 3: Select Stage: Eliminations, Quarterfinals, Semifinals, or Finals / Gold Match.',
      '• Step 4: Enter Score (e.g., "24 - 18", "2-1 Sets") and Result: Win, Loss, Draw, or Gold / Silver / Bronze.',
      '• Step 5: Tap [ Save Bout Result ]. The delegation medal tally updates live across all city displays!'
    ];
    stepsBouts.forEach(s => { doc.text(s, marginX + 2, curY); curY += 4.5; });
    curY += 3;

    // Section 3.5: Meals & Nutrition
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setTextColor(15, 23, 42);
    doc.text('3.5 Meals & Nutrition (Claim Verification)', marginX, curY);
    curY += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_BODY);
    doc.setTextColor(51, 65, 85);
    doc.text('• Cycles: Breakfast, AM Snack, Lunch, PM Snack, Dinner, Sports Drink, and Vitamins.', marginX + 2, curY);
    curY += 4.5;
    doc.text('• Generating meal master rosters is reserved for Delegation Officials to prevent double rationing.', marginX + 2, curY);
    curY += 4.5;
    doc.text('• Coaches inspect the active meal list and verify their sport\'s athletes show "CLAIMED" status.', marginX + 2, curY);

    renderFooter(doc, 4);
  }

  // =========================================================================
  // PAGE 5: CHAPTER 4 & 5 - FIELD SCENARIOS & COACH FAQ
  // =========================================================================
  {
    doc.addPage();
    renderHeader(doc, 5, 'CHAPTER 4 & 5: FIELD SCENARIOS & COACH FAQ');

    let curY = 27;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_CHAPTER_TITLE);
    doc.setTextColor(15, 23, 42);
    doc.text('4.0 "In The Trenches" — Common Field Scenarios', marginX, curY);
    curY += 6;

    // Scenario A & B Boxes
    curY = drawCalloutBox(
      doc,
      curY,
      'SCENARIO A: ATHLETE INJURED DURING PRE-MATCH WARM-UP',
      [
        '1. Remove athlete from the floor immediately. Escort them to the Bais Delegation Medical Clinic.',
        '2. The Medical Staff logs: "Right Ankle - Sprain - Cleared to Play: NO".',
        '3. Status flips to [ Medical Hold ]. Notify Tournament Table of medical withdrawal before match forfeit.'
      ],
      'danger'
    );

    curY = drawCalloutBox(
      doc,
      curY,
      'SCENARIO B: CELLULAR SIGNAL DROPS AT OUTDOOR PLAYING COURTS',
      [
        '1. Notice the sync pill in the header switches to gray [ Offline Cache ]. DO NOT RELOAD YOUR BROWSER.',
        '2. Continue logging your Bout result or Whereabouts. Data is saved in encrypted device memory.',
        '3. When you reconnect to Wi-Fi/4G, the header flashes amber [ Syncing... ], then emerald [ Cloud Synced ].'
      ],
      'info'
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_CHAPTER_TITLE);
    doc.setTextColor(15, 23, 42);
    doc.text('5.0 Coach’s Frequently Asked Questions (FAQ)', marginX, curY);
    curY += 6;

    const faqs = [
      {
        q: 'Q1: Why can\'t I delete a recorded bout or check-in record?',
        a: 'To comply with City Audit transparency rules, coaches have create and edit permissions, but permanent deletion is restricted to the App Administrator and Delegation Head to protect data integrity.',
      },
      {
        q: 'Q2: How do I filter views so I only see my team\'s athletes?',
        a: 'Tap the "Sport Filter" dropdown at the top of Whereabouts, Training, Health, or Bouts and pick your sport (e.g., Arnis, Taekwondo, Athletics). The view instantly filters to your team.',
      },
      {
        q: 'Q3: What should I do if an athlete\'s accreditation number is misspelled?',
        a: 'Accreditation numbers are locked to official PSC Batang Pinoy badges. Bring the athlete\'s physical tournament badge to the Delegation Secretariat Desk at Hotel HQ Room 101 to update the master roster.',
      },
      {
        q: 'Q4: How do I practice using the app before competition begins?',
        a: 'Tap the top header toggle and switch to [ PRACTICE ] mode (amber flask). Practice entering dummy bouts and test training drills. Once finished, switch back to [ LIVE ] mode for official records.',
      },
    ];

    faqs.forEach(f => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(FONT_SECTION_TITLE);
      doc.setTextColor(30, 58, 138);
      doc.text(f.q, marginX + 2, curY);
      curY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(FONT_BODY);
      doc.setTextColor(51, 65, 85);
      const aLines = doc.splitTextToSize(f.a, contentWidth - 4);
      doc.text(aLines, marginX + 2, curY);
      curY += (aLines.length * 4.2) + 3.5;
    });

    renderFooter(doc, 5);
  }

  // =========================================================================
  // PAGE 6: TEAR-OUT 1-PAGE POCKET QUICK-REFERENCE CARD
  // =========================================================================
  {
    doc.addPage();

    // Top Card Header (Aligned exactly to marginX and contentWidth)
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(marginX, 15, contentWidth, 22, 'F');
    doc.setFillColor(217, 119, 6); // amber-600
    doc.rect(marginX, 37, contentWidth, 1.5, 'F');

    doc.setTextColor(251, 191, 36);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_BODY);
    doc.text('BAIS CITY SPORTS DELEGATION • BATANG PINOY 2026', marginX + 5, 23);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(FONT_CHAPTER_TITLE);
    doc.text('COACH’S FIELD POCKET QUICK-REFERENCE CARD', marginX + 5, 31);

    doc.setFontSize(FONT_HEADER_FOOTER);
    doc.setTextColor(203, 213, 225);
    doc.text('TEAR-OUT / FOLDABLE POCKET PLAYBOOK • KEEP WITH YOUR TOURNAMENT ID BADGE', marginX + 5, 35);

    let curY = 44;

    // Daily Checklist Table
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, curY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setTextColor(15, 23, 42);
    doc.text('MANDATORY DAILY TOUCHPOINTS CHECKLIST', marginX + 4, curY + 5);
    curY += 9;

    const checklist = [
      '[ ] 06:00 AM  -->  Whereabouts Tab: Log Billeting Quarters & Morning Breakfast Call',
      '[ ] 08:30 AM  -->  Training Tab: Log Drill Focus, Start/End Time, Venue & Attendance',
      '[ ] 12:00 PM  -->  Nutrition Tab: Verify Athletes Claimed Lunch Rations & Electrolytes',
      '[ ] 02:00 PM  -->  Health Tab: Confirm NO Athlete has a Pulsing [ MEDICAL HOLD ]',
      '[ ] 05:30 PM  -->  Bouts Tab: Record Opponent City, Final Score, Round & Medal Outcome',
      '[ ] 10:00 PM  -->  Whereabouts Tab: Mandatory Room-by-Room Night Curfew Headcount'
    ];

    checklist.forEach(c => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(FONT_BODY);
      doc.setTextColor(30, 41, 59);
      doc.text(c, marginX + 3, curY);
      curY += 5;
    });
    curY += 4;

    // Button Glossary Table
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, curY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setTextColor(15, 23, 42);
    doc.text('RAPID ACTION BUTTON GLOSSARY', marginX + 4, curY + 5);
    curY += 9;

    const buttons = [
      { btn: '[ LIVE / PRACTICE ]', desc: 'Top Header toggle. Green = Real Tournament. Amber = Dry-run testing.' },
      { btn: '[ + Log Whereabouts ]', desc: 'Whereabouts Tab. Tap to submit location and batch athlete attendance.' },
      { btn: '[ + Log Training ]', desc: 'Training Tab. Start/End times auto-calculate total session duration.' },
      { btn: '[ + Record Bout ]', desc: 'Bouts Tab. Enter scores, opponent city, and Medal (Gold/Silver/Bronze).' },
      { btn: '[ ☀️ / 🌙 ]', desc: 'Header Theme toggle. Light Mode for arena sun, Dark Mode for night curfew.' },
      { btn: '[ Table View ]', desc: 'Review sorted tables and rosters for staff briefings and meetings.' }
    ];

    buttons.forEach(b => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(FONT_BODY);
      doc.setTextColor(30, 58, 138);
      doc.text(b.btn, marginX + 3, curY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`: ${b.desc}`, marginX + 40, curY);
      curY += 5;
    });
    curY += 4;

    // Delegation Standards & Procedures Box
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginX, curY, contentWidth, 38, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setTextColor(30, 58, 138);
    doc.text('OFFICIAL DELEGATION STANDARDS & PROCEDURES', marginX + 4, curY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONT_BODY);
    doc.setTextColor(30, 41, 59);
    const guidelines = [
      '• Official Accreditation Badges must be worn at all competition venues and billeting areas at all times.',
      '• Roster modifications and bracket disputes must be filed through the official Delegation Secretariat.',
      '• Medical evaluations and return-to-play clearances are strictly under the authority of the Delegation Clinic.',
      '• Scheduled team transport and logistical movements follow official delegation dispatch notices.',
      '• Strict compliance with Child Protection, curfew, and safety policies is mandatory for all team coaches.'
    ];
    let conY = curY + 11.5;
    guidelines.forEach(c => { doc.text(c, marginX + 4, conY); conY += 5; });

    curY += 44;

    // Victory Banner at Bottom
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(marginX, curY, contentWidth, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(FONT_SECTION_TITLE);
    doc.setTextColor(251, 191, 36);
    doc.text('LAKANG BAISANON! DAD-A ANG KADAUGAN ALANG SA BAIS CITY!', pageWidth / 2, curY + 6.5, { align: 'center' });
    doc.setFontSize(FONT_BODY);
    doc.setTextColor(255, 255, 255);
    doc.text('City Government of Bais • Batang Pinoy National Championships 2026', pageWidth / 2, curY + 11, { align: 'center' });

    renderFooter(doc, 6);
  }

  // Save the PDF
  doc.save('BaisCity_BatangPinoy2026_Coach_Manual.pdf');
}
