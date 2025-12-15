import z from "zod";
import { Event, EventSchema } from "../types/events";
import { Endpoint } from "../endpoint";

export class EventsApi extends Endpoint {
  async getEvents(): Promise<Event[]> {
    return this.client.getWithSchema("events", z.array(EventSchema));
  }

  async getEvent(eventId: number): Promise<Event> {
    return this.client.getWithSchema(`events/${eventId}`, EventSchema);
  }
}
