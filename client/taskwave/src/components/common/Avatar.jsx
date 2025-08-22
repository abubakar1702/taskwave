const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Avatar = ({ name = "User", url = null, className = "", size = 6 }) => {
  const avatarUrl = url
    ? url.startsWith("http")
      ? url
      : `${API_BASE_URL}${url}`
    : null;

  const initial = name?.[0]?.toUpperCase() || "U";

  const sizeClass = `w-${size} h-${size}`;

  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt={name}
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
