import {
  ActivityDetail,
  ActivityDetailSchema,
  Timetable,
  TimetableSchema,
  TimetableType,
} from "../types/timetable";
import z from "zod";
import { Endpoint } from "../endpoint";

export class TimetableApi extends Endpoint {
  /**
   *
   * @param week A date which is in the week you want to get the timetable for.
   * @param types Types of info to get from the timetable endpoint.
   * @param extraInfo
   */
  async getTimetable(
    week: Date,
    types: TimetableType[] = ["LESSON", "EVENT", "ACTIVITY", "SUBSTITUTION"],
    extraInfo = true,
  ): Promise<Timetable> {
    const learnerId = await this.session.getLearnerId();

    // dd/mm/yyyy
    const dateStr = week.toLocaleDateString("en-GB");

    return this.client.getWithSchema(
      `timetablev2/learner/${learnerId}/fetch/ALL/0/current`,
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

  /**
   * Posts a list of activityTimeslotId to get additional activity details.
   * @param activityTimeslotIds - Array of activity timeslot IDs to get details for
   */
  async postAdditionalActivityDetails(
    activityTimeslotIds: number[],
  ): Promise<ActivityDetail[]> {
    return this.client.postWithSchema(
      "timetablev2/additional-activity-details",
      activityTimeslotIds,
      z.array(ActivityDetailSchema),
    );
  }
}
