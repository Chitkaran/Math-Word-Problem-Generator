import type { GeneratedProblem, ProblemDetail, TeacherKeyDetail, RenderSettings } from '../types';
import { LEVEL_NAMES } from '../constants';
import { DEFAULT_RENDER_SETTINGS } from '../types';

export type DifferentiationLevel = 'scaffolded' | 'onLevel' | 'challenge' | 'mix';

export interface PrintMeta {
  mathConcept: string;
  gradeLevel: string;
  numberOfQuestions: number;
  context?: string;
}

/**
 * Generates a complete, self-contained, publication-quality HTML document
 * formatted with CSS for Letter portrait printing.
 */
export function generateWorksheetHtml(
  content: GeneratedProblem,
  level: DifferentiationLevel,
  view: 'student' | 'teacher',
  meta: PrintMeta,
  renderSettings?: RenderSettings
): string {
  const settings = renderSettings || DEFAULT_RENDER_SETTINGS;
  const baseLevels = (Object.keys(content.studentWorksheet) as ('scaffolded' | 'onLevel' | 'challenge')[])
    .filter(l => content.studentWorksheet[l] && content.studentWorksheet[l]!.length > 0);

  let problemsToPrint: { problem?: ProblemDetail; key?: TeacherKeyDetail; levelLabel: string }[] = [];

  if (level === 'mix') {
    if (view === 'student') {
      const all: { problem: ProblemDetail; levelLabel: string }[] = [];
      baseLevels.forEach(bl => {
        const items = content.studentWorksheet[bl] || [];
        all.push(...items.map(p => ({ problem: p, levelLabel: LEVEL_NAMES[bl] })));
      });
      const targetCount = meta.numberOfQuestions || all.length;
      for (let i = 0; i < targetCount; i++) {
        const bl = baseLevels[i % baseLevels.length];
        const blProblems = all.filter(item => item.levelLabel === LEVEL_NAMES[bl]);
        const idx = Math.floor(i / baseLevels.length) % (blProblems.length || 1);
        if (blProblems[idx]) {
          problemsToPrint.push(blProblems[idx]);
        } else if (all[i]) {
          problemsToPrint.push(all[i]);
        }
      }
    } else {
      const allKeys: { key: TeacherKeyDetail; levelLabel: string }[] = [];
      baseLevels.forEach(bl => {
        const items = content.teacherKey[bl] || [];
        allKeys.push(...items.map(k => ({ key: k, levelLabel: LEVEL_NAMES[bl] })));
      });
      const targetCount = meta.numberOfQuestions || allKeys.length;
      for (let i = 0; i < targetCount; i++) {
        const bl = baseLevels[i % baseLevels.length];
        const blKeys = allKeys.filter(item => item.levelLabel === LEVEL_NAMES[bl]);
        const idx = Math.floor(i / baseLevels.length) % (blKeys.length || 1);
        if (blKeys[idx]) {
          problemsToPrint.push(blKeys[idx]);
        } else if (allKeys[i]) {
          problemsToPrint.push(allKeys[i]);
        }
      }
    }
  } else {
    if (view === 'student') {
      const items = content.studentWorksheet[level as keyof GeneratedProblem['studentWorksheet']] || [];
      problemsToPrint = items.map(p => ({ problem: p, levelLabel: LEVEL_NAMES[level] }));
    } else {
      const items = content.teacherKey[level as keyof GeneratedProblem['teacherKey']] || [];
      problemsToPrint = items.map(k => ({ key: k, levelLabel: LEVEL_NAMES[level] }));
    }
  }

  const levelName = level === 'mix' ? 'Mixed Differentiation' : LEVEL_NAMES[level];
  const viewTitle = view === 'student' ? 'Student Practice Worksheet' : 'Teacher Answer Key & Guide';

  const sheetTitle = settings.customTitle?.trim() || meta.mathConcept;
  const sheetSubtitle = settings.customSubtitle?.trim() || `Grade ${meta.gradeLevel} &ndash; ${levelName} &ndash; ${viewTitle}`;

  let problemsHtml = '';

  if (view === 'student') {
    problemsHtml = problemsToPrint.map((item, index) => {
      const p = item.problem;
      if (!p) return '';

      const isPageBreak = 
        (settings.pageBreaks === '2-per-page' && (index + 1) % 2 === 0 && index + 1 < problemsToPrint.length) ||
        (settings.pageBreaks === '4-per-page' && (index + 1) % 4 === 0 && index + 1 < problemsToPrint.length);

      return `
        <div class="problem-row ${isPageBreak ? 'force-page-break' : ''}">
          <div class="problem-left-col">
            <div class="problem-header">
              <span class="problem-num">Problem ${index + 1}</span>
              ${settings.showDifficultyBadge && level === 'mix' ? `<span class="level-badge">${escapeHtml(item.levelLabel)}</span>` : ''}
            </div>
            <div class="problem-text">${escapeHtml(p.problemText)}</div>
            ${settings.showHintsIfAvailable && p.stepByStepHints && p.stepByStepHints.length > 0 ? `
              <div class="hints-box">
                <div class="hints-title">💡 Helpful Hints:</div>
                <ul>
                  ${p.stepByStepHints.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
          <div class="problem-right-col">
            <div class="workspace-box paper-${settings.paperStyle}">
              ${settings.showWorkspacePrompt ? `<div class="workspace-prompt">${escapeHtml(p.workspacePrompt || 'Show your mathematical thinking & working:')}</div>` : ''}
              <div class="workspace-label">Work Space</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } else {
    problemsHtml = problemsToPrint.map((item, index) => {
      const k = item.key;
      if (!k) return '';
      return `
        <div class="problem-card teacher-card">
          <div class="problem-header">
            <span class="problem-num">Problem ${index + 1} — Solution & Guide</span>
            ${settings.showDifficultyBadge && level === 'mix' ? `<span class="level-badge">${escapeHtml(item.levelLabel)}</span>` : ''}
          </div>
          <div class="teacher-solution">
            <div class="section-title">Complete Solution:</div>
            <p>${escapeHtml(k.completeSolution)}</p>
          </div>
          <div class="teacher-grid">
            <div class="teacher-col">
              <div class="section-title">Multiple Strategies:</div>
              <ul>
                ${k.multipleStrategies.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
              </ul>
            </div>
            <div class="teacher-col">
              <div class="section-title">Common Misconceptions:</div>
              <ul>
                ${k.commonMisconceptions.map(m => `<li>⚠️ ${escapeHtml(m)}</li>`).join('')}
              </ul>
            </div>
          </div>
          <div class="teacher-criteria">
            <div class="section-title">Success Criteria:</div>
            <ul>
              ${k.successCriteria.map(c => `<li>✓ ${escapeHtml(c)}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
    }).join('');
  }

  const studentHeaderFields = (view === 'student' && settings.showHeader)
    ? `
      <div class="student-meta">
        <div class="meta-field"><strong>Name:</strong> ________________________________________</div>
        <div class="meta-field"><strong>Date:</strong> _____________________</div>
        ${settings.showClassField ? `<div class="meta-field"><strong>Class:</strong> __________________</div>` : ''}
        ${settings.showScoreField ? `<div class="meta-field"><strong>Score:</strong> ________ / ${problemsToPrint.length}</div>` : ''}
      </div>
    `
    : '';

  const fontSizes = {
    compact: { body: '10pt', problem: '10pt', title: '17pt' },
    standard: { body: '11pt', problem: '11.5pt', title: '19pt' },
    large: { body: '13pt', problem: '13.5pt', title: '21pt' }
  }[settings.fontSize] || { body: '11pt', problem: '11.5pt', title: '19pt' };

  const workspaceHeight = {
    compact: '150px',
    standard: '220px',
    spacious: '320px'
  }[settings.workspaceHeight] || '220px';

  const themeColors = {
    purple: {
      headerBorder: '#7c3aed',
      primaryText: '#581c87',
      badgeBg: '#ede9fe',
      badgeText: '#6d28d9',
      badgeBorder: '#ddd6fe',
      boxBorder: '#7c3aed'
    },
    slate: {
      headerBorder: '#0f172a',
      primaryText: '#0f172a',
      badgeBg: '#f1f5f9',
      badgeText: '#0f172a',
      badgeBorder: '#cbd5e1',
      boxBorder: '#475569'
    },
    navy: {
      headerBorder: '#1e3a8a',
      primaryText: '#172554',
      badgeBg: '#eff6ff',
      badgeText: '#1d4ed8',
      badgeBorder: '#bfdbfe',
      boxBorder: '#2563eb'
    },
    emerald: {
      headerBorder: '#047857',
      primaryText: '#064e3b',
      badgeBg: '#ecfdf5',
      badgeText: '#047857',
      badgeBorder: '#a7f3d0',
      boxBorder: '#059669'
    }
  }[settings.themeColor] || {
    headerBorder: '#7c3aed',
    primaryText: '#581c87',
    badgeBg: '#ede9fe',
    badgeText: '#6d28d9',
    badgeBorder: '#ddd6fe',
    boxBorder: '#7c3aed'
  };

  const layoutStyles = settings.layout === 'stacked'
    ? `
      .problem-row { flex-direction: column !important; }
      .problem-left-col { width: 100% !important; flex: 0 0 100% !important; margin-bottom: 12px; }
      .problem-right-col { width: 100% !important; flex: 0 0 100% !important; }
    `
    : settings.layout === 'split-40-60'
    ? `
      .problem-left-col { width: 40% !important; flex: 0 0 40% !important; }
      .problem-right-col { width: 60% !important; flex: 0 0 60% !important; }
    `
    : settings.layout === 'split-50-50'
    ? `
      .problem-left-col { width: 50% !important; flex: 0 0 50% !important; }
      .problem-right-col { width: 50% !important; flex: 0 0 50% !important; }
    `
    : `
      .problem-left-col { width: 30% !important; flex: 0 0 30% !important; }
      .problem-right-col { width: 70% !important; flex: 0 0 70% !important; }
    `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(sheetTitle)} - ${escapeHtml(viewTitle)}</title>
  <style>
    @page {
      size: letter portrait;
      margin: 14mm 14mm 14mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 0;
      font-size: ${fontSizes.body};
      line-height: 1.5;
      background: #ffffff;
    }

    /* Floating Screen Print Bar (Hidden during actual print) */
    .screen-actions-bar {
      position: sticky;
      top: 0;
      z-index: 99999;
      background: #182449;
      color: #ffffff;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .screen-actions-bar .bar-title {
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .screen-actions-bar .bar-buttons {
      display: flex;
      gap: 10px;
    }
    .screen-actions-bar button {
      font-size: 13px;
      font-weight: 700;
      padding: 7px 16px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-print-primary {
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      color: #ffffff;
    }
    .btn-print-primary:hover {
      opacity: 0.92;
      transform: translateY(-1px);
    }
    .btn-close {
      background: #334155;
      color: #ffffff;
    }
    .btn-close:hover {
      background: #475569;
    }

    .worksheet-content {
      max-width: 820px;
      margin: 0 auto;
      padding: 24px;
    }

    .header {
      border-bottom: 2.5px solid ${themeColors.headerBorder};
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .title {
      font-size: ${fontSizes.title};
      font-weight: 900;
      color: ${themeColors.primaryText};
      margin: 0 0 5px 0;
      letter-spacing: -0.3px;
    }
    .subtitle {
      font-size: 10.5pt;
      color: #475569;
      font-weight: 500;
      margin: 0;
    }
    .student-meta {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 10px;
      margin-top: 14px;
      padding: 10px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 10pt;
    }
    .meta-field {
      color: #334155;
    }

    .problem-row {
      page-break-inside: avoid;
      break-inside: avoid;
      display: flex;
      gap: 20px;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 24px;
      margin-bottom: 24px;
      align-items: stretch;
    }
    .problem-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .force-page-break {
      page-break-after: always !important;
      break-after: page !important;
    }

    /* Layout overrides */
    ${layoutStyles}

    .workspace-box {
      width: 100%;
      height: 100%;
      min-height: ${workspaceHeight};
      border: 2px solid ${themeColors.boxBorder};
      border-radius: 16px;
      padding: 12px 14px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .paper-grid {
      background-image: linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px) !important;
      background-size: 18px 18px !important;
      background-color: #f8fafc !important;
    }
    .paper-lined {
      background-image: linear-gradient(to bottom, transparent 24px, #cbd5e1 25px) !important;
      background-size: 100% 25px !important;
      background-color: #fafbfc !important;
    }
    .paper-dots {
      background-image: radial-gradient(#94a3b8 1.5px, transparent 1.5px) !important;
      background-size: 18px 18px !important;
      background-color: #f8fafc !important;
    }
    .paper-blank {
      background-color: #fafafa !important;
    }
    .workspace-prompt {
      font-size: 9pt;
      color: #64748b;
      font-style: italic;
      margin-bottom: 8px;
    }
    .workspace-label {
      align-self: flex-end;
      font-size: 8pt;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: auto;
    }
    .hints-box {
      margin-top: 10px;
      padding: 8px 12px;
      background: #fefce8;
      border: 1px solid #fef08a;
      border-radius: 8px;
      font-size: 9pt;
      color: #854d0e;
    }
    .hints-box ul {
      margin: 4px 0 0 0;
      padding-left: 18px;
    }
    .hints-box li {
      margin-bottom: 2px;
    }
    .hints-title {
      font-weight: bold;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .problem-card {
      page-break-inside: avoid;
      break-inside: avoid;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 22px;
      margin-bottom: 22px;
    }
    .problem-card:last-child {
      border-bottom: none;
    }
    .problem-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .problem-num {
      font-weight: 800;
      font-size: 12pt;
      color: #182449;
    }
    .level-badge {
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2.5px 10px;
      background: #ede9fe;
      color: #6d28d9;
      border: 1px solid #ddd6fe;
      border-radius: 12px;
      letter-spacing: 0.5px;
    }
    .problem-text {
      font-size: 11pt;
      line-height: 1.6;
      color: #1e293b;
      margin-bottom: 8px;
      white-space: pre-wrap;
    }

    .teacher-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 9pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .teacher-solution {
      background: #f5f3ff;
      border-left: 4px solid #7c3aed;
      padding: 10px 14px;
      margin: 8px 0 12px 0;
      border-radius: 0 8px 8px 0;
      font-size: 10.5pt;
    }
    .teacher-solution .section-title {
      color: #6d28d9;
    }
    .teacher-solution p {
      margin: 0;
      white-space: pre-wrap;
      color: #1e293b;
      font-weight: 500;
    }
    .teacher-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .teacher-col {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      font-size: 9.5pt;
    }
    .teacher-col .section-title {
      color: #0f766e;
    }
    .teacher-col ul, .teacher-criteria ul {
      margin: 4px 0 0 0;
      padding-left: 18px;
    }
    .teacher-col li, .teacher-criteria li {
      margin-bottom: 4px;
      color: #334155;
    }
    .teacher-criteria {
      background: #eef2ff;
      border: 1px solid #e0e7ff;
      border-radius: 8px;
      padding: 12px;
      font-size: 9.5pt;
    }
    .teacher-criteria .section-title {
      color: #4338ca;
    }

    @media print {
      .no-print, .screen-actions-bar {
        display: none !important;
      }
      body {
        background: #ffffff !important;
      }
      .worksheet-content {
        max-width: 100% !important;
        padding: 0 !important;
      }
      .problem-card {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- Floating Action Bar for Direct Viewers -->
  <div class="screen-actions-bar no-print">
    <div class="bar-title">
      <span>📄</span>
      <span>${escapeHtml(meta.mathConcept)} — ${escapeHtml(viewTitle)}</span>
    </div>
    <div class="bar-buttons">
      <button class="btn-print-primary" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
      <button class="btn-close" onclick="window.close()">
        ✕ Close
      </button>
    </div>
  </div>

  <div class="worksheet-content">
    <div class="header">
      <h1 class="title">${escapeHtml(sheetTitle)}</h1>
      <div class="subtitle">
        ${sheetSubtitle}
        ${meta.context ? ` &bull; Theme: ${escapeHtml(meta.context)}` : ''}
      </div>
      ${studentHeaderFields}
    </div>

    <div class="problems-container">
      ${problemsHtml}
    </div>
  </div>

  <script>
    // Auto-trigger print when opened in a dedicated browser window/tab
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.print();
        } catch (e) {
          console.warn('Auto print triggered:', e);
        }
      }, 350);
    });
  </script>
</body>
</html>`;
}

/**
 * Opens the worksheet in a clean, top-level browser tab with automatic print invocation.
 * Works seamlessly even when preview iframes restrict direct in-frame print dialogs.
 */
export function openPrintInNewTab(html: string): boolean {
  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Attempt window.open first
    const newWindow = window.open(url, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // If popup blocked or restricted, use simulated link click
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 10000);
      return true;
    }

    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return true;
  } catch (err) {
    console.error('Failed to open worksheet in new tab:', err);
    return false;
  }
}

/**
 * Downloads the worksheet as a standalone HTML file that can be opened and printed anywhere.
 */
export function downloadWorksheetHtml(
  content: GeneratedProblem,
  level: DifferentiationLevel,
  view: 'student' | 'teacher',
  meta: PrintMeta,
  renderSettings?: RenderSettings
): void {
  const html = generateWorksheetHtml(content, level, view, meta, renderSettings);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const cleanConcept = (meta.mathConcept || 'Worksheet').replace(/[^a-z0-9]/gi, '-');
  const filename = `Math-${cleanConcept}-Grade${meta.gradeLevel}-${view}.html`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Primary Print Executor.
 * 1. Injects into `#print-area` in the DOM (styled by @media print to hide all other UI).
 * 2. Attempts window.print().
 * 3. If window.print() is blocked by browser sandbox restrictions, automatically falls back to opening a dedicated tab.
 */
export function printWorksheetDocument(
  content: GeneratedProblem,
  level: DifferentiationLevel,
  view: 'student' | 'teacher',
  meta: PrintMeta,
  renderSettings?: RenderSettings
): { success: boolean; fallbackUsed?: boolean; error?: string } {
  const fullHtml = generateWorksheetHtml(content, level, view, meta, renderSettings);

  // 1. Locate or create #print-area
  let printArea = document.getElementById('print-area');
  if (!printArea) {
    printArea = document.createElement('div');
    printArea.id = 'print-area';
    document.body.appendChild(printArea);
  }

  // Populate #print-area with the full rendered HTML
  printArea.innerHTML = fullHtml;

  // 2. Attempt direct window.print()
  let printDialogOpened = false;
  try {
    window.print();
    printDialogOpened = true;
  } catch (err: any) {
    console.warn('Direct window.print() was blocked or restricted by iframe environment:', err);
    printDialogOpened = false;
  }

  // Schedule cleanup of #print-area after print completes
  const cleanup = () => {
    if (printArea) {
      printArea.innerHTML = '';
    }
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  setTimeout(cleanup, 4000);

  // 3. If direct print was blocked, use the new tab fallback
  if (!printDialogOpened) {
    const opened = openPrintInNewTab(fullHtml);
    return {
      success: opened,
      fallbackUsed: true,
      error: 'Direct in-frame print dialog was blocked by your browser. Opened the printable worksheet in a dedicated tab.'
    };
  }

  return { success: true, fallbackUsed: false };
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
