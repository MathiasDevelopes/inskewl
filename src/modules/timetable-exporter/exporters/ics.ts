import { CalendarEvent } from "../model/event";
import { Exporter } from "../model/exporter";

export class ICSExporter extends Exporter {
  private readonly textEncoder = new TextEncoder();

  private formatDateToICS(date: Date): string {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  }

  private escapeText(value: string): string {
    return value
      .replace(/\\/g, "\\\\")
      .replace(/\r\n|\n|\r/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  }

  private foldLine(line: string): string[] {
    const maxLineLength = 75;
    const foldedLines: string[] = [];
    let currentLine = "";
    let currentLength = 0;

    for (const char of line) {
      const charLength = this.textEncoder.encode(char).length;

      if (currentLine && currentLength + charLength > maxLineLength) {
        foldedLines.push(currentLine);
        currentLine = ` ${char}`;
        currentLength = 1 + charLength;
      } else {
        currentLine += char;
        currentLength += charLength;
      }
    }

    if (currentLine) foldedLines.push(currentLine);

    return foldedLines;
  }

  exportToBlob(events: CalendarEvent[]): Blob {
    const dtstamp = this.formatDateToICS(new Date());
    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//inskewl//EN",
    ];

    for (const event of events) {
      lines.push(
        "BEGIN:VEVENT",
        `UID:${event.id}`,
        `DTSTAMP:${dtstamp}`,
        `SUMMARY:${this.escapeText(event.name)}`,
        `DTSTART:${this.formatDateToICS(event.start)}`,
        `DTEND:${this.formatDateToICS(event.end)}`,
      );
      if (event.description)
        lines.push(`DESCRIPTION:${this.escapeText(event.description)}`);
      if (event.location)
        lines.push(`LOCATION:${this.escapeText(event.location)}`);
      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");

    const foldedLines = lines.flatMap((line) => this.foldLine(line));

    return this.stringToBlob(foldedLines.join("\r\n"), "text/calendar");
  }
}
