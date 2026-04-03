export default function Sidebar() {
  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 hidden md:flex flex-col p-4">

      <h2 className="text-lg font-semibold mb-6">Recallix</h2>

      <nav className="flex flex-col gap-2 text-sm">
        <button className="text-left px-3 py-2 rounded-lg bg-zinc-800">
          Dashboard
        </button>

        <button className="text-left px-3 py-2 rounded-lg hover:bg-zinc-800 transition">
          Collections
        </button>

        <button className="text-left px-3 py-2 rounded-lg hover:bg-zinc-800 transition">
          Tags
        </button>
      </nav>

      <div className="mt-auto text-xs text-zinc-500">
        v1.0
      </div>
    </aside>
  );
}
