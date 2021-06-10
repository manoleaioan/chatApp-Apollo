import React, { useState, useEffect } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import { Col, Image, Dropdown, Modal, Button, Form } from 'react-bootstrap'
import classNames from 'classnames'
import ReactEmoji from 'react-emoji';

import { useMessageDispatch, useMessageState } from '../../context/message'
import { useAuthDispatch, useAuthState } from '../../context/auth'

const GET_USERS = gql`
  query getUsers {
    getUsers {
      username
      createdAt
      imageUrl
      isOnline
      latestMessage {
        uuid
        from
        to
        content
        createdAt
      }
    }
  }
`

const UPDATE_USER_PROFILE_PICTURE = gql`
  mutation updateProfile($imageUrl: String!) {
    updateUserProfile(imageUrl: $imageUrl) {
      username
      createdAt
      imageUrl
      isOnline
    }
  }
`

export default function Users() {
  const authDispatch = useAuthDispatch()
  const dispatch = useMessageDispatch()
  const { user } = useAuthState()
  const { users } = useMessageState()
  const selectedUser = users?.find(u => u.selected === true)?.username
  const [profileUrl, setProfileUrl] = useState('')

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { loading } = useQuery(GET_USERS, {
    onCompleted: data => dispatch({ type: 'SET_USERS', payload: data.getUsers }),
    onError: err => console.log(err)
  })

  const [updateProfilePic] = useMutation(UPDATE_USER_PROFILE_PICTURE, {
    update: (_, res) => authDispatch({ type: 'GET_USER_DATA', payload: res.data.updateUserProfile }),
    onError: err => console.log(err)
  });

  useEffect(() => {
    setProfileUrl(user.imageUrl)
  }, [user])

  let usersMarkup

  if (!users || loading) {
    usersMarkup = <p>Loading..</p>
  } else if (users.length === 0) {
    usersMarkup = <p>No users have joined yet</p>
  } else if (users.length > 0) {
    usersMarkup = users.map((user) => {
      const selected = selectedUser === user.username

      return (<div
        role="button"
        className={classNames("user-div d-flex justify-content-center justify-content-md-start p-3", { 'user-selected': selected })}
        key={user.username}
        onClick={() => dispatch({ type: 'SET_SELECTED_USER', payload: user.username })}
      >
        <Image
          src={user.imageUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
          className="user-image"
        />    
        <div className={classNames('status',{'active':user.isOnline})}></div>
        <div className="d-none d-md-block ml-2">
          <p className="text-success users-name">{user.username}</p>
          <p className="font-weight-light">
            {user.latestMessage
              ? ReactEmoji.emojify(user.latestMessage.content)
              : 'You are now connected!'}
          </p>
        </div>
      </div>)
    })
  }

  const logout = () => {
    authDispatch({ type: 'LOGOUT' })
    window.location.href = '/login'
  }

  const updateProfilePicture = () => {
    updateProfilePic({ variables: { imageUrl: profileUrl } });
    handleClose()
  }

  return (
    <Col xs={2} md={4} className="p-0">
      <div
        role="button"
        className={"user-div acc d-flex justify-content-center justify-content-md-start p-3"}
        key={user.username}
      >
        <Image
          src={user.imageUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
          className="user-image"
        />
        <div className="d-none align-items-center d-md-flex ml-2">
          <p className="text-gray users-name">{user.username}</p>
        </div>

        <Dropdown className="ml-auto">
          <Dropdown.Toggle variant="" id="dropdown-basic">
            <i className="fas fa-cog ml-auto d-flex align-items-center dd fa-spin-hover" role='button'></i>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={handleShow}>Change profile picture</Dropdown.Item>
            <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className="users-area">
        {usersMarkup}
      </div>

      <Modal show={show} onHide={handleClose} keyboard={true}>
        <Modal.Body className="d-flex justify-cotent-center mt-2">
          <Image
            src={profileUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
            className="user-image mb-3 d-flex mr-2"
          />
          <Form.Control
            type="text"
            className="message-input p-4 bg-secondary border-0  rounded-pill"
            placeholder="Url"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={updateProfilePicture}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Col>
  )
}
