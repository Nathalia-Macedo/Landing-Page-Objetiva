// import React, { useState, useEffect, useRef } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import { Plus, Trash2, Upload, Save, Edit3, Image as ImageIcon, ChevronLeft, ChevronRight, Users, X } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import AdminHeader from "../components/HeaderAdmin";
// import AdminFooter from "../components/AdminFooter";

// const PROJECTS_API_URL = "https://back-end-objetiva.onrender.com/projects";
// const USERS_API_URL = "https://back-end-objetiva.onrender.com/auth/users";

// const fileToBase64 = (file) => new Promise((resolve, reject) => {
//   const reader = new FileReader();
//   reader.onload = (e) => resolve(e.target.result.split(",")[1]);
//   reader.onerror = reject;
//   reader.readAsDataURL(file);
// });

// export default function AdminEmpreendimentos() {
//   const { token } = useAuth();
//   const [form, setForm] = useState({ name: "", caption: "", images: [], localizacao: "", observacoes: [""], tipo: "", status: "" });
//   const [previews, setPreviews] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [projects, setProjects] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [users, setUsers] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [usersPerPage] = useState(5);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [userToDelete, setUserToDelete] = useState(null);
//   const [activeTab, setActiveTab] = useState("projects");
//   const inputFileRef = useRef();
//   const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

//   const fetchProjects = async () => {
//     try {
//       const res = await fetch(PROJECTS_API_URL);
//       if (!res.ok) throw new Error("Erro ao carregar projetos");
//       setProjects(await res.json());
//     } catch {
//       toast.error("Erro ao carregar projetos");
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       const res = await fetch(USERS_API_URL, { headers: authHeaders });
//       if (res.status === 401) throw new Error("unauth");
//       if (!res.ok) throw new Error("fail");
//       setUsers(await res.json());
//     } catch (err) {
//       toast.error(err.message === "unauth" ? "Sessão expirada. Faça login novamente." : "Erro ao carregar usuários");
//     }
//   };

//   useEffect(() => {
//     fetchProjects();
//     fetchUsers();
//   }, []);

//   const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
//   const handleObsChange = (i, v) => setForm((p) => ({ ...p, observacoes: p.observacoes.map((o, idx) => idx === i ? v : o) }));
//   const addObs = () => setForm((p) => ({ ...p, observacoes: [...p.observacoes, ""] }));
//   const removeObs = (i) => setForm((p) => ({ ...p, observacoes: p.observacoes.filter((_, idx) => idx !== i) }));

//   const handleFiles = async (files) => {
//     if (!files?.length) return;
//     const newImages = [];
//     const newPreviews = [...previews];
//     for (const file of files) {
//       const b64 = await fileToBase64(file);
//       newImages.push(b64);
//       newPreviews.push(`data:image/*;base64,${b64}`);
//     }
//     setForm((p) => ({ ...p, images: [...p.images, ...newImages] }));
//     setPreviews(newPreviews);
//   };

//   const onDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };

//   const handleImageDelete = async (imageUrl, index) => {
//     if (!editingId) return toast.error("Nenhum projeto em edição.");
//     setLoading(true);
//     try {
//       const url = `${PROJECTS_API_URL}/${editingId}/images`;
//       const res = await fetch(url, {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json", ...authHeaders },
//         body: JSON.stringify({ image_url: imageUrl })
//       });
//       if (res.status === 401) throw new Error("unauth");
//       if (!res.ok) throw new Error("fail");
//       setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));
//       setPreviews((p) => p.filter((_, i) => i !== index));
//       toast.success("Imagem removida com sucesso");
//       fetchProjects();
//     } catch (err) {
//       toast.error(err.message === "unauth" ? "Token inválido" : "Erro ao remover imagem");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.images.length) return toast.error("Envie ao menos 1 imagem");
//     setLoading(true);
//     try {
//       const method = editingId ? "PUT" : "POST";
//       const url = editingId ? `${PROJECTS_API_URL}/${editingId}` : PROJECTS_API_URL;
//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json", ...authHeaders },
//         body: JSON.stringify(form)
//       });
//       if (res.status === 401) throw new Error("unauth");
//       if (!res.ok) throw new Error("fail");
//       toast.success(editingId ? "Projeto atualizado" : "Projeto criado");
//       resetForm();
//       fetchProjects();
//     } catch (err) {
//       toast.error(err.message === "unauth" ? "Token inválido" : "Erro ao salvar");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setForm({ name: "", caption: "", images: [], localizacao: "", observacoes: [""], tipo: "", status: "" });
//     setPreviews([]);
//     setEditingId(null);
//     if (inputFileRef.current) inputFileRef.current.value = "";
//   };

