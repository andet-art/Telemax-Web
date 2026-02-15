// src/pages/CustomizePage.tsx
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { useCart } from "../context/CartContext"

// ————————————————————————————————————————————————
// 1. Define your parts arrays with their DB IDs + image URLs
// ————————————————————————————————————————————————
const starters = [
  { id: 1, imageUrl: "/starters/photo1.png" },
  { id: 2, imageUrl: "/starters/starter2.png" },
  { id: 3, imageUrl: "/starters/starter3.png" },
]
const rings = [
  { id: 4, imageUrl: "/rings/photo1.png" },
  { id: 5, imageUrl: "/rings/ring2.png" },
  { id: 6, imageUrl: "/rings/ring3.png" },
]
const tops = [
  { id: 7, imageUrl: "/tops/photo2.png" },
  { id: 8, imageUrl: "/tops/top2.png" },
  { id: 9, imageUrl: "/tops/top3.png" },
]

// ————————————————————————————————————————————————
// 2. Product type from your API
// ————————————————————————————————————————————————
interface Product {
  id: number
  name: string
  description: string
  price: number
  image_url: string
  starter_id: number
  ring_id: number
  top_id: number
}

// ————————————————————————————————————————————————
// 3. The component
// ————————————————————————————————————————————————
const CustomizePage: React.FC = () => {
  // picker indices
  const [starterIdx, setStarterIdx] = useState(0)
  const [ringIdx, setRingIdx]         = useState(0)
  const [topIdx, setTopIdx]           = useState(0)

  // fetched product for the current combo
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // optional engraving & quantity
  const [engraving, setEngraving] = useState("")
  const [quantity, setQuantity]   = useState(1)

  const navigate = useNavigate()
  const { addToCart } = useCart()

  // ——————————————————————————————
  // 4. When any picker changes, lookup via real IDs
  // ——————————————————————————————
  useEffect(() => {
    const sId = starters[starterIdx].id
    const rId = rings[ringIdx].id
    const tId = tops[topIdx].id

    setLoading(true)
    setError(null)

    fetch(`/api/products/lookup?starter=${sId}&ring=${rId}&top=${tId}`)
      .then(res => {
        if (!res.ok) throw new Error("No pipe for that combination")
        return res.json() as Promise<Product>
      })
      .then(setProduct)
      .catch(err => {
        setProduct(null)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [starterIdx, ringIdx, topIdx])

  // ——————————————————————————————
  // 5. Add to cart handler
  // ——————————————————————————————
  const handleAddToCart = () => {
    if (!product) {
      toast.error("Nothing to add!")
      return
    }
    addToCart(
      {
        id:          product.id,
        product:     product.name,
        image:       product.image_url,
        date:        new Date().toISOString().split("T")[0],
        status:      "Custom",
        customization: {
          starter:   `Starter ${starters[starterIdx].id}`,
          ring:      `Ring ${rings[ringIdx].id}`,
          top:       `Top ${tops[topIdx].id}`,
          engraving,
        },
      },
      quantity
    )
    toast.success("Custom pipe added to cart!")
    navigate("/orders")
  }

  // ——————————————————————————————
  // 6. Generic picker renderer
  // ——————————————————————————————
  const renderPicker = (
    parts: { id: number; imageUrl: string }[],
    selectedIdx: number,
    onSelect: (i: number) => void,
    label: string
  ) => (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">{label}</h2>
      <div className="flex gap-4 overflow-auto">
        {parts.map((p, i) => (
          <img
            key={p.id}
            src={p.imageUrl}
            alt={`${label} ${p.id}`}
            onClick={() => onSelect(i)}
            className={`w-24 h-24 object-contain rounded-lg cursor-pointer border-4 transition-all duration-200 ${
              selectedIdx === i ? "border-yellow-400 scale-105" : "border-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  )

  // ————————————————————————————————————————————————
  // 7. Render
  // ————————————————————————————————————————————————
  return (
    <main className="min-h-screen bg-[#1a120b] text-white p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🛠 Build Your Custom Pipe
      </h1>

      {/* Pickers */}
      {renderPicker(starters,  starterIdx, setStarterIdx, "Starter")}
      {renderPicker(rings,     ringIdx,    setRingIdx,    "Ring")}
      {renderPicker(tops,      topIdx,      setTopIdx,     "Top")}

      {/* Preview */}
      <section className="my-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Pipe</h2>
        {loading && <p>Loading…</p>}
        {error   && <p className="text-red-400">{error}</p>}
        {product && (
          <div className="inline-block p-4 bg-[#2a1d13] rounded-xl shadow-lg">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-48 h-48 object-contain mb-2"
            />
            <h3 className="font-semibold">{product.name}</h3>
            <p>${product.price.toFixed(2)}</p>
          </div>
        )}
      </section>

      {/* Engraving & Quantity */}
      <div className="mb-6">
        <label className="block mb-2 text-sm">Engraving (optional)</label>
        <input
          type="text"
          value={engraving}
          onChange={e => setEngraving(e.target.value)}
          className="w-full bg-stone-800 border-stone-600 p-3 rounded-md"
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-sm">Quantity</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
          className="w-full bg-stone-800 border-stone-600 p-3 rounded-md"
        />
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!product}
        className="w-full bg-[#c9a36a] text-black py-3 rounded-md font-semibold hover:bg-[#b8915b] disabled:opacity-50"
      >
        ➕ Add to Cart
      </button>
    </main>
  )
}

export default CustomizePage
