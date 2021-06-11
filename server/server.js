const { ApolloServer } = require('apollo-server-express')
const { createServer } = require('http')
const jwt = require('jsonwebtoken')
if (process.env.NODE_ENV != 'production') require('dotenv').config();

const { sequelize, User } = require('./models')

const resolvers = require('./graphql/resolvers')
const typeDefs = require('./graphql/typeDefs')
const contextMiddleware = require('./util/contextMiddleware')

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

const { pubsub } = contextMiddleware

const appInit = function () {
  User.update(
    { isOnline: false },
    { where: { isOnline: true } }
  )
}

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleware,
  subscriptions: {
    path: '/',
    onConnect: async (connectionParams) => {
      if (connectionParams.Authorization) {

        const accessToken = connectionParams['Authorization'].split('Bearer ')[1]

        try {
     
          let username = jwt.verify(accessToken, process.env.JWT_SECRET).username

          let user = await User.findOne({
            where: { username },
            attributes: ['id', 'username', 'imageUrl', 'createdAt', 'isOnline'],
          })

          user.isOnline = true
          user.save()

          pubsub.publish('NEW_USER', { newUser: user })

          return { user }

        } catch (e) {
          // do not fire error to allow unauthorized access to subscriptions
        }
      }
    },
    onDisconnect: async (_, context) => {
      const initialContext = await context.initPromise
      if (initialContext && initialContext.user) {
        pubsub.publish('NEW_USER', { newUser: initialContext.user })
        initialContext.user.isOnline = false
        initialContext.user.save()
      }
    },
  }
})

app.use(cors());

if (process.env.NODE_ENV == 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')))

  app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'))
  });
}

apollo.applyMiddleware({
  app
})

const httpServer = createServer(app)
apollo.installSubscriptionHandlers(httpServer)


httpServer.listen(PORT, () => {
  console.log(`server ready at http://localhost:${PORT}${apollo.graphqlPath}`)
  console.log(`Subscriptions ready at ws://localhost:${PORT}${apollo.subscriptionsPath}`)
  sequelize
    .authenticate()
    .then(() => {
      console.log('Database connected!!')
      appInit()
    })
    .catch((err) => console.log(err))
})