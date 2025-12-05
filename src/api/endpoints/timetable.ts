import {
  ActivityDetail,
  ActivityDetailSchema,
  Timetable,
  TimetableSchema,
  TimetableType,
} from "../types/timetable";
import { Session } from "../api";
import { ApiClient, Method } from "../apiClient";
import z from "zod";

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

    return this.client.requestWithSchema(
      `/timetablev2/learner/${learnerId}/fetch/ALL/0/current`,
      TimetableSchema,
      {
        query: {
          forWeek: dateStr,
          "extra-info": extraInfo,
          types: types.join(","),
        },
      },
    );
  }

  /* Internally a post request, but we expose it as get because the only thing posted is learner id. */
  async getAdditionalActivityDetails(): Promise<ActivityDetail[]> {
    const learnerId = await this.session.getLearnerId();

    return this.client.requestWithSchema(
      "/timetablev2/additional-activity-details",
      z.array(ActivityDetailSchema),
      {
        method: Method.POST,
        body: [learnerId],
      },
    );
  }
}
