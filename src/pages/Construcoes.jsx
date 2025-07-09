import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEmpreendimentos } from "../context/EmpreendimentosContext";
import Footer from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";
import useDynamicTranslation from "../hooks/useDynamicTranslaction";

const ORIGINAL_FILTROS = ["Todos"];
const ORIGINAL_PARAGRAFOS = [
  "Construção de Edificações",
  "Obras para Terceiros",
  "Gerenciamento e Fiscalização de Obras",
  "Built To Suit",
  "Reformas em Geral",
  "Construção de Reservatórios e Redes de Distribuição de Água",
];
const NAV_H = 96;

export default function Construcoes() {
  const { empreendimentos, loading } = useEmpreendimentos();
  const [tab, setTab] = useState("Todos");
  const [translatedFiltros, setTranslatedFiltros] = useState(ORIGINAL_FILTROS);
  const [translatedTitle, setTranslatedTitle] = useState("Construções para terceiros");
  const [translatedBreadcrumb, setTranslatedBreadcrumb] = useState("Construções");
  const [translatedEmpreendimentos, setTranslatedEmpreendimentos] = useState([]);
  const [translatedParagrafos, setTranslatedParagrafos] = useState(ORIGINAL_PARAGRAFOS);


  const { language } = useLanguage();
  const { translateBatch } = useDynamicTranslation();

  useEffect(() => {
    const traduzir = async () => {
      if (language === "port") {
        setTranslatedFiltros(ORIGINAL_FILTROS);
        setTranslatedBreadcrumb("Construções");
        setTranslatedParagrafos(ORIGINAL_PARAGRAFOS);
        setTranslatedEmpreendimentos(empreendimentos);
        return;
      }

      try {
        const [tituloTrad, breadcrumbTrad, ...filtrosTraduzidos] = await translateBatch(
          ["Construções para terceiros", "Construções", ...ORIGINAL_FILTROS],
          "en"
        );

        setTranslatedTitle(tituloTrad);
        setTranslatedBreadcrumb(breadcrumbTrad);
        setTranslatedFiltros(filtrosTraduzidos);

        const paragrafosTraduzidos = await translateBatch(ORIGINAL_PARAGRAFOS, "en");

        const corrigirErros = (lista) =>
        lista.map((t) => {
          let texto = t;

          // Corrigir traduções ruins
          if (texto.toLowerCase().includes("doware")) texto = "General Renovations";

          // Substituir caractere | por travessão —
          texto = texto.replace("|", "");

          return texto;
        });

        setTranslatedParagrafos(corrigirErros(paragrafosTraduzidos));


        const empreendimentosParaTraduzir = empreendimentos.flatMap((e) => [
          e.tipo || "",
          e.status || "",
          e.name || "",
        ]);

        const traducaoEmpreendimentos = await translateBatch(empreendimentosParaTraduzir, "en");

        const empreendimentosTraduzidos = empreendimentos.map((e, i) => ({
          ...e,
          tipo: traducaoEmpreendimentos[i * 3] || e.tipo,
          status: traducaoEmpreendimentos[i * 3 + 1] || e.status,
          name: traducaoEmpreendimentos[i * 3 + 2] || e.name,
        }));

        setTranslatedEmpreendimentos(empreendimentosTraduzidos);
      } catch (error) {
        console.error("Erro ao traduzir:", error);
      }
    };

    traduzir();
  }, [language, empreendimentos]);

  const lista = translatedEmpreendimentos.filter((e) => {
    const isCronstruction = e.display_on === "construções";
    const meatchesCategory = tab === "Todos" ? true : (e.tipo || "").toLowerCase() === tab.toLowerCase();
    return meatchesCategory && isCronstruction;
  });



  return (
    <main className="bg-white flex flex-col min-h-screen">
      <section
        className="w-full max-w-7xl mx-auto px-4"
        style={{ paddingTop: NAV_H + 32 }}
      >
        {/* breadcrumb */}
        <a href="/" className="text-xs uppercase tracking-wider text-gray-500 mb-2">
          Home / {translatedBreadcrumb}
        </a>

        {/* título */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8">
          {translatedTitle}
        </h1>

        {/* informacoes adicionais */}
        <ul className="list-disc pl-6 space-y-1 text-gray-700 text-base md:text-lg mb-10 uppercase"> 
          {translatedParagrafos.map((texto, i) => (
            <li key={i}>{texto}</li>
          ))}
        </ul>



        

        {/* abas de filtro */}
        <div className="flex gap-6 mb-10 text-sm md:text-base">
          {translatedFiltros.map((f) => (
            <button
              key={f}
              onClick={() => setTab(f)}
              className={`pb-1 border-b-2 transition-colors ${
                tab === f
                  ? "border-orange-600 text-orange-600 font-semibold"
                  : "border-transparent text-gray-600 hover:text-orange-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* grid */}
        {loading ? (
          <p className="text-gray-500">Carregando construções…</p>
        ) : (
          <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {lista.map((c) => (
              <Link to={`/empreendimentos/${c.id}`} key={c.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="relative h-60 rounded-lg overflow-hidden shadow group"
                >
                  {c.images?.length ? (
                    <img
                      src={c.images[0]}
                      alt={c.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-500">
                      Sem imagem
                    </div>
                  )}

                  {/* overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* informações */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                    <p className="text-white text-xs capitalize line-clamp-1">
                      {c.tipo || "-"} — {c.status || ""}
                    </p>
                    <h3 className="text-white font-semibold leading-tight line-clamp-2">
                      {c.name}
                    </h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </section>

      <Footer />
    </main>
  );
}