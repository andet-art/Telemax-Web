// src/components/Gallery.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import LazyLoad from "react-lazyload";

// 📦 Props
interface GalleryProps {
  images: string[];
  selectedImg: string | null;
  setSelectedImg: (src: string | null) => void;
  t: (key: string) => string;
}

const Gallery: React.FC<GalleryProps> = ({ images, selectedImg, setSelectedImg, t }) => {
  return (
    <section className="py-24 px-4 sm:px-6 bg-[#231a13] text-center">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-14 text-white reveal">
        {t("home.gallery_title")}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
        {images.map((src, i) => (
          <LazyLoad key={i} height={200} offset={100} once>
            <motion.div
              className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer"
              onClick={() => setSelectedImg(src)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <img
                src={src}
                alt={`Gallery image ${i + 1}`}
                className="w-full h-48 sm:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          </LazyLoad>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4"
            onClick={() => setSelectedImg(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={selectedImg}
              alt="Preview"
              className="max-w-3xl w-full rounded-xl shadow-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
