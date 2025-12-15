import { Session } from "./api";
import { ApiClient } from "./apiClient";

export abstract class Endpoint {
  protected client: ApiClient;
  protected session: Session;

  constructor(client: ApiClient, session: Session) {
    this.client = client;
    this.session = session;
  }
}
