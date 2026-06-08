import { api } from "../../api/api";
import type { Timetable } from "../../api/types/timetable";
import { Injectable } from "../core/Injectable";
import { VismaModule } from "../core/VismaModule";
import { createDropdownItem } from "../../utils/dom";
import { createLogger } from "../../utils/logger";
import { ICSExporter } from "./exporters/ics";
import { CalendarEvent, fromTimetableItem } from "./model/event";

const logger = createLogger("TimetableExporter");

export class TimetableExporter extends VismaModule {
  name: string = "TimetableExporter";
  description: string = "Export your calendar to local calendar formats.";

  override shouldLoad(url: string): boolean {
    return url.includes("dashboard");
  }

  override injectables(): Injectable[] {
    return [
      {
        id: "export-ics-btn",
        target: "ul.dropdown-menu",
        placement: "append",
        render: () => createDropdownItem(
          "timetabletoics",
          "Eksporter timeplan",
          async () => {
            try {
              await this.exportToICS();
            } catch (error) {
              logger.error("Export failed:", error);
              alert("Kunne ikke eksportere timeplanen. VIS kan ha endret systemene sine, eller du er logget ut.");
            }
          },
        ),
      },
    ];
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

  /* Entrypoint for the button. */
  private async exportToICS(): Promise<void> {
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

    // Mapping of TimetableItem to generic CalendarEvent
    const events: CalendarEvent[] = timetables.flatMap((t) =>
      t.timetableItems.map(fromTimetableItem),
    );

    const exporter = new ICSExporter();
    const blob = exporter.exportToBlob(events);

    // Here we make a small exception to stray away from the Injectable standard.
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timetable.ics";
    a.click();
    URL.revokeObjectURL(url);
  }
}
