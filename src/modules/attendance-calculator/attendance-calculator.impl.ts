import type { AcademicYear } from "../../api/types/calendar";
import type { AttendanceSubjectGroup } from "../../api/types/attendance";
import { Injectable } from "../core/Injectable";
import { VismaModule } from "../core/VismaModule";
import { createDropdownItem } from "../../utils/dom";
import { createLogger } from "../../utils/logger";
import {
  loadAttendanceCalculatorState,
  loadCurrentAttendanceGroups,
} from "./attendance-calculator.data";
import { AttendanceCalculatorView, type AttendanceCalculatorController } from "./attendance-calculator.view";
import type { SelectableLesson } from "./attendance-calculator.helpers";

const logger = createLogger("AttendanceCalculator");

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
            () => this.showCalculator(),
          ),
      },
    ];
  }

  override async onLoad(): Promise<void> {
    try {
      const { currentYear, groups } = await loadCurrentAttendanceGroups();
      this.currentYear = currentYear;
      this.groups = groups;
      this.view.injectBadgesOnVisma();
    } catch {
      // silent — badges are a nice-to-have
    }
  }

  override onMutation(): void {
    this.view.injectBadgesOnVisma();
  }

  private async showCalculator(): Promise<void> {
    if (!this.view.togglePanel()) return;

    try {
      const state = await loadAttendanceCalculatorState();
      if (state.groups.length === 0) {
        this.view.showError("Ingen fraværsdata funnet.");
        return;
      }

      this.view.setState(state);
      this.view.render();
    } catch (err) {
      logger.error("Failed to load calculator data:", err);
      this.view.showError("Kunne ikke hente data.");
    }
  }

  render(): void {
    this.view.render();
  }

  override onUnload(): void {
    this.view.destroy();
  }
}
