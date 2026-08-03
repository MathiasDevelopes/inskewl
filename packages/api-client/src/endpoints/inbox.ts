import { Endpoint } from "../endpoint";
import type { FilterType } from "../types/inbox";
import type { z, ZodType } from "zod";

export class InboxApi extends Endpoint {
  async getMessages<S extends ZodType>(
    schema: S,
    page: number = 0,
    pageSize: number = 1000,
    filterType: FilterType = "ALL",
  ): Promise<z.output<S>> {
    return this.client.getWithSchema("inbox/messages", schema, {
      query: {
        page,
        pageSize,
        filterType,
      },
    });
  }

  /* Returns the count of new messages in your inbox */
  async getNewCount(): Promise<number> {
    return this.client.get<number>("inbox/countNew");
  }
}
