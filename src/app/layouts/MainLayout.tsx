import { Outlet } from "react-router-dom";

import Sidebar from "../../shared/components/Sidebar";

function MainLayout() {
  return (
    <div className="flex min-h-screen bg-[#FFF8F2]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;