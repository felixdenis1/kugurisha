import LegalLayout from "../components/legal/LegalLayout"
import LegalSection from "../components/legal/LegalSection"

const toc = [
  { id: "cookies-ni-iki", label: "Cookies ni iki?" },
  { id: "ubwoko", label: "Ubwoko bwa cookies dukoresha" },
  { id: "gucunga", label: "Gucunga cookies" },
  { id: "itumanaho", label: "Itumanaho" },
]

export default function Cookies() {
  return (
    <LegalLayout
      eyebrow="Cookies"
      title="Politiki y'ibijyanye na cookies"
      subtitle="Dukoresha cookies kugira ngo urubuga rukore neza, tukumenye neza, kandi turinde umutekano wawe. Iyi paji isobanura uko bikora."
      lastUpdated="15 Ugushyingo 2025"
      toc={toc}
    >
      <LegalSection id="cookies-ni-iki" index="01" title="Cookies ni iki?">
        <p>
          Cookies ni udufungito duto two ku ruhande rw'umukoresha (browser)
          tubikwa iyo usuye urubuga. Bidufasha kwibuka amahitamo yawe, kumenya
          ibice by'urubuga bikoreshwa cyane, no kurinda umutekano wa konti yawe.
        </p>
      </LegalSection>

      <LegalSection id="ubwoko" index="02" title="Ubwoko bwa cookies dukoresha">
        <p>Dukoresha ibyiciro bitatu bya cookies:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--primary)]">
          <li>
            <strong className="text-[var(--text)]">Za ngombwa:</strong> zidufasha
            gukomeza ukwinjira n'ubutekano bwa konti. Ntizishobora kuzimwa.
          </li>
          <li>
            <strong className="text-[var(--text)]">Iz'ibipimo:</strong> zituma
            tumenya ibice bikoreshwa cyane kugira ngo tunoze urubuga.
          </li>
          <li>
            <strong className="text-[var(--text)]">Iz'ubwoba (optional):</strong>{" "}
            zidufasha kukwereka ibicuruzwa bishobora kukunezeza. Ushobora
            kuzihagarika.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="gucunga" index="03" title="Gucunga cookies">
        <p>
          Ushobora gukuraho cyangwa guhagarika cookies muri browser yawe. Menya
          ko guhagarika cookies z'ingenzi bishobora gutuma urubuga rudakora neza.
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--primary)]">
          <li>Chrome: Settings → Privacy → Cookies.</li>
          <li>Firefox: Settings → Privacy & Security → Cookies.</li>
          <li>Safari: Settings → Privacy → Cookies.</li>
        </ul>
      </LegalSection>

      <LegalSection id="itumanaho" index="04" title="Itumanaho">
        <p>
          Ibibazo kuri cookies:{" "}
          <a
            href="mailto:privacy@kugurisha.com"
            className="font-semibold text-[var(--primary)] underline decoration-[var(--primary)]/40 underline-offset-4 hover:decoration-[var(--primary)]"
          >
            privacy@kugurisha.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  )
}