const { ApolloServer } = require('apollo-server-express')
const { createServer } =  require('http')
require('dotenv').config()

const { sequelize } = require('./models')

const resolvers = require('./graphql/resolvers')
const typeDefs = require('./graphql/typeDefs')
const contextMiddleware = require('./util/contextMiddleware')

const express = require('express');
const cors = require('cors');
const path = require('path');

if (process.env.NODE_ENV != 'production') require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleware,
  subscriptions: { path: '/' },
})

app.use(cors());

if (process.env.NODE_ENV == 'production'){
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
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
    .then(() => console.log('Database connected!!'))
    .catch((err) => console.log(err))
})