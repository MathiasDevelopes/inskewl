import {
  AbsenceCodesByTeachingGroups,
  AbsenceCodesByTeachingGroupsSchema,
  AbsenceOverview,
  AttendanceSubjectGroup,
  AttendanceSubjectGroupSchema,
  DiplomaAbsences,
  DiplomaAbsencesSchema,
  DiplomaTermAbsences,
  DiplomaTermAbsencesSchema,
  MembershipFilter,
  AbsenceOverviewSchema,
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
      `attendance/subject-groups/learner/${learnerId}/academic-year/${academicYear.id}`,
      z.array(AttendanceSubjectGroupSchema),
    );
  }

  async getAbsenceOverview(
    membershipFilter: MembershipFilter = "MEMBER",
  ): Promise<AbsenceOverview> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `attendance/overview/learners/${learnerId}/absence-overview`,
      AbsenceOverviewSchema,
      {
        query: {
          membershipFilter: membershipFilter,
        },
      },
    );
  }

  async getAbsenceCodesByTeachingGroups(
    membershipFilter: MembershipFilter = "MEMBER",
  ): Promise<AbsenceCodesByTeachingGroups> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `attendance/overview/learners/${learnerId}/absence-overview/codes-by-teaching-groups`,
      AbsenceCodesByTeachingGroupsSchema,
      {
        query: {
          membershipFilter,
        },
      },
    );
  }

  async getDiplomaAbsences(
    academicYear: AcademicYear,
    membershipFilter: MembershipFilter = "MEMBER",
  ): Promise<DiplomaAbsences> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `attendance/v2/learners/${learnerId}/diploma-absences/academic-year/${academicYear.id}`,
      DiplomaAbsencesSchema,
      {
        query: {
          membershipFilter,
        },
      },
    );
  }

  async getDiplomaAbsencesForTerm(
    academicYear: AcademicYear,
    term: 1 | 2,
    membershipFilter: MembershipFilter = "MEMBER",
  ): Promise<DiplomaTermAbsences> {
    const learnerId = await this.session.getLearnerId();

    return this.client.getWithSchema(
      `attendance/v2/learners/${learnerId}/diploma-absences/academic-year/${academicYear.id}/term/${term}`,
      DiplomaTermAbsencesSchema,
      {
        query: {
          membershipFilter,
        },
      },
    );
  }
}
