import { API_URL } from "@/lib/config";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [categories, setCategories] = useState(user.categories?.join(", ") || "");
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || "");

  const handleSave = async () => {
    const res = await fetch(`${API_URL}/api/users/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        bio,
        categories: categories.split(",").map(c => c.trim()),
        profilePicture
      })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data));
      navigate(`/profile/${data.username}`);
    } else {
      alert("Update failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">Edit Profile</h2>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="p-2 rounded bg-gray-800"
        />

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          className="p-2 rounded bg-gray-800"
        />

        <input
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
          placeholder="Categories (comma separated)"
          className="p-2 rounded bg-gray-800"
        />

        <input
          value={profilePicture}
          onChange={(e) => setProfilePicture(e.target.value)}
          placeholder="Profile Image URL"
          className="p-2 rounded bg-gray-800"
        />

        <button
          onClick={handleSave}
          className="bg-purple-600 p-2 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}