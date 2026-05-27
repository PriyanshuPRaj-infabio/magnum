import React, { useRef, useState, useEffect, MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Artwork, CollectorMoodConfig } from "../types";
import { 
  SlidersHorizontal, 
  HelpCircle, 
  Check, 
  RotateCcw, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Camera, 
  Layers, 
  ChevronRight,
  Plus
} from "lucide-react";
import audioAmbiance from "../lib/audioService";

interface CorridorProps {
  artworks: Artwork[];
  selectedArtwork: Artwork | null;
  onSelectArtwork: (artwork: Artwork) => void;
  currentMoodConfig: CollectorMoodConfig;
}

export default function GalleryCorridor({ artworks, selectedArtwork, onSelectArtwork, currentMoodConfig }: CorridorProps) {
  const isDark = currentMoodConfig.mood !== "Calm";

  const getLayoutConfig = (index: number) => {
    const layouts = [
      { colSpan: "md:col-span-7 lg:col-span-8", aspect: "aspect-[16/11]", padding: "px-6 pt-6 pb-12" }, // Wide Left
      { colSpan: "md:col-span-5 lg:col-span-4", aspect: "aspect-[3/4]", padding: "px-8 pt-8 pb-14" },  // Tall Right
      { colSpan: "md:col-span-5 lg:col-span-4", aspect: "aspect-square", padding: "px-5 pt-5 pb-10" },  // Square Left
      { colSpan: "md:col-span-7 lg:col-span-8", aspect: "aspect-[16/10]", padding: "px-7 pt-7 pb-12" }  // Wide Right
    ];
    return layouts[index % layouts.length];
  };
  // Filter States
  const [showFilters, setShowFilters] = useState(true);
  const [selectedPhotographers, setSelectedPhotographers] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(900);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  
  // Hover & visual States
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<"prints" | "books" | "contact">("prints");
  
  // Interactive Custom modal for Shop Categories
  const [activeModalShop, setActiveModalShop] = useState<string | null>(null);

  // Track images that fail to load locally
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Available photographers to filter
  const AVAILABLE_PHOTOGRAPHERS = [
    "Abbas",
    "Alessandra Sanguinetti",
    "Bob Henriques",
    "Bruno Barbey",
    "Burt Glinn",
    "Chris Steele-Perkins",
    "Constantine Manos",
    "Cornell Capa",
    "Cristina de Middel",
    "David Hurn",
    "David Seymour",
    "Dennis Stock",
    "Elliott Erwitt",
    "Eve Arnold",
    "Gregory Halpern",
    "Guy Le Querrec",
    "Hiroji Kubota",
    "Ian Berry",
    "Inge Morath",
    "Jean Gaumy",
    "Leonard Freed",
    "Mark Power",
    "Micha Bar-Am",
    "Nanna Heitmann",
    "Nikos Economopoulos",
    "Olivia Arthur",
    "Patrick Zachmann",
    "Peter Marlow",
    "Rafal Milach",
    "Raymond Depardon",
    "Rene Burri",
    "Robert Capa",
    "Steve McCurry",
    "Susan Meiselas",
    "Thomas Hoepker",
    "Trent Parke",
    "Werner Bischof",
    "Yael Martínez"
  ];

  const SIZES = [
    "12 x 16 in (30.5 x 40.6 cm)",
    "16 x 20 in (40.6 x 50.8 cm)",
    "20 x 24 in (50.8 x 61.0 cm)"
  ];

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedPhotographers([]);
    setSelectedAvailability([]);
    setMaxPrice(900);
    setSelectedSizes([]);
    audioAmbiance.playInquireTone();
  };

  // Toggle photographer filter
  const togglePhotographer = (name: string) => {
    setSelectedPhotographers(prev => 
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
    audioAmbiance.playInquireTone();
  };

  // Toggle size filter
  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
    audioAmbiance.playInquireTone();
  };

  // Toggle availability
  const toggleAvailability = (status: string) => {
    setSelectedAvailability(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
    audioAmbiance.playInquireTone();
  };

  // Parse price helper
  const getApproxPrice = (range: string): number => {
    // Extracts numeric value out of e.g. "$450.00 – $895.00" -> 895
    try {
      const match = range.replace(/[^0-9.]/g, "");
      if (range.includes("–") || range.includes("-")) {
        const parts = range.split(/[–-]/);
        const secondPart = parts[1] || parts[0];
        return parseFloat(secondPart.replace(/[^0-9.]/g, ""));
      }
      return parseFloat(match);
    } catch {
      return 450;
    }
  };

  // Compare helper to match normalized names (e.g. René Burri vs Rene Burri)
  const normalizeName = (name: string) => {
    return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // Apply filters
  const filteredArtworks = artworks.filter(art => {
    // Photographer check
    if (selectedPhotographers.length > 0) {
      const normalizedSelected = selectedPhotographers.map(normalizeName);
      if (!normalizedSelected.includes(normalizeName(art.artist))) {
        return false;
      }
    }
    // Availability check
    if (selectedAvailability.length > 0 && art.availability && !selectedAvailability.includes(art.availability)) {
      return false;
    }
    // Max Price check
    if (art.priceRange) {
      const price = getApproxPrice(art.priceRange);
      if (price > maxPrice) return false;
    }
    // Size check
    if (selectedSizes.length > 0 && !selectedSizes.includes(art.size)) {
      return false;
    }
    return true;
  });

  return (
    <div id="gallery-corridor-track" className={`relative min-h-screen ${currentMoodConfig.background} ${currentMoodConfig.textColor} py-8 md:py-16 select-none overflow-x-hidden flex flex-col justify-between font-sans transition-colors duration-[1500ms]`}>
      
      {/* MAGNUM EDITIONS BRUSH HEADER */}
      <div className={`w-full max-w-7xl mx-auto px-6 md:px-12 mb-10 text-left border-b ${isDark ? "border-neutral-800" : "border-stone-200"} pb-8`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#8A6A45]" />
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#8A6A44]">MAGNUM PHOTOS EST. 1947</span>
            </div>
            
            <h1 className={`font-serif ${isDark ? "text-white" : "text-black"} text-4xl md:text-6xl tracking-wide font-light uppercase`}>
              Magnum Editions
            </h1>
            
            <p className={`font-serif italic ${isDark ? "text-stone-400" : "text-stone-600"} text-sm md:text-base max-w-2xl mt-4 leading-relaxed`}>
              “This collection celebrates the mystery of black and white. Magnum's members work in a range of subjects, from early military documentation to the quiet beauty of everyday life. The prints are available in 8x10&quot; archival pigment prints in limited editions of 100 each.”
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setShowFilters(!showFilters); audioAmbiance.playInquireTone(); }}
              className={`flex items-center gap-2 px-4 py-2 border ${isDark ? "border-neutral-800 bg-neutral-950 text-neutral-300 hover:text-white hover:border-neutral-700" : "border-stone-300 bg-white text-stone-700 hover:border-black"} text-xs font-mono uppercase tracking-wider transition-colors rounded-none shadow-sm cursor-pointer`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8A6A45]" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <div className={`h-8 w-px ${isDark ? "bg-neutral-800" : "bg-stone-200"}`} />
            <span className={`font-mono text-[10px] uppercase tracking-widest ${isDark ? "text-neutral-500 bg-neutral-900/60" : "text-stone-400 bg-stone-100"} px-3 py-1.5 font-medium`}>
              {filteredArtworks.length} Results
            </span>
          </div>
        </div>
      </div>

      {/* CORE CATALOG AREA */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex-1 flex flex-col lg:flex-row gap-10 items-start">
        
        {/* LEFT COLUMN: THE MOUNTED FILTER PANEL (JUST LIKE SCREENSHOT) */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -30, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "260px" }}
              exit={{ opacity: 0, x: -30, width: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`flex-shrink-0 w-[260px] space-y-8 pr-6 text-left border-r ${isDark ? "border-neutral-850" : "border-stone-200/80"} sticky top-[84px] hidden lg:block`}
            >
              
              {/* Availability Filter Block */}
              <div className="space-y-3">
                <h3 className="font-mono text-[10px] uppercase text-[#8A6A45] tracking-[0.2em] font-bold">
                  Availability
                </h3>
                <div className={`space-y-2 font-mono text-xs ${isDark ? "text-neutral-300" : "text-stone-700"}`}>
                  <label className={`flex items-center gap-3.5 cursor-pointer group ${isDark ? "hover:text-white" : "hover:text-black"}`}>
                    <input 
                      type="checkbox"
                      checked={selectedAvailability.includes("In stock")}
                      onChange={() => toggleAvailability("In stock")}
                      className="hidden"
                    />
                    <span className={`w-4 h-4 border ${isDark ? "border-neutral-800 bg-neutral-950" : "border-stone-300 bg-white"} flex items-center justify-center transition-all ${selectedAvailability.includes("In stock") ? "border-[#8A6A45] bg-[#8A6A45]/10" : ""}`}>
                      {selectedAvailability.includes("In stock") && <Check className="w-2.5 h-2.5 text-[#8A6A45] stroke-[3px]" />}
                    </span>
                    <span>In stock</span>
                  </label>
                  <label className={`flex items-center gap-3.5 cursor-pointer group ${isDark ? "hover:text-white" : "hover:text-black"}`}>
                    <input 
                      type="checkbox"
                      checked={selectedAvailability.includes("Out of stock")}
                      onChange={() => toggleAvailability("Out of stock")}
                      className="hidden"
                    />
                    <span className={`w-4 h-4 border ${isDark ? "border-neutral-800 bg-neutral-950" : "border-stone-300 bg-white"} flex items-center justify-center transition-all ${selectedAvailability.includes("Out of stock") ? "border-[#8A6A45] bg-[#8A6A45]/10" : ""}`}>
                      {selectedAvailability.includes("Out of stock") && <Check className="w-2.5 h-2.5 text-[#8A6A45] stroke-[3px]" />}
                    </span>
                    <span>Out of stock</span>
                  </label>
                </div>
              </div>

              <hr className={isDark ? "border-neutral-850" : "border-stone-200"} />

              {/* Price Range Filter Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-left">
                  <h3 className="font-mono text-[10px] uppercase text-[#8A6A45] tracking-[0.2em] font-bold">
                    Price Cap
                  </h3>
                  <span className={`font-mono text-[10px] font-bold ${isDark ? "bg-neutral-900 text-neutral-350" : "bg-stone-100 text-stone-500"} px-1.5 py-0.5`}>
                    ${maxPrice}.00
                  </span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="900" 
                  step="50"
                  value={maxPrice} 
                  onChange={(e) => { setMaxPrice(Number(e.target.value)); audioAmbiance.playInquireTone(); }}
                  className={`w-full accent-[#8A6A45] cursor-pointer h-1.5 ${isDark ? "bg-neutral-800" : "bg-stone-200"} rounded-lg appearance-none`}
                />
                <div className="flex justify-between font-mono text-[9px] text-stone-400">
                  <span>$100.00</span>
                  <span>$895.00</span>
                </div>
              </div>

              <hr className={isDark ? "border-neutral-850" : "border-stone-200"} />

              {/* Photographers Checkbox Filter */}
              <div className="space-y-3">
                <h3 className="font-mono text-[10px] uppercase text-[#8A6A45] tracking-[0.2em] font-bold">
                  Photographer
                </h3>
                <div className={`space-y-2 h-[220px] overflow-y-auto pr-2 scrollbar-thin ${isDark ? "scrollbar-thumb-neutral-800 text-neutral-300" : "scrollbar-thumb-stone-200 text-stone-700"} font-mono text-xs`}>
                  {AVAILABLE_PHOTOGRAPHERS.map(name => (
                    <label 
                      key={name} 
                      className={`flex items-center gap-3.5 cursor-pointer group ${isDark ? "hover:text-white" : "hover:text-black"} transition-colors`}
                    >
                      <input 
                        type="checkbox"
                        checked={selectedPhotographers.includes(name)}
                        onChange={() => togglePhotographer(name)}
                        className="hidden"
                      />
                      <span className={`w-4 h-4 border ${isDark ? "border-neutral-800 bg-neutral-950" : "border-stone-300 bg-white"} flex items-center justify-center transition-all ${selectedPhotographers.includes(name) ? "border-[#8A6A45] bg-[#8A6A45]/10" : ""}`}>
                        {selectedPhotographers.includes(name) && <Check className="w-2.5 h-2.5 text-[#8A6A45] stroke-[3px]" />}
                      </span>
                      <span className="truncate">{name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className={isDark ? "border-neutral-850" : "border-stone-200"} />

              {/* Size Checkbox Filter */}
              <div className="space-y-3">
                <h3 className="font-mono text-[10px] uppercase text-[#8A6A45] tracking-[0.2em] font-bold">
                  Size
                </h3>
                <div className={`space-y-2 font-mono text-xs ${isDark ? "text-neutral-300" : "text-stone-700"}`}>
                  {SIZES.map(size => (
                    <label 
                      key={size} 
                      className={`flex items-center gap-3.5 cursor-pointer group ${isDark ? "hover:text-white" : "hover:text-black"} transition-colors`}
                    >
                      <input 
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                        className="hidden"
                      />
                      <span className={`w-4 h-4 border ${isDark ? "border-neutral-800 bg-neutral-950" : "border-stone-300 bg-white"} flex items-center justify-center transition-all flex-shrink-0 ${selectedSizes.includes(size) ? "border-[#8A6A45] bg-[#8A6A45]/10" : ""}`}>
                        {selectedSizes.includes(size) && <Check className="w-2.5 h-2.5 text-[#8A6A45] stroke-[3px]" />}
                      </span>
                      <span className="text-xxs truncate tracking-tighter">{size.split(" (")[0]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset active filters action */}
              {(selectedPhotographers.length > 0 || selectedAvailability.length > 0 || maxPrice < 900 || selectedSizes.length > 0) && (
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2.5 border border-[#8A6A45] text-[#8A6A45] hover:bg-[#8A6A45]/5 font-mono text-xxs uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer rounded-none"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Filters
                </button>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* MOBILE FILTERS BAR */}
        <div className="lg:hidden w-full flex flex-wrap gap-2 mb-4">
          <button 
            onClick={() => { setShowFilters(!showFilters); audioAmbiance.playInquireTone(); }}
            className="flex items-center gap-2 px-4 py-2 border border-stone-300 text-xs font-mono uppercase bg-white rounded-none cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3 text-[#8A6A45]" />
            Filters {showFilters ? "Hide" : "Show"}
          </button>
          
          {showFilters && (
            <div className={`w-full ${isDark ? "bg-neutral-950 border-neutral-800" : "bg-stone-50 border-stone-200"} border p-4 space-y-4 text-left grid grid-cols-1 md:grid-cols-2 gap-4`}>
              <div className="space-y-2">
                <span className="font-mono text-[9px] uppercase text-[#8A6A45] tracking-widest font-bold">Photographer</span>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_PHOTOGRAPHERS.map(name => (
                    <button
                      key={name}
                      onClick={() => togglePhotographer(name)}
                      className={`px-2 py-1 text-[10px] font-mono border rounded-none cursor-pointer ${selectedPhotographers.includes(name) ? "bg-[#8A6A45] text-white border-[#8A6A45]" : isDark ? "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-750" : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-mono text-[9px] uppercase text-[#8A6A45] tracking-widest font-bold">Max Price: ${maxPrice}.00</span>
                <input 
                  type="range" 
                  min="100" 
                  max="900" 
                  step="50"
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#8A6A45]"
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: THE MUSEUM GALLERY PRINT GRID */}
        <div className="flex-1 w-full">
          {filteredArtworks.length === 0 ? (
            <div className="w-full py-20 px-4 border border-dashed border-stone-200 text-center bg-stone-50/50">
              <span className="inline-block p-3 rounded-full bg-stone-100 text-[#8A6A45] mb-4">
                <SlidersHorizontal className="w-6 h-6 stroke-[1.5]" />
              </span>
              <p className="font-serif text-lg text-stone-800">No Prints Found Matching Criteria</p>
              <p className="font-sans text-xs text-stone-500 mt-2">Try relaxing your search boundaries or click button below to reset all parameters.</p>
              <button 
                onClick={handleResetFilters}
                className="mt-6 px-6 py-2.5 bg-black text-white font-mono text-xxs uppercase tracking-widest hover:bg-stone-900 transition-colors cursor-pointer rounded-none"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 gap-x-8 lg:gap-x-12 items-start text-left">
              {filteredArtworks.map((art, idx) => {
                const isHovered = hoveredId === art.id;
                const isSelected = selectedArtwork?.id === art.id;
                const config = getLayoutConfig(idx);
                
                return (
                  <motion.div
                    key={art.id}
                    layoutId={`art-container-${art.id}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: Math.min(3, idx) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    onMouseEnter={() => setHoveredId(art.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => onSelectArtwork(art)}
                    className={`flex flex-col group cursor-pointer text-left ${config.colSpan}`}
                  >
                    
                    {/* The White-Border museum framing (Screenshot Redesign representation) */}
                    <div 
                      className={`relative bg-[#FAFAFA] border ${isSelected ? "border-[#8A6A45] ring-2 ring-[#8A6A45]/30 shadow-[0_0_25px_rgba(138,106,69,0.25)]" : isDark ? "border-neutral-800/60" : "border-stone-200"} ${config.padding} shadow-[0_4px_12px_rgba(0,0,0,0.03)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:border-[#8A6A45]/60 transition-all duration-750`}
                    >
                      {/* Paper grain/texture shade */}
                      <div className="absolute inset-0 bg-repeat bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] pointer-events-none opacity-50" />
                      
                      {/* Image Box */}
                      <div className={`relative ${config.aspect} overflow-hidden bg-stone-100 border border-stone-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]`}>
                        <img 
                          src={failedImages[art.id] ? art.fallbackUrl : art.imageUrl} 
                          alt={art.title} 
                          referrerPolicy="no-referrer"
                          onError={() => {
                            if (!failedImages[art.id]) {
                              setFailedImages(prev => ({ ...prev, [art.id]: true }));
                            }
                          }}
                          className="w-full h-full object-cover grayscale transition-transform duration-[4000ms] ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
 
                      {/* Small Museum Tag Placard inside the bottom of the white border */}
                      <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between font-mono text-[8px] text-stone-400 tracking-wider">
                        <span>PRINT ED. / 100</span>
                        <span>{art.size.split(" in")[0]} in</span>
                      </div>
                    </div>
 
                    {/* Metadata block below the museum print frame */}
                    <div className="mt-4 flex flex-col items-start pr-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#8A6A45] font-semibold">
                          {art.artist}
                        </span>
                        <span className="font-mono text-[8px] text-stone-500">// MGN-0{idx + 1}</span>
                      </div>
                      <h4 className={`font-serif text-base ${isDark ? "text-neutral-100 group-hover:text-[#8A6A45]" : "text-[#111111] group-hover:text-[#8A6A45]"} font-light mt-1.5 leading-snug tracking-wide transition-colors`}>
                        Magnum Editions {art.title}
                      </h4>
                      <div className="mt-2.5 flex items-center gap-3">
                        <span className={`font-mono text-xs ${isDark ? "text-neutral-200" : "text-stone-800"} font-bold`}>
                          {art.priceRange || "$450.00 – $895.00"}
                        </span>
                        <div className={`h-2 w-px ${isDark ? "bg-neutral-800" : "bg-stone-200"}`} />
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] text-emerald-600 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {art.availability || "In stock"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ADDITIONAL CATEGORIES SECTION AT FOOTER (Shop Books, Shop Black & White, Shop Contact Sheets) */}
      <div className={`w-full max-w-7xl mx-auto px-6 md:px-12 mt-20 md:mt-28 border-t ${isDark ? "border-neutral-850" : "border-stone-200"} pt-16`}>
        <h3 className={`font-serif text-xl md:text-2xl ${isDark ? "text-white" : "text-black"} font-light text-center mb-10 tracking-widest uppercase`}>
          Explore Magnum Collections
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Shop Books Card */}
          <div 
            onClick={() => { setActiveModalShop("books"); audioAmbiance.playInquireTone(); }}
            className={`group cursor-pointer ${isDark ? "bg-neutral-900/40 border-neutral-800 hover:bg-neutral-900/60" : "bg-white border-stone-200"} overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] hover:border-[#8A6A45]/40 transition-all duration-500 flex flex-col p-5 rounded-none`}
          >
            <div className={`relative aspect-[16/10] overflow-hidden ${isDark ? "bg-neutral-950 border-neutral-850" : "bg-stone-100 border-stone-200"} mb-5`}>
              <img 
                src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1200" 
                alt="Shop Books" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter grayscale group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute top-3 left-3 bg-black text-white font-mono text-[8px] uppercase tracking-widest px-2 py-1">
                LITERATURE
              </div>
            </div>
            
            <h4 className={`font-serif text-lg ${isDark ? "text-white" : "text-black"} font-bold group-hover:text-[#8A6A45] transition-colors leading-tight`}>
              Shop Books
            </h4>
            <p className={`font-sans text-xs ${isDark ? "text-stone-400" : "text-stone-500"} mt-2.5 leading-relaxed flex-1`}>
              Discover official, high-quality monograph books and limited anthology volumes printed by Magnum Photos members worldwide.
            </p>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-[#8A6A45] font-bold group-hover:translate-x-1.5 transition-transform">
              Explore Library <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Shop Black & White Card */}
          <div 
            onClick={() => { setActiveModalShop("bw"); audioAmbiance.playInquireTone(); }}
            className={`group cursor-pointer ${isDark ? "bg-neutral-900/40 border-neutral-800 hover:bg-neutral-900/60" : "bg-white border-stone-200"} overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] hover:border-[#8A6A45]/40 transition-all duration-500 flex flex-col p-5 rounded-none`}
          >
            <div className={`relative aspect-[16/10] overflow-hidden ${isDark ? "bg-neutral-950 border-neutral-850" : "bg-stone-100 border-stone-200"} mb-5`}>
              <img 
                src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200" 
                alt="Shop B&W" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter grayscale group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute top-3 left-3 bg-black text-white font-mono text-[8px] uppercase tracking-widest px-2 py-1">
                FINE ART
              </div>
            </div>
            
            <h4 className={`font-serif text-lg ${isDark ? "text-white" : "text-black"} font-bold group-hover:text-[#8A6A45] transition-colors leading-tight`}>
              Shop Black & White
            </h4>
            <p className={`font-sans text-xs ${isDark ? "text-stone-400" : "text-stone-500"} mt-2.5 leading-relaxed flex-1`}>
              Immerse yourself into classic, light-absorbent gelatin-silver print works capturing historical peaks of human culture.
            </p>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-[#8A6A45] font-bold group-hover:translate-x-1.5 transition-transform">
              Browse Prints <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Shop Contact Sheets Card */}
          <div 
            onClick={() => { setActiveModalShop("contact"); audioAmbiance.playInquireTone(); }}
            className={`group cursor-pointer ${isDark ? "bg-neutral-900/40 border-neutral-800 hover:bg-neutral-900/60" : "bg-white border-stone-200"} overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] hover:border-[#8A6A45]/40 transition-all duration-500 flex flex-col p-5 rounded-none`}
          >
            <div className={`relative aspect-[16/10] overflow-hidden ${isDark ? "bg-neutral-950 border-neutral-850" : "bg-stone-100 border-stone-200"} mb-5`}>
              <img 
                src="https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=1200" 
                alt="Shop Contact Sheets" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter grayscale group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute top-3 left-3 bg-black text-white font-mono text-[8px] uppercase tracking-widest px-2 py-1">
                BEHIND THE SCENES
              </div>
            </div>
            
            <h4 className={`font-serif text-lg ${isDark ? "text-white" : "text-black"} font-bold group-hover:text-[#8A6A45] transition-colors leading-tight`}>
              Shop Contact Sheets
            </h4>
            <p className={`font-sans text-xs ${isDark ? "text-stone-400" : "text-stone-500"} mt-2.5 leading-relaxed flex-1`}>
              Unveil the raw sequences. Study the exact chronological frame selects that led to legendary history-making images.
            </p>
            <div className="mt-4 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-[#8A6A45] font-bold group-hover:translate-x-1.5 transition-transform">
              Examine Frames <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* POPUP MODALS FOR EXTERNAL SHOP CATEGORIES */}
      <AnimatePresence>
        {activeModalShop && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalShop(null)}
              className="absolute inset-0 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-w-lg w-full bg-[#111111] text-white border border-stone-800 p-8 shadow-2xl z-10 text-left rounded-none"
            >
              <button 
                onClick={() => setActiveModalShop(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-white font-mono text-xs uppercase"
              >
                Close ×
              </button>

              {activeModalShop === "books" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#8A6A45]">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-mono text-[9px] tracking-widest uppercase">Magnum Library Editions</span>
                  </div>
                  <h3 className="font-serif text-2xl font-light">Rare Monograph Series</h3>
                  <p className="text-xs text-stone-400 leading-relaxed leading-slate">
                    Our books represent the gold-standard of photography publications. We hold original, signed archive books of Thomas Hoepker, René Burri, and Henri Cartier-Bresson.
                  </p>
                  <div className="p-4 bg-stone-900 border border-stone-800 space-y-2">
                    <p className="font-serif text-sm font-bold text-white">Featured Release:</p>
                    <p className="text-stone-300 font-mono text-xs">“Thomas Hoepker: My Way - The Muhammad Ali Archive” — $120.00</p>
                    <p className="text-stone-500 font-sans text-xxs">Signed by the Hoepker Estate. Only 12 remaining in vault inventory.</p>
                  </div>
                  <button 
                    onClick={() => setActiveModalShop(null)}
                    className="w-full py-3 bg-[#8A6A45] text-white text-xs font-mono uppercase tracking-widest hover:bg-[#a17e55] transition-colors"
                  >
                    Send Private Catalog Inquiry
                  </button>
                </div>
              )}

              {activeModalShop === "bw" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#8A6A45]">
                    <Layers className="w-5 h-5" />
                    <span className="font-mono text-[9px] tracking-widest uppercase">Fine Art Collectors Portfolio</span>
                  </div>
                  <h3 className="font-serif text-2xl font-light">Gelatin-Silver Master Sets</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Custom large format darkroom prints. Hand pressed from original negatives on baryta fiber papers. Includes official certificate of provenance and estate validation stamps.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-stone-400">
                    <div className="p-2 border border-stone-800 bg-stone-900	">
                      <span className="text-[#8A6A45] block mb-1">16x20&quot; Portfolio Bundle</span>
                      <span>From $2,400.00</span>
                    </div>
                    <div className="p-2 border border-stone-800 bg-stone-900	">
                      <span className="text-[#8A6A45] block mb-1">Custom Mounting Support</span>
                      <span>Bespoke Consultation</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveModalShop(null)}
                    className="w-full py-3 bg-[#8A6A45] text-white text-xs font-mono uppercase tracking-widest hover:bg-[#a17e55] transition-colors"
                  >
                    Request Fine Art Portfolio
                  </button>
                </div>
              )}

              {activeModalShop === "contact" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#8A6A45]">
                    <Camera className="w-5 h-5" />
                    <span className="font-mono text-[9px] tracking-widest uppercase">Chronological Frame Sequences</span>
                  </div>
                  <h3 className="font-serif text-2xl font-light">Original Contact Sheet Editions</h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    An educational masterpiece. Study the precise sequence of frames running alongside the final selected historical masterpiece. Provides profound insights into the photographer's decision mechanics at the split-second of truth.
                  </p>
                  <p className="text-[10px] italic text-[#8A6A45] font-serif">“A contact sheet is a diary of mistakes. Underneath the final frame lies the journey.”</p>
                  <button 
                    onClick={() => setActiveModalShop(null)}
                    className="w-full py-3 bg-[#8A6A45] text-white text-xs font-mono uppercase tracking-widest hover:bg-[#a17e55] transition-colors"
                  >
                    Receive Contact Sheets Inventory
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
