const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Avatar = ({ user, className = "", size = 6 }) => {
  if (!user) return null;
  const avatarUrl = user.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${API_BASE_URL}${user.avatar}`
    : null;

  const initial =
    user.first_name?.[0]?.toUpperCase() ||
    user.username?.[0]?.toUpperCase() ||
    "U";

  const sizeClass = `w-${size} h-${size}`;

  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt={user.username || "User"}
      className={`${sizeClass} rounded-full border border-white shadow object-cover ${className}`}
    />
  ) : (
    <div
      className={`flex items-center justify-center rounded-full bg-blue-500 text-white font-medium ${sizeClass} ${className}`}
      style={{ lineHeight: 1 }}
    >
      {initial}
    </div>
  );
};

export default Avatar;
