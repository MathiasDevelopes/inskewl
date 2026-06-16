import {
  PersonalInfo,
  PersonalInfoSchema,
  User,
  UserSchema,
} from "../types/user";
import { Endpoint } from "../endpoint";

export class UserApi extends Endpoint {
  async getCurrentUser(): Promise<User> {
    return this.client.getWithSchema("permissions/user", UserSchema);
  }

  async getPersonalInfo(
    filterType: string = "ALL",
    filterId: number = 0,
    action: string = "current",
  ): Promise<PersonalInfo> {
    const learnerId = await this.session.getLearnerId();
    // ?filterType=ALL&filterId=0&action=current

    return this.client.getWithSchema(
      `learner/${learnerId}/personal`,
      PersonalInfoSchema,
      {
        query: {
          filterType,
          filterId,
          action,
        },
      },
    );
  }

  async getMaturity(): Promise<boolean> {
    const learnerId = await this.session.getLearnerId();

    return this.client.get<boolean>(`learner/${learnerId}/maturity`);
  }
}
