import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [name, setName] = useState('');
  const [jobs, setJobs] = useState([]);
  const [jobDesc, setJobDesc] = useState('');
  const [location, setLocation] = useState('');
  const [fullTime, setFullTime] = useState('');
  const [token, setToken] = useState('');
  const [expired, setExpired] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    refreshToken();
    getJobs();
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
            navigate("/");
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

  const getJobs = async () => {
    const response = await axiosJwt.get('http://localhost:4000/jobs', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    
    setJobs(response.data);
  }

  return (
    <div className=' container mt-5'>
        <h1>Welcome Back:  { name }</h1>
        <form onSubmit={ getJobs }>
            <div class="field is-horizontal">
                <div className='field mt-5'>
                    <label className='label'>Job Description</label>
                    <div className='controls'>
                        <input type="text" className='input' placeholder='Job Description' value={jobDesc} onChange={(e) => setJobDesc(e.target.value)}/>
                    </div>
                </div>
                <div className='field mt-5'>
                    <label className='label'>Location</label>
                    <div className='controls'>
                        <input type="text" className='input' placeholder='Location' value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                </div>
                <div className='field mt-5'>
                <label class="checkbox">
                <input class ='control' type="checkbox"/>
                    Full Time Only
                </label>
                </div>
                <div className='field mt-5' class='control'>
                    <button className='button is-info is-fullwidth'>Search</button>
                </div>
            </div>
        </form>
        <table className='table is-striped is-fullwidth'>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Type</th>
                    <th>Location</th>
                </tr>
            </thead>
            <tbody>
                {jobs.map((job, index) => (
                    <tr key={job.id}>
                        <td>{job.title}</td>
                        <td>{job.company}</td>
                        <td>{job.type}</td>
                        <td>{job.location}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  )
}

export default Dashboard