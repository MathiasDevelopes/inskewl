import { Endpoint } from "../endpoint";
import { FilterType, FilterTypeSchema, Messages, MessagesSchema } from "../types/inbox";

export class InboxApi extends Endpoint {
  async getMessages(
    filterType: FilterType = FilterTypeSchema.enum.ALL,
  ): Promise<Messages> {
    return this.client.getWithSchema("inbox/messages", MessagesSchema, {
      query: {
        page: 0,
        pageSize: 1000,
        filterType,
      },
    });
  }

  /* Returns the count of new messages in your inbox */
  async getNewCount(): Promise<number> {
    return this.client.get<number>("inbox/countNew");
  }
}
