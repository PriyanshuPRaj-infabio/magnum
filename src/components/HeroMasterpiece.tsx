import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Artwork } from "../types";
import { Volume2, VolumeX, Eye, ArrowDown, Sparkles } from "lucide-react";
import audioAmbiance from "../lib/audioService";

interface HeroProps {
  masterpiece: Artwork;
  onExplore: () => void;
  onAcquire: (art: Artwork) => void;
  isAmbienceActive: boolean;
  onToggleAmbience: () => void;
}

export default function HeroMasterpiece({
  masterpiece,
  onExplore,
  onAcquire,
  isAmbienceActive,
  onToggleAmbience,
}: HeroProps) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [revealText, setRevealText] = useState(false);
  const [imgSrc, setImgSrc] = useState(masterpiece.imageUrl);

  useEffect(() => {
    setImgSrc(masterpiece.imageUrl);
  }, [masterpiece.imageUrl]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Create lazy parallax drift values
      const x = (e.clientX - window.innerWidth / 2) / 45;
      const y = (e.clientY - window.innerHeight / 2) / 45;
      setCoords({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setRevealText(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="hero-vault-arrival" className="relative h-screen w-full bg-[#070707] overflow-hidden flex flex-col justify-between p-6 md:p-12 z-40 select-none">
      {/* Volumetric ambient light ray and fine film grain */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-screen opacity-35 transition-all duration-[2500ms] ease-out"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${masterpiece.lightingColor} 0%, rgba(5,5,5,0) 70%)`
        }}
      />
      <div className="absolute inset-0 bg-repeat bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-25 pointer-events-none" />

      {/* Embedded soft atmospheric lighting indicators */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-mono text-[10px] tracking-[0.25em] text-[#D8D1C7] uppercase">Vault Server Secured</span>
      </div>

      {/* Floating Header */}
      <header className="w-full flex justify-between items-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="flex flex-col"
        >
          <span className="font-serif text-[#ECE7DF] text-xs uppercase tracking-[0.4em] font-medium leading-none">MAGNUM EDITIONS</span>
          <span className="font-sans text-[#8A6A45] text-[9px] uppercase tracking-[0.3em] mt-1.5 leading-none">HISTORIC PRINT VAULT</span>
        </motion.div>

        {/* Ambient audio controller */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          onClick={onToggleAmbience}
          className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#D8D1C7]/10 bg-black/40 backdrop-blur-xl text-[#ECE7DF] hover:border-[#8A6A45]/30 cursor-pointer transition-all duration-500"
        >
          <AnimatePresence mode="wait">
            {isAmbienceActive ? (
              <motion.div
                key="muted-active"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-[#8A6A45] rounded-full animate-[bounce_1.4s_infinite_100ms] h-full" />
                  <span className="w-0.5 bg-[#8A6A45] rounded-full animate-[bounce_1.4s_infinite_400ms] h-1/2" />
                  <span className="w-0.5 bg-[#8A6A45] rounded-full animate-[bounce_1.4s_infinite_200ms] h-2/3" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.25em]">Soundscape Active</span>
                <Volume2 className="w-3.5 h-3.5 text-[#8A6A45]" />
              </motion.div>
            ) : (
              <motion.div
                key="muted-inactive"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#D8D1C7]/70">Soundscape Muted</span>
                <VolumeX className="w-3.5 h-3.5 text-[#D8D1C7]/50" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </header>

      {/* Main Core: Floating Masterpiece centered */}
      <main className="flex-1 flex flex-col items-center justify-center relative my-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: coords.x,
            y: coords.y,
          }}
          transition={{ type: "spring", stiffness: 40, damping: 25 }}
          className="relative group cursor-none"
          style={{ perspective: 1200 }}
        >
          {/* Ambient dynamic shadow backdrop */}
          <div 
            className="absolute -inset-4 rounded-xl opacity-30 blur-3xl pointer-events-none transition-all duration-[1200ms]"
            style={{
              background: masterpiece.lightingColor,
            }}
          />

          {/* Master Painting Canvas */}
          <motion.div 
            whileHover={{ rotateY: coords.x / 1.5, rotateX: -coords.y / 1.5 }}
            className="relative bg-black p-4 md:p-6 pb-12 md:pb-16 shadow-[0_30px_100px_rgba(0,0,0,0.95)] border border-[#ECE7DF]/15 rounded-sm transition-transform duration-300"
          >
            {/* Museum highlight glow layer on frame */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="overflow-hidden bg-[#0F0F0F]">
              <motion.img
                src={imgSrc}
                alt={masterpiece.title}
                referrerPolicy="no-referrer"
                className="w-[280px] h-[340px] md:w-[420px] md:h-[500px] object-cover transition-transform duration-[6000ms] group-hover:scale-105"
                style={{ filter: "contrast(1.04) brightness(0.95)" }}
              />
            </div>

            {/* Brass museum title placard below art */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center w-[85%] text-center">
              <h2 className="font-serif text-[#ECE7DF] text-sm md:text-base tracking-[0.2em] uppercase leading-none font-light">
                {masterpiece.title}
              </h2>
              <p className="font-mono text-[#8A6A45] text-[9px] tracking-[0.25em] h-3 uppercase mt-1 leading-none">
                {masterpiece.artist} — {masterpiece.year}
              </p>
            </div>
          </motion.div>

          {/* Custom floating spotlight controller circle */}
          <motion.div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/20 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700"
            style={{
              x: coords.x * 2.5,
              y: coords.y * 2.5,
              background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)"
            }}
          >
            <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#ECE7DF]/70 flex items-center gap-1">
              <Eye className="w-3 h-3 text-[#8A6A45]" /> IMMERSE
            </span>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer Navigation */}
      <footer className="w-full flex flex-col md:flex-row justify-between items-center gap-6 border-t border-[#D8D1C7]/10 pt-6 md:pt-10 z-10">
        <div className="flex items-center gap-8 text-[#ECE7DF]/50">
          <div className="flex flex-col leading-snug">
            <span className="font-mono text-[8px] tracking-[0.3em] uppercase block">Aesthesia Index</span>
            <span className="font-serif text-[#ECE7DF] text-xs font-light mt-1 text-left block">ACQUISITION VAULT ACTIVE</span>
          </div>
          <div className="h-6 w-px bg-[#D8D1C7]/10 hidden md:block" />
          <p className="font-serif italic text-xs max-w-sm hidden md:block text-left">
            “True collectors acquire more than pigments; they occupy the silent margins of history.”
          </p>
        </div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAcquire(masterpiece)}
            className="px-6 py-3.5 bg-[#8A6A45] text-stone-100 rounded-none font-serif tracking-[0.3em] font-light text-xxs uppercase cursor-pointer hover:bg-[#a37f54] transition-all duration-300"
          >
            ACQUIRE ARTWORK
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.06)" }}
            whileTap={{ scale: 0.98 }}
            onClick={onExplore}
            className="px-6 py-3.5 border border-[#D8D1C7]/20 text-[#ECE7DF] rounded-none font-serif tracking-[0.3em] font-light text-xxs uppercase flex items-center gap-2 cursor-pointer transition-all duration-500"
          >
            ENTER CORRIDOR <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#8A6A45]" />
          </motion.button>
        </div>
      </footer>
    </div>
  );
}
