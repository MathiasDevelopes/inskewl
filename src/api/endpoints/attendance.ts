import { AttendanceSubjectGroup } from "../types/attendance";
import { AcademicYear } from "../types/calendar";
import { Session } from "../api";
import { ApiClient } from "../apiClient";

export class AttendanceApi {
  private client: ApiClient;
  private session: Session;

  constructor(client: ApiClient, session: Session) {
    this.client = client;
    this.session = session;
  }

  async getAttendanceForSubjectGroups(
    academicYear: AcademicYear,
  ): Promise<AttendanceSubjectGroup[]> {
    const learnerId = await this.session.getLearnerId();

    return this.client.request<AttendanceSubjectGroup[]>(
      `/attendance/subject-groups/learner/${learnerId}/academic-year/${academicYear.id}`,
    );
  }
}
