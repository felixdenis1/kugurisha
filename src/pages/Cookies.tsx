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
      subtitle="Dukoresha cookies kugira ngo urubuga rukore neza, tukumenye neza, kandi turinde umutekano wawe. Iyi paji isobanura uko bikora n'uburyo wazicunga."
      lastUpdated="15 Ugushyingo 2025"
      toc={toc}
    >
      <LegalSection id="cookies-ni-iki" index="01" title="Cookies ni iki?">
        <p>
          Cookies ni udufungito duto two ku ruhande rw'umukoresha (browser)
          tubikwa iyo usuye urubuga. Bidufasha kwibuka amahitamo yawe, kumenya
          ibice by'urubuga bikoreshwa cyane, no kurinda umutekano wa konti yawe.
        </p>
        <p>
          Hari ubwoko bubiri bw'ibanze: <strong className="text-[var(--text)]">session cookies</strong>{" "}
          (zisibwa iyo ufunze browser) na{" "}
          <strong className="text-[var(--text)]">persistent cookies</strong> (ziguma
          ku gikoresho cyawe igihe kitarangiye).
        </p>
      </LegalSection>

      <LegalSection id="ubwoko" index="02" title="Ubwoko bwa cookies dukoresha">
        <p>Dukoresha ibyiciro bitatu bya cookies kuri KUGURISHA.COM:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--primary)]">
          <li>
            <strong className="text-[var(--text)]">Za ngombwa (essential):</strong>{" "}
            zidufasha gukomeza ukwinjira, kubika amahitamo y'ururimi, no
            kurinda umutekano wa konti. Ntizishobora kuzimwa.
          </li>
          <li>
            <strong className="text-[var(--text)]">Iz'ibipimo (analytics):</strong>{" "}
            zituma tumenya ibice bikoreshwa cyane, ibicuruzwa bikunzwe, n'ahantu
            hakunze gutuma abakoresha bahagarara. Biduha amakuru yo kunoza
            urubuga.
          </li>
          <li>
            <strong className="text-[var(--text)]">Iz'ubwoba (marketing — optional):</strong>{" "}
            zidufasha kukwereka ibicuruzwa bishobora kukunezeza hashingiwe ku
            byo wasuye. Ushobora kuzihagarika igihe icyo ari cyo cyose.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="gucunga" index="03" title="Gucunga cookies">
        <p>
          Ushobora gukuraho cyangwa guhagarika cookies muri browser yawe igihe
          icyo ari cyo cyose. Menya ko guhagarika cookies z'ingenzi bishobora
          gutuma urubuga rudakora neza cyangwa ntushobore kwinjira muri konti
          yawe.
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--primary)]">
          <li>
            <strong className="text-[var(--text)]">Chrome:</strong> Settings →
            Privacy and security → Cookies and other site data.
          </li>
          <li>
            <strong className="text-[var(--text)]">Firefox:</strong> Settings →
            Privacy & Security → Cookies and Site Data.
          </li>
          <li>
            <strong className="text-[var(--text)]">Safari:</strong> Settings →
            Privacy → Manage Website Data.
          </li>
          <li>
            <strong className="text-[var(--text)]">Edge:</strong> Settings →
            Cookies and site permissions → Manage and delete cookies.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="itumanaho" index="04" title="Itumanaho">
        <p>
          Ibibazo kuri cookies cyangwa uko tubika amakuru:{" "}
          <a
            href="mailto:privacy@kugurisha.com"
            className="font-semibold text-[var(--primary)] underline decoration-[var(--primary)]/40 underline-offset-4 hover:decoration-[var(--primary)]"
          >
            privacy@kugurisha.com
          </a>
          . Ushobora kandi gusoma{" "}
          <a
            href="/privacy"
            className="font-semibold text-[var(--primary)] underline decoration-[var(--primary)]/40 underline-offset-4 hover:decoration-[var(--primary)]"
          >
            Politiki y'ubuzima bwite
          </a>{" "}
          kugira ngo umenye byinshi.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}