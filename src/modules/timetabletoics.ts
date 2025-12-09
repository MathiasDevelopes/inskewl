import { onDomReady } from "./core/DOMHelper";
import { VismaModule } from "./core/VismaModule";

export class TimetableToICS extends VismaModule {
  name: string = "TimetableToICS";

  shouldLoad(url: string): boolean {
    return url.includes("dashboard");
  }

  load(): void {
    onDomReady(() => {
      const btn = document.createElement("button");
      btn.id = "timetabletoics";
      btn.textContent = "export ze calendar";
      btn.addEventListener("click", () => {
        alert("you clicked this button");
      });
      document.body.appendChild(btn);
    });
  }

  unload(): void {
    const btn = document.getElementById("timetabletoics");
    btn?.remove();
  }

  /* Converts a visma style date string dd/mm/yyyy and time 00:00 into a date object. */
  private makeDate(date: string, time: string): Date {
    const [d, m, y] = date.split("/");
    const [h, min] = time.split(":");

    return new Date(
      Number(y),
      Number(m) - 1, // for index
      Number(d),
      Number(h),
      Number(min),
    );
  }
}
