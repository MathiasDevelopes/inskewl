import { api } from "../api/api";
import { TimetableItem } from "../api/types/timetable";
import { onDomReady } from "./core/DOMHelper";
import { VismaModule } from "./core/VismaModule";
import { makeDate } from "./utils/parsing";

export class TimetableToICS extends VismaModule {
  name: string = "TimetableToICS";
  private observer?: MutationObserver;

  shouldLoad(url: string): boolean {
    return url.includes("dashboard");
  }

  load(): void {
    onDomReady(() => {
      const obs = new MutationObserver(() => {
        const dropdown = document.querySelector("ul.dropdown-menu");
        if (dropdown && !dropdown.querySelector("#timetabletoics")) {
          const btn = document.createElement("button");
          btn.id = "timetabletoics";
          btn.className = "vsware-capitalize dropdown-item";
          btn.textContent = "Export to ICS";
          btn.addEventListener("click", this.exportToICS.bind(this));

          const li = document.createElement("li");
          li.setAttribute("role", "menuitem");
          li.appendChild(btn);

          dropdown.appendChild(li);
        }
      });

      obs.observe(document.body, { childList: true, subtree: true });
    });
  }

  unload(): void {
    // stopp observeren hvis den finnes
    this.observer?.disconnect();
    this.observer = undefined;

    // fjern knappen
    const btn = document.getElementById("timetabletoics");
    btn?.remove();
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

    return `
BEGIN:VEVENT
UID:${item.id}-${Math.random().toString(36).substr(2, 9)}@inskewl
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${start}
DTEND:${end}
SUMMARY:${item.subject ?? item.label}
${item.locations.length ? `LOCATION:${item.locations.join(", ")}` : ""}
DESCRIPTION:Type: ${item.type}${item.subject ? `, Subject: ${item.subject}` : ""}${item.teacherName ? `, Teacher: ${item.teacherName}` : ""}
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
