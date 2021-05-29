import React, { useState } from 'react'
import { Row, Col, Form, Button } from 'react-bootstrap'
import { gql, useLazyQuery } from '@apollo/client'
import { Link } from 'react-router-dom'

import { useAuthDispatch } from '../context/auth'

const LOGIN_USER = gql`
  query Login(
    $username: String!,
    $password: String!
  ) {
    login(username: $username password: $password) {
      username email createdAt token imageUrl
    }
  }
`;

export default function Register(props) {
  const [variables, setVariables] = useState({
    username: '',
    password: ''
  })

  const [errors, setErrors] = useState({})

  const dispatch = useAuthDispatch()

  const [loginUser, { loading }] = useLazyQuery(LOGIN_USER, {
    onError: (err) => {
      try {
        setErrors(err.graphQLErrors[0].extensions.errors)
      } catch (err) {
        alert(err)
      }
    },
    onCompleted(data) {
      dispatch({ type: 'LOGIN', payload: data.login })
      window.location.href = '/'
    },
  })

  const submitLoginForm = (e) => {
    e.preventDefault();
    loginUser({ variables });
  }

  return (
    <Row className="bg-white py-5 justify-content-center login-register-box">
      <Col xs={8} sm={8} md={6} lg={6}>
        <h1 className="mb-4 text-center">Login</h1>
        <Form onSubmit={submitLoginForm}>

          <Form.Group>
            <Form.Label className={errors.username && 'text-danger'}>
              {errors.username ?? 'Username'}
            </Form.Label>
            <Form.Control type="text" value={variables.username} onChange={e => setVariables({ ...variables, username: e.target.value })} className={errors.username && 'is-invalid'} />
          </Form.Group>

          <Form.Group>
            <Form.Label className={errors.password && 'text-danger'}>
              {errors.password ?? 'Password'}
            </Form.Label>
            <Form.Control type="password" value={variables.password} onChange={e => setVariables({ ...variables, password: e.target.value })} className={errors.password && 'is-invalid'} />
          </Form.Group>

          <div className="text-center mt-4">
            <Button variant="success" type="submit" disabled={loading}>
              {loading ? 'Loading' : 'Login'}
            </Button>
            <br />
            <small>Don't have an account? <Link to='/register'>Register</Link></small>
          </div>
        </Form>
      </Col>
    </Row>
  )
}
