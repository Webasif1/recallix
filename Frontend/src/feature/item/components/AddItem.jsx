import { useState } from "react";
import { useDispatch } from "react-redux";
import { addItem } from "../item.slice";

export default function AddItem() {
  const [url, setUrl] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url) return;

    dispatch(addItem(url));
    setUrl("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 p-4 bg-zinc-900"
    >
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste URL..."
        className="flex-1 p-2 rounded text-white"
      />
      <button className="bg-white text-black px-4 rounded">
        Save
      </button>
    </form>
  );
}
