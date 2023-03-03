import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [expired, setExpired] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    refreshToken();
  }, [])

  const refreshToken = async () => {
    try {
        const response = await axios.get('http://localhost:4000/token');
        setToken(response.data.accessToken);
        const decoded = jwt_decode(response.data.accessToken);
        setName(decoded.userName);
        setExpired(decoded.exp);
    } catch (error) {
        if (error.response) {
            navigate("/")
        }
    }
  }

  const axiosJwt = axios.create();

  axiosJwt.interceptors.request.use(async (config) => {
    const currentDate = new Date();
    if (expired * 1000 < currentDate.getTime()) {
        const response = await axios.get('http://localhost:4000/token');
        config.headers.Authorization = `Bearer ${response.data.accesstoken}`;
        setToken(response.data.accessToken);
        const decoded = jwt_decode(response.data.accessToken);
        setName(decoded.userName);
        setExpired(decoded.exp);
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  })

  const getUsers = async () => {
    const response = await axiosJwt.get('http://localhost:4000/users', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log(response.data)
  }

  return (
    <div className=' container mt-5'>
        <h1>Welcome Back:  { name }</h1>
        <button onClick={ getUsers } className='button is-info'>Get Users</button>
    </div>
  )
}

export default Dashboard