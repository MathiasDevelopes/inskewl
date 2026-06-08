import type { TimetableItem } from "../../../api/types/timetable";
import { combineDateWithTime } from "../../../utils/parsing";

// Calendar formats can extend this interface with features unique to that calendar format.
export interface CalendarEvent {
  id: string;
  name: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
}

function formatDateForUid(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function stringifyUidValue(value: unknown): string {
  if (value === null || value === undefined) return "unknown";
  if (value instanceof Date) return formatDateForUid(value);
  if (Array.isArray(value)) return `[${value.map(stringifyUidValue).join(",")}]`;

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entryValue]) => `${key}:${stringifyUidValue(entryValue)}`);
    return `{${entries.join(",")}}`;
  }

  return String(value);
}

function hashString(value: string): string {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;

  for (let i = 0; i < value.length; i++) {
    hash ^= BigInt(value.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * prime);
  }

  return hash.toString(36);
}

function createTimetableItemUid(item: TimetableItem): string {
  const fallbackId = [
    item.entityId,
    item.type,
    item.subject ?? item.label ?? "event",
  ].join("-");

  const source = stringifyUidValue({
    tenant: item.tenant,
    id: item.id ?? fallbackId,
    date: item.date,
    startTime: item.startTime,
    endTime: item.endTime,
  });

  return `timetable-${hashString(source)}@inskewl`;
}

export function fromTimetableItem(item: TimetableItem): CalendarEvent {
  const start = combineDateWithTime(item.date, item.startTime);
  const end = combineDateWithTime(item.date, item.endTime);

  const typeLabels: Record<TimetableItem["type"], string> = {
    LESSON: "Undervisning",
    EVENT: "Hendelse",
    ACTIVITY: "Aktivitet",
    SUBSTITUTION: "Vikar/endring",
    EXAM: "Eksamen",
    ASSESSMENT: "Vurdering",
  };
  const descriptionParts = [`Type: ${typeLabels[item.type]}`];
  if (item.label) descriptionParts.push(`Gruppe: ${item.label}`);
  if (item.teachers?.length && item.teachers.length >= 1)
    descriptionParts.push(`Lærere: ${item.teachers.join(", ")}`);

  return {
    id: createTimetableItemUid(item),
    name: item.subject ?? item.label ?? "Event",
    start,
    end,
    description: descriptionParts.join("\n"),
    location: item.locations?.join(", "),
  };
}
