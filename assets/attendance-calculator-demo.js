(function () {
    'use strict';

    function cx(...classes) {
        return classes.filter(Boolean).join(" ");
    }

    const INSKEWL_UI_STYLES = `
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

    const STYLE_ID = "inskewl-ui-styles";
    function installInskewlUi() {
        if (typeof document === "undefined")
            return;
        if (document.getElementById(STYLE_ID))
            return;
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = INSKEWL_UI_STYLES;
        document.head.appendChild(style);
    }

    function setCssVars(el, vars) {
        for (const [name, value] of Object.entries(vars)) {
            if (value == null) {
                el.style.removeProperty(name);
            }
            else {
                el.style.setProperty(name, value);
            }
        }
    }
    function px(value) {
        return `${value}px`;
    }
    function pct(value) {
        return `${value}%`;
    }

    function normHex(raw) {
        const stripped = raw.replace(/^#/, "");
        if (/^[0-9a-f]{6}$/i.test(stripped))
            return `#${stripped}`;
        if (/^[0-9a-f]{3}$/i.test(stripped)) {
            const [r, g, b] = stripped;
            return `#${r}${r}${g}${g}${b}${b}`;
        }
        return "#5c6bc0";
    }
    function textColorForBg(hex) {
        const h = normHex(hex).replace("#", "");
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return lum > 0.55 ? "#222" : "#fff";
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function round(n, decimals = 1) {
        const f = 10 ** decimals;
        return Math.round(n * f) / f;
    }
    function fmt(n) {
        const r = round(n);
        return r % 1 === 0 ? r.toFixed(0) : r.toFixed(1);
    }
    function fmtPct(n) {
        return round(n, 2).toFixed(2);
    }

    function timeToMinutes(time) {
        const [h, m] = time.split(":").map(Number);
        if (h === undefined || m === undefined) {
            throw new Error(`Invalid time format: ${time}. Expected HH:mm`);
        }
        return h * 60 + m;
    }
    function startOfWeek(date) {
        const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const day = weekStart.getDay();
        const daysSinceMonday = day === 0 ? 6 : day - 1;
        weekStart.setDate(weekStart.getDate() - daysSinceMonday);
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
    }
    function addWeeks(date, amount) {
        const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        next.setDate(next.getDate() + amount * 7);
        return next;
    }
    function getISOWeekNumber(date) {
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const day = utcDate.getUTCDay() || 7;
        utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
        const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
        const daysSinceYearStart = (utcDate.getTime() - yearStart.getTime()) / 86400000 + 1;
        return Math.ceil(daysSinceYearStart / 7);
    }
    function formatWeekRange(date, locale = "nb-NO", daysInWeek = 5) {
        const start = startOfWeek(date);
        const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + daysInWeek - 1);
        const monthFormatter = new Intl.DateTimeFormat(locale, { month: "long" });
        if (start.getMonth() === end.getMonth()) {
            return `${start.getDate()}.-${end.getDate()}. ${monthFormatter.format(end)}`;
        }
        return `${start.getDate()}. ${monthFormatter.format(start)}-${end.getDate()}. ${monthFormatter.format(end)}`;
    }

    function lessonDurationHours(item) {
        return (timeToMinutes(item.endTime) - timeToMinutes(item.startTime)) / 60;
    }
    function attendanceCodeCountsTowardsLimit(code) {
        if (!code)
            return true;
        return code !== "D" && code !== "!" && code !== "R" && code !== "§";
    }
    function absenceBasisHours(group) {
        return group.yearlyHours > 0 ? group.yearlyHours : group.totalScheduledHours;
    }
    function isLessonInFuture(lesson, now) {
        const startMinutes = timeToMinutes(lesson.item.startTime);
        const lessonStart = new Date(lesson.item.date.getFullYear(), lesson.item.date.getMonth(), lesson.item.date.getDate(), Math.floor(startMinutes / 60), startMinutes % 60);
        return lessonStart.getTime() > now.getTime();
    }
    function canSimulateLessonAbsenceAt(lesson, now) {
        return !lesson.registeredAttendance && isLessonInFuture(lesson, now);
    }
    function computeAbsenceInfo(group, extraHours = 0) {
        const basisHours = absenceBasisHours(group);
        const totalAbsence = group.totalAbsence + extraHours;
        const absencePercentage = basisHours > 0
            ? (totalAbsence / basisHours) * 100
            : 0;
        const maxAbsenceHours = (group.defaultLimit / 100) * basisHours;
        const remainingHours = Math.max(0, maxAbsenceHours - totalAbsence);
        let status = "ok";
        if (absencePercentage >= group.defaultLimit) {
            status = "exceeded";
        }
        else if (absencePercentage >= group.warningLimit) {
            status = "warning";
        }
        return {
            subjectCode: group.subjectCode,
            subjectName: group.subjectName,
            absenceBasisHours: basisHours,
            totalAbsence,
            absencePercentage,
            warningLimit: group.warningLimit,
            defaultLimit: group.defaultLimit,
            remainingHours,
            status,
        };
    }
    function canSkipLesson(group, lessonHours) {
        if (!group) {
            return { safe: true, newPct: 0 };
        }
        const basisHours = absenceBasisHours(group);
        if (basisHours <= 0)
            return { safe: true, newPct: 0 };
        const newAbsence = group.totalAbsence + lessonHours;
        const newPct = (newAbsence / basisHours) * 100;
        return { safe: newPct < group.defaultLimit, newPct };
    }
    const WEEKDAYS_SHORT = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];

    const BADGE_ATTR = "data-inskewl-badge";
    const ATTENDANCE_STATUS_LABELS = {
        ok: "OK",
        warning: "Advarsel",
        exceeded: "Over grensen",
    };
    const ATTENDANCE_STATUS_COLORS = {
        ok: "#4caf50",
        warning: "#ff9800",
        exceeded: "#f44336",
    };
    const ATTENDANCE_UI_COLORS = {
        ...ATTENDANCE_STATUS_COLORS,
        blocked: "#9ca3af",
        neutral: "#607d8b",
    };
    function statusColor(status) {
        return ATTENDANCE_UI_COLORS[status];
    }
    function statusBadgeClass(status) {
        switch (status) {
            case "exceeded":
                return "inskewl-badge-danger";
            case "warning":
                return "inskewl-badge-warning";
            case "ok":
                return "inskewl-badge-ok";
        }
    }
    function vismaBadgeColor(options) {
        if (!options.safe)
            return ATTENDANCE_UI_COLORS.exceeded;
        if (options.nearLimit)
            return ATTENDANCE_UI_COLORS.warning;
        return ATTENDANCE_UI_COLORS.ok;
    }
    function lessonDotColor(options) {
        if (options.canSimulate) {
            return options.safe
                ? ATTENDANCE_UI_COLORS.ok
                : ATTENDANCE_UI_COLORS.exceeded;
        }
        if (options.blocked)
            return ATTENDANCE_UI_COLORS.blocked;
        return options.countsTowardsLimit
            ? ATTENDANCE_UI_COLORS.warning
            : ATTENDANCE_UI_COLORS.neutral;
    }

    class AttendanceCalculatorView {
        controller;
        constructor(controller) {
            this.controller = controller;
        }
        setState(state) {
            this.controller.currentYear = state.currentYear;
            this.controller.groups = state.groups;
            this.controller.lessons = state.lessons;
            this.controller.selectedWeek = state.selectedWeek;
        }
        mountInline(container, state) {
            installInskewlUi();
            this.controller.panel = null;
            this.controller.contentEl = container;
            this.setState(state);
            container.classList.add("inskewl-root", "inskewl-panel", "inskewl-panel-inline", "attendance-calculator-root");
            this.render();
        }
        injectBadgesOnVisma() {
            if (this.controller.groups.length === 0)
                return;
            installInskewlUi();
            const groupByCode = new Map(this.controller.groups.map((g) => [g.subjectCode, g]));
            const items = document.querySelectorAll('.Timetable-TimetableItem[subjectcode][tttype="LESSON"]');
            for (const el of items) {
                if (el.querySelector(`[${BADGE_ATTR}]`))
                    continue;
                if (el.closest("#attendance-calc-overlay"))
                    continue;
                const code = el.getAttribute("subjectcode");
                if (!code)
                    continue;
                const group = groupByCode.get(code);
                const basisHours = group ? absenceBasisHours(group) : 0;
                if (!group || basisHours <= 0)
                    continue;
                const pct = (group.totalAbsence / basisHours) * 100;
                const safe = pct < group.defaultLimit;
                const nearLimit = pct >= group.warningLimit;
                const badge = document.createElement("span");
                badge.setAttribute(BADGE_ATTR, "");
                badge.className = "attendance-visma-badge";
                setCssVars(badge, {
                    "--attendance-badge-bg": vismaBadgeColor({ safe, nearLimit }),
                });
                badge.textContent = `${fmtPct(pct)}%`;
                const pos = getComputedStyle(el).position;
                if (pos === "static")
                    el.style.position = "relative";
                el.appendChild(badge);
            }
        }
        togglePanel() {
            if (this.controller.panel) {
                this.closePanel();
                return false;
            }
            installInskewlUi();
            const overlay = document.createElement("div");
            overlay.id = "attendance-calc-overlay";
            overlay.className = "inskewl-root inskewl-overlay attendance-calculator-root";
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    this.controller.panel = null;
                    this.controller.contentEl = null;
                }
            };
            const panel = document.createElement("div");
            panel.className = "inskewl-panel";
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
            this.controller.panel = overlay;
            this.controller.contentEl = panel;
            this.showLoading("Laster data...");
            return true;
        }
        showLoading(message) {
            if (!this.controller.contentEl)
                return;
            this.controller.contentEl.innerHTML = `
      <h2 class="inskewl-title">Fraværskalkulator</h2>
      <p class="inskewl-muted">${escapeHtml(message)}</p>
    `;
        }
        showError(message) {
            if (!this.controller.contentEl)
                return;
            this.controller.contentEl.innerHTML =
                `<p class="inskewl-error-text">${escapeHtml(message)}</p>`;
        }
        render() {
            if (!this.controller.contentEl || !this.controller.currentYear)
                return;
            const scrollTop = this.controller.contentEl.scrollTop;
            const now = new Date();
            const selectedWeek = this.controller.selectedWeek ?? startOfWeek(now);
            const extra = this.getSimulatedExtra(now);
            const hasSimulation = extra.size > 0;
            const subjects = this.controller.groups
                .map((g) => computeAbsenceInfo(g, extra.get(g.subjectCode) ?? 0))
                .sort((a, b) => b.absencePercentage - a.absencePercentage);
            const totalAbsence = subjects.reduce((s, g) => s + g.totalAbsence, 0);
            const totalBasisHours = subjects.reduce((s, g) => s + g.absenceBasisHours, 0);
            const overallPct = totalBasisHours > 0 ? (totalAbsence / totalBasisHours) * 100 : 0;
            const exceeded = subjects.filter((s) => s.status === "exceeded").length;
            const warned = subjects.filter((s) => s.status === "warning").length;
            const selectedHours = this.controller.lessons
                .filter((l) => l.selected && canSimulateLessonAbsenceAt(l, now))
                .reduce((s, l) => s + l.durationHours, 0);
            this.controller.contentEl.innerHTML = "";
            const header = document.createElement("div");
            header.className = "inskewl-header";
            const title = document.createElement("div");
            title.innerHTML = `
      <h2 class="inskewl-title">Fraværskalkulator</h2>
      <span class="inskewl-muted">${escapeHtml(this.controller.currentYear.name)} · Totalt fravær: <strong>${fmt(totalAbsence)}t</strong> av ${fmt(totalBasisHours)} årstimer (${fmtPct(overallPct)}%)</span>`;
            header.appendChild(title);
            const headerRight = document.createElement("div");
            headerRight.className = "inskewl-stack attendance-week-selector";
            headerRight.appendChild(this.buildWeekSelector(selectedWeek, now));
            const status = document.createElement("div");
            status.className = "attendance-summary";
            if (exceeded > 0) {
                const exceededLine = document.createElement("div");
                exceededLine.className = "attendance-status-line attendance-status-danger";
                exceededLine.textContent = `⚠ ${exceeded} fag over grensen`;
                status.appendChild(exceededLine);
            }
            if (warned > 0) {
                const warnedLine = document.createElement("div");
                warnedLine.className = "attendance-status-line attendance-status-warning";
                warnedLine.textContent = `${warned} fag nær grensen`;
                status.appendChild(warnedLine);
            }
            headerRight.appendChild(status);
            header.appendChild(headerRight);
            this.controller.contentEl.appendChild(header);
            const bannerContainer = document.createElement("div");
            bannerContainer.className = "attendance-banner-slot";
            this.controller.contentEl.appendChild(bannerContainer);
            if (hasSimulation) {
                const affectedSubjects = [...extra.entries()].map(([code, hours]) => {
                    const group = this.controller.groups.find((g) => g.subjectCode === code);
                    const name = group?.subjectShortName ?? code;
                    const basisHours = group ? absenceBasisHours(group) : 0;
                    const pct = basisHours > 0
                        ? (hours / basisHours) * 100
                        : 0;
                    return `${escapeHtml(name)} +${fmtPct(pct)}%`;
                });
                const banner = document.createElement("div");
                banner.className = "inskewl-banner inskewl-banner-warning";
                banner.innerHTML = `<span>Simulering: <strong>+${fmt(selectedHours)}t</strong> · ${affectedSubjects.join(", ")}</span>`;
                const resetBtn = document.createElement("button");
                resetBtn.textContent = "Nullstill";
                resetBtn.className =
                    "inskewl-button inskewl-button-small inskewl-button-warning";
                resetBtn.onclick = () => {
                    this.controller.lessons.forEach((l) => (l.selected = false));
                    this.controller.render();
                };
                banner.appendChild(resetBtn);
                bannerContainer.appendChild(banner);
            }
            const layout = document.createElement("div");
            layout.className = "inskewl-layout";
            const sidebar = document.createElement("div");
            sidebar.className = "inskewl-scroll-area attendance-subject-list";
            sidebar.appendChild(this.buildSubjectList(subjects, extra));
            const center = document.createElement("div");
            center.className = "inskewl-scroll-area attendance-timetable";
            center.appendChild(this.buildTimetableGrid(now));
            layout.appendChild(sidebar);
            layout.appendChild(center);
            this.controller.contentEl.appendChild(layout);
            this.controller.contentEl.scrollTop = scrollTop;
        }
        destroy() {
            this.closePanel();
            document.querySelectorAll(`[${BADGE_ATTR}]`).forEach((el) => el.remove());
        }
        closePanel() {
            if (this.controller.panel) {
                this.controller.panel.remove();
                this.controller.panel = null;
            }
            this.controller.contentEl = null;
        }
        getSimulatedExtra(now) {
            const extra = new Map();
            for (const l of this.controller.lessons) {
                if (!l.selected || !l.item.subjectCode)
                    continue;
                if (!canSimulateLessonAbsenceAt(l, now))
                    continue;
                extra.set(l.item.subjectCode, (extra.get(l.item.subjectCode) ?? 0) + l.durationHours);
            }
            return extra;
        }
        buildWeekSelector(selectedWeek, now) {
            const currentWeek = startOfWeek(now);
            const isCurrentWeek = selectedWeek.getTime() <= currentWeek.getTime();
            const wrapper = document.createElement("div");
            wrapper.className = "inskewl-row attendance-week-controls";
            const prev = this.buildWeekButton("<", "Forrige uke", isCurrentWeek);
            prev.onclick = () => {
                if (!prev.disabled)
                    void this.controller.changeWeek(-1);
            };
            wrapper.appendChild(prev);
            const label = document.createElement("span");
            label.className = "attendance-week-label";
            label.textContent = `Uke ${getISOWeekNumber(selectedWeek)} · ${formatWeekRange(selectedWeek)}`;
            wrapper.appendChild(label);
            const next = this.buildWeekButton(">", "Neste uke", false);
            next.onclick = () => {
                void this.controller.changeWeek(1);
            };
            wrapper.appendChild(next);
            return wrapper;
        }
        buildWeekButton(label, title, disabled) {
            const button = document.createElement("button");
            button.setAttribute("type", "button");
            button.textContent = label;
            button.title = title;
            button.disabled = disabled;
            button.className = "inskewl-button attendance-week-button";
            return button;
        }
        buildSubjectList(subjects, extra) {
            const wrapper = document.createElement("div");
            for (const s of subjects) {
                const label = ATTENDANCE_STATUS_LABELS[s.status];
                const barWidth = Math.min(100, (s.absencePercentage / s.defaultLimit) * 100);
                const sim = extra.has(s.subjectCode);
                const color = statusColor(s.status);
                const row = document.createElement("div");
                row.className = cx("attendance-subject-row", sim && "attendance-subject-row-simulated");
                setCssVars(row, { "--attendance-status-color": color });
                const main = document.createElement("div");
                main.className = "attendance-subject-main";
                const name = document.createElement("span");
                name.className = "attendance-subject-name";
                name.textContent = s.subjectName;
                main.appendChild(name);
                const badge = document.createElement("span");
                badge.className = cx("inskewl-badge", statusBadgeClass(s.status));
                badge.textContent = label;
                main.appendChild(badge);
                row.appendChild(main);
                const meta = document.createElement("div");
                meta.className = "attendance-subject-meta";
                const absence = document.createElement("span");
                absence.append(`${fmt(s.totalAbsence)}t / ${fmt(s.absenceBasisHours)}t · `);
                const pct$1 = document.createElement("span");
                pct$1.className = "attendance-subject-percent";
                pct$1.textContent = `${fmtPct(s.absencePercentage)}%`;
                absence.appendChild(pct$1);
                meta.appendChild(absence);
                const remaining = document.createElement("span");
                remaining.className = "attendance-subject-remaining";
                remaining.textContent = `${fmt(s.remainingHours)}t igjen`;
                meta.appendChild(remaining);
                row.appendChild(meta);
                const progress = document.createElement("div");
                progress.className = "inskewl-progress";
                const fill = document.createElement("div");
                fill.className = "inskewl-progress-fill";
                setCssVars(fill, {
                    "--inskewl-progress": pct(barWidth),
                    "--inskewl-progress-color": color,
                });
                progress.appendChild(fill);
                row.appendChild(progress);
                wrapper.appendChild(row);
            }
            return wrapper;
        }
        buildTimetableGrid(now) {
            const groupByCode = new Map(this.controller.groups.map((g) => [g.subjectCode, g]));
            const dayGroups = new Map();
            for (const lesson of this.controller.lessons) {
                const day = lesson.item.date.getDay();
                if (!dayGroups.has(day))
                    dayGroups.set(day, []);
                dayGroups.get(day).push(lesson);
            }
            const days = [...dayGroups.keys()].sort();
            if (days.length === 0) {
                const empty = document.createElement("p");
                empty.className = "inskewl-muted";
                empty.textContent = "Ingen fag-timer for fraværssimulering denne uken.";
                return empty;
            }
            let globalStart = Infinity;
            let globalEnd = 0;
            for (const lesson of this.controller.lessons) {
                const s = timeToMinutes(lesson.item.startTime);
                const e = timeToMinutes(lesson.item.endTime);
                if (s < globalStart)
                    globalStart = s;
                if (e > globalEnd)
                    globalEnd = e;
            }
            globalStart = Math.floor(globalStart / 60) * 60;
            globalEnd = Math.ceil(globalEnd / 60) * 60;
            const totalMinutes = globalEnd - globalStart;
            const PX_PER_HOUR = 80;
            const gridHeight = (totalMinutes / 60) * PX_PER_HOUR;
            const wrapper = document.createElement("div");
            const label = document.createElement("div");
            label.className = "inskewl-label attendance-timetable-label";
            label.textContent = "Trykk på en fremtidig time for å simulere fravær";
            wrapper.appendChild(label);
            const grid = document.createElement("div");
            grid.className = "attendance-timetable-grid";
            setCssVars(grid, {
                "--attendance-day-count": String(days.length),
                "--attendance-grid-height": px(gridHeight),
            });
            const timeCol = document.createElement("div");
            timeCol.className = "attendance-time-column";
            for (let m = globalStart; m <= globalEnd; m += 60) {
                const top = ((m - globalStart) / totalMinutes) * gridHeight;
                const tick = document.createElement("div");
                tick.className = "attendance-time-tick";
                setCssVars(tick, { "--attendance-top": px(top) });
                tick.textContent = `${String(Math.floor(m / 60)).padStart(2, "0")}:00`;
                timeCol.appendChild(tick);
            }
            grid.appendChild(timeCol);
            for (const day of days) {
                const col = document.createElement("div");
                col.className = "attendance-day-column";
                const lessonsForDay = dayGroups.get(day) ?? [];
                const simulatableLessons = lessonsForDay.filter((lesson) => canSimulateLessonAbsenceAt(lesson, now));
                const allSelected = simulatableLessons.length > 0 &&
                    simulatableLessons.every((l) => l.selected);
                const dayLabel = document.createElement("button");
                dayLabel.setAttribute("type", "button");
                dayLabel.disabled = simulatableLessons.length === 0;
                dayLabel.className = cx("attendance-day-label", allSelected && "attendance-day-label-selected");
                dayLabel.textContent = WEEKDAYS_SHORT[day] ?? "";
                dayLabel.onclick = () => {
                    if (simulatableLessons.length === 0)
                        return;
                    const newState = !allSelected;
                    simulatableLessons.forEach((l) => (l.selected = newState));
                    this.controller.render();
                };
                col.appendChild(dayLabel);
                for (let m = globalStart; m <= globalEnd; m += 60) {
                    const top = ((m - globalStart) / totalMinutes) * gridHeight;
                    const line = document.createElement("div");
                    line.className = "attendance-hour-line";
                    setCssVars(line, { "--attendance-top": px(top) });
                    col.appendChild(line);
                }
                for (const lesson of lessonsForDay) {
                    col.appendChild(this.buildBlockEl(lesson, globalStart, totalMinutes, gridHeight, groupByCode, now));
                }
                grid.appendChild(col);
            }
            wrapper.appendChild(grid);
            return wrapper;
        }
        buildBlockEl(lesson, gridStart, totalMinutes, gridHeight, groupByCode, now) {
            const startMin = timeToMinutes(lesson.item.startTime);
            const endMin = timeToMinutes(lesson.item.endTime);
            const top = ((startMin - gridStart) / totalMinutes) * gridHeight;
            const height = ((endMin - startMin) / totalMinutes) * gridHeight;
            const bg = normHex(lesson.item.colour);
            const fg = textColorForBg(bg);
            const shortName = this.getShortName(lesson);
            const group = groupByCode.get(lesson.item.subjectCode ?? "");
            const { safe, newPct } = canSkipLesson(group, lesson.durationHours);
            const canSimulate = canSimulateLessonAbsenceAt(lesson, now);
            const attendanceStatus = this.getAttendanceStatusText(lesson);
            const blockedStatus = this.getBlockedSimulationText(lesson, now);
            const impactPct = group && absenceBasisHours(group) > 0
                ? (lesson.durationHours / absenceBasisHours(group)) * 100
                : 0;
            const el = document.createElement("button");
            el.setAttribute("type", "button");
            el.className = cx("attendance-lesson-block", !canSimulate && "attendance-lesson-block-disabled", lesson.selected && canSimulate && "attendance-lesson-block-selected");
            setCssVars(el, {
                "--attendance-top": px(top + 1),
                "--attendance-height": px(Math.max(height - 2, 18)),
                "--attendance-bg": bg,
                "--attendance-fg": fg,
            });
            el.setAttribute("aria-disabled", String(!canSimulate));
            if (attendanceStatus || blockedStatus) {
                el.title = attendanceStatus && lesson.attendanceCodeDescription
                    ? `${attendanceStatus} - ${lesson.attendanceCodeDescription}`
                    : attendanceStatus ?? blockedStatus ?? "";
            }
            const topRow = document.createElement("div");
            topRow.className = "attendance-lesson-top-row";
            const nameEl = document.createElement("span");
            nameEl.className = "attendance-lesson-title";
            nameEl.textContent = shortName;
            topRow.appendChild(nameEl);
            const dot = document.createElement("span");
            dot.className = "attendance-lesson-dot";
            setCssVars(dot, {
                "--attendance-dot": lessonDotColor({
                    canSimulate,
                    safe,
                    blocked: blockedStatus != null,
                    countsTowardsLimit: lesson.countsTowardsLimit,
                }),
            });
            dot.title = attendanceStatus ?? blockedStatus ??
                (safe ? `Kan skulkes (${fmtPct(newPct)}%)` : `Over grensen! (${fmtPct(newPct)}%)`);
            topRow.appendChild(dot);
            el.appendChild(topRow);
            if (height > 26) {
                const sub = document.createElement("div");
                sub.className = "attendance-lesson-subtitle";
                sub.textContent = attendanceStatus ?? blockedStatus ??
                    `${fmt(lesson.durationHours)}t · +${fmtPct(impactPct)}%`;
                el.appendChild(sub);
            }
            el.onclick = () => {
                if (!canSimulate)
                    return;
                lesson.selected = !lesson.selected;
                this.controller.render();
            };
            return el;
        }
        getShortName(lesson) {
            const group = this.controller.groups.find((g) => g.subjectCode === lesson.item.subjectCode);
            return group?.subjectShortName ?? lesson.item.subject ?? "?";
        }
        getAttendanceStatusText(lesson) {
            if (!lesson.registeredAttendance || !lesson.attendanceCode)
                return null;
            return lesson.countsTowardsLimit
                ? `${lesson.attendanceCode} · Allerede registrert`
                : `${lesson.attendanceCode} · Teller ikke`;
        }
        getBlockedSimulationText(lesson, now) {
            if (lesson.registeredAttendance || isLessonInFuture(lesson, now)) {
                return null;
            }
            return "Timen har startet eller passert";
        }
    }

    const demoYear = {
        id: 20252026,
        name: "Skoleåret 2025/2026",
        currentYear: true,
    };
    const groups = [
        subjectGroup("MAT1023", "Matematikk 2P", "Matematikk", 112, 112.7, 4.5),
        subjectGroup("NOR1267", "Norsk hovedmål", "Norsk", 112, 112.7, 9.5),
        subjectGroup("ITK2002", "Informasjonsteknologi 1", "IT", 84, 84.5, 2),
        subjectGroup("ENG1007", "Engelsk", "Engelsk", 84, 84.3, 5),
        subjectGroup("KRO1006", "Kroppsøving", "Gym", 56, 56.4, 5),
    ];
    function createAttendanceCalculatorDemoState(week = new Date()) {
        const selectedWeek = startOfWeek(week);
        const demoLesson = (id, dayOffset, startTime, endTime, subjectCode, subject, colour, attendance) => lesson(id, selectedWeek, dayOffset, startTime, endTime, subjectCode, subject, colour, attendance);
        return {
            currentYear: demoYear,
            groups,
            selectedWeek,
            lessons: [
                demoLesson(1, 0, "08:15", "09:45", "MAT1023", "Matematikk", "#d7ecff"),
                demoLesson(2, 0, "10:00", "11:30", "NOR1267", "Norsk", "#ffe0e7", {
                    code: "D",
                    description: "Dokumentert fravær",
                }),
                demoLesson(3, 0, "12:15", "13:45", "ITK2002", "IT", "#dff7e8"),
                demoLesson(4, 1, "08:15", "09:45", "ENG1007", "Engelsk", "#fff1c2"),
                demoLesson(5, 1, "10:00", "11:30", "KRO1006", "Gym", "#e8ddff"),
                demoLesson(6, 1, "12:15", "13:45", "MAT1023", "Matematikk", "#d7ecff"),
                demoLesson(7, 2, "08:15", "10:00", "ITK2002", "IT", "#dff7e8"),
                demoLesson(8, 2, "10:15", "11:45", "NOR1267", "Norsk", "#ffe0e7", {
                    code: "X",
                    description: "Udokumentert fravær",
                }),
                demoLesson(9, 2, "12:15", "13:45", "ENG1007", "Engelsk", "#fff1c2"),
                demoLesson(10, 3, "08:15", "09:45", "MAT1023", "Matematikk", "#d7ecff"),
                demoLesson(11, 3, "10:00", "11:30", "NOR1267", "Norsk", "#ffe0e7"),
                demoLesson(12, 3, "12:15", "13:45", "KRO1006", "Gym", "#e8ddff"),
                demoLesson(13, 4, "08:15", "09:45", "ITK2002", "IT", "#dff7e8"),
                demoLesson(14, 4, "10:00", "11:30", "ENG1007", "Engelsk", "#fff1c2"),
            ],
        };
    }
    function subjectGroup(subjectCode, subjectName, subjectShortName, yearlyHours, totalScheduledHours, totalAbsence) {
        return {
            subjectGroupId: Number(subjectCode.replace(/\D/g, "")),
            subjectCode,
            subjectName,
            subjectShortName,
            warningLimit: 8,
            defaultLimit: 10,
            yearlyHours,
            totalScheduledHours,
            totalAbsence,
        };
    }
    function lesson(id, weekStart, dayOffset, startTime, endTime, subjectCode, subject, colour, attendance) {
        const item = {
            id,
            startTime,
            endTime,
            date: demoWeekday(weekStart, dayOffset),
            label: `2ITA/${subjectCode}/1`,
            type: "LESSON",
            originalType: null,
            colour,
            teachingGroupId: 2000 + id,
            subject,
            subjectCode,
        };
        return {
            item,
            durationHours: lessonDurationHours(item),
            selected: false,
            attendanceCode: attendance?.code ?? null,
            attendanceCodeDescription: attendance?.description ?? null,
            registeredAttendance: attendance != null,
            countsTowardsLimit: attendanceCodeCountsTowardsLimit(attendance?.code),
        };
    }
    function demoWeekday(weekStart, dayOffset) {
        return new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + dayOffset);
    }

    function mountDemo() {
        const container = document.getElementById("attendance-calculator-demo");
        if (!container)
            return;
        let state = createAttendanceCalculatorDemoState();
        let view = null;
        const controller = {
            panel: null,
            contentEl: container,
            currentYear: state.currentYear,
            groups: state.groups,
            lessons: state.lessons,
            selectedWeek: state.selectedWeek,
            render: () => {
                view?.render();
            },
            changeWeek: async (offsetWeeks) => {
                const currentWeek = startOfWeek(new Date());
                const selectedWeek = controller.selectedWeek ?? currentWeek;
                const nextWeek = startOfWeek(addWeeks(selectedWeek, offsetWeeks));
                if (nextWeek.getTime() < currentWeek.getTime())
                    return;
                state = createAttendanceCalculatorDemoState(nextWeek);
                view?.setState(state);
                view?.render();
            },
        };
        view = new AttendanceCalculatorView(controller);
        view.mountInline(container, state);
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mountDemo);
    }
    else {
        mountDemo();
    }

})();
