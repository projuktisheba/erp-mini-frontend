import { useState, useEffect, useContext } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import axiosInstance from "../../hooks/AxiosInstance/AxiosInstance";
import { useUser } from "../UserContext/UserContext";
import { AppContext } from "../../context/AppContext";
import { API_BASE_URL } from "../../config/apiConfig";

type UserMetaCardProps = {
  id: number;
  image: string;
  name: string;
};

export default function UserMetaCard({ id, image, name }: UserMetaCardProps) {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("AppContext not provided");
  }
  const { branchId } = context;

  const { isOpen, openModal, closeModal } = useModal();
  const { avatar, setAvatar } = useUser();

  const [preview, setPreview] = useState(image || avatar || "");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPreview(avatar || image);
  }, [avatar, image]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("id", id.toString());
      formData.append("profile_picture", file);

      const res = await axiosInstance.post(
        "/hr/employee/profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-Branch-ID": branchId,
          },
        }
      );

      if (res.data?.avatar_link) {
        const newUrl = `${API_BASE_URL}${res.data.avatar_link}`;
        setPreview(newUrl);
        setAvatar(newUrl);
      }

      closeModal();
    } catch (err) {
      console.error("Failed to update profile picture:", err);
      alert("Failed to save image.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <img
              src={preview || "/images/user/owner.jpg"}
              alt="user"
              className="w-full h-full object-cover"
            />
          </div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {name}
          </h4>
        </div>

        <Button onClick={openModal} size="sm" variant="outline">
          Edit
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[400px] m-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl flex flex-col items-center gap-4">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Update Profile Picture
          </h4>

          <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700">
            <img
              src={preview || "/images/user/owner.jpg"}
              alt="preview"
              className="w-full h-full object-cover"
            />
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="
    mt-2 
    w-full 
    border 
    border-gray-300 
    dark:border-gray-700 
    px-4 
    py-2 
    rounded-lg 
    bg-white 
    dark:bg-gray-800 
    text-gray-700 
    dark:text-gray-300 
    cursor-pointer
    transition 
    duration-200 
    hover:border-gray-400 
    focus:outline-none 
    focus:ring-2 
    focus:ring-blue-500
  "
          />

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !file}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
