import type { GeneratedProblem, ProblemDetail, TeacherKeyDetail } from '../types';
import { LEVEL_NAMES } from '../constants';

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
  meta: PrintMeta
): string {
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

  let problemsHtml = '';

  if (view === 'student') {
    problemsHtml = problemsToPrint.map((item, index) => {
      const p = item.problem;
      if (!p) return '';

      return `
        <div class="problem-row">
          <div class="problem-left-col">
            <div class="problem-header">
              <span class="problem-num">Problem ${index + 1}</span>
              ${level === 'mix' ? `<span class="level-badge">${escapeHtml(item.levelLabel)}</span>` : ''}
            </div>
            <div class="problem-text">${escapeHtml(p.problemText)}</div>
          </div>
          <div class="problem-right-col">
            <div class="workspace-box">
              <div class="workspace-prompt">${escapeHtml(p.workspacePrompt || 'Show your mathematical thinking:')}</div>
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
            ${level === 'mix' ? `<span class="level-badge">${escapeHtml(item.levelLabel)}</span>` : ''}
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

  const studentHeaderFields = view === 'student'
    ? `
      <div class="student-meta">
        <div class="meta-field"><strong>Name:</strong> ________________________________________</div>
        <div class="meta-field"><strong>Date:</strong> _____________________</div>
        <div class="meta-field"><strong>Score:</strong> ________ / ${problemsToPrint.length}</div>
      </div>
    `
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(meta.mathConcept)} - ${escapeHtml(viewTitle)}</title>
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
      font-size: 11pt;
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
      border-bottom: 2.5px solid #182449;
      padding-bottom: 12px;
      margin-bottom: 18px;
    }
    .title {
      font-size: 19pt;
      font-weight: 900;
      color: #182449;
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
      justify-content: space-between;
      margin-top: 14px;
      padding: 10px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 10.5pt;
    }
    .meta-field {
      color: #334155;
    }

    .problem-row {
      page-break-inside: avoid;
      break-inside: avoid;
      display: flex;
      flex-direction: row;
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
    .problem-left-col {
      width: 30%;
      flex: 0 0 30%;
      display: flex;
      flex-direction: column;
    }
    .problem-right-col {
      width: 70%;
      flex: 0 0 70%;
      display: flex;
      flex-direction: column;
    }
    .workspace-box {
      width: 100%;
      height: 100%;
      min-height: 200px;
      border: 2px solid #94a3b8;
      border-radius: 16px;
      background: #fafafa;
      padding: 12px 14px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }
    .workspace-prompt {
      font-size: 9pt;
      color: #64748b;
      font-style: italic;
      margin-bottom: 8px;
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
      <h1 class="title">${escapeHtml(meta.mathConcept)}</h1>
      <div class="subtitle">
        Grade ${escapeHtml(meta.gradeLevel)} &bull; ${escapeHtml(levelName)} &bull; ${escapeHtml(viewTitle)}
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
  meta: PrintMeta
): void {
  const html = generateWorksheetHtml(content, level, view, meta);
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
  meta: PrintMeta
): { success: boolean; fallbackUsed?: boolean; error?: string } {
  const fullHtml = generateWorksheetHtml(content, level, view, meta);

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
