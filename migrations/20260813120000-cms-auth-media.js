'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MediaAssets', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      sourceKey: { type: Sequelize.STRING, allowNull: true, unique: true },
      mimeType: { type: Sequelize.STRING, allowNull: false },
      originalName: { type: Sequelize.STRING, allowNull: true },
      byteSize: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      data: { type: Sequelize.BLOB('long'), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Roles', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      isSystem: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Permissions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      key: { type: Sequelize.STRING, allowNull: false, unique: true },
      label: { type: Sequelize.STRING, allowNull: false },
      group: { type: Sequelize.STRING, allowNull: false, defaultValue: 'General' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('RolePermissions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      roleId: { type: Sequelize.INTEGER, allowNull: false },
      permissionId: { type: Sequelize.INTEGER, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex('RolePermissions', ['roleId', 'permissionId'], {
      unique: true,
      name: 'role_permissions_unique'
    });

    await queryInterface.createTable('Users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      passwordHash: { type: Sequelize.STRING, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      roleId: { type: Sequelize.INTEGER, allowNull: false },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Offices', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      label: { type: Sequelize.STRING, allowNull: false },
      address: { type: Sequelize.TEXT, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: true },
      email: { type: Sequelize.STRING, allowNull: true },
      sortOrder: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Partners', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      logoId: { type: Sequelize.INTEGER, allowNull: true },
      showName: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      sortOrder: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('PageBlocks', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      pageKey: { type: Sequelize.STRING, allowNull: false },
      blockKey: { type: Sequelize.STRING, allowNull: false },
      eyebrow: { type: Sequelize.STRING, allowNull: true },
      title: { type: Sequelize.STRING, allowNull: true },
      lede: { type: Sequelize.TEXT, allowNull: true },
      body: { type: Sequelize.TEXT, allowNull: true },
      extra: { type: Sequelize.TEXT, allowNull: true },
      imageId: { type: Sequelize.INTEGER, allowNull: true },
      sortOrder: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex('PageBlocks', ['pageKey', 'blockKey'], {
      unique: true,
      name: 'page_blocks_page_block_unique'
    });

    const addImageId = async (table, column = 'imageId') => {
      await queryInterface.addColumn(table, column, {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    };

    await addImageId('Campaigns');
    await addImageId('Posts');
    await addImageId('Galleries');
    await addImageId('TeamMembers');
    await addImageId('Testimonials');
    await addImageId('Chairmen', 'photoId');
    await addImageId('Chairmen', 'signatureId');
    await addImageId('SiteConfigs', 'qrImageId');
    await addImageId('SiteConfigs', 'logoId');
  },

  async down(queryInterface) {
    const remove = async (table, column) => {
      await queryInterface.removeColumn(table, column);
    };
    await remove('SiteConfigs', 'logoId');
    await remove('SiteConfigs', 'qrImageId');
    await remove('Chairmen', 'signatureId');
    await remove('Chairmen', 'photoId');
    await remove('Testimonials', 'imageId');
    await remove('TeamMembers', 'imageId');
    await remove('Galleries', 'imageId');
    await remove('Posts', 'imageId');
    await remove('Campaigns', 'imageId');
    await queryInterface.dropTable('PageBlocks');
    await queryInterface.dropTable('Partners');
    await queryInterface.dropTable('Offices');
    await queryInterface.dropTable('Users');
    await queryInterface.dropTable('RolePermissions');
    await queryInterface.dropTable('Permissions');
    await queryInterface.dropTable('Roles');
    await queryInterface.dropTable('MediaAssets');
  }
};
