import { api } from "./api";
import { ZodError } from "zod";

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
  console.log("Starting API schema validation tests...");

  const results: TestResult[] = [];

  // Helper function to test an API call
  const testApiCall = async <T>(
    name: string,
    fn: () => Promise<T>,
  ): Promise<T | null> => {
    try {
      const result = await fn();
      results.push({ name, status: "passed" });
      console.log(`✅ ${name}`);
      return result;
    } catch (error) {
      results.push({ name, status: "failed", error });
      console.error(`❌ ${name}`);
      if (error instanceof ZodError) {
        console.error("Zod validation error:", error);
      } else {
        console.error("Unexpected error:", error);
      }
      return null;
    }
  };

  // Helper function to record a skipped test
  const skipTest = (name: string, reason: string): void => {
    results.push({ name, status: "skipped", reason });
    console.log(`⏭️  ${name} (skipped: ${reason})`);
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
  await testApiCall("TimetableApi.getAdditionalActivityDetails()", () =>
    api.timetable.getAdditionalActivityDetails(),
  );

  // Test CalendarApi methods
  const academicYears = await testApiCall("CalendarApi.getAcademicYears()", () =>
    api.calendar.getAcademicYears(),
  );

  // Test getDayCount with the first academic year if available
  if (academicYears && academicYears.length > 0) {
    await testApiCall("CalendarApi.getDayCount()", () =>
      api.calendar.getDayCount(academicYears[0]),
    );
  } else {
    skipTest("CalendarApi.getDayCount()", "no academic years available");
  }

  // Test AttendanceApi methods
  if (academicYears && academicYears.length > 0) {
    await testApiCall("AttendanceApi.getAttendanceForSubjectGroups()", () =>
      api.attendance.getAttendanceForSubjectGroups(academicYears[0]),
    );
  } else {
    skipTest(
      "AttendanceApi.getAttendanceForSubjectGroups()",
      "no academic years available",
    );
  }

  // Test SchoolApi methods
  await testApiCall("SchoolApi.getCurrent()", () => api.school.getCurrent());

  // Test AssessmentApi methods
  await testApiCall("AssessmentApi.getBehaviour()", () =>
    api.assessment.getBehaviour(),
  );
  await testApiCall("AssessmentApi.getRemarkLimit()", () =>
    api.assessment.getRemarkLimit(),
  );

  // Test InboxApi methods
  await testApiCall("InboxApi.getMessages()", () => api.inbox.getMessages());
  await testApiCall("InboxApi.getNewCount()", () => api.inbox.getNewCount());

  // Test EventsApi methods
  const events = await testApiCall("EventsApi.getEvents()", () =>
    api.events.getEvents(),
  );

  // Also test getEvent with the first event if available
  if (events && events.length > 0) {
    await testApiCall(`EventsApi.getEvent(${events[0].id})`, () =>
      api.events.getEvent(events[0].id),
    );
  } else {
    skipTest("EventsApi.getEvent(id)", "no events available");
  }

  // Summary
  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;

  console.groupEnd();
  console.group("📊 Test Summary");
  console.log(`Total: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);

  if (failed > 0) {
    console.group("❌ Failed Tests");
    results
      .filter((r) => r.status === "failed")
      .forEach((r) => {
        console.group(r.name);
        if (r.error instanceof ZodError) {
          console.error("Zod Error Details:", r.error);
        } else if (r.error) {
          console.error("Error Details:", r.error);
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
        console.log(`${r.name}: ${r.reason}`);
      });
    console.groupEnd();
  }

  console.groupEnd();
}
