import { Timetable } from "../../types/timetable";
import { User } from "../../types/user";
import { ApiClient, Method } from "../apiClient";
import { Session } from "../api";

export class UserApi {
  private client: ApiClient;
  private session: Session;

  constructor(client: ApiClient, session: Session) {
    this.client = client;
    this.session = session;
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
    const learnerId = await this.session.getLearnerId();

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