//   const handleEdit = (p) => {
//     setEditingId(p.id);
//     const images = p.images || [];
//     setForm({ ...p, observacoes: p.observacoes.length ? p.observacoes : [""], images });
//     setPreviews(images.map(img => img.startsWith("http") ? img : `data:image/*;base64,${img}`));
//   };

//   const handleProjectDelete = async (id) => {
//     try {
//       const res = await fetch(`${PROJECTS_API_URL}/${id}`, { method: "DELETE", headers: authHeaders });
//       if (res.status === 401) throw new Error("unauth");
//       if (!res.ok) throw new Error("fail");
//       toast.success("Projeto excluído");
//       fetchProjects();
//     } catch (err) {
//       toast.error(err.message === "unauth" ? "Token inválido" : "Erro ao excluir projeto");
//     }
//   };

//   const handleUserDelete = async () => {
//     if (!userToDelete) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`${USERS_API_URL}/${userToDelete.id}`, {
//         method: "DELETE",
//         headers: authHeaders
//       });
//       if (res.status === 401) throw new Error("unauth");
//       if (!res.ok) throw new Error("fail");
//       toast.success("Usuário excluído com sucesso");
//       fetchUsers();
//       setShowDeleteModal(false);
//       setUserToDelete(null);
//     } catch (err) {
//       toast.error(err.message === "unauth" ? "Token inválido" : "Erro ao excluir usuário");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openDeleteModal = (user) => {
//     setUserToDelete(user);
//     setShowDeleteModal(true);
//   };

//   const closeDeleteModal = () => {
//     setShowDeleteModal(false);
//     setUserToDelete(null);
//   };

//   const imgSrc = (val) => (val?.startsWith("http") ? val : `data:image/*;base64,${val || ""}`);

//   const nextCard = () => setCurrentIndex((i) => (i + 1) % projects.length);
//   const prevCard = () => setCurrentIndex((i) => (i - 1 + projects.length) % projects.length);

//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
//   const totalPages = Math.ceil(users.length / usersPerPage);

//   const nextPage = () => {
//     if (currentPage < totalPages) setCurrentPage(currentPage + 1);
//   };

//   const prevPage = () => {
//     if (currentPage > 1) setCurrentPage(currentPage - 1);
//   };

//   return (
//     <>
//       <AdminHeader />
//       <section className="py-10 px-4 bg-gradient-to-br from-white to-orange-50 min-h-screen">
//         <div className="max-w-7xl mx-auto">
//           {/* ABAS */}
//           <div className="flex border-b border-gray-200 mb-6">
//             <button
//               onClick={() => setActiveTab("projects")}
//               className={`px-6 py-3 text-lg font-semibold transition-all duration-300 ${
//                 activeTab === "projects"
//                   ? "text-orange-600 border-b-2 border-orange-600"
//                   : "text-gray-600 hover:text-orange-500"
//               }`}
//               aria-label="Ver projetos"
//             >
//               Projetos
//             </button>
//             <button
//               onClick={() => setActiveTab("users")}
//               className={`px-6 py-3 text-lg font-semibold transition-all duration-300 ${
//                 activeTab === "users"
//                   ? "text-orange-600 border-b-2 border-orange-600"
//                   : "text-gray-600 hover:text-orange-500"
//               }`}
//               aria-label="Ver usuários"
//             >
//               Usuários
//             </button>
//           </div>

