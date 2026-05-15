import { api } from "../../api/api";
import { AttendanceSubjectGroup } from "../../api/types/attendance";
import { AcademicYear } from "../../api/types/calendar";
import { TimetableItem } from "../../api/types/timetable";
import {
  formatDateKey,
  formatDateLabel,
  formatPercent,
  formatTime,
} from "../../utils/formatting";
import { combineDateWithTime } from "../../utils/parsing";
import { Injectable } from "../core/Injectable";
import { VismaModule } from "../core/VismaModule";

type TimetableDay = {
  key: string;
  date: Date;
  items: TimetableItem[];
};

type GroupEvaluation = {
  group: AttendanceSubjectGroup;
  addedHours: number;
  currentPercentage?: number;
  projectedPercentage?: number;
  canSkip?: boolean;
  status: "ok" | "over" | "unknown";
};

type EvaluationResult = {
  groups: GroupEvaluation[];
  unknownItems: TimetableItem[];
};

export class AbsenceChecker extends VismaModule {
  name = "AbsenceChecker";
  description = "Check if you can skip lessons without exceeding absence limits.";

  private panel?: HTMLDivElement;
  private toggleButton?: HTMLButtonElement;
  private daySelect?: HTMLSelectElement;
  private classList?: HTMLDivElement;
  private results?: HTMLDivElement;
  private status?: HTMLDivElement;

  private days: TimetableDay[] = [];
  private currentDayKey?: string;
  private currentDayItems: TimetableItem[] = [];
  private attendanceGroups: AttendanceSubjectGroup[] = [];
  private dataLoaded = false;
  private lastLoadedAt?: number;
  private lessonUnitMinutes = 45;
  private loadingPromise?: Promise<void>;
  private readonly refreshIntervalMs = 5 * 60 * 1000;

  shouldLoad(url: string): boolean {
    return /timetable|timeplan|dashboard/.test(url);
  }

  injectables(): Injectable[] {
    return [
      {
        id: "absence-checker-toggle",
        target: ".userTimetable_timetableFilters_left",
        placement: "append",
        render: () => this.renderToggleButton(),
      },
      {
        id: "absence-checker-panel",
        target: "body",
        placement: "append",
        render: () => this.renderPanel(),
      },
    ];
  }

