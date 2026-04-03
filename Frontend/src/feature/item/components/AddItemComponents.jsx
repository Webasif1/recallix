import { useState } from "react";
import { useDispatch } from "react-redux";
import { addItem } from "../item.slice";
import { Link2, CheckCircle2 } from "lucide-react";

export default function AddItem() {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setIsSubmitting(true);
    try {
      await dispatch(addItem(url));
      setUrl("");
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/article-to-archive"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#F45B26] transition-colors"
          required
          disabled={isSubmitting}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#F45B26] hover:bg-[#F45B26]/80 disabled:bg-[#F45B26]/50 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#F45B26]/20 text-sm sm:text-base"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Archiving...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Archive</span>
          </>
        )}
      </button>
    </form>
  );
}
