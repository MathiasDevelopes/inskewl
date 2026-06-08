import type { CalendarEvent } from "./event";

export abstract class Exporter {
  abstract readonly id: string;
  abstract readonly label: string;
  abstract readonly extension: string;
  abstract readonly mimeType: string;

  stringToBlob(content: string, mime = this.mimeType): Blob {
    return new Blob([content], { type: mime });
  }

  abstract exportToBlob(events: CalendarEvent[]): Blob;
}
