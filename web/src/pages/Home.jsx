import { useEffect, useState } from "react";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load categories");
        return res.json();
      })
      .then(setCategories)
      .catch((err) => setError(err.message));
      console.log("Fetching categories" + categories);
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!categories.length) return <div>Loading...</div>;

  return (
    <div>
      <h3>Categories</h3>
      {categories.map((c) => (
        <div key={c}>{c}</div>
      ))}
    </div>
  );
}
