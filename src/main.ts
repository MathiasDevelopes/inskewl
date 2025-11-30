import { api } from "./api/api";
import { Timetable } from "./types/timetable";

(async function () {
  try {
    const timeTable: Timetable = await api.timetable.getTimetable(new Date());
    timeTable.timetableItems.forEach((t) =>
      console.log(t.subject, t.mainRoom, t.startTime, t.endTime, t.teachers),
    );
  } catch (err) {
    console.log("ermmmm");
    console.log(err);
  }
})();
