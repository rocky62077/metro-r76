export type TestReportStatus =
  | "draft"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "completed";

export type UserRole =
  | "admin"
  | "engineer"
  | "reviewer"
  | "lab_manager"
  | "viewer"
  | "auditor";

interface WorkflowTransition {
  from: TestReportStatus;
  to: TestReportStatus;
  allowedRoles: UserRole[];
}

const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  {
    from: "draft",
    to: "in_progress",
    allowedRoles: ["admin", "engineer"],
  },
  {
    from: "in_progress",
    to: "submitted",
    allowedRoles: ["admin", "engineer"],
  },
  {
    from: "submitted",
    to: "under_review",
    allowedRoles: ["admin", "reviewer", "lab_manager"],
  },
  {
    from: "under_review",
    to: "approved",
    allowedRoles: ["admin", "reviewer", "lab_manager"],
  },
  {
    from: "under_review",
    to: "rejected",
    allowedRoles: ["admin", "reviewer", "lab_manager"],
  },
  {
    from: "rejected",
    to: "in_progress",
    allowedRoles: ["admin", "engineer"],
  },
  {
    from: "approved",
    to: "completed",
    allowedRoles: ["admin", "lab_manager"],
  },
];

export const canTransition = (
  currentStatus: TestReportStatus,
  nextStatus: TestReportStatus,
  role: UserRole,
): boolean => {
  const transition = WORKFLOW_TRANSITIONS.find(
    (item) => item.from === currentStatus && item.to === nextStatus,
  );

  if (!transition) {
    return false;
  }

  return transition.allowedRoles.includes(role);
};

export const validateTransition = (
  currentStatus: TestReportStatus,
  nextStatus: TestReportStatus,
  role: UserRole,
): void => {
  if (!canTransition(currentStatus, nextStatus, role)) {
    throw new Error(
      `Invalid workflow transition: ${currentStatus} -> ${nextStatus} for role ${role}`,
    );
  }
};

export const getAvailableTransitions = (
  currentStatus: TestReportStatus,
  role: UserRole,
): TestReportStatus[] => {
  return WORKFLOW_TRANSITIONS.filter(
    (transition) =>
      transition.from === currentStatus &&
      transition.allowedRoles.includes(role),
  ).map((transition) => transition.to);
};
