import type { AttendanceSubjectGroup } from "../../api/types/attendance";
import type { AcademicYear } from "../../api/types/calendar";
import { cx } from "../core/ui/classes";
import { installInskewlUi } from "../core/ui/install";
import { pct as cssPct, px, setCssVars } from "../core/ui/styleVars";
import { normHex, textColorForBg } from "../../utils/color";
import { escapeHtml } from "../../utils/dom";
import { fmt, fmtPct } from "../../utils/format";
import {
  formatWeekRange,
  getISOWeekNumber,
  startOfWeek,
  timeToMinutes,
} from "../../utils/time";
import {
  absenceBasisHours,
  type AttendanceCalculatorState,
  canSkipLesson,
  canSimulateLessonAbsenceAt,
  computeAbsenceInfo,
  isLessonInFuture,
  type SelectableLesson,
  type SubjectAbsenceInfo,
  WEEKDAYS_SHORT,
} from "./attendance-calculator.helpers";
import {
  ATTENDANCE_STATUS_LABELS,
  BADGE_ATTR,
  lessonDotColor,
  statusBadgeClass,
  statusColor,
  vismaBadgeColor,
} from "./attendance-calculator.ui";

export interface AttendanceCalculatorController {
  panel: HTMLElement | null;
  groups: AttendanceSubjectGroup[];
  lessons: SelectableLesson[];
  contentEl: HTMLElement | null;
  currentYear: AcademicYear | null;
  selectedWeek: Date | null;
  render: () => void;
  changeWeek: (offsetWeeks: number) => Promise<void>;
}

export class AttendanceCalculatorView {
  constructor(private readonly controller: AttendanceCalculatorController) {}

  setState(state: AttendanceCalculatorState): void {
    this.controller.currentYear = state.currentYear;
    this.controller.groups = state.groups;
    this.controller.lessons = state.lessons;
    this.controller.selectedWeek = state.selectedWeek;
  }

  mountInline(container: HTMLElement, state: AttendanceCalculatorState): void {
    installInskewlUi();
    this.controller.panel = null;
    this.controller.contentEl = container;
    this.setState(state);
    container.classList.add(
      "inskewl-root",
      "inskewl-panel",
      "inskewl-panel-inline",
      "attendance-calculator-root",
    );
    this.render();
  }

  injectBadgesOnVisma(): void {
    if (this.controller.groups.length === 0) return;
    installInskewlUi();

    const groupByCode = new Map(
      this.controller.groups.map((g) => [g.subjectCode, g]),
    );

    const items = document.querySelectorAll<HTMLElement>(
      '.Timetable-TimetableItem[subjectcode][tttype="LESSON"]',
    );

    for (const el of items) {
      if (el.querySelector(`[${BADGE_ATTR}]`)) continue;
      if (el.closest("#attendance-calc-overlay")) continue;

      const code = el.getAttribute("subjectcode");
      if (!code) continue;
      const group = groupByCode.get(code);
      const basisHours = group ? absenceBasisHours(group) : 0;
      if (!group || basisHours <= 0) continue;

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
      if (pos === "static") el.style.position = "relative";
      el.appendChild(badge);
    }
  }

