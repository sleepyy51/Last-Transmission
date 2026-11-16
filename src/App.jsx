import { useCallback, useEffect, useRef, useState } from "react";
import AboutPanel from "./about/AboutPanel.jsx";
import { useAudio } from "./audio/useAudio.js";
import MapView from "./map/MapView.jsx";
import Starfield from "./stars/StarField.jsx";
import titleLogo from "../assets-src/logos/favicon-nobg.svg";

export default function App() {
  const [view, setView] = useState("title");
  const [scene, setScene] = useState("story");
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutButton = useRef(null);
  const {
    started,
    musicMuted,
    sfxMuted,
    start,
    toggleMusic,
    toggleSfx,
    playClick,
  } = useAudio(view === "title" ? "title" : scene);

  // Autoplay needs a gesture: the title theme starts on the first click or key
  // press on the title screen.
  useEffect(() => {
    if (started || view !== "title") return;
    const onGesture = () => start();
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [started, view, start]);

  // One shared click effect for every control, in the panel and on the map.
  useEffect(() => {
    const onClick = (e) => {
      if (e.target.closest("button, a, input")) playClick();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [playClick]);

  const closeAbout = useCallback(() => {
    setAboutOpen(false);
    aboutButton.current?.focus();
  }, []);

  const screen =
    view === "title" ? (
      <main className="screen">
        <img
          className="site-logo"
          src={titleLogo}
          alt="Last Transmission logo"
        />
        <h1>Last Transmission</h1>
        <p className="subtitle">Forgotten astral artifacts from mankind.</p>
        <p className="pitch">
          An interactive pixel-art map of NASA hardware still sitting on the
          Moon, Mars and Deep Space — with the science it made possible.
        </p>
        <p className="note">For the best experience use headphones</p>
        <div className="actions">
          <button onClick={() => setView("tour")}>Begin transmission</button>
          <button onClick={() => setView("explore")}>Explore the map</button>
        </div>
      </main>
    ) : (
      <MapView
        guided={view === "tour"}
        onSceneChange={setScene}
        onFinish={() => setView("title")}
      />
    );

  return (
    <>
      <Starfield pixelArt={true} starCount={150} shootingStars={true} />
      {screen}
      <button
        ref={aboutButton}
        type="button"
        className="about-toggle"
        aria-expanded={aboutOpen}
        aria-controls="about-panel"
        onClick={() => setAboutOpen((open) => !open)}
      >
        About
      </button>
      {aboutOpen && (
        <AboutPanel
          onClose={closeAbout}
          musicMuted={musicMuted}
          onToggleMusic={toggleMusic}
          sfxMuted={sfxMuted}
          onToggleSfx={toggleSfx}
        />
      )}
    </>
  );
}
