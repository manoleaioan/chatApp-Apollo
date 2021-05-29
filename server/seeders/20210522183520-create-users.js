'use strict'
const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const password = await bcrypt.hash('123456', 6)
    const createdAt = new Date()
    const updatedAt = createdAt

    // https://unsplash.com/photos/ZHvM3XIOHoE
    // https://unsplash.com/photos/b1Hg7QI-zcc
    // https://unsplash.com/photos/RiDxDgHg7pw

    await queryInterface.bulkInsert('users', [
      {
        username: 'john',
        email: 'john@email.com',
        password: password,
        imageUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1700&q=80',
        createdAt,
        updatedAt,
      },
      {
        username: 'jane',
        email: 'jane@email.com',
        password: password,
        imageUrl:
          'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2190&q=80',
        createdAt,
        updatedAt,
      },
      {
        username: 'boss',
        email: 'boss@email.com',
        password: password,
        imageUrl:
          'https://images.unsplash.com/photo-1566753323558-f4e0952af115?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2122&q=80',
        createdAt,
        updatedAt,
      },
      {
        username: 'admin',
        email: 'admin@email.com',
        password: password,
        imageUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxoBnq05850hAXAOcv0CciJtz3dASMTGcBQY38EssxzZkD7mpDlgUj1HUlhHaFJlo5gEk&usqp=CAU',
        createdAt,
        updatedAt,
      },
      {
        username: 'sophia',
        email: 'sophia@email.com',
        password: password,
        imageUrl:
          'https://www.rd.com/wp-content/uploads/2017/09/01-shutterstock_476340928-Irina-Bg.jpg',
        createdAt,
        updatedAt,
      },
      {
        username: 'ioan',
        email: 'ioan@email.com',
        password: password,
        imageUrl:
          'https://t3.ftcdn.net/jpg/03/91/19/22/360_F_391192211_2w5pQpFV1aozYQhcIw3FqA35vuTxJKrB.jpg',
        createdAt,
        updatedAt,
      },
      {
        username: 'ava',
        email: 'ava@email.com',
        password: password,
        imageUrl:
          'https://st.depositphotos.com/1001992/1451/i/600/depositphotos_14516561-stock-photo-beautiful-young-woman-with-beautiful.jpg',
        createdAt,
        updatedAt,
      },
      {
        username: 'jack',
        email: 'jack@email.com',
        password: password,
        imageUrl:
          'https://widgetwhats.com/app/uploads/2019/11/free-profile-photo-whatsapp-4.png',
        createdAt,
        updatedAt,
      }
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {})
  },
}