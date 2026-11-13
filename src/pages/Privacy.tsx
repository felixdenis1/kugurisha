import LegalLayout from "../components/legal/LegalLayout"
import LegalSection from "../components/legal/LegalSection"

const toc = [
  { id: "amakuru", label: "Amakuru dukusanya" },
  { id: "impamvu", label: "Impamvu dukusanya amakuru" },
  { id: "kubika", label: "Uko tubika amakuru" },
  { id: "gusangiza", label: "Gusangiza abandi" },
  { id: "uburenganzira", label: "Uburenganzira bwawe" },
  { id: "cookies", label: "Cookies" },
  { id: "itumanaho", label: "Itumanaho" },
]

export default function Privacy() {
  return (
    <LegalLayout
      eyebrow="Ubuzima bwite"
      title="Politiki y'ubuzima bwite"
      subtitle="Dufata ubuzima bwite bwawe nk'ikintu cy'agaciro. Iyi politiki isobanura amakuru dukusanya, impamvu tuyakusanya, n'uburyo tuyabika."
      lastUpdated="15 Ugushyingo 2025"
      toc={toc}
    >
      <LegalSection id="amakuru" index="01" title="Amakuru dukusanya">
        <p>Dukusanya amakuru akenewe kugira ngo urubuga rukore neza:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--primary)]">
          <li>
            <strong className="text-[var(--text)]">Amakuru y'identite:</strong>{" "}
            amazina, imeyili, nimero ya telefoni.
          </li>
          <li>
            <strong className="text-[var(--text)]">Amakuru y'ibicuruzwa:</strong>{" "}
            amafoto, ibisobanuro, igiciro, aho ikintu kiherereye.
          </li>
          <li>
            <strong className="text-[var(--text)]">Amakuru y'ikoranabuhanga:</strong>{" "}
            aderesi IP, ubwoko bw'igikoresho, ururimi, n'ibihe bikoresha.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="impamvu" index="02" title="Impamvu dukusanya amakuru">
        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--primary)]">
          <li>Kugira ngo dushobore kwerekana ibicuruzwa ku baguzi.</li>
          <li>Kugira ngo duhuze abagura n'abagurisha.</li>
          <li>Kurinda umutekano w'urubuga no kurwanya uburiganya.</li>
          <li>Kunoza serivisi zacu (ibipimo, AI, n'ibindi).</li>
        </ul>
      </LegalSection>

      <LegalSection id="kubika" index="03" title="Uko tubika amakuru">
        <p>
          Amakuru abikwa mu buryo butekanye, hakoreshejwe uburyo bwa
          kriptogarafi. Ugera ku makuru yawe gusa, uretse iyo amategeko
          y'u Rwanda abisabye cyangwa iyo ubihaye uruhushya.
        </p>
      </LegalSection>

      <LegalSection id="gusangiza" index="04" title="Gusangiza abandi">
        <p>
          Ntitugurisha amakuru yawe. Dushobora gusangiza amakuru gusa:
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--primary)]">
          <li>Abafatanyabikorwa b'ubwishyu, gusa kugira ngo ubwishyu bukore.</li>
          <li>Abafite uburenganzira bw'amategeko iyo babisabye.</li>
        </ul>
      </LegalSection>

      <LegalSection id="uburenganzira" index="05" title="Uburenganzira bwawe">
        <ul className="list-disc space-y-2 pl-5 marker:text-[var(--primary)]">
          <li>Kubona amakuru yose tuyabika kuri wowe.</li>
          <li>Gusaba ko amakuru akosowe cyangwa asibwe.</li>
          <li>Gusaba gusiba konti yawe burundu.</li>
          <li>Kwanga ubutumwa bwo kwamamaza.</li>
        </ul>
        <p>
          Kugira ngo ukoreshe uburenganzira bwawe, twandikire kuri{" "}
          <a
            href="mailto:privacy@kugurisha.com"
            className="font-semibold text-[var(--primary)] underline decoration-[var(--primary)]/40 underline-offset-4 hover:decoration-[var(--primary)]"
          >
            privacy@kugurisha.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="cookies" index="06" title="Cookies">
        <p>
          Dukoresha cookies kugira ngo tukumire neza. Ushobora kubona ibisobanuro
          byuzuye kuri paji yacu y'ibijyanye na{" "}
          <a
            href="/cookies"
            className="font-semibold text-[var(--primary)] underline decoration-[var(--primary)]/40 underline-offset-4 hover:decoration-[var(--primary)]"
          >
            Cookies
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="itumanaho" index="07" title="Itumanaho">
        <p>
          Ibibazo kuri iyi politiki:{" "}
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