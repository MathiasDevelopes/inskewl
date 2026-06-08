import {
  type AttendanceCalculatorController,
  AttendanceCalculatorView,
} from "./attendance-calculator.view";
import { createAttendanceCalculatorDemoState } from "./attendance-calculator.demo-data";

function mountDemo(): void {
  const container = document.getElementById("attendance-calculator-demo");
  if (!container) return;

  const state = createAttendanceCalculatorDemoState();
  let view: AttendanceCalculatorView | null = null;

  const controller: AttendanceCalculatorController = {
    panel: null,
    contentEl: container,
    currentYear: state.currentYear,
    groups: state.groups,
    lessons: state.lessons,
    render: () => {
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
