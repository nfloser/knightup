import { CoachPage } from "./CoachPage";
export function InsightsPage({
  count,
  onSessionChange,
}: {
  count: number;
  onSessionChange: (active: boolean) => void;
}) {
  return <CoachPage count={count} onSessionChange={onSessionChange} />;
}
