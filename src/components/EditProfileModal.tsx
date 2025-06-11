import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../services/api";
import {
  UserCircle,
  Pencil,
  MapPin,
  Instagram,
  Linkedin,
  Star,
  Briefcase,
  Github,
} from "lucide-react";

interface User {
  createdAt: string;
  id: number;
  name: string;
  email: string;
  bio?: string;
  title?: string;
  location?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  skills?: string | string[];
  avatar?: string; // pode existir, mas não deve ser enviado no PUT
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onProfileUpdated: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}) => {
  const [formData, setFormData] = useState<User>({
    ...user,
    instagramUrl: user.instagramUrl
      ? user.instagramUrl
          .replace("https://www.instagram.com/", "")
          .replace("/", "")
      : "",
    linkedinUrl: user.linkedinUrl
      ? user.linkedinUrl
          .replace("https://www.linkedin.com/in/", "")
          .replace("/", "")
      : "",
    githubUrl: user.githubUrl
      ? user.githubUrl.replace("https://github.com/", "").replace("/", "")
      : "",
    skills: Array.isArray(user.skills)
      ? user.skills.join(", ")
      : user.skills || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...user,
        instagramUrl: user.instagramUrl
          ? user.instagramUrl
              .replace("https://www.instagram.com/", "")
              .replace("/", "")
          : "",
        linkedinUrl: user.linkedinUrl
          ? user.linkedinUrl
              .replace("https://www.linkedin.com/in/", "")
              .replace("/", "")
          : "",
        githubUrl: user.githubUrl
          ? user.githubUrl.replace("https://github.com/", "").replace("/", "")
          : "",
        skills: Array.isArray(user.skills)
          ? user.skills.join(", ")
          : user.skills || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Remova avatar do payload!
      const { avatar, ...restFormData } = formData;

      const payload = {
        ...restFormData,
        instagramUrl: formData.instagramUrl
          ? `https://www.instagram.com/${formData.instagramUrl
              .trim()
              .replace(/^@/, "")
              .replace(/\//g, "")}`
          : undefined,
        linkedinUrl: formData.linkedinUrl
          ? `https://www.linkedin.com/in/${formData.linkedinUrl
              .trim()
              .replace(/^@/, "")
              .replace(/\//g, "")}`
          : undefined,
        githubUrl: formData.githubUrl
          ? `https://github.com/${formData.githubUrl
              .trim()
              .replace(/^@/, "")
              .replace(/\//g, "")}`
          : undefined,
        skills: formData.skills
          ? typeof formData.skills === "string"
            ? formData.skills
                .split(",")
                .map((skill: string) => skill.trim())
                .filter((skill) => skill)
            : formData.skills
          : [],
      };

      const response = await api.put(`/users/${user.id}`, payload);

      // Garante que skills será string no retorno para o contexto do usuário
      const updatedUser = {
        ...response.data,
        skills: Array.isArray(response.data.skills)
          ? response.data.skills.join(", ")
          : response.data.skills || "",
      };

      onProfileUpdated(updatedUser);
      toast.success("Perfil atualizado com sucesso!");
      onClose();
    } catch (error: any) {
      console.error(
        "Erro ao atualizar perfil:",
        error.response?.data || error.message
      );
      toast.error("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 p-2 sm:p-6 rounded-2xl shadow-2xl border border-gray-600 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <UserCircle className="text-orange-400 w-5 h-5 sm:w-6 sm:h-6" />
            Editar Perfil
          </h3>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors duration-200 text-lg sm:text-xl p-1 sm:p-2 rounded-full hover:bg-gray-600"
          >
            ✕
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-2 sm:gap-4"
        >
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-2">
              <Pencil className="text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
              Nome
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Seu nome"
              required
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-2">
              <Pencil className="text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio || ""}
              onChange={handleChange}
              className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 h-20 sm:h-24 resize-none"
              placeholder="Fale sobre você"
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-2">
              <Briefcase className="text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
              Título
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Sua profissão ou cargo"
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-2">
              <MapPin className="text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
              Localização
            </label>
            <input
              type="text"
              name="location"
              value={formData.location || ""}
              onChange={handleChange}
              className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Onde você está?"
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-2">
              <Instagram className="text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
              Instagram
            </label>
            <input
              type="text"
              name="instagramUrl"
              value={formData.instagramUrl || ""}
              onChange={handleChange}
              className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Seu usuário do Instagram"
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-2">
              <Linkedin className="text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
              LinkedIn
            </label>
            <input
              type="text"
              name="linkedinUrl"
              value={formData.linkedinUrl || ""}
              onChange={handleChange}
              className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Seu usuário do LinkedIn"
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-2">
              <Github className="text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
              GitHub
            </label>
            <input
              type="text"
              name="githubUrl"
              value={formData.githubUrl || ""}
              onChange={handleChange}
              className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Seu usuário do GitHub"
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-2">
              <Star className="text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
              Habilidades
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills || ""}
              onChange={handleChange}
              className="w-full p-2 sm:p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Habilidades (separadas por vírgula)"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-4 sm:mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full p-2 sm:p-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition-colors duration-200"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full p-2 sm:p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <svg
                  className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;