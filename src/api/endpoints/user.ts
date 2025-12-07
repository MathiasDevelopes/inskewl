import { Timetable } from "../types/timetable";
import { User, UserSchema } from "../types/user";
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
    return this.client.getWithSchema("/permissions/user", UserSchema);
  }

  async getMaturity(): Promise<boolean> {
    const learnerId = await this.session.getLearnerId();

    return this.client.get<boolean>(`/learner/${learnerId}/maturity`);
  }
}
