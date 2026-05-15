import { api } from "../../api/api";
import { AttendanceSubjectGroup } from "../../api/types/attendance";
import { AcademicYear } from "../../api/types/calendar";
import { Timetable, TimetableItem } from "../../api/types/timetable";
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
  private loadingPromise?: Promise<void>;

  shouldLoad(url: string): boolean {
    return /timetable|timeplan|dashboard/.test(url);
  }

  injectables(): Injectable[] {
    return [
      {
        id: "absence-checker-toggle",
        target: "body",
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
    btn.id = "absence-checker-toggle";
    btn.textContent = "Kan jeg ta fraværet?";
    btn.style.cssText = [
      "position: fixed",
      "right: 16px",
      "bottom: 16px",
      "z-index: 999999",
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
    panel.id = "absence-checker-panel";
    panel.style.cssText = [
      "position: fixed",
      "right: 16px",
      "bottom: 64px",
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
    void this.ensureDataLoaded();
  }

  private hidePanel(): void {
    if (!this.panel) return;
    this.panel.style.display = "none";
  }

  private async ensureDataLoaded(): Promise<void> {
    if (this.dataLoaded) return;
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
      const timetable: Timetable = await api.timetable.getTimetable(new Date());
      this.days = this.buildTimetableDays(timetable);
      this.populateDaySelect();
      this.dataLoaded = true;
      if (this.days.length === 0) {
        this.setStatus("Fant ingen timer i denne uka.");
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

  private buildTimetableDays(timetable: Timetable): TimetableDay[] {
    const map = new Map<string, TimetableDay>();
    const relevantItems = timetable.timetableItems.filter((item) =>
      ["LESSON", "SUBSTITUTION", "ACTIVITY"].includes(item.type),
    );
    for (const item of relevantItems) {
      const key = this.formatDateKey(item.date);
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
    this.daySelect.innerHTML = "";
    for (const day of this.days) {
      const option = document.createElement("option");
      option.value = day.key;
      option.textContent = this.formatDateLabel(day.date);
      this.daySelect.appendChild(option);
    }
    if (this.days.length > 0) {
      this.currentDayKey = this.days[0].key;
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
        li.textContent = `${status} ${group.group.subjectGroupName}: ${this.formatPercent(group.currentPercentage)}% → ${this.formatPercent(group.projectedPercentage)}% (grense ${this.formatPercent(group.group.defaultLimit)}%)`;
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
      if (!scheduled || scheduled <= 0) {
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
        [group.subjectName, group.subjectShortName]
          .filter(Boolean)
          .some((name) => name.toLowerCase() === subject),
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
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return diff > 0 ? diff : 0;
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
    const timeRange = `${this.formatTime(item.startTime)}-${this.formatTime(
      item.endTime,
    )}`;
    const room = item.mainRoom ? ` (${item.mainRoom})` : "";
    return `${timeRange} · ${name}${room}`;
  }

  private formatTime(time: string): string {
    const parts = time.split(":");
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return time;
  }

  private formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  private formatDateLabel(date: Date): string {
    return date.toLocaleDateString("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  }

  private formatPercent(value?: number): string {
    if (value == null || Number.isNaN(value)) return "-";
    return value.toFixed(1);
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
