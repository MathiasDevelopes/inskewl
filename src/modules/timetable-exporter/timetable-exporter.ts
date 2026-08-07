import { api } from "../../api/client";
import { z } from "zod";
import {
  ExportAcademicYearSchema,
  ExportTimetableSchema,
} from "./model/schemas";
import type { Injectable } from "../core/Injectable";
import { dropdownAction } from "../core/injectables";
import { VismaModule } from "../core/VismaModule";
import { getWeekStartDates } from "../../utils/time";
import { ICSExporter } from "./exporters/ics";
import { fromTimetableItem } from "./model/event";
import type { CalendarEvent } from "./model/event";
import type { Exporter } from "./model/exporter";

export class TimetableExporter extends VismaModule {
  name: string = "TimetableExporter";
  description: string = "Export your calendar to local calendar formats.";

  private readonly exporters: Exporter[] = [new ICSExporter()];

  override shouldLoad(url: string): boolean {
    return url.includes("dashboard");
  }

  override injectables(): Injectable[] {
    return this.exporters.map((exporter) =>
      dropdownAction({
        id: `export-${exporter.id}-btn`,
        buttonId: `timetable-to-${exporter.id}`,
        label: exporter.label,
        onClick: async () => {
          try {
            await this.exportCalendar(exporter);
          } catch (error) {
            this.logger.error("Export failed:", error);
            alert("Kunne ikke eksportere timeplanen. VIS kan ha endret systemene sine, eller du er logget ut.");
          }
        },
      }),
    );
  }

  private async loadEvents(): Promise<CalendarEvent[]> {
    const currentAcademicYear = await api.calendar.getCurrentAcademicYear(
      z.array(ExportAcademicYearSchema),
    );
    const currentTerm = api.calendar.getCurrentTerm(currentAcademicYear);

    const weeks: Date[] = getWeekStartDates(
      new Date(),
      currentTerm.endDate,
    );

    const timetables = await Promise.all(
      weeks.map((week) => api.timetable.getTimetable(week, ExportTimetableSchema)),
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
