import { useCallback } from "react";

export const useSound = (soundPath: string) => {
  const playSound = useCallback(() => {
    try {
      const audio = new Audio(soundPath);
      audio.volume = 0.5; // Set volume to 50%
      audio.play().catch((error) => {
        console.log("Sound playback failed:", error);
      });
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  }, [soundPath]);

  return playSound;
};
