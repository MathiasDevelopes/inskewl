import { CalendarEvent } from "./event";

export abstract class Exporter {
  // Helper function to convert a string to blob. To be used in conjunction with the abstract function exportToBlob
  stringToBlob(content: string, mime = "text/plain"): Blob {
    return new Blob([content], { type: mime });
  }

  abstract exportToBlob(events: CalendarEvent[]): Blob;
}
