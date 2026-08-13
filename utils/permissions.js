const PERMISSIONS = [
  { key: 'home.edit', label: 'Edit home page', group: 'Pages' },
  { key: 'about.who_we_are.edit', label: 'Edit Who We Are', group: 'Pages' },
  { key: 'about.history.edit', label: 'Edit History', group: 'Pages' },
  { key: 'about.leadership.edit', label: 'Edit Leadership', group: 'Pages' },
  { key: 'about.team.edit', label: 'Edit Team', group: 'Pages' },
  { key: 'campaigns.edit', label: 'Edit campaigns', group: 'Content' },
  { key: 'blogs.edit', label: 'Edit blogs', group: 'Content' },
  { key: 'media.edit', label: 'Edit media gallery', group: 'Content' },
  { key: 'stories.edit', label: 'Edit success stories', group: 'Content' },
  { key: 'stats.edit', label: 'Edit impact stats', group: 'Content' },
  { key: 'donate.edit', label: 'Edit donate page', group: 'Pages' },
  { key: 'contact.edit', label: 'Edit contact page', group: 'Pages' },
  { key: 'offices.edit', label: 'Edit offices', group: 'Content' },
  { key: 'partners.edit', label: 'Edit partners', group: 'Content' },
  { key: 'settings.edit', label: 'Edit site settings', group: 'Admin' },
  { key: 'inbox.view', label: 'View inbox', group: 'Admin' },
  { key: 'users.manage', label: 'Manage users', group: 'Admin' },
  { key: 'roles.manage', label: 'Manage roles', group: 'Admin' }
];

const ADMIN_SLUG = 'admin';
const EVERYONE_SLUG = 'everyone';

function userCan(user, key) {
  if (!user || user.isActive === false) return false;
  const role = user.Role || user.role;
  if (!role) return false;
  if (role.slug === ADMIN_SLUG) return true;
  const perms = role.Permissions || role.permissions || [];
  return perms.some((p) => p.key === key);
}

function permissionGroups(permissions = PERMISSIONS) {
  const groups = [];
  const seen = new Map();
  permissions.forEach((perm) => {
    if (!seen.has(perm.group)) {
      seen.set(perm.group, []);
      groups.push({ name: perm.group, items: seen.get(perm.group) });
    }
    seen.get(perm.group).push(perm);
  });
  return groups;
}

module.exports = {
  PERMISSIONS,
  ADMIN_SLUG,
  EVERYONE_SLUG,
  userCan,
  permissionGroups
};
