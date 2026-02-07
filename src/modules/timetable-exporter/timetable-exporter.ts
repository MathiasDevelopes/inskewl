import { api } from "../../api/api";
import { AcademicYear, Term } from "../../api/types/calendar";
import { Timetable } from "../../api/types/timetable";
import { Injectable } from "../core/Injectable";
import { VismaModule } from "../core/VismaModule";
import { ICSExporter } from "./exporters/ics";
import { CalendarEvent, fromTimetableItem } from "./model/event";

export class TimetableExporter extends VismaModule {
  name: string = "TimetableExporter";
  description: string = "Export your calendar to local calendar formats.";

  shouldLoad(url: string): boolean {
    return url.includes("dashboard");
  }

  injectables(): Injectable[] {
    return [
      {
        id: "export-ics-btn",
        target: "ul.dropdown-menu",
        placement: "append",
        render: () => {
          const li = document.createElement("li");
          li.setAttribute("role", "menuitem");
          li.setAttribute("tabindex", "-1");

          const btn = document.createElement("button");
          btn.id = "timetabletoics";
          btn.className = "vsware-capitalize dropdown-item";
          // required for proper styling of the button inside the dropdown menu
          btn.setAttribute("data-v-649b0c40", "");
          btn.textContent = "Export to ICS";
          btn.onclick = () => this.exportToICS();

          li.appendChild(btn);
          return li;
        },
      },
    ];
  }

  // ja dette er ai ikke døm jeg er trøtt
  getWeekStartDates(startDate: Date, endDate: Date): Date[] {
    const weekStarts: Date[] = [];
    const currentDate = new Date(startDate.getTime()); // Use a copy to avoid modifying the original date

    // Set the initial date to the first Monday on or after the original start date
    const startDay = currentDate.getDay();
    const daysUntilMonday = startDay === 0 ? 1 : 1 - startDay; // Handle Sunday (0) as needing +1 day to reach Monday
    currentDate.setDate(currentDate.getDate() + daysUntilMonday);

    // Ensure the initial date is not before the original start date (this could happen if the start date was Sunday)
    if (currentDate < startDate) {
      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Loop through the dates, adding 7 days in each iteration until the date exceeds the end date
    while (currentDate <= endDate) {
      weekStarts.push(new Date(currentDate.getTime())); // Push a new Date object to the array
      currentDate.setDate(currentDate.getDate() + 7); // Increment by a week
    }

    return weekStarts;
  }

  /* Entrypoint for the button. */
  private async exportToICS(): Promise<void> {
    const academicYears = await api.calendar.getAcademicYears();
    const currentAcademicYear: AcademicYear = academicYears.filter(
      (academicYear) => academicYear.currentYear,
    )[0];

    const currentTerm: Term = currentAcademicYear.terms.find((t) => t.current)!;

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
