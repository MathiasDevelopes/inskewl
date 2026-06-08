import { api } from "../../api/api";
import type { Timetable } from "../../api/types/timetable";
import { Injectable } from "../core/Injectable";
import { VismaModule } from "../core/VismaModule";
import { createDropdownItem } from "../../utils/dom";
import { createLogger } from "../../utils/logger";
import { ICSExporter } from "./exporters/ics";
import { fromTimetableItem } from "./model/event";
import type { CalendarEvent } from "./model/event";
import type { Exporter } from "./model/exporter";

const logger = createLogger("TimetableExporter");

export class TimetableExporter extends VismaModule {
  name: string = "TimetableExporter";
  description: string = "Export your calendar to local calendar formats.";

  private readonly exporters: Exporter[] = [new ICSExporter()];

  override shouldLoad(url: string): boolean {
    return url.includes("dashboard");
  }

  override injectables(): Injectable[] {
    return this.exporters.map((exporter) => ({
      id: `export-${exporter.id}-btn`,
      target: "ul.dropdown-menu",
      placement: "append",
      render: () =>
        createDropdownItem(
          `timetable-to-${exporter.id}`,
          exporter.label,
          async () => {
            try {
              await this.exportCalendar(exporter);
            } catch (error) {
              logger.error("Export failed:", error);
              alert("Kunne ikke eksportere timeplanen. VIS kan ha endret systemene sine, eller du er logget ut.");
            }
          },
        ),
    }));
  }

  getWeekStartDates(startDate: Date, endDate: Date): Date[] {
    const weekStarts: Date[] = [];
    const currentDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
    );
    const lastDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
    );

    const startDay = currentDate.getDay();
    const daysSinceMonday = startDay === 0 ? 6 : startDay - 1;
    currentDate.setDate(currentDate.getDate() - daysSinceMonday);

    while (currentDate <= lastDate) {
      weekStarts.push(new Date(currentDate.getTime()));
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return weekStarts;
  }

  private async loadEvents(): Promise<CalendarEvent[]> {
    const academicYears = await api.calendar.getAcademicYears();
    const currentAcademicYear = academicYears.find(
      (academicYear) => academicYear.currentYear,
    );
    if (!currentAcademicYear) {
      throw new Error("No current academic year available.");
    }

    const currentTerm = currentAcademicYear.terms.find((t) => t.current);
    if (!currentTerm) {
      throw new Error("No current term available.");
    }

    const weeks: Date[] = this.getWeekStartDates(
      new Date(),
      currentTerm.endDate,
    );

    const timetables: Timetable[] = await Promise.all(
      weeks.map((week) => api.timetable.getTimetable(week)),
    );

    return timetables.flatMap((t) =>
      t.timetableItems.map(fromTimetableItem),
    );
  }

  private async exportCalendar(exporter: Exporter): Promise<void> {
    const events = await this.loadEvents();
    const blob = exporter.exportToBlob(events);
    this.downloadBlob(blob, `timetable.${exporter.extension}`);
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
