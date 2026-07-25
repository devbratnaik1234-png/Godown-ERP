export default function FarmerSearch({ search, setSearch }) {
  return (
    <input
      type="text"
      placeholder="Search Farmer..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border rounded-lg px-4 py-2 w-64"
    />
  );
}