//           {/* CONTEÚDO DAS ABAS */}
//           <div className="transition-opacity duration-300">
//             {activeTab === "projects" && (
//               <div className="grid lg:grid-cols-2 gap-8">
//                 {/* FORMULÁRIO DE PROJETOS */}
//                 <form onSubmit={handleSubmit} className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl p-6 space-y-6">
//                   <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//                     {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
//                     {editingId ? "Editar Projeto" : "Novo Projeto"}
//                   </h2>
//                   <div className="grid md:grid-cols-2 gap-4">
//                     <input
//                       name="name"
//                       placeholder="Nome *"
//                       value={form.name}
//                       onChange={handleChange}
//                       className="bg-white/50 border border-white/30 p-3 rounded-lg text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
//                       required
//                     />
//                     <input
//                       name="caption"
//                       placeholder="Legenda"
//                       value={form.caption}
//                       onChange={handleChange}
//                       className="bg-white/50 border border-white/30 p-3 rounded-lg text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
//                     />
//                     <input
//                       name="localizacao"
//                       placeholder="Localização"
//                       value={form.localizacao}
//                       onChange={handleChange}
//                       className="bg-white/50 border border-white/30 p-3 rounded-lg text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
//                     />
//                    <select
//   name="tipo"
//   value={form.tipo}
//   onChange={handleChange}
//   required
//   className="bg-white/50 border border-white/30 p-3 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
// >
//   <option value="">Tipo de Empreendimento</option>
//   <option value="Residencial">Residencial</option>
//   <option value="Empresarial">Empresarial</option>
//   <option value="Casas">Casas</option>
// </select>

//                     <select
//                       name="status"
//                       value={form.status}
//                       onChange={handleChange}
//                       className="bg-white/50 border border-white/30 p-3 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
//                     >
//                       <option value="">Status</option>
//                       <option value="lançamento">Lançamento</option>
//                       <option value="entregue">Entregue</option>
//                     </select>
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium text-gray-800">Observações</label>
//                     {form.observacoes.map((o, i) => (
//                       <div key={i} className="flex gap-2 items-center">
//                         <input
//                           value={o}
//                           onChange={(e) => handleObsChange(i, e.target.value)}
//                           className="flex-1 bg-white/50 border border-white/30 p-2 rounded-lg text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
//                         />
//                         {form.observacoes.length > 1 && (
//                           <button type="button" onClick={() => removeObs(i)} className="text-red-600 hover:text-red-800" aria-label="Remover observação">
//                             <Trash2 size={16} />
//                           </button>
//                         )}
//                       </div>
//                     ))}
//                     <button type="button" onClick={addObs} className="text-sm text-orange-500 flex gap-1 items-center hover:text-orange-600" aria-label="Adicionar nova observação">
//                       <Plus size={14} /> Nova observação
//                     </button>
//                   </div>
//                   <div
//                     onDrop={onDrop}
//                     onDragOver={(e) => e.preventDefault()}
//                     onClick={() => inputFileRef.current.click()}
//                     className="h-36 border-2 border-dashed border-orange-300 rounded-lg flex flex-col justify-center items-center text-orange-500 cursor-pointer bg-white/20 hover:bg-white/30 transition-all duration-300"
//                     aria-label="Arraste ou clique para enviar imagens"
//                   >
//                     <Upload size={22} />
//                     <p className="text-sm">Arraste a imagem ou clique</p>
//                     <input
//                       ref={inputFileRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => handleFiles(e.target.files)}
//                       className="hidden"
//                     />
//                   </div>
//                   {previews.length > 0 && (
//   <div className="space-y-2">
//     <label className="text-sm font-medium text-gray-800">Imagens Selecionadas</label>
//     <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//       {previews.map((preview, index) => (
//         <div key={index} className="relative">
//           <img
//             src={preview}
//             alt={`Preview ${index + 1}`}
//             className="h-20 w-full object-cover rounded-lg"
//           />
//           <button
//             type="button"
//             onClick={() => {
//               const isBase64 =
//                 form.images[index]?.startsWith("data:image") ||
//                 form.images[index]?.length > 200;

