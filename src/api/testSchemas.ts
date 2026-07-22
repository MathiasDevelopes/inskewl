import { api } from "./api";
import { z, ZodError } from "zod";
import { createLogger } from "../utils/logger";
import { BehaviourSchema, RemarkLimitSchema } from "./types/assessment";
import {
  AbsenceCodesByTeachingGroupsSchema,
  AbsenceOverviewSchema,
  AttendanceSubjectGroupSchema,
  DiplomaAbsencesSchema,
  DiplomaTermAbsencesSchema,
  LessonAttendancesSchema,
} from "./types/attendance";
import { AcademicYearSchema, DayCountSchema } from "./types/calendar";
import { EventSchema } from "./types/events";
import { ExamGroupsSchema } from "./types/exams";
import { MessagesSchema } from "./types/inbox";
import { LoginPageSchema } from "./types/login-page";
import { SchoolSchema } from "./types/school";
import { TenantSchema } from "./types/tenant";
import { TimetableSchema } from "./types/timetable";
import { PersonalInfoSchema, UserSchema } from "./types/user";

// Features validate only the fields they need (feature-driven schemas).
// This suite passes the full catalog schemas to detect upstream API drift
// in fields no feature consumes yet.

const logger = createLogger("ApiSchemas");

interface TestResult {
  name: string;
  status: "passed" | "failed" | "skipped";
  error?: unknown;
  reason?: string;
}

/**
 * Tests all API functions to validate Zod schemas.
 * This function should be called from the browser console when authenticated.
 * It will call each API endpoint and report which schemas passed or failed validation.
 */
