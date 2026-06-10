import { api } from "./api";
import { ZodError } from "zod";
import { createLogger } from "../utils/logger";

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
    api.user.getCurrentUser(),
  );
  await testApiCall("UserApi.getPersonalInfo()", () =>
    api.user.getPersonalInfo(),
  );
  await testApiCall("UserApi.getMaturity()", () => api.user.getMaturity());

  // Test TimetableApi methods
  await testApiCall("TimetableApi.getTimetable()", () =>
    api.timetable.getTimetable(new Date()),
  );
  // Skipping postAdditionalActivityDetails - requires activityTimeslotIds parameter
  skipTest(
    "TimetableApi.postAdditionalActivityDetails()",
    "requires activityTimeslotIds parameter - needs dedicated test",
  );

  // Test CalendarApi methods
  const academicYears = await testApiCall("CalendarApi.getAcademicYears()", () =>
    api.calendar.getAcademicYears(),
  );

  // Test getDayCount with the first academic year if available
  if (academicYears && academicYears.length > 0) {
    const firstAcademicYear = academicYears[0];
    if (!firstAcademicYear) {
      skipTest("CalendarApi.getDayCount()", "no academic years available");
    } else {
      await testApiCall("CalendarApi.getDayCount()", () =>
        api.calendar.getDayCount(firstAcademicYear),
      );
    }
  } else {
    skipTest("CalendarApi.getDayCount()", "no academic years available");
  }

  // Test AttendanceApi methods
  await testApiCall("AttendanceApi.getAbsenceOverview()", () =>
    api.attendance.getAbsenceOverview(),
  );
  await testApiCall("AttendanceApi.getAbsenceCodesByTeachingGroups()", () =>
    api.attendance.getAbsenceCodesByTeachingGroups(),
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
        () => api.attendance.getAttendanceForSubjectGroups(firstAcademicYear),
      );
      if (attendanceGroups && attendanceGroups.length > 0) {
        await testApiCall("AttendanceApi.getLessonAttendancesForTeachingGroups()", () =>
          api.attendance.getLessonAttendancesForTeachingGroups(
            firstAcademicYear,
            attendanceGroups.map((g) => g.subjectGroupId),
          ),
        );
      } else {
        skipTest(
          "AttendanceApi.getLessonAttendancesForTeachingGroups()",
          "no attendance subject groups available",
        );
      }
      await testApiCall("AttendanceApi.getDiplomaAbsences()", () =>
        api.attendance.getDiplomaAbsences(firstAcademicYear),
      );
      await testApiCall("AttendanceApi.getDiplomaAbsencesForTerm(1)", () =>
        api.attendance.getDiplomaAbsencesForTerm(firstAcademicYear, 1),
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
  await testApiCall("SchoolApi.getCurrent()", () => api.school.getCurrent());

  // Test TenantApi methods
  await testApiCall("TenantApi.getTenantlist()", () => api.tenant.getTenantlist());

  // Test AssessmentApi methods
  await testApiCall("AssessmentApi.getBehaviour()", () =>
    api.assessment.getBehaviour(),
  );
  await testApiCall("AssessmentApi.getRemarkLimit()", () =>
    api.assessment.getRemarkLimit(),
  );

  // Test ExamsApi methods
  await testApiCall("ExamsApi.getGroups()", () => api.exams.getGroups());

  // Test InboxApi methods
  await testApiCall("InboxApi.getMessages()", () => api.inbox.getMessages());
  await testApiCall("InboxApi.getNewCount()", () => api.inbox.getNewCount());

  // Test EventsApi methods
  const events = await testApiCall("EventsApi.getEvents()", () =>
    api.events.getEvents(),
  );

  await testApiCall("LoginPageApi.getLoginPage()", () =>
    api.loginPage.getLoginPage(),
  );

  // Also test getEvent with the first event if available
  if (events && events.length > 0) {
    const firstEvent = events[0];
    if (!firstEvent) {
      skipTest("EventsApi.getEvent(id)", "no events available");
    } else {
      await testApiCall(`EventsApi.getEvent(${firstEvent.id})`, () =>
        api.events.getEvent(firstEvent.id),
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
