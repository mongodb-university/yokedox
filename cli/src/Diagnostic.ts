export type Diagnostic = Error & {
  severity: "info" | "warning" | "error";
};
