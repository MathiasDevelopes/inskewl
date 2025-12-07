import { School, SchoolSchema } from "../types/school";
import { Session } from "../api";
import { ApiClient } from "../apiClient";

export class SchoolApi {
  private client: ApiClient;
  private session: Session;

  constructor(client: ApiClient, session: Session) {
    this.client = client;
    this.session = session;
  }

  async getCurrent(): Promise<School> {
    return this.client.getWithSchema("/schoolinfo/current", SchoolSchema);
  }
}
