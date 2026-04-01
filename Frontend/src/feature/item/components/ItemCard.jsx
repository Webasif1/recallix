import { useDispatch } from "react-redux";
import { deleteItem } from "../item.slice";

export default function ItemCard({ item }) {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteItem(item._id));
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-lg shadow relative">

      {/* ❌ Delete button */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 text-red-500"
      >
        ✕
      </button>

      <h3 className="text-lg font-semibold">{item.title}</h3>

      <p className="text-sm text-gray-400 mt-1">
        {item.collection}
      </p>

      <p className="text-sm mt-2 text-gray-300">
        {item.summary}
      </p>

      <div className="flex gap-2 mt-2 flex-wrap">
        {item.tags?.map((tag, i) => (
          <span
            key={i}
            className="text-xs bg-white text-black px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
