import { Endpoint } from "../endpoint";
import { FilterType, Messages, MessagesSchema } from "../types/inbox";

export class InboxApi extends Endpoint {
  async getMessages(
    page: number = 0,
    pageSize: number = 1000,
    filterType: FilterType = "ALL",
  ): Promise<Messages> {
    return this.client.getWithSchema("inbox/messages", MessagesSchema, {
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
