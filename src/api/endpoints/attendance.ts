import type { MembershipFilter } from "../types/attendance";
import type { z, ZodType } from "zod";
import { Endpoint } from "../endpoint";

export class AttendanceApi extends Endpoint {
  async getAttendanceForSubjectGroups<S extends ZodType>(
    academicYear: { id: number },
    schema: S,
  ): Promise<z.output<S>> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `attendance/subject-groups/learner/${learnerId}/academic-year/${academicYear.id}`,
      schema,
    );
  }

  async getAbsenceOverview<S extends ZodType>(
    schema: S,
    membershipFilter: MembershipFilter = "MEMBER",
  ): Promise<z.output<S>> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `attendance/overview/learners/${learnerId}/absence-overview`,
      schema,
      {
        query: {
          membershipFilter: membershipFilter,
        },
      },
    );
  }

  async getAbsenceCodesByTeachingGroups<S extends ZodType>(
    schema: S,
    membershipFilter: MembershipFilter = "MEMBER",
  ): Promise<z.output<S>> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `attendance/overview/learners/${learnerId}/absence-overview/codes-by-teaching-groups`,
      schema,
      {
        query: {
          membershipFilter,
        },
      },
    );
  }

  async getDiplomaAbsences<S extends ZodType>(
    academicYear: { id: number },
    schema: S,
    membershipFilter: MembershipFilter = "MEMBER",
  ): Promise<z.output<S>> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `attendance/v2/learners/${learnerId}/diploma-absences/academic-year/${academicYear.id}`,
      schema,
      {
        query: {
          membershipFilter,
        },
      },
    );
  }

  async getDiplomaAbsencesForTerm<S extends ZodType>(
    academicYear: { id: number },
    term: 1 | 2,
    schema: S,
    membershipFilter: MembershipFilter = "MEMBER",
  ): Promise<z.output<S>> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `attendance/v2/learners/${learnerId}/diploma-absences/academic-year/${academicYear.id}/term/${term}`,
      schema,
      {
        query: {
          membershipFilter,
        },
      },
    );
  }

  async getLessonAttendancesForTeachingGroups<S extends ZodType>(
    academicYear: { id: number },
    subjectGroupIds: number[],
    schema: S,
  ): Promise<z.output<S>> {
    if (subjectGroupIds.length === 0) return [] as z.output<S>;

    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `attendance/v2/lesson/learner/${learnerId}/academic-year/${academicYear.id}/teaching-groups`,
      schema,
      {
        query: {
          teachingGroupIds: subjectGroupIds.join(","),
        },
      },
    );
  }
}
