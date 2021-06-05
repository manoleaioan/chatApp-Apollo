const { ApolloServer } = require('apollo-server-express')

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
const port = process.env.PORT || 4000;

const server = new ApolloServer({
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

server.applyMiddleware({
  app
})

app.listen(port, () => {
  console.log(`🚀 Server ready at ${server.graphqlPath}`)
  sequelize
    .authenticate()
    .then(() => console.log('Database connected!!'))
    .catch((err) => console.log(err))
})