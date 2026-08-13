const bcrypt = require('bcryptjs');
const { User, Role, Permission, ContactMessage, VolunteerApplication } = require('../models');
const { requireAuth, requirePermission, verifyCsrf } = require('../middleware/auth');
const { ADMIN_SLUG, EVERYONE_SLUG, permissionGroups, PERMISSIONS } = require('../utils/permissions');
const { buildPageSeo } = require('../utils/seo');

function adminSeo(title, path) {
  return {
    title,
    ...buildPageSeo({
      seoTitle: `${title} · The Utthan Foundation`,
      description: 'Website administration for The Utthan Foundation.',
      path,
      noindex: true
    }),
    jsonLd: []
  };
}

async function countActiveAdmins() {
  const adminRole = await Role.findOne({ where: { slug: ADMIN_SLUG } });
  if (!adminRole) return 0;
  return User.count({ where: { roleId: adminRole.id, isActive: true } });
}

function createAdminRouter(express) {
  const router = express.Router();
  router.use(requireAuth);

  router.get('/users', requirePermission('users.manage'), async (req, res, next) => {
    try {
      const users = await User.findAll({
        include: [Role],
        order: [['id', 'ASC']],
        attributes: { exclude: ['passwordHash'] }
      });
      res.render('admin/users', {
        ...adminSeo('Users', '/admin/users'),
        users
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/users/new', requirePermission('users.manage'), async (req, res, next) => {
    try {
      const roles = await Role.findAll({ order: [['name', 'ASC']] });
      res.render('admin/user-form', {
        ...adminSeo('New user', '/admin/users/new'),
        editUser: null,
        roles
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/users/:id/edit', requirePermission('users.manage'), async (req, res, next) => {
    try {
      const editUser = await User.findByPk(req.params.id, {
        include: [Role],
        attributes: { exclude: ['passwordHash'] }
      });
      if (!editUser) {
        req.flash('error', 'User not found.');
        return res.redirect('/admin/users');
      }
      const roles = await Role.findAll({ order: [['name', 'ASC']] });
      res.render('admin/user-form', {
        ...adminSeo('Edit user', `/admin/users/${editUser.id}/edit`),
        editUser,
        roles
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/users', requirePermission('users.manage'), verifyCsrf, async (req, res, next) => {
    try {
      const name = String(req.body.name || '').trim();
      const email = String(req.body.email || '').trim().toLowerCase();
      const password = String(req.body.password || '');
      const roleId = Number(req.body.roleId);
      const isActive = req.body.isActive === 'on' || req.body.isActive === '1';

      if (!name || !email || !password || !roleId) {
        req.flash('error', 'Name, email, password, and role are required.');
        return res.redirect('/admin/users/new');
      }

      await User.create({
        name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        roleId,
        isActive
      });
      req.flash('success', 'User created.');
      return res.redirect('/admin/users');
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        req.flash('error', 'That email is already in use.');
        return res.redirect('/admin/users/new');
      }
      next(err);
    }
  });

  router.post('/users/:id', requirePermission('users.manage'), verifyCsrf, async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id, { include: [Role] });
      if (!user) {
        req.flash('error', 'User not found.');
        return res.redirect('/admin/users');
      }

      const name = String(req.body.name || '').trim();
      const email = String(req.body.email || '').trim().toLowerCase();
      const password = String(req.body.password || '');
      const roleId = Number(req.body.roleId);
      const isActive = req.body.isActive === 'on' || req.body.isActive === '1';
      const adminCount = await countActiveAdmins();
      const wasAdmin = user.Role && user.Role.slug === ADMIN_SLUG;

      if (wasAdmin && adminCount <= 1 && (!isActive || roleId !== user.roleId)) {
        const nextRole = await Role.findByPk(roleId);
        const leavingAdmin = !isActive || (nextRole && nextRole.slug !== ADMIN_SLUG);
        if (leavingAdmin) {
          req.flash('error', 'Cannot remove or deactivate the last admin.');
          return res.redirect(`/admin/users/${user.id}/edit`);
        }
      }

      const updates = { name, email, roleId, isActive };
      if (password) updates.passwordHash = await bcrypt.hash(password, 10);
      await user.update(updates);
      req.flash('success', 'User updated.');
      return res.redirect('/admin/users');
    } catch (err) {
      next(err);
    }
  });

  router.post('/users/:id/delete', requirePermission('users.manage'), verifyCsrf, async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id, { include: [Role] });
      if (!user) {
        req.flash('error', 'User not found.');
        return res.redirect('/admin/users');
      }
      if (user.id === req.currentUser.id) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/admin/users');
      }
      if (user.Role && user.Role.slug === ADMIN_SLUG && (await countActiveAdmins()) <= 1) {
        req.flash('error', 'Cannot delete the last admin.');
        return res.redirect('/admin/users');
      }
      await user.destroy();
      req.flash('success', 'User deleted.');
      return res.redirect('/admin/users');
    } catch (err) {
      next(err);
    }
  });

  router.get('/roles', requirePermission('roles.manage'), async (req, res, next) => {
    try {
      const roles = await Role.findAll({
        include: [Permission],
        order: [['isSystem', 'DESC'], ['name', 'ASC']]
      });
      res.render('admin/roles', {
        ...adminSeo('Roles', '/admin/roles'),
        roles,
        permissionGroups: permissionGroups()
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/roles/new', requirePermission('roles.manage'), async (req, res) => {
    res.render('admin/role-form', {
      ...adminSeo('New role', '/admin/roles/new'),
      editRole: null,
      selectedKeys: [],
      permissionGroups: permissionGroups()
    });
  });

  router.get('/roles/:id/edit', requirePermission('roles.manage'), async (req, res, next) => {
    try {
      const editRole = await Role.findByPk(req.params.id, { include: [Permission] });
      if (!editRole) {
        req.flash('error', 'Role not found.');
        return res.redirect('/admin/roles');
      }
      res.render('admin/role-form', {
        ...adminSeo('Edit role', `/admin/roles/${editRole.id}/edit`),
        editRole,
        selectedKeys: (editRole.Permissions || []).map((p) => p.key),
        permissionGroups: permissionGroups()
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/roles', requirePermission('roles.manage'), verifyCsrf, async (req, res, next) => {
    try {
      const name = String(req.body.name || '').trim();
      if (!name) {
        req.flash('error', 'Role name is required.');
        return res.redirect('/admin/roles/new');
      }
      const slug = name.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '') || `role-${Date.now()}`;
      const role = await Role.create({ name, slug, isSystem: false });
      const keys = [].concat(req.body.permissions || []);
      const perms = await Permission.findAll({ where: { key: keys } });
      await role.setPermissions(perms);
      req.flash('success', 'Role created.');
      return res.redirect('/admin/roles');
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        req.flash('error', 'A role with that name already exists.');
        return res.redirect('/admin/roles/new');
      }
      next(err);
    }
  });

  router.post('/roles/:id', requirePermission('roles.manage'), verifyCsrf, async (req, res, next) => {
    try {
      const role = await Role.findByPk(req.params.id);
      if (!role) {
        req.flash('error', 'Role not found.');
        return res.redirect('/admin/roles');
      }
      if (role.slug === ADMIN_SLUG) {
        req.flash('error', 'The admin role always has every permission.');
        return res.redirect('/admin/roles');
      }
      if (role.slug === EVERYONE_SLUG) {
        await role.setPermissions([]);
        req.flash('success', 'Everyone stays without permissions.');
        return res.redirect('/admin/roles');
      }
      const name = String(req.body.name || '').trim();
      if (name) await role.update({ name });
      const keys = [].concat(req.body.permissions || []);
      const allowed = new Set(PERMISSIONS.map((p) => p.key));
      const perms = await Permission.findAll({ where: { key: keys.filter((k) => allowed.has(k)) } });
      await role.setPermissions(perms);
      req.flash('success', 'Role updated.');
      return res.redirect('/admin/roles');
    } catch (err) {
      next(err);
    }
  });

  router.post('/roles/:id/delete', requirePermission('roles.manage'), verifyCsrf, async (req, res, next) => {
    try {
      const role = await Role.findByPk(req.params.id);
      if (!role) {
        req.flash('error', 'Role not found.');
        return res.redirect('/admin/roles');
      }
      if (role.isSystem) {
        req.flash('error', 'System roles cannot be deleted.');
        return res.redirect('/admin/roles');
      }
      const everyone = await Role.findOne({ where: { slug: EVERYONE_SLUG } });
      await User.update({ roleId: everyone.id }, { where: { roleId: role.id } });
      await role.setPermissions([]);
      await role.destroy();
      req.flash('success', 'Role deleted. Assigned users moved to Everyone.');
      return res.redirect('/admin/roles');
    } catch (err) {
      next(err);
    }
  });

  router.get('/inbox', requirePermission('inbox.view'), async (req, res, next) => {
    try {
      const [messages, applications] = await Promise.all([
        ContactMessage.findAll({ order: [['createdAt', 'DESC']] }),
        VolunteerApplication.findAll({ order: [['createdAt', 'DESC']] })
      ]);
      res.render('admin/inbox', {
        ...adminSeo('Inbox', '/admin/inbox'),
        messages,
        applications
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/inbox/contact/:id/read', requirePermission('inbox.view'), verifyCsrf, async (req, res, next) => {
    try {
      const item = await ContactMessage.findByPk(req.params.id);
      if (item) await item.update({ isRead: true });
      return res.redirect('/admin/inbox');
    } catch (err) {
      next(err);
    }
  });

  router.post('/inbox/volunteer/:id/read', requirePermission('inbox.view'), verifyCsrf, async (req, res, next) => {
    try {
      const item = await VolunteerApplication.findByPk(req.params.id);
      if (item) await item.update({ isRead: true });
      return res.redirect('/admin/inbox');
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createAdminRouter };
