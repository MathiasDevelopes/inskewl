import { api } from "../src/api/api";
import { Timetable } from "../src/api/types/timetable";

(async function () {
  try {
    const timeTable: Timetable = await api.timetable.getTimetable(
      new Date(3, 11, 2025),
    );
    timeTable.timetableItems.forEach((t) =>
      console.log(t.subject, t.mainRoom, t.startTime, t.endTime, t.teachers),
    );
  } catch (err) {
    console.log("ermmmm");
    console.log(err);
  }
})();
