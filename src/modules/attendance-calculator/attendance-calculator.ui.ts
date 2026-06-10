import type { SubjectAbsenceInfo } from "./attendance-calculator.helpers";

export const BADGE_ATTR = "data-inskewl-badge";

export const ATTENDANCE_STATUS_LABELS = {
  ok: "OK",
  warning: "Advarsel",
  exceeded: "Over grensen",
} as const;

const ATTENDANCE_STATUS_COLORS = {
  ok: "#4caf50",
  warning: "#ff9800",
  exceeded: "#f44336",
} as const;

const ATTENDANCE_UI_COLORS = {
  ...ATTENDANCE_STATUS_COLORS,
  blocked: "#9ca3af",
  neutral: "#607d8b",
} as const;

export function statusColor(status: SubjectAbsenceInfo["status"]): string {
  return ATTENDANCE_UI_COLORS[status];
}

export function statusBadgeClass(
  status: SubjectAbsenceInfo["status"],
): string {
  switch (status) {
    case "exceeded":
      return "inskewl-badge-danger";
    case "warning":
      return "inskewl-badge-warning";
    case "ok":
      return "inskewl-badge-ok";
  }
}

export function vismaBadgeColor(options: {
  safe: boolean;
  nearLimit: boolean;
}): string {
  if (!options.safe) return ATTENDANCE_UI_COLORS.exceeded;
  if (options.nearLimit) return ATTENDANCE_UI_COLORS.warning;
  return ATTENDANCE_UI_COLORS.ok;
}

export function lessonDotColor(options: {
  canSimulate: boolean;
  safe: boolean;
  blocked: boolean;
  countsTowardsLimit: boolean;
}): string {
  if (options.canSimulate) {
    return options.safe
      ? ATTENDANCE_UI_COLORS.ok
      : ATTENDANCE_UI_COLORS.exceeded;
  }

  if (options.blocked) return ATTENDANCE_UI_COLORS.blocked;
  return options.countsTowardsLimit
    ? ATTENDANCE_UI_COLORS.warning
    : ATTENDANCE_UI_COLORS.neutral;
}
