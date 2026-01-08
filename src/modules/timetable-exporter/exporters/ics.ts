import { ICSCalendarEvent } from "../model/event";
import { Exporter } from "../model/exporter";

export class ICSExporter extends Exporter {
  private formatDateToICS(date: Date): string {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  }

  exportToBlob(events: ICSCalendarEvent[]): Blob {
    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//inskewl//EN",
    ];

    for (const event of events) {
      const uid = event.uid ?? `${event.id}@myapp`;
      lines.push(
        "BEGIN:VEVENT",
        `UID:${event.id}`,
        `SUMMARY:${event.name}`,
        `DTSTART:${this.formatDateToICS(event.start)}`,
        `DTEND:${this.formatDateToICS(event.end)}`,
      );
      if (event.description) lines.push(`DESCRIPTION:${event.description}`);
      if (event.location) lines.push(`LOCATION:${event.location}`);
      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");

    return this.stringToBlob(lines.join("\r\n"), "text/calendar");
  }
}
