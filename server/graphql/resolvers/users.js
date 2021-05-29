const bcrypt = require('bcryptjs')
const { UserInputError, AuthenticationError, ForbiddenError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')

const { Message, User } = require('../../models')

module.exports = {
  Query: {
    getUsers: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError('Unauthenticated')

        let users = await User.findAll({
          attributes: ['username', 'imageUrl', 'createdAt'],
          where: { username: { [Op.ne]: user.username } },
        })

        const allUserMessages = await Message.findAll({
          where: {
            [Op.or]: [{ from: user.username }, { to: user.username }],
          },
          order: [['createdAt', 'DESC']],
        })


        users = users.map((otherUser) => {
          const latestMessage = allUserMessages.find(
            (m) => m.from === otherUser.username || m.to === otherUser.username
          )
          otherUser.latestMessage = latestMessage
          return otherUser
        })

        return users
      } catch (err) {
        console.log(err)
        throw err
      }
    },

    getUserData: async (_, __, { user }) => {
      try {
        let userData = await User.findOne({
          attributes: ['username', 'imageUrl', 'createdAt'],
          where: { username: user.username },
        })

        return userData
      } catch (err) {
        console.log(err)
      }
    },

    login: async (_, args) => {
      const { username, password } = args
      let errors = {}

      try {
        if (username.trim() === '')
          errors.username = 'username must not be empty'
        if (password === '') errors.password = 'password must not be empty'

        if (Object.keys(errors).length > 0) {
          throw new UserInputError('bad input', { errors })
        }

        const user = await User.findOne({
          where: { username },
        })

    
        if (!user) {
          errors.username = 'user not found'
          throw new UserInputError('user not found', { errors })
        }

        const correctPassword = await bcrypt.compare(password, user.password)

        if (!correctPassword) {
          errors.password = 'password is incorrect'
          throw new UserInputError('password is incorrect', { errors })
        }

        const token = jwt.sign({ username:username.toLowerCase() }, process.env.JWT_SECRET,{
          expiresIn: 60 * 60,
        })

        return {
          ...user.toJSON(),
          token
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
  },

  Mutation: {
    register: async (_, args) => {
      let { username, email, password, confirmPassword } = args
      let errors = {}

      try {
        // Validate input data
        if (email.trim() === '') errors.email = 'email must not be empty'
        if (username.trim() === '')
          errors.username = 'username must not be empty'
        if (password.trim() === '')
          errors.password = 'password must not be empty'
        if (confirmPassword.trim() === '')
          errors.confirmPassword = 'repeat password must not be empty'

        if (password !== confirmPassword)
          errors.confirmPassword = 'passwords must match'

        if (Object.keys(errors).length > 0) {
          throw errors
        }

        // Hash password
        password = await bcrypt.hash(password, 6)

        // Create user
        const user = await User.create({
          username,
          email,
          password,
        })

        // Return user
        return user
      } catch (err) {
        console.log(err)
        if (err.name === 'SequelizeUniqueConstraintError') {
          err.errors.forEach(
            (e) => (errors[e.path] = `${e.path} is already taken`)
          )
        } else if (err.name === 'SequelizeValidationError') {
          err.errors.forEach((e) => (errors[e.path] = e.message))
        }
        throw new UserInputError('Bad input', { errors })
      }
    },

    updateUserProfile: async (_, { imageUrl }, { user }) => {
      try {
       // console.log(user);
        if (!user) throw new AuthenticationError('Unauthenticated')

        let userData = await User.findOne({
          where: { username: user.username },
        })

        userData.imageUrl = imageUrl
        userData.save()

        return {
          ...userData.toJSON()
        }
      } catch (err) {
        console.log(err)
      }
    }

  },
}