export default function Role() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center h-screen gap-5">
        <div>Choose your role:</div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Fan
        </button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Creator
        </button>
      </div>
    </div>
  );
}