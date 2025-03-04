import { Can } from "@/components/can";
import { LogoutButton } from "@/components/logout-button";

export default function DashboardPage() {
  return (
    <main>
      <Can actions={["dashboard:view"]}>
        <div>Dashboard</div>
        <LogoutButton />
      </Can>
      <h2>Isso aqui pode ver</h2>
    </main>
  );
}