//               if (isBase64 || !editingId) {
//                 // Remove apenas do estado local
//                 setForm((prev) => ({
//                   ...prev,
//                   images: prev.images.filter((_, i) => i !== index),
//                 }));
//                 setPreviews((prev) => prev.filter((_, i) => i !== index));
//               } else {
//                 // Remove do servidor
//                 handleImageDelete(form.images[index], index);
//               }
//             }}
//             className="absolute top-1 right-1 bg-white/70 p-1 rounded-full text-red-600 hover:bg-white"
//             aria-label={`Remover imagem ${index + 1}`}
//           >
//             <Trash2 size={14} />
//           </button>
//         </div>
//       ))}
//     </div>
//   </div>
// )}

//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                     aria-label={loading ? "Salvando projeto" : "Salvar projeto"}
//                   >
//                     <Save size={16} /> {loading ? "Salvando…" : "Salvar"}
//                   </button>
//                 </form>

//                 {/* CARROSSEL DE PROJETOS */}
//                 <div className="relative">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <ImageIcon size={18} /> Projetos Cadastrados
//                   </h3>
//                   {projects.length === 0 ? (
//                     <p className="text-gray-500">Nenhum projeto encontrado.</p>
//                   ) : (
//                     <div className="relative overflow-hidden rounded-lg">
//                       <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
//                         {projects.map((p) => (
//                           <div key={p.id} className="min-w-full relative h-72 bg-orange-300 group">
//                             {p.images?.[0] ? (
//                               <img
//                                 src={imgSrc(p.images[0])}
//                                 alt={p.name}
//                                 className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
//                               />
//                             ) : (
//                               <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
//                                 <p className="text-gray-500">Sem imagem</p>
//                               </div>
//                             )}
//                             <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
//                             <div className="absolute top-2 right-2 flex gap-2 z-20">
//                               <button
//                                 onClick={() => handleEdit(p)}
//                                 className="bg-white/70 p-1 rounded-full hover:bg-white"
//                                 aria-label={`Editar projeto ${p.name}`}
//                               >
//                                 <Edit3 size={14} />
//                               </button>
//                               <button
//                                 onClick={() => handleProjectDelete(p.id)}
//                                 className="bg-white/70 p-1 rounded-full text-red-600 hover:bg-white"
//                                 aria-label={`Excluir projeto ${p.name}`}
//                               >
//                                 <Trash2 size={14} />
//                               </button>
//                             </div>
//                             <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
//                               <p className="text-white text-xs lowercase">{p.tipo || "-"} – {p.status || ""}</p>
//                               <h4 className="text-white text-base font-bold break-words">{p.name}</h4>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                       <button
//                         onClick={prevCard}
//                         className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full z-30 hover:bg-white"
//                         aria-label="Projeto anterior"
//                       >
//                         <ChevronLeft size={20} />
//                       </button>
//                       <button
//                         onClick={nextCard}
//                         className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full z-30 hover:bg-white"
//                         aria-label="Próximo projeto"
//                       >
//                         <ChevronRight size={20} />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {activeTab === "users" && (
//               <div className="backdrop-blur-lg bg-white/80 border border-white/20 rounded-2xl p-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                   <Users size={18} /> Usuários Cadastrados
//                 </h3>
//                 {users.length === 0 ? (
//                   <p className="text-gray-500">Nenhum usuário encontrado.</p>
//                 ) : (
//                   <>
//                     <div className="overflow-x-auto">
//                       <table className="min-w-full bg-white/90 rounded-lg">
//                         <thead>
//                           <tr className="text-left text-gray-800">
//                             <th className="p-3">ID</th>
//                             <th className="p-3">Nome de Usuário</th>
//                             <th className="p-3">Email</th>
//                             <th className="p-3">Ações</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {currentUsers.map((user, idx) => (
//                             <tr key={user.id} className={`${idx % 2 === 0 ? "bg-white/95" : "bg-white/85"} hover:bg-gray-50`}>
//                               <td className="p-3 text-gray-800">{user.id}</td>
//                               <td className="p-3 text-gray-800">{user.username}</td>
//                               <td className="p-3 text-gray-800">{user.email}</td>
//                               <td className="p-3">
//                                 <button
//                                   onClick={() => openDeleteModal(user)}
//                                   className="text-red-600 hover:text-red-800"
//                                   aria-label={`Excluir usuário ${user.username}`}
//                                   title="Excluir usuário"
//                                 >
//                                   <Trash2 size={16} />
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                     <div className="mt-4 flex justify-center gap-4">
//                       <button
//                         onClick={prevPage}
//                         disabled={currentPage === 1}
//                         className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                         aria-label="Página anterior"
//                       >
//                         <ChevronLeft size={16} /> Anterior
//                       </button>
//                       <span className="text-gray-700 self-center">
//                         Página {currentPage} de {totalPages}
//                       </span>
//                       <button
//                         onClick={nextPage}
//                         disabled={currentPage === totalPages}
//                         className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                         aria-label="Próxima página"
//                       >
//                         Próximo <ChevronRight size={16} />
//                       </button>
//                     </div>
//                   </>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* MODAL DE CONFIRMAÇÃO */}
//           {showDeleteModal && (
//             <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
//               <div className="bg-white rounded-lg p-6 max-w-sm w-full border border-orange-300">
//                 <div className="flex justify-between items-center mb-4">
//                   <h4 className="text-base font-bold text-gray-800">Confirmar Exclusão</h4>
//                   <button onClick={closeDeleteModal} className="text-gray-600 hover:text-gray-800" aria-label="Fechar modal">
//                     <X size={18} />
//                   </button>
//                 </div>
//                 <p className="text-gray-700 text-sm mb-6">
//                   Tem certeza que deseja excluir o usuário <strong>{userToDelete?.username}</strong>? Esta ação não pode ser desfeita.
//                 </p>
//                 <div className="flex justify-end gap-2">
//                   <button
//                     onClick={closeDeleteModal}
//                     className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm"
//                     aria-label="Cancelar exclusão"
//                   >
//                     Cancelar
//                   </button>
//                   <button
//                     onClick={handleUserDelete}
//                     disabled={loading}
//                     className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                     aria-label={loading ? "Excluindo usuário" : "Confirmar exclusão"}
//                   >
//                     {loading ? "Excluindo…" : "Excluir"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </section>
//       <AdminFooter />
//     </>
//   );
// }