export async function testAllApiSchemas(): Promise<void> {
  console.group("🧪 API Schema Validation Tests");
  logger.info("Starting API schema validation tests...");

  const results: TestResult[] = [];

  // Helper function to test an API call
  const testApiCall = async <T>(
    name: string,
    fn: () => Promise<T>,
  ): Promise<T | null> => {
    try {
      const result = await fn();
      results.push({ name, status: "passed" });
      logger.info(`✅ ${name}`);
      return result;
    } catch (error) {
      results.push({ name, status: "failed", error });
      logger.error(`❌ ${name}`);
      if (error instanceof ZodError) {
        logger.error("Zod validation error:", error);
      } else {
        logger.error("Unexpected error:", error);
      }
      return null;
    }
  };

  // Helper function to record a skipped test
  const skipTest = (name: string, reason: string): void => {
    results.push({ name, status: "skipped", reason });
    logger.warn(`⏭️  ${name} (skipped: ${reason})`);
  };

  // Test UserApi methods
  await testApiCall("UserApi.getCurrentUser()", () =>
    api.user.getCurrentUser(UserSchema),
  );
  await testApiCall("UserApi.getPersonalInfo()", () =>
    api.user.getPersonalInfo(PersonalInfoSchema),
  );
  await testApiCall("UserApi.getMaturity()", () => api.user.getMaturity());

  // Test TimetableApi methods
  await testApiCall("TimetableApi.getTimetable()", () =>
    api.timetable.getTimetable(new Date(), TimetableSchema),
  );
  // Skipping postAdditionalActivityDetails - requires activityTimeslotIds parameter
  skipTest(
    "TimetableApi.postAdditionalActivityDetails()",
    "requires activityTimeslotIds parameter - needs dedicated test",
  );

  // Test CalendarApi methods
  const academicYears = await testApiCall("CalendarApi.getAcademicYears()", () =>
    api.calendar.getAcademicYears(z.array(AcademicYearSchema)),
  );

  // Test getDayCount with the first academic year if available
  if (academicYears && academicYears.length > 0) {
    const firstAcademicYear = academicYears[0];
    if (!firstAcademicYear) {
      skipTest("CalendarApi.getDayCount()", "no academic years available");
    } else {
      await testApiCall("CalendarApi.getDayCount()", () =>
        api.calendar.getDayCount(firstAcademicYear, DayCountSchema),
      );
    }
  } else {
    skipTest("CalendarApi.getDayCount()", "no academic years available");
  }

  // Test AttendanceApi methods
  await testApiCall("AttendanceApi.getAbsenceOverview()", () =>
    api.attendance.getAbsenceOverview(AbsenceOverviewSchema),
  );
  await testApiCall("AttendanceApi.getAbsenceCodesByTeachingGroups()", () =>
    api.attendance.getAbsenceCodesByTeachingGroups(
      AbsenceCodesByTeachingGroupsSchema,
    ),
  );

  if (academicYears && academicYears.length > 0) {
    const firstAcademicYear = academicYears[0];
    if (!firstAcademicYear) {
      skipTest(
        "AttendanceApi.getAttendanceForSubjectGroups()",
        "no academic years available",
      );
      skipTest(
        "AttendanceApi.getLessonAttendancesForTeachingGroups()",
        "no academic years available",
      );
      skipTest(
        "AttendanceApi.getDiplomaAbsences()",
        "no academic years available",
      );
      skipTest(
        "AttendanceApi.getDiplomaAbsencesForTerm()",
        "no academic years available",
      );
    } else {
      const attendanceGroups = await testApiCall(
        "AttendanceApi.getAttendanceForSubjectGroups()",
        () =>
          api.attendance.getAttendanceForSubjectGroups(
            firstAcademicYear,
            z.array(AttendanceSubjectGroupSchema),
          ),
      );
      if (attendanceGroups && attendanceGroups.length > 0) {
        await testApiCall("AttendanceApi.getLessonAttendancesForTeachingGroups()", () =>
          api.attendance.getLessonAttendancesForTeachingGroups(
            firstAcademicYear,
            attendanceGroups.map((g) => g.subjectGroupId),
            LessonAttendancesSchema,
          ),
        );
      } else {
        skipTest(
          "AttendanceApi.getLessonAttendancesForTeachingGroups()",
          "no attendance subject groups available",
        );
      }
      await testApiCall("AttendanceApi.getDiplomaAbsences()", () =>
        api.attendance.getDiplomaAbsences(firstAcademicYear, DiplomaAbsencesSchema),
      );
      await testApiCall("AttendanceApi.getDiplomaAbsencesForTerm(1)", () =>
        api.attendance.getDiplomaAbsencesForTerm(
          firstAcademicYear,
          1,
          DiplomaTermAbsencesSchema,
        ),
      );
    }
  } else {
    skipTest(
      "AttendanceApi.getAttendanceForSubjectGroups()",
      "no academic years available",
    );
    skipTest(
      "AttendanceApi.getLessonAttendancesForTeachingGroups()",
      "no academic years available",
    );
    skipTest(
      "AttendanceApi.getDiplomaAbsences()",
      "no academic years available",
    );
    skipTest(
      "AttendanceApi.getDiplomaAbsencesForTerm()",
      "no academic years available",
    );
  }

  // Test SchoolApi methods
  await testApiCall("SchoolApi.getCurrent()", () =>
    api.school.getCurrent(SchoolSchema),
  );

  // Test TenantApi methods
  await testApiCall("TenantApi.getTenantlist()", () =>
    api.tenant.getTenantlist(z.array(TenantSchema)),
  );

  // Test AssessmentApi methods
  await testApiCall("AssessmentApi.getBehaviour()", () =>
    api.assessment.getBehaviour(BehaviourSchema),
  );
  await testApiCall("AssessmentApi.getRemarkLimit()", () =>
    api.assessment.getRemarkLimit(RemarkLimitSchema),
  );

  // Test ExamsApi methods
  await testApiCall("ExamsApi.getGroups()", () =>
    api.exams.getGroups(ExamGroupsSchema),
  );

  // Test InboxApi methods
  await testApiCall("InboxApi.getMessages()", () =>
    api.inbox.getMessages(MessagesSchema),
  );
  await testApiCall("InboxApi.getNewCount()", () => api.inbox.getNewCount());

  // Test EventsApi methods
  const events = await testApiCall("EventsApi.getEvents()", () =>
    api.events.getEvents(z.array(EventSchema)),
  );

  await testApiCall("LoginPageApi.getLoginPage()", () =>
    api.loginPage.getLoginPage(LoginPageSchema),
  );

  // Also test getEvent with the first event if available
  if (events && events.length > 0) {
    const firstEvent = events[0];
    if (!firstEvent) {
      skipTest("EventsApi.getEvent(id)", "no events available");
    } else {
      await testApiCall(`EventsApi.getEvent(${firstEvent.id})`, () =>
        api.events.getEvent(firstEvent.id, EventSchema),
      );
    }
  } else {
    skipTest("EventsApi.getEvent(id)", "no events available");
  }

  // Summary
  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;

  console.groupEnd();
  console.group("📊 Test Summary");
  logger.info(`Total: ${results.length}`);
  logger.info(`✅ Passed: ${passed}`);
  logger.info(`❌ Failed: ${failed}`);
  logger.info(`⏭️  Skipped: ${skipped}`);

  if (failed > 0) {
    console.group("❌ Failed Tests");
    results
      .filter((r) => r.status === "failed")
      .forEach((r) => {
        console.group(r.name);
        if (r.error instanceof ZodError) {
          logger.error("Zod Error Details:", r.error);
        } else if (r.error) {
          logger.error("Error Details:", r.error);
        }
        console.groupEnd();
      });
    console.groupEnd();
  }

  if (skipped > 0) {
    console.group("⏭️  Skipped Tests");
    results
      .filter((r) => r.status === "skipped")
      .forEach((r) => {
        logger.warn(`${r.name}: ${r.reason}`);
      });
    console.groupEnd();
  }

  console.groupEnd();
}
