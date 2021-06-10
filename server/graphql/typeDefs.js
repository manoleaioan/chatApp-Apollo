const { gql } = require('apollo-server')

module.exports = gql`
  type User {
    username: String!
    email: String
    createdAt: String!
    token: String
    imageUrl: String
    latestMessage: Message
    isOnline: Boolean
  }
  type Message {
    uuid: String!
    content: String!
    from: String!
    to: String!
    createdAt: String!
    reactions: [Reaction]
  }
  type Reaction {
    uuid: String!
    content: String!
    createdAt: String!
    message: Message!
    user: User!
  }
  type Query {
    getUserData: User!
    getUsers: [User]!
    login(username: String!, password: String!): User!
    getMessages(from: String!): [Message]!
  }
  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): User!
    sendMessage(to: String!, content: String!): Message!
    reactToMessage(uuid: String!, content: String!): Reaction!
    updateUserProfile(imageUrl: String!): User!
  }
  type Subscription {
    newMessage: Message!
    newReaction: Reaction!
    newUser: User!
  }
`