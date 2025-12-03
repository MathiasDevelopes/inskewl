import { Timetable } from "../types/timetable";
import { User } from "../types/user";
import { ApiClient } from "../apiClient";
import { Session } from "../api";

export class UserApi {
  private client: ApiClient;
  private session: Session;

  constructor(client: ApiClient, session: Session) {
    this.client = client;
    this.session = session;
  }

  async getCurrentUser(): Promise<User> {
    return this.client.request<User>("/permissions/user");
  }

  async getMaturity(): Promise<boolean> {
    const learnerId = await this.session.getLearnerId();

    return this.client.request<boolean>(`/learner/${learnerId}/maturity`);
  }
}
