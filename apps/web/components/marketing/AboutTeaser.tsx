import Image from "next/image";
import Link from "next/link";

import { H2, Label, Section } from "./Section";
import { LINKS } from "./links";

export function AboutTeaser() {
  return (
    <Section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-start gap-[clamp(24px,4vw,52px)]">
      <div className="rv">
        <Label className="mb-5">Who you&rsquo;re dealing with</Label>
        <H2 className="mb-[18px] max-w-[20ch]">One person, start to finish.</H2>
        <Image
          src="/portrait.png"
          alt="Nazarii Tsubera"
          width={1254}
          height={1254}
          sizes="240px"
          className="h-auto w-full max-w-[240px]"
        />
      </div>
      <div className="rv space-y-4">
        <p className="text-body">
          I work independently, so the person who listens to the problem is the person who builds the fix and answers the
          phone afterwards. There&rsquo;s no account manager to hand you off to.
        </p>
        <p className="text-body">
          By day I&rsquo;m a backend and infrastructure engineer at Global Virtual Opportunities in San Antonio, where I
          build and run the platforms behind MarkoMax and LoveFund. I&rsquo;m also a computer science student at UTSA,
          class of 2028.
        </p>
        <Link href={LINKS.about} className="l navlink inline-block pt-2 text-accent">
          More about me <span className="arw">&rarr;</span>
        </Link>
      </div>
    </Section>
  );
}
