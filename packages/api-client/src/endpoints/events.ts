import type { z, ZodType } from "zod";
import { Endpoint } from "../endpoint";

export class EventsApi extends Endpoint {
  async getEvents<S extends ZodType>(schema: S): Promise<z.output<S>> {
    return this.client.getWithSchema("events", schema);
  }

  async getEvent<S extends ZodType>(
    eventId: number,
    schema: S,
  ): Promise<z.output<S>> {
    return this.client.getWithSchema(`events/${eventId}`, schema);
  }
}
