import { Container } from "../custom-ui/container";
import { Heading } from "../custom-ui/heading";
import { options } from "@/.velite";

export default function Intro() {
  return (
    <>
      <Container width="marginxy">
        <Heading
          size="lg"
          fontweight="normal"
          className="text-balance leading-20"
        >
          {options.intro}
        </Heading>
      </Container>
    </>
  );
}
