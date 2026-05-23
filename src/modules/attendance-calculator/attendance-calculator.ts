import { api } from "../../api/api";
import { AcademicYear } from "../../api/types/calendar";
import { AttendanceSubjectGroup } from "../../api/types/attendance";
import { TimetableItem } from "../../api/types/timetable";
import { Injectable } from "../core/Injectable";
import { VismaModule } from "../core/VismaModule";
import { normHex, textColorForBg } from "../../utils/color";
import { createDropdownItem, escapeHtml } from "../../utils/dom";
import { fmt, fmtPct, round } from "../../utils/format";
import { timeToMinutes } from "../../utils/time";

interface SubjectAbsenceInfo {
  subjectCode: string;
  subjectName: string;
  totalScheduledHours: number;
  totalAbsence: number;
  absencePercentage: number;
  warningLimit: number;
  defaultLimit: number;
  remainingHours: number;
  status: "ok" | "warning" | "exceeded";
}

interface SelectableLesson {
  item: TimetableItem;
  durationHours: number;
  selected: boolean;
}

function lessonDurationHours(item: TimetableItem): number {
  return (timeToMinutes(item.endTime) - timeToMinutes(item.startTime)) / 60;
}

function computeAbsenceInfo(
  group: AttendanceSubjectGroup,
  extraHours = 0,
): SubjectAbsenceInfo {
  const totalAbsence = group.totalAbsence + extraHours;
  const absencePercentage =
    group.totalScheduledHours > 0
      ? (totalAbsence / group.totalScheduledHours) * 100
      : 0;
  const maxAbsenceHours =
    (group.defaultLimit / 100) * group.totalScheduledHours;
  const remainingHours = Math.max(0, maxAbsenceHours - totalAbsence);

  let status: SubjectAbsenceInfo["status"] = "ok";
  if (absencePercentage >= group.defaultLimit) {
    status = "exceeded";
  } else if (absencePercentage >= group.warningLimit) {
    status = "warning";
  }

  return {
    subjectCode: group.subjectCode,
    subjectName: group.subjectName,
    totalScheduledHours: group.totalScheduledHours,
    totalAbsence,
    absencePercentage,
    warningLimit: group.warningLimit,
    defaultLimit: group.defaultLimit,
    remainingHours,
    status,
  };
}

function canSkipLesson(
  group: AttendanceSubjectGroup | undefined,
  lessonHours: number,
): { safe: boolean; newPct: number } {
  if (!group || group.totalScheduledHours <= 0)
    return { safe: true, newPct: 0 };
  const newAbsence = group.totalAbsence + lessonHours;
  const newPct = (newAbsence / group.totalScheduledHours) * 100;
  return { safe: newPct < group.defaultLimit, newPct };
}

const STATUS_COLORS = {
  ok: "#4caf50",
  warning: "#ff9800",
  exceeded: "#f44336",
} as const;

const STATUS_LABELS = {
  ok: "OK",
  warning: "Advarsel",
  exceeded: "Over grensen",
} as const;

const WEEKDAYS_SHORT = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];

const BADGE_ATTR = "data-inskewl-badge";

export class AttendanceCalculator extends VismaModule {
  name: string = "AttendanceCalculator";
  description: string = "Beregn gjenstående fravær per fag.";

  private panel: HTMLElement | null = null;
  private groups: AttendanceSubjectGroup[] = [];
  private lessons: SelectableLesson[] = [];
  private contentEl: HTMLElement | null = null;
  private currentYear: AcademicYear | null = null;

  shouldLoad(url: string): boolean {
    return url.includes("dashboard");
  }

  injectables(): Injectable[] {
    return [
      {
        id: "attendance-calc-btn",
        target: "ul.dropdown-menu",
        placement: "append",
        render: () => createDropdownItem(
          "attendance-calc-trigger",
          "Fraværskalkulator",
          () => this.showPanel(),
        ),
      },
    ];
  }

