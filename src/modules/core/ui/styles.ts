export const INSKEWL_UI_STYLES = `
  .inskewl-root {
    --inskewl-bg: #ffffff;
    --inskewl-text: #111827;
    --inskewl-muted: #6b7280;
    --inskewl-subtle: #9ca3af;
    --inskewl-border: #e5e7eb;
    --inskewl-border-strong: #d1d5db;
    --inskewl-panel-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    --inskewl-radius: 8px;
    --inskewl-primary: #2563eb;
    --inskewl-danger: #f44336;
    --inskewl-warning: #ff9800;
    --inskewl-success: #4caf50;
    --inskewl-neutral: #607d8b;
    --inskewl-warning-bg: #fff3e0;
    --inskewl-warning-border: #ffe0b2;
    --inskewl-warning-text: #e65100;
    color: var(--inskewl-text);
    font-family: system-ui, sans-serif;
    box-sizing: border-box;
  }

  .inskewl-root *,
  .inskewl-root *::before,
  .inskewl-root *::after {
    box-sizing: border-box;
  }

  .inskewl-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
  }

  .inskewl-panel {
    width: 95vw;
    max-width: 1200px;
    max-height: 90vh;
    overflow: auto;
    padding: 24px;
    border-radius: 12px;
    background: var(--inskewl-bg);
    box-shadow: var(--inskewl-panel-shadow);
  }

  .inskewl-panel-inline {
    width: 100%;
    max-width: none;
    max-height: none;
    padding: 16px;
    border: 1px solid var(--inskewl-border);
    border-radius: var(--inskewl-radius);
    box-shadow: none;
  }

  .inskewl-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .inskewl-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .inskewl-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .inskewl-stack {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .inskewl-scroll-area {
    overflow: auto;
  }

  .inskewl-title {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.25;
  }

  .inskewl-muted {
    color: var(--inskewl-muted);
    font-size: 13px;
  }

  .inskewl-label {
    color: var(--inskewl-subtle);
    font-size: 12px;
  }

  .inskewl-error-text {
    margin: 0;
    color: var(--inskewl-danger);
  }

  .inskewl-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 26px;
    padding: 4px 10px;
    border: 1px solid var(--inskewl-border-strong);
    border-radius: 4px;
    background: #fff;
    color: #374151;
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
  }

  .inskewl-button:hover:not(:disabled) {
    background: #f9fafb;
  }

  .inskewl-button:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .inskewl-button-small {
    min-height: 0;
    padding: 2px 10px;
    font-size: 12px;
  }

  .inskewl-button-warning {
    border-color: #ffcc80;
    color: var(--inskewl-warning-text);
  }

  .inskewl-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-height: 36px;
    padding: 8px 12px;
    border-radius: var(--inskewl-radius);
    font-size: 13px;
  }

  .inskewl-banner-warning {
    border: 1px solid var(--inskewl-warning-border);
    background: var(--inskewl-warning-bg);
    color: var(--inskewl-warning-text);
  }

  .inskewl-badge {
    display: inline-block;
    flex-shrink: 0;
    margin-left: 6px;
    padding: 1px 6px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.4;
  }

  .inskewl-badge-ok {
    background: rgba(76, 175, 80, 0.14);
    color: var(--inskewl-success);
  }

  .inskewl-badge-warning {
    background: rgba(255, 152, 0, 0.14);
    color: var(--inskewl-warning);
  }

  .inskewl-badge-danger {
    background: rgba(244, 67, 54, 0.14);
    color: var(--inskewl-danger);
  }

  .inskewl-badge-neutral {
    background: rgba(96, 125, 139, 0.14);
    color: var(--inskewl-neutral);
  }

  .inskewl-progress {
    width: 100%;
    height: 4px;
    margin-top: 4px;
    border-radius: 2px;
    background: #e0e0e0;
    overflow: hidden;
  }

  .inskewl-progress-fill {
    width: var(--inskewl-progress, 0%);
    height: 100%;
    border-radius: 2px;
    background: var(--inskewl-progress-color, var(--inskewl-success));
  }

  .attendance-calculator-root {
    font-size: 13px;
  }

  .attendance-summary {
    text-align: right;
    min-height: 18px;
  }

  .attendance-status-line {
    font-size: 13px;
  }

  .attendance-status-danger {
    color: var(--inskewl-danger);
  }

  .attendance-status-warning {
    color: var(--inskewl-warning);
  }

  .attendance-week-selector {
    align-items: flex-end;
    font-size: 13px;
  }

  .attendance-week-controls {
    white-space: nowrap;
  }

  .attendance-week-button {
    width: 28px;
    height: 26px;
    padding: 0;
  }

  .attendance-week-label {
    min-width: 132px;
    text-align: center;
    color: #555;
    font-size: 12px;
  }

  .attendance-banner-slot {
    display: flex;
    align-items: center;
    min-height: 36px;
    margin-bottom: 12px;
  }

  .attendance-subject-list {
    flex: 0 1 320px;
    width: min(320px, 100%);
    max-height: 600px;
  }

  .attendance-subject-row {
    padding: 8px 10px;
    border-bottom: 1px solid #f0f0f0;
  }

  .attendance-subject-row-simulated {
    background: #fff8e1;
  }

  .attendance-subject-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 3px;
  }

  .attendance-subject-name {
    font-size: 13px;
    font-weight: 600;
  }

  .attendance-subject-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 12px;
  }

  .attendance-subject-percent {
    color: var(--attendance-status-color, var(--inskewl-success));
    font-weight: 600;
  }

  .attendance-subject-remaining {
    color: #888;
    white-space: nowrap;
  }

  .attendance-timetable {
    flex: 1 1 360px;
    min-width: 280px;
  }

  .attendance-timetable-label {
    margin-bottom: 8px;
  }

  .attendance-timetable-grid {
    display: grid;
    grid-template-columns: 40px repeat(var(--attendance-day-count, 1), 1fr);
    gap: 0 3px;
    height: var(--attendance-grid-height, 0px);
    position: relative;
    margin-top: 24px;
  }

  .attendance-time-column,
  .attendance-day-column {
    position: relative;
  }

  .attendance-time-tick {
    position: absolute;
    top: var(--attendance-top, 0px);
    right: 4px;
    color: #bbb;
    font-size: 10px;
    line-height: 1;
    transform: translateY(-50%);
  }

  .attendance-day-label {
    position: absolute;
    top: -18px;
    left: 0;
    right: 0;
    padding: 1px 0;
    border: none;
    border-radius: 3px;
    outline: none;
    background: transparent;
    color: #555;
    cursor: pointer;
    font: inherit;
    font-size: 11px;
    font-weight: 600;
    text-align: center;
    text-transform: capitalize;
    user-select: none;
  }

  .attendance-day-label:disabled {
    color: #aaa;
    cursor: not-allowed;
  }

  .attendance-day-label-selected {
    background: var(--inskewl-warning-text);
    color: #fff;
  }

  .attendance-hour-line {
    position: absolute;
    top: var(--attendance-top, 0px);
    left: 0;
    right: 0;
    border-top: 1px solid #f0f0f0;
  }

  .attendance-lesson-block {
    position: absolute;
    top: var(--attendance-top, 0px);
    left: 1px;
    right: 1px;
    height: var(--attendance-height, 18px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    padding: 1px 5px;
    border: none;
    border-radius: 5px;
    outline: none;
    background: var(--attendance-bg, #e5e7eb);
    color: var(--attendance-fg, #111827);
    cursor: pointer;
    font: inherit;
    font-size: 11px;
    line-height: 1.2;
    text-align: left;
    user-select: none;
  }

  .attendance-lesson-block-disabled {
    cursor: not-allowed;
    opacity: 0.78;
  }

  .attendance-lesson-block-selected {
    outline: 2.5px solid #222;
    outline-offset: -1px;
    filter: brightness(0.75);
  }

  .attendance-lesson-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2px;
  }

  .attendance-lesson-title {
    overflow: hidden;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .attendance-lesson-dot {
    width: 8px;
    height: 8px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--attendance-dot, var(--inskewl-success));
  }

  .attendance-lesson-subtitle {
    overflow: hidden;
    font-size: 9px;
    opacity: 0.85;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .attendance-visma-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    z-index: 1;
    padding: 1px 4px;
    border-radius: 4px;
    background: var(--attendance-badge-bg, var(--inskewl-success));
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    line-height: 1.2;
    pointer-events: none;
  }

  @media (max-width: 760px) {
    .inskewl-panel {
      padding: 16px;
    }

    .attendance-week-selector {
      align-items: flex-start;
    }
  }
`;
