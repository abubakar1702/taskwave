const UserInitial = ({ user, className = "" }) => {
  const initial =
    user?.[0]?.toUpperCase() ||
    user?.[0]?.toUpperCase() ||
    "U";

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-blue-500 text-white font-medium ${className}`}
      style={{ lineHeight: 1 }}
    >
      {initial}
    </div>
  );
};

export default UserInitial;
