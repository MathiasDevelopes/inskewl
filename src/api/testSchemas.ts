import { api } from "./api";
import { ZodError } from "zod";

interface TestResult {
  name: string;
  success: boolean;
  error?: ZodError;
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
      results.push({ name, success: true });
      console.log(`✅ ${name}`);
      return result;
    } catch (error) {
      if (error instanceof ZodError) {
        results.push({ name, success: false, error });
        console.error(`❌ ${name}`);
        console.error("Zod validation error:", error);
      } else {
        results.push({ name, success: false });
        console.error(`❌ ${name}`);
        console.error("Unexpected error:", error);
      }
      return null;
    }
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
  }

  // Test AttendanceApi methods
  if (academicYears && academicYears.length > 0) {
    await testApiCall("AttendanceApi.getAttendanceForSubjectGroups()", () =>
      api.attendance.getAttendanceForSubjectGroups(academicYears[0]),
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
  }

  // Summary
  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.groupEnd();
  console.group("📊 Test Summary");
  console.log(`Total: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.group("❌ Failed Tests");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.group(r.name);
        if (r.error) {
          console.error("Zod Error Details:", r.error);
        }
        console.groupEnd();
      });
    console.groupEnd();
  }

  console.groupEnd();
}
