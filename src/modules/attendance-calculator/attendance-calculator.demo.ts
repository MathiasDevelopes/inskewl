import {
  type AttendanceCalculatorController,
  AttendanceCalculatorView,
} from "./attendance-calculator.view";
import { addWeeks, startOfWeek } from "../../utils/time";
import { createAttendanceCalculatorDemoState } from "./attendance-calculator.demo-data";

function mountDemo(): void {
  const container = document.getElementById("attendance-calculator-demo");
  if (!container) return;

  let state = createAttendanceCalculatorDemoState();
  let view: AttendanceCalculatorView | null = null;

  const controller: AttendanceCalculatorController = {
    panel: null,
    contentEl: container,
    currentYear: state.currentYear,
    groups: state.groups,
    lessons: state.lessons,
    selectedWeek: state.selectedWeek,
    render: () => {
      view?.render();
    },
    changeWeek: async (offsetWeeks: number) => {
      const currentWeek = startOfWeek(new Date());
      const selectedWeek = controller.selectedWeek ?? currentWeek;
      const nextWeek = startOfWeek(addWeeks(selectedWeek, offsetWeeks));
      if (nextWeek.getTime() < currentWeek.getTime()) return;

      state = createAttendanceCalculatorDemoState(nextWeek);
      view?.setState(state);
      view?.render();
    },
  };

  view = new AttendanceCalculatorView(controller);
  view.mountInline(container, state);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountDemo);
} else {
  mountDemo();
}