import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Plus, Trash2, Upload, Save, Edit3, Image as ImageIcon, ChevronLeft, ChevronRight, Users, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AdminHeader from "../components/HeaderAdmin";
import AdminFooter from "../components/AdminFooter";

const PROJECTS_API_URL = "https://back-end-objetiva.onrender.com/projects";
const USERS_API_URL = "https://back-end-objetiva.onrender.com/auth/users";

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => resolve(e.target.result.split(",")[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function AdminEmpreendimentos() {
  const { token } = useAuth();
  const [form, setForm] = useState({ name: "", caption: "", images: [], localizacao: "", observacoes: [""], tipo: "", status: "", display_on: "empreendimentos" });
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState("projects");
  const inputFileRef = useRef();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchProjects = async () => {
    try {
      const res = await fetch(PROJECTS_API_URL);
      if (!res.ok) throw new Error("Erro ao carregar projetos");
      setProjects(await res.json());
    } catch {
      toast.error("Erro ao carregar projetos");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(USERS_API_URL, { headers: authHeaders });
      if (res.status === 401) throw new Error("unauth");
      if (!res.ok) throw new Error("fail");
      setUsers(await res.json());
    } catch (err) {
      toast.error(err.message === "unauth" ? "Sessão expirada. Faça login novamente." : "Erro ao carregar usuários");
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleObsChange = (i, v) => setForm((p) => ({ ...p, observacoes: p.observacoes.map((o, idx) => idx === i ? v : o) }));
  const addObs = () => setForm((p) => ({ ...p, observacoes: [...p.observacoes, ""] }));
  const removeObs = (i) => setForm((p) => ({ ...p, observacoes: p.observacoes.filter((_, idx) => idx !== i) }));

  const handleFiles = async (files) => {
    if (!files?.length) return;
    const newImages = [];
    const newPreviews = [...previews];
    for (const file of files) {
      const b64 = await fileToBase64(file);
      newImages.push(b64);
      newPreviews.push(`data:image/*;base64,${b64}`);
    }
    setForm((p) => ({ ...p, images: [...p.images, ...newImages] }));
    setPreviews(newPreviews);
  };

  const onDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };

  const handleImageDelete = async (imageUrl, index) => {
    if (!editingId) return toast.error("Nenhum projeto em edição.");
    setLoading(true);
    try {
      const url = `${PROJECTS_API_URL}/${editingId}/images`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ image_url: imageUrl })
      });
      if (res.status === 401) throw new Error("unauth");
      if (!res.ok) throw new Error("fail");
      setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));
      setPreviews((p) => p.filter((_, i) => i !== index));
      toast.success("Imagem removida com sucesso");
      fetchProjects();
    } catch (err) {
      toast.error(err.message === "unauth" ? "Token inválido" : "Erro ao remover imagem");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.images.length) return toast.error("Envie ao menos 1 imagem");
    setLoading(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${PROJECTS_API_URL}/${editingId}` : PROJECTS_API_URL;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(form)
      });
      if (res.status === 401) throw new Error("unauth");
      if (!res.ok) throw new Error("fail");
      toast.success(editingId ? "Projeto atualizado" : "Projeto criado");
      resetForm();
      fetchProjects();
    } catch (err) {
      toast.error(err.message === "unauth" ? "Token inválido" : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", caption: "", images: [], localizacao: "", observacoes: [""], tipo: "", status: "", display_on: "empreendimentos" });
    setPreviews([]);
    setEditingId(null);
    if (inputFileRef.current) inputFileRef.current.value = "";
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    const images = p.images || [];
    setForm({ ...p, observacoes: p.observacoes.length ? p.observacoes : [""], images, display_on: p.display_on || "empreendimentos" });
    setPreviews(images.map(img => img.startsWith("http") ? img : `data:image/*;base64,${img}`));
  };

  const handleProjectDelete = async (id) => {
    try {
      const res = await fetch(`${PROJECTS_API_URL}/${id}`, { method: "DELETE", headers: authHeaders });
      if (res.status === 401) throw new Error("unauth");
      if (!res.ok) throw new Error("fail");
      toast.success("Projeto excluído");
      fetchProjects();
    } catch (err) {
      toast.error(err.message === "unauth" ? "Token inválido" : "Erro ao excluir projeto");
    }
  };

  const handleUserDelete = async () => {
    if (!userToDelete) return;
    setLoading(true);
    try {
      const res = await fetch(`${USERS_API_URL}/${userToDelete.id}`, {
        method: "DELETE",
        headers: authHeaders
      });
      if (res.status === 401) throw new Error("unauth");
      if (!res.ok) throw new Error("fail");
      toast.success("Usuário excluído com sucesso");
      fetchUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      toast.error(err.message === "unauth" ? "Token inválido" : "Erro ao excluir usuário");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const imgSrc = (val) => (val?.startsWith("http") ? val : `data:image/*;base64,${val || ""}`);

  const nextCard = () => setCurrentIndex((i) => (i + 1) % projects.length);
  const prevCard = () => setCurrentIndex((i) => (i - 1 + projects.length) % projects.length);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <>
      <AdminHeader />
      <section className="py-10 px-4 bg-gradient-to-br from-white to-orange-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* ABAS */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-6 py-3 text-lg font-semibold transition-all duration-300 ${
                activeTab === "projects"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-orange-500"
              }`}
              aria-label="Ver projetos"
            >
              Projetos
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 text-lg font-semibold transition-all duration-300 ${
                activeTab === "users"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-orange-500"
              }`}
              aria-label="Ver usuários"
            >
              Usuários
            </button>
          </div>

          {/* CONTEÚDO DAS ABAS */}
          <div className="transition-opacity duration-300">
            {activeTab === "projects" && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* FORMULÁRIO DE PROJETOS */}
                <form onSubmit={handleSubmit} className="backdrop-blur-lg bg-white/30 border border-white/20 rounded-2xl p-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                    {editingId ? "Editar Projeto" : "Novo Projeto"}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      name="name"
                      placeholder="Nome *"
                      value={form.name}
                      onChange={handleChange}
                      className="bg-white/50 border border-white/30 p-3 rounded-lg text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      required
                    />
                    <input
                      name="caption"
                      placeholder="Legenda"
                      value={form.caption}
                      onChange={handleChange}
                      className="bg-white/50 border border-white/30 p-3 rounded-lg text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    <input
                      name="localizacao"
                      placeholder="Localização"
                      value={form.localizacao}
                      onChange={handleChange}
                      className="bg-white/50 border border-white/30 p-3 rounded-lg text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    <select
                      name="tipo"
                      value={form.tipo}
                      onChange={handleChange}
                      required
                      className="bg-white/50 border border-white/30 p-3 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      <option value="">Tipo de Empreendimento</option>
                      <option value="Residencial">Residencial</option>
                      <option value="Empresarial">Empresarial</option>
                      <option value="Casas">Casas</option>
                    </select>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="bg-white/50 border border-white/30 p-3 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                      <option value="">Status</option>
                      <option value="lançamento">Lançamento</option>
                      <option value="entregue">Entregue</option>
                    </select>
                   <div className="flex flex-col">
                      <label htmlFor="display_on" className="text-sm font-medium text-gray-700 mb-1">
                        Onde exibir:
                      </label>
                      <select
                        id="display_on"
                        name="display_on"
                        value={form.display_on}
                        onChange={handleChange}
                        className="bg-white/50 border border-white/30 p-3 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      >
                        <option value="empreendimentos">Empreendimentos</option>
                        <option value="construções">Construções</option>
                      </select>
                    </div>

                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-800">Observações</label>
                    {form.observacoes.map((o, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          value={o}
                          onChange={(e) => handleObsChange(i, e.target.value)}
                          className="flex-1 bg-white/50 border border-white/30 p-2 rounded-lg text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                        {form.observacoes.length > 1 && (
                          <button type="button" onClick={() => removeObs(i)} className="text-red-600 hover:text-red-800" aria-label="Remover observação">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addObs} className="text-sm text-orange-500 flex gap-1 items-center hover:text-orange-600" aria-label="Adicionar nova observação">
                      <Plus size={14} /> Nova observação
                    </button>
                  </div>
                  <div
                    onDrop={onDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => inputFileRef.current.click()}
                    className="h-36 border-2 border-dashed border-orange-300 rounded-lg flex flex-col justify-center items-center text-orange-500 cursor-pointer bg-white/20 hover:bg-white/30 transition-all duration-300"
                    aria-label="Arraste ou clique para enviar imagens"
                  >
                    <Upload size={22} />
                    <p className="text-sm">Arraste a imagem ou clique</p>
                    <input
                      ref={inputFileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFiles(e.target.files)}
                      className="hidden"
                    />
                  </div>
                  {previews.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-800">Imagens Selecionadas</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {previews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="h-20 w-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const isBase64 =
                                  form.images[index]?.startsWith("data:image") ||
                                  form.images[index]?.length > 200;

                                if (isBase64 || !editingId) {
                                  setForm((prev) => ({
                                    ...prev,
                                    images: prev.images.filter((_, i) => i !== index),
                                  }));
                                  setPreviews((prev) => prev.filter((_, i) => i !== index));
                                } else {
                                  handleImageDelete(form.images[index], index);
                                }
                              }}
                              className="absolute top-1 right-1 bg-white/70 p-1 rounded-full text-red-600 hover:bg-white"
                              aria-label={`Remover imagem ${index + 1}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={loading ? "Salvando projeto" : "Salvar projeto"}
                  >
                    <Save size={16} /> {loading ? "Salvando…" : "Salvar"}
                  </button>
                </form>

                {/* CARROSSEL DE PROJETOS */}
                <div className="relative">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ImageIcon size={18} /> Projetos Cadastrados
                  </h3>
                  {projects.length === 0 ? (
                    <p className="text-gray-500">Nenhum projeto encontrado.</p>
                  ) : (
                    <div className="relative overflow-hidden rounded-lg">
                      <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {projects.map((p) => (
                          <div key={p.id} className="min-w-full relative h-72 bg-orange-300 group">
                            {p.images?.[0] ? (
                              <img
                                src={imgSrc(p.images[0])}
                                alt={p.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
                                <p className="text-gray-500">Sem imagem</p>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-2 right-2 flex gap-2 z-20">
                              <button
                                onClick={() => handleEdit(p)}
                                className="bg-white/70 p-1 rounded-full hover:bg-white"
                                aria-label={`Editar projeto ${p.name}`}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleProjectDelete(p.id)}
                                className="bg-white/70 p-1 rounded-full text-red-600 hover:bg-white"
                                aria-label={`Excluir projeto ${p.name}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                              <p className="text-white text-xs lowercase">{p.tipo || "-"} – {p.status || ""}</p>
                              <h4 className="text-white text-base font-bold break-words">{p.name}</h4>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={prevCard}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full z-30 hover:bg-white"
                        aria-label="Projeto anterior"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextCard}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full z-30 hover:bg-white"
                        aria-label="Próximo projeto"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="backdrop-blur-lg bg-white/80 border border-white/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users size={18} /> Usuários Cadastrados
                </h3>
                {users.length === 0 ? (
                  <p className="text-gray-500">Nenhum usuário encontrado.</p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white/90 rounded-lg">
                        <thead>
                          <tr className="text-left text-gray-800">
                            <th className="p-3">ID</th>
                            <th className="p-3">Nome de Usuário</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentUsers.map((user, idx) => (
                            <tr key={user.id} className={`${idx % 2 === 0 ? "bg-white/95" : "bg-white/85"} hover:bg-gray-50`}>
                              <td className="p-3 text-gray-800">{user.id}</td>
                              <td className="p-3 text-gray-800">{user.username}</td>
                              <td className="p-3 text-gray-800">{user.email}</td>
                              <td className="p-3">
                                <button
                                  onClick={() => openDeleteModal(user)}
                                  className="text-red-600 hover:text-red-800"
                                  aria-label={`Excluir usuário ${user.username}`}
                                  title="Excluir usuário"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex justify-center gap-4">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Página anterior"
                      >
                        <ChevronLeft size={16} /> Anterior
                      </button>
                      <span className="text-gray-700 self-center">
                        Página {currentPage} de {totalPages}
                      </span>
                      <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Próxima página"
                      >
                        Próximo <ChevronRight size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* MODAL DE CONFIRMAÇÃO */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full border border-orange-300">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-bold text-gray-800">Confirmar Exclusão</h4>
                  <button onClick={closeDeleteModal} className="text-gray-600 hover:text-gray-800" aria-label="Fechar modal">
                    <X size={18} />
                  </button>
                </div>
                <p className="text-gray-700 text-sm mb-6">
                  Tem certeza que deseja excluir o usuário <strong>{userToDelete?.username}</strong>? Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={closeDeleteModal}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm"
                    aria-label="Cancelar exclusão"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUserDelete}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={loading ? "Excluindo usuário" : "Confirmar exclusão"}
                  >
                    {loading ? "Excluindo…" : "Excluir"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <AdminFooter />
    </>
  );
}