  private renderToggleButton(): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.textContent = "Kan jeg ta fraværet?";
    btn.style.cssText = [
      "margin-left: auto",
      "align-self: center",
      "padding: 8px 12px",
      "border-radius: 6px",
      "border: none",
      "background: #2f6fe4",
      "color: #fff",
      "font-size: 12px",
      "font-weight: 600",
      "cursor: pointer",
      "box-shadow: 0 2px 8px rgba(0,0,0,0.2)",
    ].join(";");
    btn.onclick = () => this.togglePanel();
    this.toggleButton = btn;
    return btn;
  }

  private renderPanel(): HTMLDivElement {
    const panel = document.createElement("div");
    panel.style.cssText = [
      "position: fixed",
      "top: 0",
      "left: 0",
      "width: 340px",
      "max-height: 70vh",
      "overflow: auto",
      "z-index: 999999",
      "background: #fff",
      "color: #1f1f1f",
      "border: 1px solid #d6d6d6",
      "border-radius: 10px",
      "box-shadow: 0 8px 20px rgba(0,0,0,0.18)",
      "padding: 12px",
      "font-size: 12px",
      "display: none",
    ].join(";");

    const header = document.createElement("div");
    header.style.cssText = [
      "display: flex",
      "align-items: center",
      "justify-content: space-between",
      "margin-bottom: 8px",
    ].join(";");
    const title = document.createElement("strong");
    title.textContent = "Kan jeg ta fraværet?";
    const close = document.createElement("button");
    close.textContent = "×";
    close.style.cssText = [
      "border: none",
      "background: transparent",
      "font-size: 18px",
      "cursor: pointer",
      "line-height: 1",
    ].join(";");
    close.onclick = () => this.hidePanel();
    header.append(title, close);

    const status = document.createElement("div");
    status.style.cssText = [
      "margin-bottom: 8px",
      "color: #5a5a5a",
    ].join(";");

    const dayWrapper = document.createElement("div");
    dayWrapper.style.cssText = "margin-bottom: 8px;";
    const dayLabel = document.createElement("label");
    dayLabel.textContent = "Velg dag:";
    dayLabel.style.display = "block";
    dayLabel.style.marginBottom = "4px";
    const daySelect = document.createElement("select");
    daySelect.style.cssText = [
      "width: 100%",
      "padding: 6px",
      "border-radius: 6px",
      "border: 1px solid #c7c7c7",
      "font-size: 12px",
    ].join(";");
    daySelect.onchange = () => {
      const selected = daySelect.value;
      this.currentDayKey = selected;
      this.updateClassList(selected);
      this.setResults("Velg timer og sjekk fravær for denne dagen.");
    };
    dayWrapper.append(dayLabel, daySelect);

    const classList = document.createElement("div");
    classList.style.cssText = [
      "border: 1px solid #e5e5e5",
      "border-radius: 8px",
      "padding: 8px",
      "margin-bottom: 8px",
    ].join(";");

    const actions = document.createElement("div");
    actions.style.cssText = [
      "display: flex",
      "gap: 8px",
      "margin-bottom: 8px",
    ].join(";");
    const checkSelected = document.createElement("button");
    checkSelected.textContent = "Sjekk valgte";
    checkSelected.style.cssText = this.actionButtonStyle();
    checkSelected.onclick = () => this.checkSelectedLessons();
    const checkDay = document.createElement("button");
    checkDay.textContent = "Sjekk hele dagen";
    checkDay.style.cssText = this.actionButtonStyle("secondary");
    checkDay.onclick = () => this.checkWholeDay();
    actions.append(checkSelected, checkDay);

    const results = document.createElement("div");
    results.style.cssText = [
      "border-top: 1px solid #efefef",
      "padding-top: 8px",
    ].join(";");

    panel.append(header, status, dayWrapper, classList, actions, results);

    this.panel = panel;
    this.status = status;
    this.daySelect = daySelect;
    this.classList = classList;
    this.results = results;

    return panel;
  }

  private actionButtonStyle(kind: "primary" | "secondary" = "primary"): string {
    if (kind === "secondary") {
      return [
        "flex: 1",
        "padding: 6px",
        "border-radius: 6px",
        "border: 1px solid #c7c7c7",
        "background: #f6f6f6",
        "cursor: pointer",
        "font-size: 12px",
      ].join(";");
    }
    return [
      "flex: 1",
      "padding: 6px",
      "border-radius: 6px",
      "border: none",
      "background: #2f6fe4",
      "color: #fff",
      "cursor: pointer",
      "font-size: 12px",
      "font-weight: 600",
    ].join(";");
  }

  private togglePanel(): void {
    if (!this.panel) return;
    const isOpen = this.panel.style.display !== "none";
    if (isOpen) {
      this.hidePanel();
    } else {
      this.showPanel();
    }
  }

  private showPanel(): void {
    if (!this.panel) return;
    this.panel.style.display = "block";
    this.positionPanel();
    void this.ensureDataLoaded();
  }

  private hidePanel(): void {
    if (!this.panel) return;
    this.panel.style.display = "none";
  }

  private positionPanel(): void {
    if (!this.panel || !this.toggleButton) return;
    const spacing = 8;
    const rect = this.toggleButton.getBoundingClientRect();

    const preferredTop = rect.bottom + spacing;
    const maxTop = window.innerHeight - this.panel.offsetHeight - spacing;
    const top =
      preferredTop + this.panel.offsetHeight > window.innerHeight - spacing
        ? Math.max(spacing, rect.top - spacing - this.panel.offsetHeight)
        : Math.min(preferredTop, maxTop);

    const preferredLeft = rect.right - this.panel.offsetWidth;
    const maxLeft = window.innerWidth - this.panel.offsetWidth - spacing;
    const left = Math.min(
      maxLeft,
      Math.max(spacing, preferredLeft),
    );

    this.panel.style.top = `${Math.round(top)}px`;
    this.panel.style.left = `${Math.round(left)}px`;
  }

  private async ensureDataLoaded(): Promise<void> {
    if (
      this.dataLoaded &&
      this.lastLoadedAt &&
      Date.now() - this.lastLoadedAt < this.refreshIntervalMs
    ) {
      return;
    }
    if (!this.loadingPromise) {
      this.loadingPromise = this.loadData();
    }
    await this.loadingPromise;
  }

  private async loadData(): Promise<void> {
    this.setStatus("Laster timeplan og fravær...");
    this.results?.replaceChildren();
    try {
      const academicYear = await this.getCurrentAcademicYear();
      this.attendanceGroups =
        await api.attendance.getAttendanceForSubjectGroups(academicYear);
      const timetableItems = await this.getUpcomingTimetableItems(new Date(), 4);
      this.lessonUnitMinutes = this.detectLessonUnitMinutes(timetableItems);
      this.days = this.buildTimetableDays(timetableItems);
      this.populateDaySelect();
      if (this.days.length > 0) {
        this.setResults("Velg timer og sjekk fravær for denne dagen.");
      } else {
        this.classList?.replaceChildren();
        this.setResults("Ingen timer tilgjengelig å sjekke.");
      }
      this.dataLoaded = true;
      this.lastLoadedAt = Date.now();
      if (this.days.length === 0) {
        this.setStatus("Fant ingen timer de neste ukene.");
      } else {
        this.setStatus("Velg dag og hvilke timer du vurderer å hoppe over.");
      }
    } catch (error) {
      console.warn("inskewl: klarte ikke å laste fraværsdata", error);
      this.setStatus("Kunne ikke hente data. Prøv å åpne på nytt.");
    } finally {
      this.loadingPromise = undefined;
    }
  }

  private async getCurrentAcademicYear(): Promise<AcademicYear> {
    const years = await api.calendar.getAcademicYears();
    const current = years.find((year) => year.currentYear);
    if (current) return current;
    if (years.length > 0) return years[0];
    throw new Error("inskewl: no academic years found in API response");
  }

  private async getUpcomingTimetableItems(
    reference: Date,
    weeks: number,
  ): Promise<TimetableItem[]> {
    const weekStarts = this.getUpcomingWeekStartDates(reference, weeks);
    const timetables = await Promise.all(
      weekStarts.map((week) => api.timetable.getTimetable(week)),
    );
    return timetables.flatMap((timetable) => timetable.timetableItems);
  }

  private getUpcomingWeekStartDates(reference: Date, weeks: number): Date[] {
    const start = new Date(reference.getTime());
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    const totalWeeks = Math.max(1, weeks);
    return Array.from({ length: totalWeeks }, (_, index) => {
      const date = new Date(start.getTime());
      date.setDate(start.getDate() + index * 7);
      return date;
    });
  }

  private detectLessonUnitMinutes(items: TimetableItem[]): number {
    const counts = new Map<number, number>();
    for (const item of items) {
      const start = combineDateWithTime(item.date, item.startTime);
      const end = combineDateWithTime(item.date, item.endTime);
      const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
      if (!Number.isFinite(diffMinutes) || diffMinutes <= 0) continue;
      const rounded = Math.round(diffMinutes / 5) * 5;
      counts.set(rounded, (counts.get(rounded) ?? 0) + 1);
    }
    const sorted = Array.from(counts.entries()).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0] - b[0];
    });
    return sorted[0]?.[0] ?? 45;
  }

  private buildTimetableDays(items: TimetableItem[]): TimetableDay[] {
    const map = new Map<string, TimetableDay>();
    const relevantItems = items.filter((item) =>
      ["LESSON", "SUBSTITUTION", "ACTIVITY"].includes(item.type),
    );
    for (const item of relevantItems) {
      const key = formatDateKey(item.date);
      const day = map.get(key) ?? {
        key,
        date: item.date,
        items: [],
      };
      day.items.push(item);
      map.set(key, day);
    }
    const days = Array.from(map.values()).sort((a, b) =>
      a.date.getTime() - b.date.getTime(),
    );
    for (const day of days) {
      day.items.sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      );
    }
    return days;
  }

  private populateDaySelect(): void {
    if (!this.daySelect) return;
    const previousKey = this.currentDayKey;
    this.daySelect.innerHTML = "";
    for (const day of this.days) {
      const option = document.createElement("option");
      option.value = day.key;
      option.textContent = formatDateLabel(day.date);
      this.daySelect.appendChild(option);
    }
    if (this.days.length > 0) {
      const matchingDay = previousKey
        ? this.days.find((day) => day.key === previousKey)
        : undefined;
      this.currentDayKey = matchingDay?.key ?? this.days[0].key;
      this.daySelect.value = this.currentDayKey;
      this.updateClassList(this.currentDayKey);
    }
  }

  private updateClassList(dayKey: string): void {
    if (!this.classList) return;
    this.classList.replaceChildren();
    const day = this.days.find((d) => d.key === dayKey);
    this.currentDayItems = day?.items ?? [];
    if (!day || day.items.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "Ingen timer for denne dagen.";
      empty.style.color = "#666";
      this.classList.appendChild(empty);
      return;
    }

    day.items.forEach((item, index) => {
      const row = document.createElement("label");
      row.style.cssText = [
        "display: flex",
        "align-items: flex-start",
        "gap: 6px",
        "margin-bottom: 6px",
        "cursor: pointer",
      ].join(";");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.dataset.index = index.toString();
      const text = document.createElement("span");
      text.textContent = this.formatLessonLabel(item);
      row.append(checkbox, text);
      this.classList?.appendChild(row);
    });
  }

  private checkSelectedLessons(): void {
    const items = this.getSelectedItems();
    if (items.length === 0) {
      this.setResults("Velg minst én time før du sjekker.");
      return;
    }
    this.renderEvaluation(items, "Valgte timer");
  }

  private checkWholeDay(): void {
    if (!this.currentDayKey) return;
    const day = this.days.find((d) => d.key === this.currentDayKey);
    if (!day || day.items.length === 0) {
      this.setResults("Ingen timer å sjekke for denne dagen.");
      return;
    }
    this.renderEvaluation(day.items, "Hele dagen");
  }

  private renderEvaluation(items: TimetableItem[], title: string): void {
    const result = this.evaluateItems(items);
    if (!this.results) return;
    this.results.replaceChildren();

    const summary = document.createElement("div");
    summary.style.cssText = [
      "font-weight: 600",
      "margin-bottom: 6px",
    ].join(";");

    const allOk =
      result.groups.every((group) => group.status === "ok") &&
      result.unknownItems.length === 0;
    if (allOk) {
      summary.textContent = `✅ ${title}: Du holder deg under fraværsgrensen.`;
    } else {
      summary.textContent = `⚠️ ${title}: Se detaljer under.`;
    }
    this.results.appendChild(summary);

    const list = document.createElement("ul");
    list.style.cssText = [
      "margin: 0",
      "padding-left: 18px",
      "margin-bottom: 6px",
    ].join(";");

    for (const group of result.groups) {
      const li = document.createElement("li");
      const status =
        group.status === "ok"
          ? "✅"
          : group.status === "over"
            ? "❌"
            : "❔";
      if (group.status === "unknown") {
        li.textContent = `${status} ${group.group.subjectGroupName}: klarte ikke å beregne fravær.`;
      } else {
        li.textContent = `${status} ${group.group.subjectGroupName}: ${formatPercent(group.currentPercentage)}% → ${formatPercent(group.projectedPercentage)}% (grense ${formatPercent(group.group.defaultLimit)}%)`;
      }
      list.appendChild(li);
    }

    if (result.groups.length > 0) {
      this.results.appendChild(list);
    }

    if (result.unknownItems.length > 0) {
      const warning = document.createElement("div");
      warning.style.cssText = "color: #a35b00;";
      warning.textContent =
        "Noen timer mangler fagdata og ble ikke sjekket.";
      this.results.appendChild(warning);
    }
  }

  private evaluateItems(items: TimetableItem[]): EvaluationResult {
    const grouped = new Map<number, { group: AttendanceSubjectGroup; hours: number }>();
    const unknownItems: TimetableItem[] = [];

    for (const item of items) {
      const group = this.findAttendanceGroup(item);
      if (!group) {
        unknownItems.push(item);
        continue;
      }
      const entry = grouped.get(group.subjectGroupId) ?? {
        group,
        hours: 0,
      };
      entry.hours += this.getLessonHours(item);
      grouped.set(group.subjectGroupId, entry);
    }

    const groups: GroupEvaluation[] = [];
    for (const { group, hours } of grouped.values()) {
      const scheduled = group.totalScheduledHours;
      const absence = group.totalAbsence;
      if (!Number.isFinite(scheduled) || scheduled <= 0) {
        groups.push({
          group,
          addedHours: hours,
          status: "unknown",
        });
        continue;
      }
      const currentPercentage = (absence / scheduled) * 100;
      const projectedPercentage = ((absence + hours) / scheduled) * 100;
      const canSkip = projectedPercentage <= group.defaultLimit;
      groups.push({
        group,
        addedHours: hours,
        currentPercentage,
        projectedPercentage,
        canSkip,
        status: canSkip ? "ok" : "over",
      });
    }

    return { groups, unknownItems };
  }

  private findAttendanceGroup(
    item: TimetableItem,
  ): AttendanceSubjectGroup | undefined {
    if (item.teachingGroupId != null) {
      const match = this.attendanceGroups.find(
        (group) => group.subjectGroupId === item.teachingGroupId,
      );
      if (match) return match;
    }
    if (item.subjectCode) {
      const match = this.attendanceGroups.find(
        (group) => group.subjectCode === item.subjectCode,
      );
      if (match) return match;
    }
    const labelCode = this.extractSubjectCode(item.label ?? "");
    if (labelCode) {
      const match = this.attendanceGroups.find(
        (group) => group.subjectCode === labelCode,
      );
      if (match) return match;
    }
    if (item.subject) {
      const subject = item.subject.toLowerCase();
      return this.attendanceGroups.find((group) =>
        [group.subjectName, group.subjectShortName].some(
          (name) => name.toLowerCase() === subject,
        ),
      );
    }
    return undefined;
  }

  private extractSubjectCode(label: string): string | null {
    if (!label) return null;
    const parts = label.split("/");
    if (parts.length >= 2) return parts[1];
    return null;
  }

  private getLessonHours(item: TimetableItem): number {
    const start = combineDateWithTime(item.date, item.startTime);
    const end = combineDateWithTime(item.date, item.endTime);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const units = Math.round(diffMinutes / this.lessonUnitMinutes);
    return units > 0 ? units : 0;
  }

  private getSelectedItems(): TimetableItem[] {
    if (!this.classList) return [];
    const inputs = this.classList.querySelectorAll<HTMLInputElement>(
      "input[type='checkbox'][data-index]",
    );
    const items: TimetableItem[] = [];
    for (const input of inputs) {
      if (!input.checked) continue;
      const index = Number(input.dataset.index);
      const item = this.currentDayItems[index];
      if (item) items.push(item);
    }
    return items;
  }

  private formatLessonLabel(item: TimetableItem): string {
    const name = item.subject ?? item.label ?? "Ukjent fag";
    const timeRange = `${formatTime(item.startTime)}-${formatTime(
      item.endTime,
    )}`;
    const room = item.mainRoom ? ` (${item.mainRoom})` : "";
    return `${timeRange} · ${name}${room}`;
  }

  private setStatus(message: string): void {
    if (this.status) this.status.textContent = message;
  }

  private setResults(message: string): void {
    if (!this.results) return;
    this.results.replaceChildren();
    const text = document.createElement("div");
    text.textContent = message;
    text.style.color = "#555";
    this.results.appendChild(text);
  }
}
