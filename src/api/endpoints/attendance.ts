import {
  AttendanceSubjectGroup,
  AttendanceSubjectGroupSchema,
} from "../types/attendance";
import { AcademicYear } from "../types/calendar";
import z from "zod";
import { Endpoint } from "../endpoint";

export class AttendanceApi extends Endpoint {
  async getAttendanceForSubjectGroups(
    academicYear: AcademicYear,
  ): Promise<AttendanceSubjectGroup[]> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `/attendance/subject-groups/learner/${learnerId}/academic-year/${academicYear.id}`,
      z.array(AttendanceSubjectGroupSchema),
    );
  }
}
