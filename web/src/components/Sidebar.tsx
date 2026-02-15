import { Layers, X, Menu, ChevronRight, Palette, RotateCcw, Filter, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState, useCallback } from "react";

interface PipePart {
  id: number;
  name: string;
  material?: string;
  price: number;
  image?: string;
}

interface SidebarProps {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (state: boolean) => void;
  navbarHidden: boolean;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categoriesList: string[];
  setCurrentPage: (page: number) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  selectedHead: PipePart | null;
  selectedRing: PipePart | null;
  selectedTail: PipePart | null;
  getCustomPipeTotal: () => number;
  resetCustomPipe: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarExpanded,
  setIsSidebarExpanded,
  navbarHidden,
  selectedCategory,
  setSelectedCategory,
  categoriesList,
  setCurrentPage,
  activeSection,
  setActiveSection,
  selectedHead,
  selectedRing,
  selectedTail,
  getCustomPipeTotal,
  resetCustomPipe,
  isMobile = false,
}) => {
  const { t } = useTranslation();
  const sidebarRef = useRef<HTMLElement>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [sidebarHidden, setSidebarHidden] = useState(false);

  // Scroll behavior - matches navbar exactly
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          
          // Follow navbar behavior exactly
          const showSidebar = currentScroll < lastScrollY || currentScroll < 10;
          setSidebarHidden(!showSidebar);
          setLastScrollY(currentScroll);
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Click outside handler - optimized
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarExpanded &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-sidebar-toggle]')
      ) {
        setIsSidebarExpanded(false);
      }
    };

    if (isSidebarExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll on mobile when sidebar is open
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarExpanded, setIsSidebarExpanded, isMobile]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isSidebarExpanded) {
        setIsSidebarExpanded(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarExpanded, setIsSidebarExpanded]);

  // Optimized category selection with navigation
  const handleCategorySelect = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    
    // Always close sidebar after selection
    setIsSidebarExpanded(false);
    
    // Optional: Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setSelectedCategory, setCurrentPage, setIsSidebarExpanded]);

  // Section toggle handler with sidebar close
  const handleSectionToggle = useCallback((section: string) => {
    setActiveSection(section);
    // Close sidebar after section change for clean UX
    setTimeout(() => setIsSidebarExpanded(false), 300);
  }, [setActiveSection, setIsSidebarExpanded]);

  // Calculate progress percentage for custom builder
  const customProgress = (selectedHead ? 33 : 0) + (selectedRing ? 33 : 0) + (selectedTail ? 34 : 0);

  return (
    <>
      {/* Backdrop Overlay - Between navbar and sidebar */}
      <AnimatePresence>
        {isSidebarExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
            onClick={() => setIsSidebarExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Toggle Button - Always available when sidebar is closed */}
      <AnimatePresence>
        {!isSidebarExpanded && (
          <motion.button
            initial={{ x: -60, opacity: 0 }}
            animate={{ 
              x: isMobile ? (sidebarHidden ? -60 : 0) : 0,
              opacity: isMobile ? (sidebarHidden ? 0 : 1) : 1,
              y: isMobile ? (sidebarHidden ? "-100%" : "0%") : "0%"
            }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            onClick={() => setIsSidebarExpanded(true)}
            data-sidebar-toggle
            className={`fixed z-40 group touch-manipulation transition-all duration-300 ${
              isMobile 
                ? 'top-20 left-0' 
                : 'top-20 left-0' // Desktop: positioned below navbar
            }`}
            aria-label="Open sidebar"
          >
            <div className="bg-gradient-to-r from-[#1a120b] to-[#2a1d13] hover:from-[#2a1d13] hover:to-[#3a2d23] border-r border-[#c9a36a]/20 text-white flex items-center justify-center w-10 sm:w-12 h-12 sm:h-14 cursor-pointer transition-all duration-300 rounded-tr-xl rounded-br-xl shadow-xl hover:shadow-2xl hover:border-[#c9a36a]/40">
              <div className="flex flex-col items-center gap-1">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-[#c9a36a] group-hover:text-white transition-colors duration-300" />
                {isMobile && (
                  <span className="text-[8px] text-[#c9a36a] group-hover:text-white font-medium">
                    {t("filters")}
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar Panel - Above navbar when open */}
      <motion.aside
        ref={sidebarRef}
        initial={false}
        animate={{
          x: isSidebarExpanded ? 0 : (isMobile ? -320 : -280),
          opacity: isSidebarExpanded ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          opacity: { duration: 0.2 }
        }}
        className={`
          fixed z-[60] bg-gradient-to-b from-[#1a120b] via-[#1f1611] to-[#1a120b] 
          border-r border-[#c9a36a]/30 shadow-2xl overflow-hidden transition-all duration-300
          top-0 bottom-0 left-0
          ${isMobile 
            ? 'w-80 rounded-tr-2xl rounded-br-2xl' 
            : 'w-72' // Desktop: covers full left side, no rounded corners
          }
        `}
        style={{ 
          willChange: 'transform, opacity',
          // Full height coverage from top to bottom
          height: '100vh',
          // No padding needed since sidebar is above navbar
          paddingTop: '0',
        }}
      >
        <AnimatePresence>
          {isSidebarExpanded && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="relative text-white h-full flex flex-col"
            >
              {/* Header - Full coverage from top */}
              <div className="px-4 sm:px-6 border-b border-[#2a1d13]/50 pt-6 pb-4">
                <div className="flex items-center justify-between">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#c9a36a] to-[#b8915b] rounded-lg shadow-lg">
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {activeSection === "commercial" 
                          ? t("sidebar_categories", "Shop Categories")
                          : t("custom_builder", "Pipe Builder")
                        }
                      </h3>
                      <p className="text-[10px] sm:text-xs text-stone-400">
                        {activeSection === "commercial" 
                          ? t("browse_by_type", "Browse by type")
                          : t("build_custom", "Build your custom pipe")
                        }
                      </p>
                    </div>
                  </motion.div>

                  {/* Close button for both mobile and desktop */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSidebarExpanded(false)}
                    className="p-2 rounded-xl bg-[#2a1d13] hover:bg-[#3a2d23] text-stone-400 hover:text-[#c9a36a] transition-all duration-200 touch-manipulation"
                    aria-label="Close sidebar"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Section Toggle - Enhanced */}
              <div className="px-4 sm:px-6 mt-3 sm:mt-4 mb-2">
                <div className="flex bg-[#2a1d13]/80 backdrop-blur-sm rounded-xl p-1 shadow-inner">
                  <button
                    onClick={() => handleSectionToggle("commercial")}
                    className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 text-xs sm:text-sm rounded-lg transition-all duration-200 font-medium touch-manipulation ${
                      activeSection === "commercial" 
                        ? "bg-[#c9a36a] text-black shadow-md transform scale-[1.02]" 
                        : "text-white hover:bg-[#3a2d23] hover:text-[#c9a36a]"
                    }`}
                  >
                    {t("commercial", "Commercial")}
                  </button>
                  <button
                    onClick={() => handleSectionToggle("custom")}
                    className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 text-xs sm:text-sm rounded-lg transition-all duration-200 font-medium touch-manipulation ${
                      activeSection === "custom" 
                        ? "bg-[#c9a36a] text-black shadow-md transform scale-[1.02]" 
                        : "text-white hover:bg-[#3a2d23] hover:text-[#c9a36a]"
                    }`}
                  >
                    {t("custom", "Custom")}
                  </button>
                </div>
              </div>

              {/* Content Area - Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#c9a36a]/20 scrollbar-track-transparent">
                
                {/* Commercial Categories */}
                {activeSection === "commercial" && (
                  <div className="py-2 px-3 sm:px-4 space-y-2">
                    <div className="mb-4">
                      <p className="text-xs text-stone-500 uppercase tracking-wider px-2 mb-3">
                        {t("product_categories", "Product Categories")}
                      </p>
                    </div>
                    
                    {categoriesList.map((cat, index) => {
                      const isSelected = selectedCategory === cat;
                      return (
                        <motion.div
                          key={cat}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 + (index * 0.05), duration: 0.3, type: "spring" }}
                        >
                          <motion.button
                            whileHover={{ x: isMobile ? 0 : 4, scale: isMobile ? 0.98 : 1 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleCategorySelect(cat)}
                            className={`
                              w-full text-left px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl transition-all duration-200
                              flex items-center justify-between group relative overflow-hidden touch-manipulation
                              ${isSelected
                                ? "bg-gradient-to-r from-[#c9a36a]/20 to-[#c9a36a]/10 text-[#c9a36a] border border-[#c9a36a]/30 shadow-lg transform scale-[1.02]"
                                : "text-stone-300 hover:text-white hover:bg-[#2a1d13]/50 border border-transparent hover:border-[#2a1d13] hover:shadow-md"
                              }
                            `}
                          >
                            <span className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                isSelected ? "bg-[#c9a36a]" : "bg-stone-500 group-hover:bg-[#c9a36a]"
                              }`} />
                              <span className="font-medium text-sm sm:text-base truncate">
                                {t(`cat_${cat.toLowerCase()}`, cat)}
                              </span>
                            </span>
                            <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 transition-all duration-200 ${
                              isSelected 
                                ? "text-[#c9a36a] translate-x-1" 
                                : "text-stone-500 group-hover:text-[#c9a36a] group-hover:translate-x-1"
                            }`} />
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Custom Builder Progress - Enhanced */}
                {activeSection === "custom" && (
                  <div className="p-3 sm:p-4 space-y-4">
                    
                    {/* Progress Overview */}
                    <div className="bg-[#2a1d13]/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-[#3a2d23]">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[#c9a36a] font-semibold text-sm sm:text-base">
                          {t("build_progress", "Build Progress")}
                        </p>
                        <span className="text-xs sm:text-sm text-stone-400">
                          {customProgress}%
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-[#1a120b] rounded-full h-2 mb-4">
                        <motion.div
                          className="bg-gradient-to-r from-[#c9a36a] to-[#b8915b] h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${customProgress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                      
                      {/* Progress Steps */}
                      <div className="space-y-2 sm:space-y-3">
                        {[
                          { key: 'head', item: selectedHead, label: t("head", "Head") },
                          { key: 'ring', item: selectedRing, label: t("ring", "Ring") },
                          { key: 'tail', item: selectedTail, label: t("tail", "Tail") }
                        ].map(({ key, item, label }) => (
                          <div key={key} className="flex items-center gap-2 sm:gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              item ? 'bg-green-400' : 'bg-stone-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs sm:text-sm ${
                                item ? 'text-green-400 font-medium' : 'text-stone-400'
                              }`}>
                                {label}
                              </span>
                              {item && (
                                <p className="text-[10px] sm:text-xs text-stone-500 truncate">
                                  {item.name} - ${item.price}
                                </p>
                              )}
                            </div>
                            {item && (
                              <span className="text-xs text-green-400">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total & Actions */}
                    {(selectedHead || selectedRing || selectedTail) && (
                      <div className="bg-[#2a1d13]/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-[#3a2d23]">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[#c9a36a] font-semibold text-sm sm:text-base">
                            {t("current_total", "Current Total")}
                          </p>
                          <span className="text-lg sm:text-xl font-bold text-[#c9a36a]">
                            ${getCustomPipeTotal()}
                          </span>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={resetCustomPipe}
                          className="flex items-center justify-center gap-2 w-full text-xs sm:text-sm text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30 px-3 py-2 rounded-lg transition-all duration-200 touch-manipulation"
                        >
                          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                          {t("reset_design", "Reset Design")}
                        </motion.button>
                        
                        {selectedHead && selectedRing && selectedTail && (
                          <div className="mt-3 p-2 bg-green-900/20 rounded-lg">
                            <p className="text-xs text-green-400 text-center font-medium">
                              🎉 {t("design_complete", "Design Complete!")}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-[#2a1d13]/40 p-3 rounded-xl border border-[#3a2d23]/50">
                      <p className="text-xs text-stone-400 text-center leading-relaxed">
                        {selectedHead && selectedRing && selectedTail 
                          ? t("builder_complete_tip", "Your custom pipe is ready! Switch to preview mode to see the final result.")
                          : t("builder_tip", "Select a head, ring, and tail to build your custom pipe. Each component affects the final price and appearance.")
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Mobile Safe Area */}
              {isMobile && (
                <div className="px-4 pb-8 pt-4 border-t border-[#2a1d13]/50">
                  <div className="text-center">
                    <p className="text-xs text-stone-500">
                      {t("swipe_to_close", "Tap outside to close")}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
};

export default Sidebar;