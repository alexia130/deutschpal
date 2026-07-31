import type { ReactNode } from "react";

import Card from "./Card";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  description?: string;
}

function StatCard({
  icon,
  title,
  value,
  description,
}: StatCardProps) {
  return (
    <Card className="flex items-start gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF3E8]">
        {icon}
      </div>

      <div>
        <p className="text-sm text-gray-500">
          {title}
        </p>

        <h3 className="mt-1 text-3xl font-bold text-gray-900">
          {value}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}

export default StatCard;