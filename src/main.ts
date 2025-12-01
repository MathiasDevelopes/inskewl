import { api } from "./api/api";
import { AttendanceSubjectGroup } from "./types/attendance";
import { AcademicYear } from "./types/calendar";
import { Timetable } from "./types/timetable";

(async function () {
  try {
    const timeTable: Timetable = await api.timetable.getTimetable(new Date());
    timeTable.timetableItems.forEach((t) =>
      console.log(t.subject, t.mainRoom, t.startTime, t.endTime, t.teachers),
    );

    const academicYears = await api.calendar.getAcademicYears();
    if (!academicYears?.length) {
      console.error("no academic years returned");
      return;
    }

    const attendance = await api.attendance.getAttendanceForSubjectGroups(
      academicYears[0],
    );
    console.log(attendance[0].totalAbsence);
  } catch (err) {
    console.log("ermmmm");
    console.log(err);
  }
})();
