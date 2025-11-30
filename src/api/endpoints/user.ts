import { Timetable } from "../../types/timetable";
import { User } from "../../types/user";
import { ApiClient, Method } from "../apiClient";

export class UserApi {
  private client: ApiClient;
  private learnerId: number | null;

  constructor(client: ApiClient) {
    this.learnerId = null;
    this.client = client;
  }

  // Almost every api call related to user requires learner id, so we cache it here.
  private async ensureLearnerId(): Promise<number> {
    if (this.learnerId != null) return this.learnerId;
    const user = await this.client.request<User>("/permissions/user");
    this.learnerId = user.learnerId;
    return this.learnerId;
  }

  async getCurrentUser(): Promise<User> {
    return this.client.request("/permissions/user");
  }

  /**
   *
   * @param week A date which is in the week you want to get the timetable for.
   * @param types Types of info to get from the timetable endpoint.
   * @param extraInfo
   */
  async getTimetable(
    week: Date,
    types: string[] = ["LESSON", "EVENT", "ACTIVITY", "SUBSTITUTION"],
    extraInfo = true,
  ) {
    const learnerId = await this.ensureLearnerId();

    // dd/mm/yyyy
    const dateStr = week.toLocaleDateString("en-GB");

    return this.client.request<Timetable>(
      `/timetablev2/learner/${learnerId}/fetch/ALL/0/current`,
      {
        query: {
          forWeek: dateStr,
          "extra-info": extraInfo,
          types: types.join(","),
        },
      },
    );
  }
}
