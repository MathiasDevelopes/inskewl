import { api } from "../api/api";
import { TimetableItem } from "../api/types/timetable";
import { Injectable } from "./core/Injectable";
import { VismaModule } from "./core/VismaModule";
import { makeDate } from "./utils/parsing";

export class TimetableToICS extends VismaModule {
  name: string = "TimetableToICS";
  description = "Export your calendar to the .ics format";

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

    const exporter = new TimetableExporter(timetable.timetableItems);
    exporter.downloadICS();
  }
}

class TimetableExporter {
  constructor(private items: TimetableItem[]) {}

  private formatDate(dateStr: string, timeStr: string) {
    const dt = makeDate(dateStr, timeStr);
    return dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  private generateVEvent(item: TimetableItem): string {
    const start = this.formatDate(item.date, item.startTime);
    const end = this.formatDate(item.date, item.endTime);

    const teacherDisplay = () => {
      if (item.teachers && item.teachers.length > 1) {
        return `Teachers: ${item.teachers.join(", ")}`;
      } else if (item.teacherName) {
        return `Teacher: ${item.teacherName}`;
      } else {
        return "";
      }
    };

    return `
BEGIN:VEVENT
UID:${item.id}-${Math.random().toString(36).substr(2, 9)}@inskewl
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${start}
DTEND:${end}
SUMMARY:${item.subject ?? item.label}
${item.locations.length ? `LOCATION:${item.locations.join(", ")}` : ""}
DESCRIPTION:Type: ${item.type}${item.label ? `, ${item.label}` : ""}${teacherDisplay()}
END:VEVENT
    `.trim();
  }

  downloadICS(filename = "timetable.ics") {
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//inskewl//EN
${this.items.map((item) => this.generateVEvent(item)).join("\n")}
END:VCALENDAR
    `.trim();

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
