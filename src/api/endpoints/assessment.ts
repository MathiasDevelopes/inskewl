import { Session } from "../api";
import { ApiClient } from "../apiClient";
import { Behaviour } from "../types/assessment";

export class AssessmentApi {
  private client: ApiClient;
  private session: Session;

  constructor(client: ApiClient, session: Session) {
    this.client = client;
    this.session = session;
  }

  async getBehaviour(): Promise<Behaviour> {
    const learnerId = await this.session.getLearnerId();

    return this.client.request<Behaviour>(`/assessment/behaviour/${learnerId}`);
  }
}