  async onLoad(): Promise<void> {
    try {
      const academicYears = await api.calendar.getAcademicYears();
      const currentYear = academicYears.find((y) => y.currentYear);
      if (!currentYear) return;

      const groups = await api.attendance.getAttendanceForSubjectGroups(currentYear);
      this.groups = groups.filter((g) => g.totalScheduledHours > 0);

      this.injectBadgesOnVisma();
    } catch {
      // silent — badges are a nice-to-have
    }
  }

  onMutation(): void {
    this.injectBadgesOnVisma();
  }

  private injectBadgesOnVisma(): void {
    if (this.groups.length === 0) return;

    const groupByCode = new Map(this.groups.map((g) => [g.subjectCode, g]));

    const items = document.querySelectorAll<HTMLElement>(
      '.Timetable-TimetableItem[subjectcode][tttype="LESSON"]',
    );

    for (const el of items) {
      if (el.querySelector(`[${BADGE_ATTR}]`)) continue;
      if (el.closest("#attendance-calc-overlay")) continue;

      const code = el.getAttribute("subjectcode");
      if (!code) continue;
      const group = groupByCode.get(code);
      if (!group || group.totalScheduledHours <= 0) continue;

      const pct = (group.totalAbsence / group.totalScheduledHours) * 100;
      const safe = pct < group.defaultLimit;
      const nearLimit = pct >= group.warningLimit;

      const badge = document.createElement("span");
      badge.setAttribute(BADGE_ATTR, "");
      badge.style.cssText = `
        position:absolute;top:2px;right:2px;
        font-size:9px;font-weight:700;padding:1px 4px;border-radius:4px;
        line-height:1.2;pointer-events:none;z-index:1;
        ${!safe
          ? "background:#f44336;color:#fff;"
          : nearLimit
            ? "background:#ff9800;color:#fff;"
            : "background:#4caf50;color:#fff;"}
      `;
      badge.textContent = `${fmtPct(pct)}%`;

      const pos = getComputedStyle(el).position;
      if (pos === "static") el.style.position = "relative";
      el.appendChild(badge);
    }
  }

  private async showPanel(): Promise<void> {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
      return;
    }

