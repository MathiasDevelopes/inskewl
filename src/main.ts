import { api } from "./api/api";
import { Timetable } from "./types/timetable";
import { User } from "./types/user";

(async function () {
  try {
    const timeTable: Timetable = await api.user.getTimetable(new Date());
    timeTable.timetableItems.forEach((t) =>
      console.log(t.subject, t.startTime, t.endTime, t.teachers),
    );
  } catch (err) {
    console.log("ermmmm");
    console.log(err);
  }
})();
