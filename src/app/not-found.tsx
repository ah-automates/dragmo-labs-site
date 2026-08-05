import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/shared/container";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
      />

      <Container className="relative">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <p
            aria-hidden
            className="font-heading text-[clamp(4rem,12vw,8rem)] font-extrabold leading-none tracking-[-0.05em] tabular-nums text-foreground-muted/25"
          >
            404
          </p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            This Page Took a Wrong Turn
          </h1>
          <p className="text-pretty text-base leading-relaxed text-foreground-muted">
            The page you are looking for does not exist or has moved. Here is
            the way back.
          </p>
          <ButtonLink href="/" className="mt-2">
            <ArrowLeft
              className="size-4 transition-transform duration-300 group-hover:-translate-x-1"
              aria-hidden
            />
            Back to Home
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
