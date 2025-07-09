// import { useEffect, useState } from "react";
// import { useEmpreendimentos } from "../context/EmpreendimentosContext";
// import { useLanguage } from "../context/LanguageContext";
// import useDynamicTranslation from "../hooks/useDynamicTranslaction";
// import { ArrowRight } from "lucide-react";

// const BACKEND = "https://back-end-objetiva.onrender.com";

// const imgSrc = (raw) => {
//   if (!raw || raw === "string") return "/placeholder.jpg";
//   if (Array.isArray(raw)) raw = raw[0];
//   if (raw.startsWith("data:image")) return raw;
//   if (raw.length > 200 && !raw.startsWith("http")) {
//     return `data:image/*;base64,${raw.replace(/^\/+/, "")}`;
//   }
//   if (/^https?:\/\//i.test(raw)) return raw;
//   if (!raw.startsWith("/")) raw = "/" + raw;
//   return BACKEND + raw;
// };

// const EmpreendimentosGrid = ({ category }) => {
//   const { empreendimentos, loading } = useEmpreendimentos();
//   const { language } = useLanguage();
//   const { translateBatch } = useDynamicTranslation();

//   const [translatedCards, setTranslatedCards] = useState([]);

//   useEffect(() => {
//     const traduzir = async () => {
//       if (!empreendimentos || empreendimentos.length === 0) return;

//       if (language === "port") {
//         setTranslatedCards(empreendimentos);
//         return;
//       }

//       const textos = empreendimentos.flatMap((e) => [
//         e.tipo || "",
//         e.status || "",
//         e.name || "",
//       ]);

//       // Dividir em blocos menores
//       const chunkSize = 10; // Reduzido para 10
//       const traducaoFinal = [];

//       const translateWithRetry = async (chunk, retries = 3) => {
//         for (let attempt = 0; attempt < retries; attempt++) {
//           try {
//             return await translateBatch(chunk, "en");
//           } catch (error) {
//             console.error(`Erro na tentativa ${attempt + 1}:`, error);
//             if (attempt === retries - 1) throw error; // Lança o erro se for a última tentativa
//           }
//         }
//       };

//       for (let i = 0; i < textos.length; i += chunkSize) {
//         const chunk = textos.slice(i, i + chunkSize);
//         try {
//           const traduzido = await translateWithRetry(chunk);
//           traducaoFinal.push(...traduzido);
//         } catch (error) {
//           console.warn("Erro ao traduzir o bloco:", error);
//         }
//       }

//       // Importante: garantir que o número de traduções esteja correto
//       if (traducaoFinal.length < textos.length) {
//         console.warn("Traduções incompletas:", {
//           esperados: textos.length,
//           recebidos: traducaoFinal.length,
//         });
//       }

//       const cardsTraduzidos = empreendimentos.map((e, i) => ({
//         ...e,
//         tipo: traducaoFinal[i * 3] ?? e.tipo,
//         status: traducaoFinal[i * 3 + 1] ?? e.status,
//         name: traducaoFinal[i * 3 + 2] ?? e.name,
//       }));

//       setTranslatedCards(cardsTraduzidos);
//     };

//     traduzir();
//   }, [language, empreendimentos?.length]);

//   if (loading) return <p className="text-center text-gray-500 py-10">Carregando empreendimentos…</p>;

//   const itens =
//     category === "Todos"
//       ? translatedCards
//       : translatedCards.filter((e) => e.tipo?.toLowerCase() === category.toLowerCase());

//   return (
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//       {itens.map((card, idx) => (
//         <div key={card.id} className="relative group aspect-square overflow-hidden rounded">
//           <img
//             src={imgSrc(card.images?.[0])}
//             alt={card.name}
//             className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//           />
//           <div className="absolute inset-0 bg-orange-600/70 opacity-0 group-hover:opacity-100 transition-opacity" />
//           {idx === 0 && (
//             <ArrowRight
//               size={28}
//               className="absolute top-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity"
//             />
//           )}
//           <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-10">
//             <p className="text-xs capitalize">
//               {card.tipo || "Tipo"} — {card.status || "Status"}
//             </p>
//             <h3 className="text-base font-semibold leading-tight break-words">{card.name}</h3>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default EmpreendimentosGrid;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useEmpreendimentos } from "../context/EmpreendimentosContext";
import { useLanguage } from "../context/LanguageContext";
import useDynamicTranslation from "../hooks/useDynamicTranslaction";
import { ArrowRight } from "lucide-react";

