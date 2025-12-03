import { api } from "../api/api";
import { onDomReady } from "./core/DOMHelper";
import { VismaModule } from "./core/VismaModule";

export class TestModule extends VismaModule {
  name = "testmodule";
  originalColor: string = "";

  shouldLoad(url: string): boolean {
    return url.endsWith("dashboard/"); // for now
  }

  async load(): Promise<void> {
    const timetable = await api.timetable.getTimetable(new Date());

    const teacherCounts: Record<string, number> = {};
    let totalTeachers = 0;

    timetable.timetableItems.forEach((t) => {
      t.teachers.forEach((teacher) => {
        totalTeachers++;
        teacherCounts[teacher] = (teacherCounts[teacher] || 0) + 1;
      });
    });

    console.log("Total teacher occurrences:", totalTeachers);

    // find teacher with most occurrences
    let maxTeacher = "";
    let maxCount = 0;

    for (const [teacher, count] of Object.entries(teacherCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxTeacher = teacher;
      }
    }

    console.log(
      "Teacher with most occurrences:",
      maxTeacher,
      "(",
      maxCount,
      ")",
    );
    onDomReady(() => {
      this.originalColor = document.body.style.backgroundColor;
      document.body.style.backgroundColor = "#ffcccc";
    });
  }

  unload(): void {
    document.body.style.backgroundColor = this.originalColor;
    console.log("test unloaded");
  }
}
