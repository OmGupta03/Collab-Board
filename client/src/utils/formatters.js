export const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";
  const kb = Math.round(bytes / 1024);
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60)          return "Just now";
  if (diff < 3600)        return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)       return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 172800)      return "Yesterday";
  return date.toLocaleDateString("en-US", { month:"short", day:"numeric" });
};

export const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
};