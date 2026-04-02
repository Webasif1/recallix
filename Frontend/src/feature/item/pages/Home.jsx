import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchItems } from "../item.slice";
import AddItem from "../components/AddItemComponents";
import ItemCard from "../components/ItemCard";

export default function Home() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.items);
  console.log(items)

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  return (
    <div className="bg-black min-h-screen text-white">
      <h1 className="text-2xl p-4">Dashboard</h1>

      <AddItem />

      {loading && <p className="p-4">Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {items.map((item,idx) => (
          <ItemCard key={idx} item={item} />
        ))}
      </div>
    </div>
  );
}
