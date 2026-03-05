import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-x-hidden">
        <Header />
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 size-16 bg-gradient-to-br from-primary to-accent text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group">
        <span className="material-symbols-outlined text-3xl">smart_toy</span>
      </button>
    </div>
  );
};

export default DashboardLayout;
