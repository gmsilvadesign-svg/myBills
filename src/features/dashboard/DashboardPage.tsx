import LegacyDashboard from "@/app/LegacyDashboard";
import { DashboardLayout } from "@/features/dashboard/layout/DashboardLayout";
import * as Types from "@/types";

export interface DashboardPageProps {
  activeBookId: string;
  books: Types.Book[];
  onSelectBook: (bookId: string) => void;
  onCreateBook: (name?: string) => Promise<void> | void;
  onDeleteBook: (bookId: string) => Promise<void> | void;
}

export function DashboardPage(props: DashboardPageProps) {
  return (
    <DashboardLayout>
      <LegacyDashboard {...props} />
    </DashboardLayout>
  );
}