  togglePanel(): boolean {
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

  showLoading(message: string): void {
    if (!this.controller.contentEl) return;
    this.controller.contentEl.innerHTML = `
      <h2 class="inskewl-title">Fraværskalkulator</h2>
      <p class="inskewl-muted">${escapeHtml(message)}</p>
    `;
  }

  showError(message: string): void {
    if (!this.controller.contentEl) return;
    this.controller.contentEl.innerHTML =
      `<p class="inskewl-error-text">${escapeHtml(message)}</p>`;
  }

  render(): void {
    if (!this.controller.contentEl || !this.controller.currentYear) return;

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

  destroy(): void {
    this.closePanel();
    document.querySelectorAll(`[${BADGE_ATTR}]`).forEach((el) => el.remove());
  }

  private closePanel(): void {
    if (this.controller.panel) {
      this.controller.panel.remove();
      this.controller.panel = null;
    }
    this.controller.contentEl = null;
  }

  private getSimulatedExtra(now: Date): Map<string, number> {
    const extra = new Map<string, number>();
    for (const l of this.controller.lessons) {
      if (!l.selected || !l.item.subjectCode) continue;
      if (!canSimulateLessonAbsenceAt(l, now)) continue;
      extra.set(
        l.item.subjectCode,
        (extra.get(l.item.subjectCode) ?? 0) + l.durationHours,
      );
    }
    return extra;
  }

  private buildWeekSelector(selectedWeek: Date, now: Date): HTMLElement {
    const currentWeek = startOfWeek(now);
    const isCurrentWeek = selectedWeek.getTime() <= currentWeek.getTime();

    const wrapper = document.createElement("div");
    wrapper.className = "inskewl-row attendance-week-controls";

    const prev = this.buildWeekButton("<", "Forrige uke", isCurrentWeek);
    prev.onclick = () => {
      if (!prev.disabled) void this.controller.changeWeek(-1);
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

  private buildWeekButton(
    label: string,
    title: string,
    disabled: boolean,
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.textContent = label;
    button.title = title;
    button.disabled = disabled;
    button.className = "inskewl-button attendance-week-button";
    return button;
  }

  private buildSubjectList(
    subjects: SubjectAbsenceInfo[],
    extra: Map<string, number>,
  ): HTMLElement {
    const wrapper = document.createElement("div");

    for (const s of subjects) {
      const label = ATTENDANCE_STATUS_LABELS[s.status];
      const barWidth = Math.min(100, (s.absencePercentage / s.defaultLimit) * 100);
      const sim = extra.has(s.subjectCode);
      const color = statusColor(s.status);

      const row = document.createElement("div");
      row.className = cx(
        "attendance-subject-row",
        sim && "attendance-subject-row-simulated",
      );
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
      absence.append(
        `${fmt(s.totalAbsence)}t / ${fmt(s.absenceBasisHours)}t · `,
      );
      const pct = document.createElement("span");
      pct.className = "attendance-subject-percent";
      pct.textContent = `${fmtPct(s.absencePercentage)}%`;
      absence.appendChild(pct);
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
        "--inskewl-progress": cssPct(barWidth),
        "--inskewl-progress-color": color,
      });
      progress.appendChild(fill);
      row.appendChild(progress);

      wrapper.appendChild(row);
    }

    return wrapper;
  }

  private buildTimetableGrid(now: Date): HTMLElement {
    const groupByCode = new Map(
      this.controller.groups.map((g) => [g.subjectCode, g]),
    );

    const dayGroups = new Map<number, SelectableLesson[]>();
    for (const lesson of this.controller.lessons) {
      const day = lesson.item.date.getDay();
      if (!dayGroups.has(day)) dayGroups.set(day, []);
      dayGroups.get(day)!.push(lesson);
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
      if (s < globalStart) globalStart = s;
      if (e > globalEnd) globalEnd = e;
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
      const simulatableLessons = lessonsForDay.filter((lesson) =>
        canSimulateLessonAbsenceAt(lesson, now)
      );
      const allSelected = simulatableLessons.length > 0 &&
        simulatableLessons.every((l) => l.selected);

      const dayLabel = document.createElement("button");
      dayLabel.setAttribute("type", "button");
      dayLabel.disabled = simulatableLessons.length === 0;
      dayLabel.className = cx(
        "attendance-day-label",
        allSelected && "attendance-day-label-selected",
      );
      dayLabel.textContent = WEEKDAYS_SHORT[day] ?? "";
      dayLabel.onclick = () => {
        if (simulatableLessons.length === 0) return;
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
        col.appendChild(
          this.buildBlockEl(
            lesson,
            globalStart,
            totalMinutes,
            gridHeight,
            groupByCode,
            now,
          ),
        );
      }

      grid.appendChild(col);
    }

    wrapper.appendChild(grid);
    return wrapper;
  }

  private buildBlockEl(
    lesson: SelectableLesson,
    gridStart: number,
    totalMinutes: number,
    gridHeight: number,
    groupByCode: Map<string, AttendanceSubjectGroup>,
    now: Date,
  ): HTMLElement {
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
    const impactPct =
      group && absenceBasisHours(group) > 0
        ? (lesson.durationHours / absenceBasisHours(group)) * 100
        : 0;

    const el = document.createElement("button");
    el.setAttribute("type", "button");
    el.className = cx(
      "attendance-lesson-block",
      !canSimulate && "attendance-lesson-block-disabled",
      lesson.selected && canSimulate && "attendance-lesson-block-selected",
    );
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
      if (!canSimulate) return;
      lesson.selected = !lesson.selected;
      this.controller.render();
    };

    return el;
  }

  private getShortName(lesson: SelectableLesson): string {
    const group = this.controller.groups.find(
      (g) => g.subjectCode === lesson.item.subjectCode,
    );
    return group?.subjectShortName ?? lesson.item.subject ?? "?";
  }

  private getAttendanceStatusText(lesson: SelectableLesson): string | null {
    if (!lesson.registeredAttendance || !lesson.attendanceCode) return null;
    return lesson.countsTowardsLimit
      ? `${lesson.attendanceCode} · Allerede registrert`
      : `${lesson.attendanceCode} · Teller ikke`;
  }

  private getBlockedSimulationText(
    lesson: SelectableLesson,
    now: Date,
  ): string | null {
    if (lesson.registeredAttendance || isLessonInFuture(lesson, now)) {
      return null;
    }
    return "Timen har startet eller passert";
  }
}