    const overlay = document.createElement("div");
    overlay.id = "attendance-calc-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.5)",
      zIndex: "99999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    });
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        overlay.remove();
        this.panel = null;
      }
    };

    const panel = document.createElement("div");
    Object.assign(panel.style, {
      background: "#fff",
      borderRadius: "12px",
      padding: "24px",
      maxWidth: "1200px",
      width: "95vw",
      maxHeight: "90vh",
      overflow: "auto",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      fontFamily: "system-ui, sans-serif",
    });

    panel.innerHTML = `<h2 style="margin:0 0 8px;font-size:20px">Fraværskalkulator</h2>
      <p style="margin:0 0 16px;color:#666;font-size:14px">Laster data…</p>`;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    this.panel = overlay;
    this.contentEl = panel;

    try {
      const [academicYears, timetable] = await Promise.all([
        api.calendar.getAcademicYears(),
        api.timetable.getTimetable(new Date()),
      ]);

      const currentYear = academicYears.find((y) => y.currentYear);
      if (!currentYear) {
        panel.innerHTML = `<p style="color:#f44336">Fant ikke gjeldende skoleår.</p>`;
        return;
      }
      this.currentYear = currentYear;

      if (this.groups.length === 0) {
        const groups = await api.attendance.getAttendanceForSubjectGroups(currentYear);
        this.groups = groups.filter((g) => g.totalScheduledHours > 0);
      }

      if (this.groups.length === 0) {
        panel.innerHTML = `<p>Ingen fraværsdata funnet.</p>`;
        return;
      }

      const subjectCodes = new Set(this.groups.map((g) => g.subjectCode));
      this.lessons = timetable.timetableItems
        .filter(
          (item) =>
            item.type === "LESSON" && item.subjectCode && subjectCodes.has(item.subjectCode),
        )
        .sort((a, b) => {
          const dateCmp = a.date.getTime() - b.date.getTime();
          return dateCmp !== 0 ? dateCmp : a.startTime.localeCompare(b.startTime);
        })
        .map((item) => ({
          item,
          durationHours: lessonDurationHours(item),
          selected: false,
        }));

      this.render();
    } catch (err) {
      console.error("[AttendanceCalculator]", err);
      panel.innerHTML = `<p style="color:#f44336">Kunne ikke hente data.</p>`;
    }
  }

  private getSimulatedExtra(): Map<string, number> {
    const extra = new Map<string, number>();
    for (const l of this.lessons) {
      if (!l.selected || !l.item.subjectCode) continue;
      extra.set(
        l.item.subjectCode,
        (extra.get(l.item.subjectCode) ?? 0) + l.durationHours,
      );
    }
    return extra;
  }

  private getShortName(lesson: SelectableLesson): string {
    const group = this.groups.find((g) => g.subjectCode === lesson.item.subjectCode);
    return group?.subjectShortName ?? lesson.item.subject ?? "?";
  }

  private render(): void {
    if (!this.contentEl || !this.currentYear) return;

    const scrollTop = this.contentEl.scrollTop;

    const extra = this.getSimulatedExtra();
    const hasSimulation = extra.size > 0;

    const subjects = this.groups
      .map((g) => computeAbsenceInfo(g, extra.get(g.subjectCode) ?? 0))
      .sort((a, b) => b.absencePercentage - a.absencePercentage);

    const totalAbsence = subjects.reduce((s, g) => s + g.totalAbsence, 0);
    const totalScheduled = subjects.reduce((s, g) => s + g.totalScheduledHours, 0);
    const overallPct = totalScheduled > 0 ? round((totalAbsence / totalScheduled) * 100) : 0;
    const exceeded = subjects.filter((s) => s.status === "exceeded").length;
    const warned = subjects.filter((s) => s.status === "warning").length;

    const selectedHours = this.lessons
      .filter((l) => l.selected)
      .reduce((s, l) => s + l.durationHours, 0);

    this.contentEl.innerHTML = "";

    const header = document.createElement("div");
    header.style.cssText = "display:flex;justify-content:space-between;align-items:start;margin-bottom:12px;flex-wrap:wrap;gap:8px";
    header.innerHTML = `
      <div>
        <h2 style="margin:0 0 4px;font-size:20px">Fraværskalkulator</h2>
        <span style="color:#666;font-size:13px">${escapeHtml(this.currentYear.name)} · Totalt fravær: <strong>${fmt(totalAbsence)}t</strong> av ${fmt(totalScheduled)}t (${fmtPct(overallPct)}%)</span>
      </div>
      <div style="text-align:right;font-size:13px">
        ${exceeded > 0 ? `<div style="color:${STATUS_COLORS.exceeded}">⚠ ${exceeded} fag over grensen</div>` : ""}
        ${warned > 0 ? `<div style="color:${STATUS_COLORS.warning}">${warned} fag nær grensen</div>` : ""}
      </div>`;
    this.contentEl.appendChild(header);

    const bannerContainer = document.createElement("div");
    bannerContainer.style.cssText = "min-height:36px;margin-bottom:12px;display:flex;align-items:center";
    this.contentEl.appendChild(bannerContainer);

    if (hasSimulation) {
      const affectedSubjects = [...extra.entries()].map(([code, hours]) => {
        const group = this.groups.find((g) => g.subjectCode === code);
        const name = group?.subjectShortName ?? code;
        const pct = group && group.totalScheduledHours > 0
          ? (hours / group.totalScheduledHours) * 100
          : 0;
        return `${escapeHtml(name)} +${fmtPct(pct)}%`;
      });

      const banner = document.createElement("div");
      banner.style.cssText = "background:#fff3e0;border:1px solid #ffe0b2;border-radius:8px;padding:8px 12px;font-size:13px;color:#e65100;display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;box-sizing:border-box;min-height:36px";
      banner.innerHTML = `<span>Simulering: <strong>+${fmt(selectedHours)}t</strong> · ${affectedSubjects.join(", ")}</span>`;
      const resetBtn = document.createElement("button");
      resetBtn.textContent = "Nullstill";
      resetBtn.style.cssText = "padding:2px 10px;font-size:12px;border:1px solid #ffcc80;border-radius:4px;background:#fff;cursor:pointer;color:#e65100;flex-shrink:0";
      resetBtn.onclick = () => {
        this.lessons.forEach((l) => (l.selected = false));
        this.render();
      };
      banner.appendChild(resetBtn);
      bannerContainer.appendChild(banner);
    }

    const layout = document.createElement("div");
    layout.style.cssText = "display:flex;gap:20px;align-items:start";

    const sidebar = document.createElement("div");
    sidebar.style.cssText = "flex-shrink:0;width:320px;max-height:600px;overflow-y:auto";
    sidebar.innerHTML = this.renderSubjectList(subjects, extra);

    const center = document.createElement("div");
    center.style.cssText = "flex:1;min-width:0";
    center.appendChild(this.buildTimetableGrid());

    layout.appendChild(sidebar);
    layout.appendChild(center);
    this.contentEl.appendChild(layout);

    this.contentEl.scrollTop = scrollTop;
  }

  private renderSubjectList(subjects: SubjectAbsenceInfo[], extra: Map<string, number>): string {
    return subjects.map((s) => {
      const color = STATUS_COLORS[s.status];
      const label = STATUS_LABELS[s.status];
      const barWidth = Math.min(100, (s.absencePercentage / s.defaultLimit) * 100);
      const sim = extra.has(s.subjectCode);

      return `
        <div style="padding:8px 10px;border-bottom:1px solid #f0f0f0;${sim ? "background:#fff8e1;" : ""}">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
            <span style="font-weight:600;font-size:13px">${escapeHtml(s.subjectName)}</span>
            <span style="display:inline-block;padding:1px 6px;border-radius:6px;font-size:10px;font-weight:600;background:${color}20;color:${color};flex-shrink:0;margin-left:6px">${label}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#666">
            <span>${fmt(s.totalAbsence)}t / ${fmt(s.totalScheduledHours)}t · <span style="font-weight:600;color:${color}">${fmtPct(s.absencePercentage)}%</span></span>
            <span style="color:#888">${fmt(s.remainingHours)}t igjen</span>
          </div>
          <div style="width:100%;height:4px;background:#e0e0e0;border-radius:2px;margin-top:4px">
            <div style="width:${barWidth}%;height:100%;background:${color};border-radius:2px"></div>
          </div>
        </div>`;
    }).join("");
  }

  private buildTimetableGrid(): HTMLElement {
    const groupByCode = new Map(this.groups.map((g) => [g.subjectCode, g]));

    const dayGroups = new Map<number, SelectableLesson[]>();
    for (const lesson of this.lessons) {
      const day = lesson.item.date.getDay();
      if (!dayGroups.has(day)) dayGroups.set(day, []);
      dayGroups.get(day)!.push(lesson);
    }

    const days = [...dayGroups.keys()].sort();
    if (days.length === 0) {
      const empty = document.createElement("p");
      empty.style.cssText = "color:#999;font-size:13px";
      empty.textContent = "Ingen timer denne uken.";
      return empty;
    }

    let globalStart = Infinity;
    let globalEnd = 0;
    for (const lesson of this.lessons) {
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
    label.style.cssText = "font-size:12px;color:#999;margin-bottom:8px";
    label.textContent = "Trykk på en time for å simulere fravær";
    wrapper.appendChild(label);

    const grid = document.createElement("div");
    grid.style.cssText = `display:grid;grid-template-columns:40px repeat(${days.length},1fr);gap:0 3px;height:${gridHeight}px;position:relative;margin-top:24px`;

    const timeCol = document.createElement("div");
    timeCol.style.cssText = "position:relative";
    for (let m = globalStart; m <= globalEnd; m += 60) {
      const top = ((m - globalStart) / totalMinutes) * gridHeight;
      const tick = document.createElement("div");
      tick.style.cssText = `position:absolute;top:${top}px;right:4px;font-size:10px;color:#bbb;transform:translateY(-50%);line-height:1`;
      tick.textContent = `${String(Math.floor(m / 60)).padStart(2, "0")}:00`;
      timeCol.appendChild(tick);
    }
    grid.appendChild(timeCol);

    for (const day of days) {
      const col = document.createElement("div");
      col.style.cssText = "position:relative";

      const lessonsForDay = dayGroups.get(day) ?? [];
      const allSelected = lessonsForDay.length > 0 && lessonsForDay.every((l) => l.selected);

      const dayLabel = document.createElement("button");
      dayLabel.setAttribute("type", "button");
      dayLabel.style.cssText = `position:absolute;top:-18px;left:0;right:0;text-align:center;font-size:11px;font-weight:600;text-transform:capitalize;cursor:pointer;user-select:none;border-radius:3px;padding:1px 0;border:none;outline:none;font:inherit;${allSelected ? "background:#e65100;color:#fff;" : "background:transparent;color:#555;"}`;
      dayLabel.textContent = WEEKDAYS_SHORT[day];
      dayLabel.onclick = () => {
        const newState = !allSelected;
        lessonsForDay.forEach((l) => (l.selected = newState));
        this.render();
      };
      col.appendChild(dayLabel);

      for (let m = globalStart; m <= globalEnd; m += 60) {
        const top = ((m - globalStart) / totalMinutes) * gridHeight;
        const line = document.createElement("div");
        line.style.cssText = `position:absolute;top:${top}px;left:0;right:0;border-top:1px solid #f0f0f0`;
        col.appendChild(line);
      }

      for (const lesson of lessonsForDay) {
        col.appendChild(this.buildBlockEl(lesson, globalStart, totalMinutes, gridHeight, groupByCode));
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
    const impactPct =
      group && group.totalScheduledHours > 0
        ? (lesson.durationHours / group.totalScheduledHours) * 100
        : 0;

    const el = document.createElement("button");
    el.setAttribute("type", "button");
    el.style.cssText = `
      position:absolute;top:${top + 1}px;left:1px;right:1px;height:${Math.max(height - 2, 18)}px;
      border-radius:5px;cursor:pointer;overflow:hidden;box-sizing:border-box;
      display:flex;flex-direction:column;justify-content:center;padding:1px 5px;
      font-size:11px;line-height:1.2;user-select:none;
      background:${bg};color:${fg};
      border:none;outline:none;font:inherit;text-align:left;
      ${lesson.selected
        ? `outline:2.5px solid #222;outline-offset:-1px;filter:brightness(0.75);`
        : ``}
    `;

    const topRow = document.createElement("div");
    topRow.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:2px";

    const nameEl = document.createElement("span");
    nameEl.style.cssText = "font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis";
    nameEl.textContent = shortName;
    topRow.appendChild(nameEl);

    const dot = document.createElement("span");
    dot.style.cssText = `flex-shrink:0;width:8px;height:8px;border-radius:50%;${safe ? "background:#4caf50;" : "background:#f44336;"}`;
    dot.title = safe ? `Kan skulkes (${fmtPct(newPct)}%)` : `Over grensen! (${fmtPct(newPct)}%)`;
    topRow.appendChild(dot);

    el.appendChild(topRow);

    if (height > 26) {
      const sub = document.createElement("div");
      sub.style.cssText = "font-size:9px;opacity:0.85;white-space:nowrap";
      sub.textContent = `${fmt(lesson.durationHours)}t · +${fmtPct(impactPct)}%`;
      el.appendChild(sub);
    }

    el.onclick = () => {
      lesson.selected = !lesson.selected;
      this.render();
    };

    return el;
  }

  onUnload(): void {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
    document.querySelectorAll(`[${BADGE_ATTR}]`).forEach((el) => el.remove());
  }
}
