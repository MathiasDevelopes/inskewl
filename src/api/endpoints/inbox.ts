import { Endpoint } from "../endpoint";
import { Messages, MessagesSchema } from "../types/inbox";

export class InboxApi extends Endpoint {
  async getMessages(): Promise<Messages> {
    /* default values are ?page=0&pageSize=10&filterType=ALL

    we put pageSize to a very big value to get all messages.
    */
    return this.client.getWithSchema("/inbox/messages", MessagesSchema, {
      query: {
        page: 0,
        pageSize: 1000,
        filterType: "ALL", // can also be INBOX for unread messages.
      },
    });
  }

  /* Returns the count of new messages in your inbox */
  async getNewCount(): Promise<number> {
    return this.client.get<number>("/inbox/countNew");
  }
}
