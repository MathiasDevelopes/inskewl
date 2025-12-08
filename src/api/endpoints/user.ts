import {
  PersonalInfo,
  PersonalInfoSchema,
  User,
  UserSchema,
} from "../types/user";
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

  async getPersonalInfo(): Promise<PersonalInfo> {
    const learnerId = await this.session.getLearnerId();
    // ?filterType=ALL&filterId=0&action=current

    return this.client.getWithSchema(
      `/learner/${learnerId}/personal`,
      PersonalInfoSchema,
      {
        query: {
          filterType: "ALL",
          filterId: 0,
          action: "current",
        },
      },
    );
  }

  async getMaturity(): Promise<boolean> {
    const learnerId = await this.session.getLearnerId();

    return this.client.get<boolean>(`/learner/${learnerId}/maturity`);
  }
}
