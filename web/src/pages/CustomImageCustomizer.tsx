import { useState } from "react";

const starters = ["photo1.jpg", "starter2", "starter3"];
const rings = ["photo2.jpg", "ring2", "ring3"];
const tops = ["photo3.jpg", "top2", "top3"];

const CustomImageCustomizer = () => {
  const [starter, setStarter] = useState("photo1.jpg");
  const [ring, setRing] = useState("photo2.jpg");
  const [top, setTop] = useState("photo3.jpg");

  const combinationPath = `/combinations/${starter}-${ring}-${top}.jpg`;

  return (
    <main className="min-h-screen bg-[#1a120b] text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6">Customize Your Pipe</h1>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-6xl mb-10">
        {/* Starter Selector */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-center">Starter</h2>
          <div className="grid grid-cols-1 gap-4">
            {starters.map((s) => (
              <img
                key={s}
                src={`/starters/${s}.jpg`}
                alt={s}
                className={`w-full h-48 object-cover cursor-pointer rounded-xl border-4 transition-all duration-300 ${
                  starter === s ? "border-yellow-500 scale-105" : "border-transparent"
                }`}
                onClick={() => setStarter(s)}
              />
            ))}
          </div>
        </div>

        {/* Ring Selector */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-center">Ring</h2>
          <div className="grid grid-cols-1 gap-4">
            {rings.map((r) => (
              <img
                key={r}
                src={`/rings/${r}.jpg`}
                alt={r}
                className={`w-full h-48 object-cover cursor-pointer rounded-xl border-4 transition-all duration-300 ${
                  ring === r ? "border-yellow-500 scale-105" : "border-transparent"
                }`}
                onClick={() => setRing(r)}
              />
            ))}
          </div>
        </div>

        {/* Top Selector */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-center">Top</h2>
          <div className="grid grid-cols-1 gap-4">
            {tops.map((t) => (
              <img
                key={t}
                src={`/tops/${t}.jpg`}
                alt={t}
                className={`w-full h-48 object-cover cursor-pointer rounded-xl border-4 transition-all duration-300 ${
                  top === t ? "border-yellow-500 scale-105" : "border-transparent"
                }`}
                onClick={() => setTop(t)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Final Preview */}
      <div className="w-full max-w-3xl p-4 bg-[#2a1d13] rounded-xl shadow-lg border border-stone-700">
        <h2 className="text-2xl font-semibold mb-4 text-center">Final Product</h2>
        <img
          src={combinationPath}
          alt="Final Pipe"
          className="w-full h-[400px] object-contain rounded-xl border border-stone-600 shadow-md"
          onError={(e) => ((e.target as HTMLImageElement).src = "/fallback.jpg")}
        />
      </div>
    </main>
  );
};

export default CustomImageCustomizer;
