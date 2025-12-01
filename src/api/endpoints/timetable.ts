import { Timetable, TimetableType } from "../../types/timetable";
import { Session } from "../api";
import { ApiClient } from "../apiClient";

export class TimetableApi {
  private client: ApiClient;
  private session: Session;

  constructor(client: ApiClient, session: Session) {
    this.client = client;
    this.session = session;
  }

  /**
   *
   * @param week A date which is in the week you want to get the timetable for.
   * @param types Types of info to get from the timetable endpoint.
   * @param extraInfo
   */
  async getTimetable(
    week: Date,
    // types kan også inneholde EXAM og ASSESSMENT
    types: TimetableType[] = ["LESSON", "EVENT", "ACTIVITY", "SUBSTITUTION"],
    extraInfo = true,
  ): Promise<Timetable> {
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
