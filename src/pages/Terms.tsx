import LegalLayout from "../components/legal/LegalLayout"
import LegalSection from "../components/legal/LegalSection"

const toc = [
  { id: "kwiyandikisha", label: "Kwiyandikisha n'ubushobozi" },
  { id: "ibicuruzwa", label: "Ibicuruzwa byemewe" },
  { id: "ubwishingizi", label: "Ingwate n'ubwishingizi" },
  { id: "ubwishyu", label: "Ubwishyu n'ubwishyu bw'ubwoba" },
  { id: "ihohoterwa", label: "Ihohoterwa n'ibyaha" },
  { id: "guhagarika", label: "Guhagarika cyangwa gufunga konti" },
  { id: "itegeko", label: "Itegeko rikoreshwa" },
  { id: "itumanaho", label: "Itumanaho" },
]

export default function Terms() {
  return (
    <LegalLayout
      eyebrow="Amabwiriza"
      title="Amabwiriza yo gukoresha KUGURISHA.COM"
      subtitle="Aya ni amabwiriza agenga imikorere y'urubuga rwa KUGURISHA.COM mu Rwanda. Koresha uru rubuga, uba wemeye aya mabwiriza."
      lastUpdated="15 Ugushyingo 2025"
      toc={toc}
    >
      <LegalSection id="kwiyandikisha" index="01" title="Kwiyandikisha n'ubushobozi">
        <p>
          Kugira ngo ugurishe cyangwa ugure binyuze kuri KUGURISHA.COM, ugomba
          kuba ufite nibura imyaka 18 y'amavuko kandi ukagurisha ikintu uzi nezako aricya we bitabaye 
          ibyo ugakurikiranwa.
.
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--primary)]">
          <li>Ugomba gutanga amakuru y'ukuri igihe wiyandikisha.</li>
          <li>
            Ugomba kugumana ibanga ry'ijambo banga (password) yawe; ntubyiturire
            undi muntu.
          </li>
          <li>
            Konti imwe ni iy'umuntu umwe. Gukoresha konti nyinshi mu buryo
            bw'uburiganya birahagarikwa.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="ibicuruzwa" index="02" title="Ibicuruzwa byemewe">
        <p>
          Kuri KUGURISHA.COM hashobora gushyirwaho ibicuruzwa byemewe n'amategeko
          y'u Rwanda. Ibicuruzwa bikurikira ntibyemewe:
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--primary)]">
          <li>Intwaro, ibisasu, cyangwa ibikoresho by'urugamba.</li>
          <li>Ibiyobyabwenge n'ibikoresho byabyo.</li>
          <li>Ibinyabuzima cyangwa ibice byabyo bidafite uruhushya.</li>
          <li>Ibicuruzwa bihindura amakuru y'ibinyabuzima cyangwa iby'iterabwoba.</li>
        </ul>
      </LegalSection>

      <LegalSection id="ubwishingizi" index="03" title="Ingwate n'ubwishingizi">
        <p>
          KUGURISHA.COM ni isoko rihuza abagurisha n'abagura. Ntitwishingira
          ubwiza cyangwa ukuri kw'ibicuruzwa byatanzwe n'umugurisha.
        </p>
        <p>
          Abagura bagomba kugenzura ibicuruzwa mbere yo kwishyura. Igihe
          habaye amakimbirane, dushishikariza abagombaga kuganira mu buryo
          bw'ubwitonzi, kandi bashobora kudukoresha nk'umuhuza.
        </p>
      </LegalSection>

      <LegalSection id="ubwishyu" index="04" title="Ubwishyu n'ubwishyu bw'ubwoba">
        <p>
          Ubwishyu bw'ibicuruzwa bukorwa hagati y'umugura n'umugurisha. Niba
          ubwishyu bukorwa binyuze ku buryo bwemewe na KUGURISHA.COM, amategeko
          y'ubwishyu azagaragazwa mbere yo kwemeza.
        </p>
      </LegalSection>

      <LegalSection id="ihohoterwa" index="05" title="Ihohoterwa n'ibyaha">
        <p>Birabujijwe gukoresha uru rubuga mu:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--primary)]">
          <li>Gushyiraho ibicuruzwa bitemewe n'amategeko.</li>
          <li>Guhohotera abandi mu magambo cyangwa mu bikorwa.</li>
          <li>Kugerageza gusahura cyangwa kwangiza sisitemu y'urubuga.</li>
          <li>Kwandikira abandi utabifitiye uruhushya (spam).</li>
        </ul>
      </LegalSection>

      <LegalSection id="guhagarika" index="06" title="Guhagarika cyangwa gufunga konti">
        <p>
          Turafite uburenganzira bwo guhagarika cyangwa gufunga konti iyo
          tubonye ko hari ukurenga ku mabwiriza, cyangwa iyo abandi bakoresha
          batanga ibimenyetso byiza by'uburiganya.
        </p>
      </LegalSection>

      <LegalSection id="itegeko" index="07" title="Itegeko rikoreshwa">
        <p>
          Aya mabwiriza agengwa n'amategeko y'u Rwanda. Impaka zose zizakemurwa
          mu nkiko z'u Rwanda.
        </p>
      </LegalSection>

      <LegalSection id="itumanaho" index="08" title="Itumanaho">
        <p>
          Ibibazo cyangwa ibisobanuro kuri aya mabwiriza:{" "}
          <a
            href="mailto:legal@kugurisha.com"
            className="font-semibold text-[var(--primary)] underline decoration-[var(--primary)]/40 underline-offset-4 hover:decoration-[var(--primary)]"
          >
            legal@kugurisha.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  )
}