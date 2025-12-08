import { Session } from "../api";
import { ApiClient } from "../apiClient";
import z from "zod";
import { Event, EventSchema } from "../types/events";

export class EventsApi {
  private client: ApiClient;
  private session: Session;

  constructor(client: ApiClient, session: Session) {
    this.client = client;
    this.session = session;
  }

  async getEvents(): Promise<Event[]> {
    return this.client.getWithSchema("/events", z.array(EventSchema));
  }

  async getEvent(eventId: number): Promise<Event> {
    return this.client.getWithSchema(`/events/${eventId}`, EventSchema);
  }
}
