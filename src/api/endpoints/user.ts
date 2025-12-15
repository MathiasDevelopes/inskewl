import {
  PersonalInfo,
  PersonalInfoSchema,
  User,
  UserSchema,
} from "../types/user";
import { Endpoint } from "../endpoint";

export class UserApi extends Endpoint {
  async getCurrentUser(): Promise<User> {
    return this.client.getWithSchema("/permissions/user", UserSchema);
  }

  async getPersonalInfo(): Promise<PersonalInfo> {
    const learnerId = await this.session.getLearnerId();
    // ?filterType=ALL&filterId=0&action=current

    return this.client.getWithSchema(
      `learner/${learnerId}/personal`,
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

    return this.client.get<boolean>(`learner/${learnerId}/maturity`);
  }
}
