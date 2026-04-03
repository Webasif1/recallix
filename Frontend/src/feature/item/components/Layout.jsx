import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <header className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-medium">Dashboard</h1>

          <div className="text-sm text-zinc-400">
            Your saved knowledge
          </div>
        </header>

        {/* Content */}
        <main className="p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
