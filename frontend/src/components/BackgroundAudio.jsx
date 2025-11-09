import React, { useEffect, useRef, useState } from "react";
import omAudio from "../assets/om.mp3";
import { motion } from "framer-motion";

const BackgroundAudio = () => {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(
    JSON.parse(localStorage.getItem("isMuted")) || false
  );
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.15;
      audio.loop = true;
      audio.muted = isMuted;
    }
  }, [isMuted]);

  const startMusic = async () => {
    const audio = audioRef.current;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.log("Autoplay blocked until user interacts");
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      const newMuteState = !isMuted;
      audio.muted = newMuteState;
      setIsMuted(newMuteState);
      localStorage.setItem("isMuted", JSON.stringify(newMuteState));
    }
  };

  useEffect(() => {
    const playOnInteraction = () => {
      startMusic();
      document.removeEventListener("click", playOnInteraction);
    };
    document.addEventListener("click", playOnInteraction);
    return () => document.removeEventListener("click", playOnInteraction);
  }, []);

  return (
    <>
      <audio ref={audioRef} src={omAudio} loop playsInline />

      {/* 🔇 Mute / Unmute Button */}
      <motion.button
        onClick={!isPlaying ? startMusic : toggleMute}
        className={`fixed bottom-6 right-6 z-9999 bg-[rgba(0,0,0,0.6)] rounded-full w-12 h-12 flex items-center justify-center shadow-[0_0_15px_rgba(194,153,90,0.4)] border border-[#c2995a]/60 hover:bg-[rgba(0,0,0,0.8)] transition-all duration-300 ${
          !isPlaying ? "animate-pulse" : ""
        }`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        title={
          !isPlaying
            ? "Click to Start Music"
            : isMuted
            ? "Unmute Sound"
            : "Mute Sound"
        }
      >
        {/* Change icon based on state */}
        {!isPlaying ? (
          <span className="text-2xl text-gray-300">🔈</span> // waiting state
        ) : isMuted ? (
          <span className="text-2xl text-(--color-gold)">🔇</span> // muted
        ) : (
          <span className="text-2xl text-(--color-gold)">🔊</span> // playing
        )}
      </motion.button>

      {/* 🪷 "Tap to Continue Music" message */}
      {!isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed bottom-20 right-6 z-9999 bg-[rgba(0,0,0,0.6)] text-white px-4 py-2 rounded-lg text-sm font-[Outfit] cursor-pointer border border-[#c2995a]/50 shadow-md hover:bg-[rgba(0,0,0,0.8)] transition"
          onClick={startMusic}
        >
          🎵 Tap to Continue Music
        </motion.div>
      )}
    </>
  );
};

export default BackgroundAudio;