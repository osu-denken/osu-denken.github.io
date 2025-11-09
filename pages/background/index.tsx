import { ParticleSpaceAnimationBackground } from "../components/ParticleSpaceAnimationBackground";
import type { NextPageWithLayout } from "../api/NextPageWithLayout";

const BackgroundPage : NextPageWithLayout = () => {
  return (
    <>
      <ParticleSpaceAnimationBackground />
    </>
  );
};

BackgroundPage.getLayout = (page) => page;

export default BackgroundPage;