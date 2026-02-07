// Blueprint for a CalendarEvent.

import { TimetableItem } from "../../../api/types/timetable";
import { combineDateWithTime } from "../../utils/parsing";

// Calender formats can extend this interface with features unique to that calender format.
export interface CalendarEvent {
  id: string;
  name: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
}

export function fromTimetableItem(item: TimetableItem): CalendarEvent {
  const uid = `${Math.random().toString(36).substr(2, 9)}@inskewl`;
  const start = combineDateWithTime(item.date, item.startTime);
  const end = combineDateWithTime(item.date, item.endTime);

  const descriptionParts = [`Type: ${item.type}`];
  if (item.label) descriptionParts.push(item.label);
  if (item.teachers?.length && item.teachers.length >= 1)
    descriptionParts.push(`Teacher(s): ${item.teachers.join(", ")}`);

  return {
    id: uid,
    name: item.subject ?? item.label ?? "Event",
    start: start,
    end: end,
    description: descriptionParts.join(" "),
    location: item.locations?.join(", "),
  };
}
