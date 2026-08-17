import AccountSidebar from "@/components/layout/sider-bar";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
        {/* Left Navigation Sidebar */}
        <AccountSidebar />

        {/* Main Content Area */}
        <main className="flex-1 bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm w-full">
          {children}
        </main>
      </div>
    </div>
  );
}