const BACKEND = "https://back-end-objetiva.onrender.com";

const imgSrc = (raw) => {
  if (!raw || raw === "string") return "/placeholder.jpg";
  if (Array.isArray(raw)) raw = raw[0];
  if (raw.startsWith("data:image")) return raw;
  if (raw.length > 200 && !raw.startsWith("http")) {
    return `data:image/*;base64,${raw.replace(/^\/+/, "")}`;
  }
  if (/^https?:\/\//i.test(raw)) return raw;
  if (!raw.startsWith("/")) raw = "/" + raw;
  return BACKEND + raw;
};

const EmpreendimentosGrid = ({ category }) => {
  const { empreendimentos, loading } = useEmpreendimentos();
  const { language } = useLanguage();
  const { translateBatch } = useDynamicTranslation();

  const [translatedCards, setTranslatedCards] = useState([]);

  useEffect(() => {
    const traduzir = async () => {
      if (!empreendimentos || empreendimentos.length === 0) return;

      if (language === "port") {
        setTranslatedCards(empreendimentos);
        return;
      }

      const textos = empreendimentos.flatMap((e) => [
        e.tipo || "",
        e.status || "",
        e.name || "",
      ]);

      const chunkSize = 10;
      const traducaoFinal = [];

      const translateWithRetry = async (chunk, retries = 3) => {
        for (let attempt = 0; attempt < retries; attempt++) {
          try {
            return await translateBatch(chunk, "en");
          } catch (error) {
            console.error(`Erro na tentativa ${attempt + 1}:`, error);
            if (attempt === retries - 1) throw error;
          }
        }
      };

      for (let i = 0; i < textos.length; i += chunkSize) {
        const chunk = textos.slice(i, i + chunkSize);
        try {
          const traduzido = await translateWithRetry(chunk);
          traducaoFinal.push(...traduzido);
        } catch (error) {
          console.warn("Erro ao traduzir o bloco:", error);
        }
      }

      if (traducaoFinal.length < textos.length) {
        console.warn("Traduções incompletas:", {
          esperados: textos.length,
          recebidos: traducaoFinal.length,
        });
      }

      const cardsTraduzidos = empreendimentos.map((e, i) => ({
        ...e,
        tipo: traducaoFinal[i * 3] ?? e.tipo,
        status: traducaoFinal[i * 3 + 1] ?? e.status,
        name: traducaoFinal[i * 3 + 2] ?? e.name,
      }));

      setTranslatedCards(cardsTraduzidos);
    };

    traduzir();
  }, [language, empreendimentos?.length]);

  if (loading) return <p className="text-center text-gray-500 py-10">Carregando empreendimentos…</p>;

  const itens =
    category === "Todos"
     
      ? translatedCards.filter((e) => e.display_on === "empreendimentos")
      :  translatedCards.filter((e) => 
        e.tipo?.toLowerCase() === category.toLowerCase() && e.display_on === "empreendimentos");

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {itens.map((card, idx) => (
        <Link
          to={`/empreendimentos/${card.id}`}
          key={card.id}
          className="relative group aspect-square overflow-hidden rounded"
        >
          <img
            src={imgSrc(card.images?.[0])}
            alt={card.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-orange-600/70 opacity-0 group-hover:opacity-100 transition-opacity" />
          {idx === 0 && (
            <ArrowRight
              size={28}
              className="absolute top-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            />
          )}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-10">
            <p className="text-xs capitalize">
              {card.tipo || "Tipo"} — {card.status || "Status"}
            </p>
            <h3 className="text-base font-semibold leading-tight break-words">{card.name}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default EmpreendimentosGrid;
