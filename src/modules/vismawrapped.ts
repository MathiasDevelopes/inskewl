import { api } from "../api/api";
import { Timetable } from "../api/types/timetable";
import { VismaModule } from "./core/VismaModule";

export class VismaWrapped extends VismaModule {
  name: string = "VismaWrapped";

  shouldLoad(url: string): boolean {
    return url.includes("dashboard"); // can load on any, but we load it on dashboard.
  }

  // can we do asynchronous function if the module loader dosent use async for now?
  async load(): Promise<void> {
    // for current week
    const timetable = await api.timetable.getTimetable(new Date());

    const teacherHeatMap = this.getTeacherWithMostOccurances(timetable);
    const sortedTeachers = Object.entries(teacherHeatMap).sort(
      ([, a], [, b]) => b - a,
    ); // sort for teacher count

    let alertString = "";

    // console.group("Visma Wrapped");
    // extract teacher and count for each occurence in the teachermap.
    // console.group("Your teachers (sorted by occurance)");
    // sortedTeachers.forEach(([teacher, count]) => {
    //   console.log(`${teacher} med ${count} timer.`);
    // });
    // console.groupEnd();
    //
    sortedTeachers.forEach(([teacher, count]) => {
      alertString += `${teacher} med ${count} timer.\n`;
    });

    alert(alertString);

    // console.groupEnd();
  }

  private getTeacherWithMostOccurances(
    timetable: Timetable,
  ): Record<string, number> {
    // teacher mapping for name to number of lessons
    const teacherMap: Record<string, number> = {};
    timetable.timetableItems.forEach((timetableItem) => {
      timetableItem.teachers?.forEach((teacher) => {
        teacherMap[teacher] = (teacherMap[teacher] ?? 0) + 1;
      });
    });

    return teacherMap;
  }
}
