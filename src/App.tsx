import React, { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Volume2,
  VolumeX,
  Eye,
  ArrowRight,
  HelpCircle,
  Sliders,
  User,
  MessageSquare,
  CornerDownRight,
  Sparkles,
  Award,
  MapPin,
  X,
  Info,
  Check,
  Compass,
  Activity,
  ArrowUpRight,
  Maximize2,
  RefreshCw,
  Camera
} from "lucide-react";
import { MASTER_ARTWORKS, EMOTIONAL_COLLECTIONS, COLLECTOR_MOOD_CONFIGS, ROOM_SCENES } from "./data";
import { Artwork, CollectorMoodType, CollectorMoodConfig, RoomScene } from "./types";
import audioAmbiance from "./lib/audioService";
import HeroMasterpiece from "./components/HeroMasterpiece";
import GalleryCorridor from "./components/GalleryCorridor";
// Logo rendered as styled text for reliability

export default function App() {
  // Navigation & Sections
  const [activeTab, setActiveTab] = useState<"vault" | "corridor" | "journal" | "advisor">("vault");
  const detailInspectorRef = useRef<HTMLDivElement | null>(null);

  // Custom states
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(MASTER_ARTWORKS[0]);
  const [activeMood, setActiveMood] = useState<CollectorMoodType>("Calm");
  const [selectedRoom, setSelectedRoom] = useState<RoomScene>(ROOM_SCENES[0]);
  const [isAmbienceActive, setIsAmbienceActive] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [artworkPosition, setArtworkPosition] = useState<{ x: number; y: number }>({ x: 0, y: -20 });
  const [virtualScalePercent, setVirtualScalePercent] = useState<number>(85); // 50% to 150%

  // Advisory Assistant States
  const [advisoryMessage, setAdvisoryMessage] = useState<string>("");
  const [advisoryResult, setAdvisoryResult] = useState<string>("");
  const [isLoadingAdvisory, setIsLoadingAdvisory] = useState<boolean>(false);

  // Acquisition Overlay Status
  const [acquiryTarget, setAcquiryTarget] = useState<Artwork | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [acquisitionForm, setAcquisitionForm] = useState({
    fullName: "",
    email: "",
    galleryNote: "",
  });

  // Dynamic image fallbacks for detailed view and acquisition target
  const [detailImgSrc, setDetailImgSrc] = useState<string>("");
  const [acquiryImgSrc, setAcquiryImgSrc] = useState<string>("");

  useEffect(() => {
    if (selectedArtwork) {
      setDetailImgSrc(selectedArtwork.imageUrl);
    }
  }, [selectedArtwork]);

  useEffect(() => {
    if (acquiryTarget) {
      setAcquiryImgSrc(acquiryTarget.imageUrl);
    }
  }, [acquiryTarget]);

  // Load and apply soundscape changes
  const currentMoodConfig = COLLECTOR_MOOD_CONFIGS.find(m => m.mood === activeMood) || COLLECTOR_MOOD_CONFIGS[0];
  const isDark = activeMood !== "Calm";

  const aliArtwork = MASTER_ARTWORKS.find(art => art.id === "magnum-ali-chicago-1966") || MASTER_ARTWORKS[0];
  const sidebarArtworks = [
    MASTER_ARTWORKS.find(art => art.id === "magnum-officer-ankle-1979"),
    MASTER_ARTWORKS.find(art => art.id === "magnum-lauderdale-1966"),
    MASTER_ARTWORKS.find(art => art.id === "magnum-james-dean-1955")
  ].filter(Boolean) as typeof MASTER_ARTWORKS;

  useEffect(() => {
    if (isAmbienceActive) {
      audioAmbiance.enableAmbiance();
      audioAmbiance.handleMoodAmbiance(currentMoodConfig.ambientHumHz, currentMoodConfig.harmonicHz);
    } else {
      audioAmbiance.disableAmbiance();
    }
  }, [isAmbienceActive, activeMood]);

  // Auto-rotate arrival masterpiece every 10 seconds when on the Arrival (vault) tab
  useEffect(() => {
    if (activeTab !== "vault") return;

    const interval = setInterval(() => {
      setSelectedArtwork(prev => {
        const currentArt = prev || MASTER_ARTWORKS[0];
        const currentIndex = MASTER_ARTWORKS.findIndex(art => art.id === currentArt.id);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % MASTER_ARTWORKS.length;
        return MASTER_ARTWORKS[nextIndex];
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Enable scroll to change tabs
  const tabsOrder: ("vault" | "corridor" | "journal" | "advisor")[] = ["vault", "corridor", "journal", "advisor"];
  const lastScrollTimeRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      // Cooldown to prevent rapidly skipping multiple tabs (1200ms)
      if (now - lastScrollTimeRef.current < 1200) return;

      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 12;
      const isAtTop = window.scrollY <= 12;

      const currentIndex = tabsOrder.indexOf(activeTab);

      if (e.deltaY > 20 && isAtBottom) {
        if (currentIndex < tabsOrder.length - 1) {
          e.preventDefault();
          lastScrollTimeRef.current = now;
          const nextTab = tabsOrder[currentIndex + 1];
          setActiveTab(nextTab);
          window.scrollTo(0, 0);
        }
      } else if (e.deltaY < -20 && isAtTop) {
        if (currentIndex > 0) {
          e.preventDefault();
          lastScrollTimeRef.current = now;
          const prevTab = tabsOrder[currentIndex - 1];
          setActiveTab(prevTab);

          // Wait for render, then scroll to bottom of the previous section
          setTimeout(() => {
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: "instant" as any
            });
          }, 30);
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastScrollTimeRef.current < 1200) return;

      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartYRef.current - touchEndY; // Positive is scroll down (swipe up)

      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 25;
      const isAtTop = window.scrollY <= 15;

      const currentIndex = tabsOrder.indexOf(activeTab);

      if (deltaY > 60 && isAtBottom) {
        if (currentIndex < tabsOrder.length - 1) {
          lastScrollTimeRef.current = now;
          setActiveTab(tabsOrder[currentIndex + 1]);
          window.scrollTo(0, 0);
        }
      } else if (deltaY < -60 && isAtTop) {
        if (currentIndex > 0) {
          lastScrollTimeRef.current = now;
          setActiveTab(tabsOrder[currentIndex - 1]);
          setTimeout(() => {
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: "instant" as any
            });
          }, 30);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeTab]);

  const handleToggleAmbience = () => {
    const newState = !isAmbienceActive;
    setIsAmbienceActive(newState);
    if (newState) {
      audioAmbiance.enableAmbiance();
    } else {
      audioAmbiance.disableAmbiance();
    }
  };

  const handleSelectArtwork = (art: Artwork) => {
    setSelectedArtwork(art);
    // Smoothly shift mood to match artwork's core designer vibe automatically
    setActiveMood(art.mood);
    audioAmbiance.playInquireTone();
    // Smooth scroll down to the detail inspector
    setTimeout(() => {
      detailInspectorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const triggerAcquireFlow = (art: Artwork) => {
    setAcquiryTarget(art);
    audioAmbiance.playInquireTone();
  };

  const handleAcquireSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(true);
    audioAmbiance.playInquireTone();
    setTimeout(() => {
      setSubmitSuccess(false);
      setAcquiryTarget(null);
      // Reset form
      setAcquisitionForm({ fullName: "", email: "", galleryNote: "" });
    }, 5000);
  };

  // Submit messages to full-stack Gemini Art Advisory Desk
  const handleRequestAdvisory = async () => {
    if (!advisoryMessage.trim()) return;
    setIsLoadingAdvisory(true);
    setAdvisoryResult("");

    try {
      const response = await fetch("/api/gemini/curator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: activeMood,
          message: advisoryMessage,
          selectedArtworks: selectedArtwork ? [selectedArtwork.title] : []
        })
      });

      const data = await response.json();
      if (response.ok && data.advice) {
        setAdvisoryResult(data.advice);
      } else if (data.details && data.details.includes("GEMINI_API_KEY")) {
        const fallback = getMockAdvisorResponse(activeMood, advisoryMessage, selectedArtwork);
        setAdvisoryResult(`[DEMO SYSTEM PORT: Local curator engaged. Please set GEMINI_API_KEY in .env.local to activate the live advisor]\n\n${fallback}`);
      } else {
        const fallback = getMockAdvisorResponse(activeMood, advisoryMessage, selectedArtwork);
        setAdvisoryResult(`[System Port Offline: Engaging local curator]\n\n${fallback}`);
      }
    } catch (error) {
      console.error(error);
      const fallback = getMockAdvisorResponse(activeMood, advisoryMessage, selectedArtwork);
      setAdvisoryResult(`[System Port Offline: Engaging local curator]\n\n${fallback}`);
    } finally {
      setIsLoadingAdvisory(false);
    }
  };

  return (
    <div className={`relative min-h-screen ${currentMoodConfig.background} ${currentMoodConfig.textColor} transition-colors duration-[1500ms] overflow-x-hidden flex flex-col font-sans-lux`}>

      {/* Background cinematic vignette overlay */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.96)] z-10" />
      <div className="absolute inset-0 bg-repeat bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDYiLz4KPC9zdmc+')] opacity-30 pointer-events-none z-10" />

      {/* FIXED SOPHISTICATED NAVIGATION BAR */}
      <nav id="app-nav-bar" className="fixed top-0 left-0 right-0 z-50 w-full bg-black/95 backdrop-blur-md border-b border-stone-800/60 px-6 md:px-14 py-4 flex items-center justify-between shadow-[0_6px_30px_rgba(0,0,0,0.7)]">
        {/* Left segment: Magnum Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("vault")}>
          <span className="font-mono text-[15px] md:text-[18px] font-bold tracking-[0.35em] text-white uppercase">
            MAGNUM
          </span>
        </div>

        {/* Center: Navigation tabs — larger and more readable */}
        <div className="flex items-center gap-5 md:gap-12">
          {([
            { key: "vault" as const, label: "Arrival" },
            { key: "corridor" as const, label: "Corridor" },
            { key: "journal" as const, label: "Journal" },
            { key: "advisor" as const, label: "Advisor" },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative cursor-pointer text-[11px] md:text-[13px] uppercase tracking-[0.2em] font-mono font-medium transition-all duration-400 pb-1 ${activeTab === tab.key
                ? "text-[#ECE7DF]"
                : "text-[#ECE7DF]/40 hover:text-[#ECE7DF]/80"
                }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.span
                  layoutId="nav-active-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8A6A45] rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Right segment: Establishment marker */}
        <div className="flex items-center">
          <span className="font-mono text-[10px] text-[#8A6A45]/80 tracking-[0.25em] uppercase hidden md:inline">
            EST. 1947
          </span>
        </div>
      </nav>

      {/* MAIN RENDER ENGINE */}
      <div className="flex-1 pt-[72px]">
        <AnimatePresence mode="wait">

          {/* SECTION I: IMMERSIVE HERO VAULT */}
          {activeTab === "vault" && (
            <motion.div
              key="tab-vault"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <HeroMasterpiece
                masterpiece={selectedArtwork || MASTER_ARTWORKS[0]}
                onExplore={() => setActiveTab("corridor")}
                onAcquire={triggerAcquireFlow}
                isAmbienceActive={isAmbienceActive}
                onToggleAmbience={handleToggleAmbience}
              />
            </motion.div>
          )}

          {/* SECTION II: THE GALLERY CORRIDOR TRACK */}
          {activeTab === "corridor" && (
            <motion.div
              key="tab-corridor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <GalleryCorridor
                artworks={MASTER_ARTWORKS}
                selectedArtwork={selectedArtwork}
                onSelectArtwork={handleSelectArtwork}
                currentMoodConfig={currentMoodConfig}
              />

              {/* Dynamic focused panel representing Section 4's Detail Inspector */}
              <div ref={detailInspectorRef} className="bg-[#090909] py-16 px-6 md:px-16 border-t border-[#D8D1C7]/15">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                  {/* Left Column: Huge Masterpiece Image with Zoom */}
                  <div className="lg:col-span-7 flex flex-col items-center">
                    <span className="font-mono-lux text-[9px] tracking-[0.3em] text-[#8A6A45] uppercase mb-4 self-start">
                      [ EXAMINING SELECTED MASTERPIECE ]
                    </span>
                    <div className="relative group bg-black p-4 border border-stone-800 rounded-sm overflow-hidden shadow-2xl">
                      <div className="absolute inset-0 bg-radial from-white/[0.05] to-transparent pointer-events-none" />

                      <div className="overflow-hidden bg-neutral-900 w-full h-[400px] md:h-[520px]">
                        <motion.img
                          src={detailImgSrc}
                          alt={selectedArtwork?.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-[1200ms]"
                          style={{ transform: `scale(${zoomScale})` }}
                        />
                      </div>

                      {/* Manual microscopic canvas zoom slider controls */}
                      <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 border border-[#D8D1C7]/10 flex justify-between items-center rounded-sm">
                        <span className="font-mono-lux text-[8px] text-[#ECE7DF] tracking-widest uppercase">
                          SURFACE FILM GRAIN DETAIL
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setZoomScale(s => Math.max(1, s - 0.2))}
                            className="text-[#ECE7DF] font-mono-lux text-xs hover:text-[#8A6A45] transition-colors"
                          >
                            -
                          </button>
                          <span className="font-mono-lux text-[9px] text-[#8A6A45]">{Math.round(zoomScale * 100)}%</span>
                          <button
                            onClick={() => setZoomScale(s => Math.min(2.2, s + 0.2))}
                            className="text-[#ECE7DF] font-mono-lux text-xs hover:text-[#8A6A45] transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Narrative detail spread */}
                  <div className="lg:col-span-5 flex flex-col justify-center text-left">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="font-mono-lux text-[9px] tracking-widest text-[#8A6A45] uppercase">
                        COGNITIVE MOOD: {selectedArtwork?.mood}
                      </span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8A6A45] animate-ping" />
                    </div>

                    <h3 className="font-serif-lux text-3xl md:text-5xl text-[#ECE7DF] tracking-wide font-light mb-4">
                      {selectedArtwork?.title}
                    </h3>

                    <p className="font-mono-lux text-[#8A6A45] text-[11px] tracking-[0.2em] uppercase mb-6 leading-none">
                      {selectedArtwork?.artist} — {selectedArtwork?.year}
                    </p>

                    <div className="space-y-6 text-[#D8D1C7]/80 text-sm font-light leading-relaxed mb-8">
                      <p>{selectedArtwork?.description}</p>
                      <div className="border-l-2 border-[#8A6A45]/30 pl-4 italic text-stone-400">
                        {selectedArtwork?.details}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-800 font-mono-lux text-[10px] tracking-wider text-[#D8D1C7]/60">
                        <div>
                          <span className="block text-[8px] text-[#8A6A45] uppercase">MEDIUM FORMULATION</span>
                          <span className="text-[#ECE7DF] mt-1 block">{selectedArtwork?.medium}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] text-[#8A6A45] uppercase">PHYSICAL BOUNDS</span>
                          <span className="text-[#ECE7DF] mt-1 block">{selectedArtwork?.size}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => triggerAcquireFlow(selectedArtwork!)}
                        className="flex-1 bg-[#8A6A45] hover:bg-[#a68054] text-white font-serif-lux font-light text-xxs uppercase tracking-[0.25em] py-4 transition-all"
                      >
                        ACQUIRE ARTWORK
                      </button>
                      <button
                        onClick={() => {
                          setAdvisoryMessage(`Regarding "${selectedArtwork?.title}" by ${selectedArtwork?.artist}: how do you counsel setting this up in my dynamic modernist collection?`);
                          setActiveTab("advisor");
                        }}
                        className="flex-1 border border-stone-800 hover:bg-stone-900 text-[#ECE7DF] font-serif-lux font-light text-xxs uppercase tracking-[0.25em] py-4 transition-all"
                      >
                        PRIVATE INQUIRY
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION IV: ARTIST STORIES / JOURNAL */}
          {activeTab === "journal" && (
            <motion.div
              key="tab-journal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="py-16 px-6 md:px-16"
            >
              <div className="max-w-5xl mx-auto text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-px w-8 bg-[#8A6A45]" />
                  <span className="font-mono-lux text-[9px] uppercase tracking-[0.3em] text-[#8A6A45]">Section IV</span>
                </div>
                <h2 className={`font-serif-lux text-3xl md:text-5xl ${isDark ? "text-[#ECE7DF]" : "text-stone-950"} tracking-wide font-light mb-16`}>
                  Selected Master Chronicles
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

                  {/* Main feature story */}
                  <div className="md:col-span-8 space-y-12">
                    <div className={`relative aspect-[16/10] overflow-hidden ${isDark ? "bg-stone-900 border-stone-800" : "bg-stone-100 border-stone-200"}`}>
                      <img
                        src={aliArtwork.imageUrl}
                        alt={aliArtwork.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      <span className="absolute bottom-4 left-4 font-mono-lux text-[8px] tracking-[0.25em] text-[#ECE7DF]/50">
                        {aliArtwork.title.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-6">
                      <span className="font-mono-lux text-[8px] tracking-[0.3em] text-[#8A6A45] uppercase block">
                        VOLUME 12 // FEATURED CHRONICLE
                      </span>
                      <h3 className={`font-serif-lux text-2xl md:text-4xl ${isDark ? "text-[#ECE7DF]" : "text-stone-900"} tracking-wide font-light leading-snug`}>
                        “We capture the split-second of truth and let it breathe for infinity.”
                      </h3>
                      <p className="font-mono-lux text-xs text-[#8A6A45] uppercase tracking-wider">
                        A retrospective conversation with Thomas Hoepker on physical charisma and silver-gelatin grain.
                      </p>

                      <div className={`space-y-4 font-serif-lux text-base ${isDark ? "text-[#D8D1C7]/75" : "text-stone-700"} leading-relaxed`}>
                        <p>
                          <strong>Interviewer:</strong> Your legendary work, <em>Muhammad Ali, 1966</em>, has anchored masterwork photography lists for decades. How did you capture that intense fist thrusting directly into your lens?
                        </p>
                        <p>
                          <strong>Hoepker:</strong> When photographing Ali, you had to understand that he was a physical geyser of human presence. I was using a simple Leica rangefinder with high-speed Tri-X monochrome film, which had this heavy silver grain. I wanted the fist to look closer than life itself, turning his sheer weight and determination into an architectural monument of sheer power.
                        </p>
                        <p>
                          <strong>Interviewer:</strong> You've described black-and-white portraits as an act of taking away, rather than adding.
                        </p>
                        <p>
                          <strong>Hoepker:</strong> Color is descriptive; black and white is interpretive. Color tells you what clothes the subject was wearing. Black and white exposes their physical soul. It forces the viewer to find rest inside the deep gray tones and raw shadows of historical memory.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar story elements */}
                  <div className="md:col-span-4 space-y-10 border-l border-[#8A6A45]/30 pl-8 text-left">
                    <span className="font-mono-lux text-[8px] tracking-[0.3em] text-[#8A6A45] uppercase block">
                      ARCHIVE RELEASES
                    </span>

                    <div className="space-y-6">
                      {sidebarArtworks.map((art, idx) => (
                        <div key={art.id} className="space-y-4">
                          {idx > 0 && <div className={`h-px ${isDark ? "bg-stone-900" : "bg-stone-200"} mb-6`} />}
                          <span className={`font-mono-lux text-[7px] ${isDark ? "text-[#D8D1C7]/50" : "text-stone-500"} block`}>
                            RELEASE YEAR: {art.year} // {art.medium.toUpperCase()}
                          </span>
                          <h4
                            onClick={() => {
                              setActiveTab("corridor");
                              handleSelectArtwork(art);
                            }}
                            className={`font-serif-lux text-lg ${isDark ? "text-[#ECE7DF]" : "text-stone-900"} hover:text-[#8A6A45] cursor-pointer transition-colors`}
                          >
                            {art.title}
                          </h4>
                          <p className={`font-sans-lux ${isDark ? "text-[#D8D1C7]/60" : "text-stone-600"} text-xs`}>
                            {art.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION V: CURATED ADVISORY COUNSELOR OFFICE */}
          {activeTab === "advisor" && (
            <motion.div
              key="tab-advisor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="py-12 md:py-16 px-6 md:px-16"
            >
              <div className="max-w-4xl mx-auto">
                <div className={`flex items-center justify-between border-b ${isDark ? "border-stone-800" : "border-stone-300"} pb-8 mb-10 text-left`}>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-px w-8 bg-[#8A6A45]" />
                      <span className="font-mono-lux text-[9px] uppercase tracking-[0.3em] text-[#8A6A45]">Section V</span>
                    </div>
                    <h2 className={`font-serif-lux text-3xl md:text-5xl ${isDark ? "text-[#ECE7DF]" : "text-stone-950"} tracking-wide font-light`}>
                      The Private Advisory Cell
                    </h2>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] tracking-[0.3em] uppercase ${isDark ? "text-stone-400 opacity-40" : "text-stone-500"} mb-1 font-mono-lux block`}>Active Counselor Mode</span>
                    <span className="text-sm font-serif-lux italic text-[#8A6A45]">{currentMoodConfig.title} Ambient</span>
                  </div>
                </div>

                {/* Main Advisory split */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start text-left">

                  {/* Left instruction box */}
                  <div className={`md:col-span-4 ${isDark ? "bg-black/40 border border-stone-800/80" : "bg-white border border-stone-200 shadow-sm"} p-6 space-y-6`}>
                    <span className="font-mono-lux text-[8px] tracking-[0.25em] text-[#8A6A45] uppercase block">
                      Curated Advisory Core
                    </span>
                    <p className={`font-serif-lux text-sm ${isDark ? "text-[#D8D1C7]/75" : "text-stone-700"} italic leading-relaxed`}>
                      “We welcome world-class collectors to convey their spatial limitations, lighting arrangements, color intentions, or metaphysical desires directly to our principal art advisor.”
                    </p>
                    <div className={`h-px ${isDark ? "bg-stone-800" : "bg-stone-200"}`} />
                    <div>
                      <span className={`block font-sans-lux text-xs font-semibold ${isDark ? "text-[#ECE7DF]" : "text-stone-900"}`}>CURRENT FOCUS PAINTING:</span>
                      <span className="block font-mono-lux text-[10px] text-[#8A6A45] uppercase mt-1">
                        {selectedArtwork ? selectedArtwork.title : "None Selected"}
                      </span>
                    </div>
                  </div>

                  {/* Right Chat Chamber */}
                  <div className={`md:col-span-8 ${isDark ? "bg-[#0D0D0D] border border-stone-800" : "bg-white border border-stone-200 shadow-lg"} p-6 md:p-8 rounded-sm space-y-6`}>

                    {/* Input message form */}
                    <div className="space-y-4">
                      <label className="block font-mono-lux text-[8px] tracking-[0.3em] text-[#8A6A45] uppercase">
                        TRANSMIT DESIRES (LIGHTING, LIVING SPACE, VOLUME)
                      </label>
                      <textarea
                        value={advisoryMessage}
                        onChange={(e) => setAdvisoryMessage(e.target.value)}
                        placeholder="e.g., I have a brutalist stone lounge in Aspen with deep northern sunlight. I seek a masterwork that anchors silence and is built of genuine limestone plaster."
                        rows={5}
                        className={`w-full ${isDark ? "bg-[#050505] border-stone-800 text-[#ECE7DF] placeholder-stone-600" : "bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400"} focus:border-[#8A6A45]/50 focus:outline-none p-4 font-serif-lux text-base rounded-none transition-all resize-none`}
                      />
                    </div>

                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className={`font-mono-lux text-[9px] ${isDark ? "text-[#D8D1C7]/50" : "text-stone-500"} tracking-[0.1em] uppercase`}>
                          GENAISTRUDIO PRIVATE PORT
                        </span>
                      </div>

                      <button
                        onClick={handleRequestAdvisory}
                        disabled={isLoadingAdvisory || !advisoryMessage.trim()}
                        className="px-8 py-3.5 bg-[#8A6A45] text-white font-serif-lux text-xxs uppercase tracking-[0.3em] font-light cursor-pointer hover:bg-[#9e794f] disabled:opacity-40 transition-all rounded-none"
                      >
                        {isLoadingAdvisory ? "CURATING ADVISEMENT..." : "TRANSMIT"}
                      </button>
                    </div>

                    {/* RESPONSE BOARD */}
                    <AnimatePresence mode="wait">
                      {(advisoryResult || isLoadingAdvisory) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`mt-8 border-t ${isDark ? "border-stone-800" : "border-stone-200"} pt-8`}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <CornerDownRight className="w-4 h-4 text-[#8A6A45]" />
                            <span className="font-mono-lux text-[9px] text-[#8A6A45] tracking-[0.3em] uppercase">
                              PRINCIPAL CURATOR'S MEMORANDUM
                            </span>
                          </div>

                          {isLoadingAdvisory ? (
                            <div className="flex flex-col gap-2 py-4">
                              <div className={`h-4 ${isDark ? "bg-stone-900" : "bg-stone-100"} rounded animate-pulse w-3/4`} />
                              <div className={`h-4 ${isDark ? "bg-stone-900" : "bg-stone-100"} rounded animate-pulse w-5/6`} />
                              <div className={`h-4 ${isDark ? "bg-stone-900" : "bg-stone-100"} rounded animate-pulse w-2/3`} />
                            </div>
                          ) : (
                            <div className={`font-serif-lux text-base ${isDark ? "text-[#ECE7DF] bg-black/45" : "text-stone-850 bg-stone-50/60"} leading-relaxed italic p-6 border-l border-[#8A6A45] whitespace-pre-line text-left`}>
                              {advisoryResult}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* SIGNATURE COLLECTOR MODE CONTROL BAR AT BOTTOM */}
      <footer className="bg-black border-t border-stone-800/80 px-6 md:px-16 py-8 relative z-30 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col text-left">
          <span className="font-mono-lux text-[8px] tracking-[0.3em] text-[#8A6A45] uppercase mb-2">
            SIGNATURE COLLECTOR EXPERIENCE
          </span>
          <div className="flex flex-wrap gap-2 md:gap-4">
            {COLLECTOR_MOOD_CONFIGS.map(cfg => (
              <button
                key={cfg.mood}
                onClick={() => {
                  setActiveMood(cfg.mood);
                  audioAmbiance.playInquireTone();
                }}
                className={`px-3.5 py-1.5 font-mono-lux text-[9px] uppercase tracking-wider border rounded-full transition-all cursor-pointer ${activeMood === cfg.mood ? "bg-[#8A6A45] border-[#8A6A45] text-white" : "border-stone-800 hover:border-stone-600 text-[#D8D1C7]/60"}`}
              >
                {cfg.mood}
              </button>
            ))}
          </div>
        </div>

        {/* Current status info */}
        <div className="flex items-center gap-6 font-mono-lux text-[9px] text-[#D8D1C7]/40 uppercase tracking-widest text-center md:text-right">
          <div>
            <span className="block text-[#8A6A45]">ACTIVE SETTING</span>
            <span className="text-white mt-0.5 block">{currentMoodConfig.title} Ambiance</span>
          </div>
          <div className="h-6 w-px bg-stone-800" />
          <div>
            <span className="block text-[#8A6A45]">ACOUSTICS</span>
            <span className="text-white mt-0.5 block">
              {currentMoodConfig.ambientHumHz}Hz & {currentMoodConfig.harmonicHz}Hz Active
            </span>
          </div>
          {/* POWERED BY */}
          <div className="mt-5 flex justify-end">
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 transition-all duration-300 hover:bg-white/10">

              <a
                href="https://fabulousmedia.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-90 hover:opacity-100 transition-opacity"
                aria-label="FabulousMedia"
              >
                <img
                  src="/public/fabulous-logo.png"
                  alt="FabulousMedia"
                  className="h-3 w-auto"
                />
              </a>

              <span className="h-3 w-px bg-white/30" />

              <a
                href="https://gocommercially.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-200 hover:opacity-200 transition-opacity"
                aria-label="GoCommercially"
              >
                <img
                  src="/public/go_tm logo white.png"
                  alt="GoCommercially"
                  className="h-3 w-auto"
                />
              </a>

            </div>
          </div>
        </div>
      </footer>

      {/* WHITE GLOVE ACQUISITION OVERLAY / PRIVATE INQUIRY MODAL */}
      <AnimatePresence>
        {acquiryTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark back layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              onClick={() => setAcquiryTarget(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative max-w-xl w-full bg-[#0A0A0A] border border-[#ECE7DF]/15 p-8 shadow-[0_50px_100px_rgba(0,0,0,0.95)] z-10 text-left"
            >
              <button
                onClick={() => setAcquiryTarget(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="font-mono-lux text-[8px] tracking-[0.3em] text-[#8A6A45] uppercase block mb-1">
                    SOVEREIGN PLACEMENT REQUEST
                  </span>
                  <h3 className="font-serif-lux text-3xl font-light text-[#ECE7DF]">
                    Acquisition Petition
                  </h3>
                </div>

                {/* Petioning target Details */}
                <div className="flex gap-4 items-center bg-stone-900/60 p-3 border border-stone-800">
                  <img
                    src={acquiryImgSrc}
                    alt="acquiring"
                    referrerPolicy="no-referrer"
                    className="w-16 h-20 object-cover border border-stone-800"
                  />
                  <div>
                    <h4 className="font-serif-lux text-base text-[#ECE7DF] tracking-wide">{acquiryTarget.title}</h4>
                    <p className="font-mono-lux text-[10px] text-[#8A6A45] mt-0.5 uppercase">
                      {acquiryTarget.artist} — {acquiryTarget.year}
                    </p>
                    <span className="text-[10px] text-[#D8D1C7]/50 block mt-1">{acquiryTarget.size}</span>
                  </div>
                </div>

                {submitSuccess ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-stone-900 p-6 border border-emerald-500/30 text-center space-y-3"
                  >
                    <Check className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h4 className="font-serif-lux text-lg text-white">Petition Transmitted to Magnum Registry</h4>
                    <p className="font-serif-lux italic text-xs text-stone-400">
                      “An advisory agent will construct private encrypted channels to complete your Acquisition and confirm White-Glove placement routing.”
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleAcquireSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono-lux text-[8px] text-[#8A6A45] uppercase">COLLECTOR FULL NAME</label>
                      <input
                        type="text"
                        required
                        value={acquisitionForm.fullName}
                        onChange={(e) => setAcquisitionForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full bg-stone-950 border border-stone-800 p-3 font-serif-lux text-sm text-white focus:outline-none focus:border-[#8A6A45]/40"
                        placeholder="e.g. Lord Alistair Vance"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono-lux text-[8px] text-[#8A6A45] uppercase">ENCRYPTED COMMUNICATOR EMAIL</label>
                      <input
                        type="email"
                        required
                        value={acquisitionForm.email}
                        onChange={(e) => setAcquisitionForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-stone-950 border border-stone-800 p-3 font-serif-lux text-sm text-white focus:outline-none focus:border-[#8A6A45]/40"
                        placeholder="e.g. vance@sovereignholdings.corp"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono-lux text-[8px] text-[#8A6A45] uppercase">MEMORANDUM & SPATIAL MOUNTING NOTES</label>
                      <textarea
                        value={acquisitionForm.galleryNote}
                        onChange={(e) => setAcquisitionForm(prev => ({ ...prev, galleryNote: e.target.value }))}
                        className="w-full bg-stone-950 border border-stone-800 p-3 font-serif-lux text-sm text-white focus:outline-none focus:border-[#8A6A45]/40 resize-none"
                        rows={3}
                        placeholder="e.g. Seeking high-ceiling mounting bracket placement instructions."
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-[#8A6A45] hover:bg-[#a68054] text-white font-serif-lux font-light tracking-[0.3em] text-xs uppercase py-4 transition-all rounded-none cursor-pointer"
                      >
                        SUBMIT OFFICIAL PETITION
                      </button>
                    </div>
                  </form>
                )}

                <div className="text-center font-mono-lux text-[8px] tracking-widest text-[#D8D1C7]/40 uppercase">
                  WHITE-GLOVE COURIER SERVICES SECURED // PRIVATE DISTRIBUTION ONLY
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Poetic, quiet-luxury fallback advisor responses for demo mode
function getMockAdvisorResponse(mood: string, message: string, artwork: Artwork | null): string {
  const artworkContext = artwork ? `focusing on the masterwork "${artwork.title}" by ${artwork.artist}` : "exploring our sovereign vault selection";

  switch (mood) {
    case "Calm":
      return `Collector, in seeking an atmosphere of silence and clarity, we recommend focusing on works that utilize minimalist space. ${artworkContext ? `Your interest, ${artworkContext}, aligns beautifully with this pursuit. ` : ""}Notice the quiet expanse, the delicate gradient of grey, and how the light catches the silver grain. To place this print in a brutalist space of concrete and limestone would create a sublime dialogue between raw geological weight and silent paper photography. It requires room to breathe—allow at least two feet of margin on either side of the frame.`;
    case "Power":
      return `The gravity of your request demands structural mass. ${artworkContext ? `The work, ${artworkContext}, delivers an anatomical weight that anchors any room. ` : ""}It is a testament to raw form, capturing a moment of intense contrast and physical presence. For an environment intended to project authority and quiet strength, this print should be mounted with a heavy matte black wooden frame, offset slightly from center to break symmetric expectation.`;
    case "Spiritual":
      return `There is an ethereal quality that transcends the frame here. ${artworkContext ? `By looking at ${artworkContext}, you are engaging with a metaphysical boundary. ` : ""}The interplay of deep shadow and faint luminosity suggests a sacred space. We suggest mounting this work in a space that experiences transition—a hallway or entry chamber where daylight changes organically, allowing the print's depth to reveal itself slowly to those who pass.`;
    case "Mystery":
      return `The shadows hold the truth of this capture. ${artworkContext ? `In considering ${artworkContext}, we are invited into the unsaid. ` : ""}The low-key lighting and dense grain evoke a cinematic narrative where the subject is only partially revealed. This piece thrives in low-ambient lighting, perhaps illuminated by a single warm pin-spot. It is an intellectual puzzle that does not yield its secrets at first glance.`;
    case "Royal":
      return `An air of archival prestige and historical dignity surrounds this selection. ${artworkContext ? `Selecting ${artworkContext} is an investment in the lineage of twentieth-century master photography. ` : ""}It commands attention through absolute confidence in composition. We advise a grand presentation: wide margins, museum-grade glass, and a placement of honor where it can be viewed from a distance to appreciate its scale.`;
    case "Contemplative":
    default:
      return `Your inquiry reflects a desire for deep introspection. ${artworkContext ? `The quiet grace of ${artworkContext} serves as a portal for self-reflection. ` : ""}The gentle focus, soft shadows, and organic textures invite the viewer to linger. Place this work in a private study or library—a sanctuary where the mind is free to wander. Let it hang at eye level, close to a seating arrangement, so it can be appreciated in moments of silence.`;
  }
}
