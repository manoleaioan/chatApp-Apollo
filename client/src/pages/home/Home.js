import React, { Fragment, useEffect } from 'react'
import { Row, Button, Image } from 'react-bootstrap'
import { gql, useSubscription, useQuery } from '@apollo/client'

import { useAuthDispatch, useAuthState } from '../../context/auth'
import { useMessageDispatch } from '../../context/message'

import Users from './Users'
import Messages from './Messages'

const NEW_MESSAGE = gql`
  subscription newMessage {
    newMessage {
      uuid
      from
      to
      content
      createdAt
    }
  }
`

const NEW_REACTION = gql`
  subscription newReaction {
    newReaction {
      uuid
      content
      message {
        uuid
        from
        to
      }
    }
  }
`
const GET_USER_DATA = gql`
  query getUserData {
    getUserData {
      username
      createdAt
      imageUrl
    }
  }
`

export default function Home() {
  const messageDispatch = useMessageDispatch()
  const dispatch = useAuthDispatch()

  const { user } = useAuthState()

  const { loading } = useQuery(GET_USER_DATA, {
    onCompleted: data => dispatch({ type: 'GET_USER_DATA', payload: data.getUserData }),
    onError: err => console.log(err)
  })

  const { data: messageData, error: messageError } = useSubscription(
    NEW_MESSAGE
  )

  const { data: reactionData, error: reactionError } = useSubscription(
    NEW_REACTION
  )

  useEffect(() => {
    if (messageError) console.log(messageError)

    if (messageData) {
      const message = messageData.newMessage
      const otherUser = user.username === message.to ? message.from : message.to

      messageDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          username: otherUser,
          message,
        },
      })
    }
  }, [messageError, messageData])

  useEffect(() => {
    if (reactionError) console.log(reactionError)

    if (reactionData) {
      const reaction = reactionData.newReaction
      const otherUser =
        user.username === reaction.message.to
          ? reaction.message.from
          : reaction.message.to

      messageDispatch({
        type: 'ADD_REACTION',
        payload: {
          username: otherUser,
          reaction,
        },
      })
    }
  }, [reactionError, reactionData])

  return (
    <Fragment>
      <Row className="bg-white chat">
        {!loading && <Users />}
        <Messages />
      </Row>
    </Fragment>
  )
}