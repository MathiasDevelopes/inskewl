// Blueprint for a CalendarEvent.
// Calender formats can extend this interface with features unique to that calender format.
export interface CalendarEvent {
  id: string;
  name: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
}
