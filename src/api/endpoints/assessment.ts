import { Session } from "../api";
import { ApiClient } from "../apiClient";
import { Behaviour, BehaviourSchema } from "../types/assessment";

export class AssessmentApi {
  private client: ApiClient;
  private session: Session;

  constructor(client: ApiClient, session: Session) {
    this.client = client;
    this.session = session;
  }

  async getBehaviour(): Promise<Behaviour> {
    const learnerId = await this.session.getLearnerId();

    return this.client.requestWithSchema(
      `/assessment/behaviour/${learnerId}`,
      BehaviourSchema,
    );
  }
}
