import { api } from "../../api/api";
import { AcademicYear } from "../../api/types/calendar";
import { AttendanceSubjectGroup } from "../../api/types/attendance";
import { Injectable } from "../core/Injectable";
import { VismaModule } from "../core/VismaModule";
import { createDropdownItem } from "../../utils/dom";
import { AttendanceCalculatorView, type AttendanceCalculatorController } from "./attendance-calculator.view";
import { SelectableLesson } from "./attendance-calculator.helpers";

export class AttendanceCalculator extends VismaModule implements AttendanceCalculatorController {
  name: string = "AttendanceCalculator";
  description: string = "Beregn gjenstående fravær per fag.";

  panel: HTMLElement | null = null;
  groups: AttendanceSubjectGroup[] = [];
  lessons: SelectableLesson[] = [];
  contentEl: HTMLElement | null = null;
  currentYear: AcademicYear | null = null;

  private readonly view = new AttendanceCalculatorView(this);

  override shouldLoad(url: string): boolean {
    return url.includes("dashboard");
  }

  override injectables(): Injectable[] {
    return [
      {
        id: "attendance-calc-btn",
        target: "ul.dropdown-menu",
        placement: "append",
        render: () =>
          createDropdownItem(
            "attendance-calc-trigger",
            "Fraværskalkulator",
            () => this.view.showPanel(),
          ),
      },
    ];
  }

  override async onLoad(): Promise<void> {
    try {
      const academicYears = await api.calendar.getAcademicYears();
      const currentYear = academicYears.find((y) => y.currentYear);
      if (!currentYear) return;

      const groups = await api.attendance.getAttendanceForSubjectGroups(currentYear);
      this.groups = groups.filter((g) => g.totalScheduledHours > 0);

      this.view.injectBadgesOnVisma();
    } catch {
      // silent — badges are a nice-to-have
    }
  }

  override onMutation(): void {
    this.view.injectBadgesOnVisma();
  }

  render(): void {
    this.view.render();
  }

  override onUnload(): void {
    this.view.destroy();
  }
}
