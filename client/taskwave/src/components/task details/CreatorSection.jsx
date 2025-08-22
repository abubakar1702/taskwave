import Avatar from "../common/Avatar";

const CreatorSection = ({ creator }) => {
  const getUserDisplayName = (user) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name} ${user.last_name}`.trim();
    }
    return user.username;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Creator
      </h3>
      <div className="flex items-center gap-3">
        <Avatar name={creator.first_name} url={creator.avatar} size={10} />
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {getUserDisplayName(creator)}
          </h4>
          <p className="text-xs text-gray-500 truncate">{creator.email}</p>
        </div>
      </div>
    </div>
  );
};

export default CreatorSection;
