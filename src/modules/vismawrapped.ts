import { api } from "../api/api";
import { Timetable } from "../api/types/timetable";
import { onDomReady } from "./core/DOMHelper";
import { VismaModule } from "./core/VismaModule";

export class VismaWrapped extends VismaModule {
  name: string = "VismaWrapped";

  shouldLoad(url: string): boolean {
    return url.includes("dashboard"); // can load on any, but we load it on dashboard.
  }

  // can we do asynchronous function if the module loader dosent use async for now?
  async load(): Promise<void> {
    onDomReady(() => {
      const btn = document.createElement("button");
      btn.id = "vismawrapped";
      btn.textContent = "Show your wrapped";
      btn.addEventListener("click", this.alertTeachers.bind(this));
      document.body.appendChild(btn);
    });

    // console.groupEnd();
  }

  unload(): void {
    const btn = document.getElementById("vismawrapped");
    btn?.remove();
  }

  private async alertTeachers(): Promise<void> {
    // for current week
    const timetable = await api.timetable.getTimetable(new Date());

    const teacherHeatMap = this.getTeachersAndOccurances(timetable);
    const sortedTeachers = this.sortTeachersByHours(teacherHeatMap);

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
      alertString += `${teacher} med ${count} skoletimer.\n`;
    });

    alert(alertString);

    // console.groupEnd();
  }

  // Returns a Record<string, number> type of the teacher's name and occurences in the timetable.
  private getTeachersAndOccurances(
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

  // Takes input of Record<string, number>, where string is the teacher's name and number is the occurances, and sorts them by the occurance count.
  private sortTeachersByHours(teacherHeatMap: Record<string, number>) {
    const sortedTeachers = Object.entries(teacherHeatMap).sort(
      ([, a], [, b]) => b - a,
    ); // sort for teacher count

    return sortedTeachers;
  }
}
