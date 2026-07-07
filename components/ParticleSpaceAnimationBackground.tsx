import { useParticleSpaceAnimation } from "@hooks/useParticleSpaceAnimation";

const ParticleSpaceAnimationBackground = () => {
  const { blurCanvasRef, charCanvasRef } = useParticleSpaceAnimation();

  return (
    <>
      <div className="overlay" style={{ position: "fixed", inset: 0, backgroundColor: "#12121266", zIndex: 2, pointerEvents: "none" }} />
      <canvas
        ref={blurCanvasRef}
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
      />
      <canvas
        ref={charCanvasRef}
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}
      />
    </>
  );
};

export default ParticleSpaceAnimationBackground;