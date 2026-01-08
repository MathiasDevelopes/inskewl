import { api } from "../../api/api";
import { Injectable } from "../core/Injectable";
import { VismaModule } from "../core/VismaModule";
import { makeDate } from "../utils/parsing";
import { ICSExporter } from "./exporters/ics";
import { CalendarEvent, ICSCalendarEvent } from "./model/event";

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

  /* Entrypoint for the button. */
  private async exportToICS(): Promise<void> {
    // TODO: Add selector for week you want to export
    const timetable = await api.timetable.getTimetable(new Date());

    // Mapping of TimetableItem to generic CalendarEvent
    const events: ICSCalendarEvent[] = timetable.timetableItems.map((item) => {
      const uid = `${Math.random().toString(36).substr(2, 9)}@inskewl`;
      const start = makeDate(item.date, item.startTime);
      const end = makeDate(item.date, item.endTime);

      const descriptionParts = [`Type: ${item.type}`];
      if (item.label) descriptionParts.push(item.label);
      if (item.teachers?.length && item.teachers.length > 1)
        descriptionParts.push(`Teacher(s): ${item.teachers.join(", ")}`);

      return {
        id: uid,
        name: item.subject ?? item.label ?? "Event",
        start,
        end,
        location: item.locations?.join(", "),
        uid: uid,
      };
    });

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
