import type { NextPage } from "next";
import { Container } from "@mantine/core";
import dynamic from "next/dynamic";

const AudioPlayer = dynamic(
  () => import("../components/audio/AudioPlayer/AudioPlayer"),
  {
    ssr: false,
  }
);

const Home: NextPage = () => {
  return (
    <Container>
      <AudioPlayer audioPath={"/samples/skrill.wav"} />
      <AudioPlayer audioPath={"/samples/sample_10.wav"} />
    </Container>
  );
};

export default Home;
