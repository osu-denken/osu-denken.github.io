import ParticleSpaceAnimationBackground from "@components/ParticleSpaceAnimationBackground";
import type { NextPageWithLayout } from "../../types/NextPageWithLayout";

const BackgroundPage : NextPageWithLayout = () => {
  return (
    <>
      <ParticleSpaceAnimationBackground />
    </>
  );
};

BackgroundPage.getLayout = (page) => page;

export default BackgroundPage;