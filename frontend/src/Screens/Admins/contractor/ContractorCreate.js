import axios from 'axios';
import React, { useContext, useState } from 'react';
import { Store } from '../../../Store';
import { Button } from 'react-bootstrap';
import { MenuItem, Select } from '@mui/material';
import FormSubmitLoader from '../../../Util/formSubmitLoader';
import Validations from '../../../Components/Validations';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function ContractorCreate() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const [submiting, setsubmiting] = useState(false);
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    status: true,
    role: 'contractor',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setsubmiting(true);
    const submitData = {
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      role: user.role,
      userStatus: user.status,
    };
    console.log('submitData', submitData);
    try {
      const response = await axios.post(`/api/user/add`, submitData, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      if (response.status === 200) {
        setUser({
          firstName: '',
          lastName: '',
          email: '',
        });
        toast.success('Admin Created Successfully !');
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setsubmiting(false);
    }
  };

  return (
    <>
      <ul className="nav-style1">
        <li>
          <Link to="/contractor">
            <a>Client</a>
          </Link>
        </li>
        <li>
          <Link to="/contractor/create">
            <a className="active">Create</a>
          </Link>
        </li>
      </ul>
      {submiting && <FormSubmitLoader />}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label className="form-label fw-semibold">Image</label>
              <input
                type="file"
                className="form-control file-control"
                id="clientImage"
                name="image_url"
                // onChange={handleChange}
              />
              <div className="form-text">Upload image size 300x300!</div>

              <div className="mt-2">
                {/* {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="image"
                    className="img-thumbnail w-100px me-2"
                  />
                ) : ( */}
                <img
                  src="https://res.cloudinary.com/dmhxjhsrl/image/upload/v1698911473/r5jajgkngwnzr6hzj7vn.jpg"
                  alt="image"
                  className="img-thumbnail creatForm me-2"
                />
                {/* )} */}
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="form-group">
              <label className="form-label fw-semibold">First Name</label>
              <input
                type="text"
                className="form-control"
                name="firstName"
                value={user.firstName}
                onChange={handleChange}
                required={true}
              />
            </div>
          </div>

          <div className="col-md-12">
            <div className="form-group">
              <label className="form-label fw-semibold">Last Name</label>
              <input
                type="text"
                className="form-control"
                name="lastName"
                value={user.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-12">
            <div className="form-group">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="text"
                className="form-control"
                name="email"
                value={user.email}
                onChange={handleChange}
                required={true}
              />
            </div>
            <Validations type="email" value={user.email} />
          </div>

          <div className="col-md-12">
            <div className="form-group">
              <label className="form-label fw-semibold">Status</label>
              <Select
                className={`form-control ${user.status ? 'active' : ''}`}
                value={user.status}
                onChange={handleChange}
                inputProps={{
                  name: 'status',
                  id: 'status',
                }}
                required
              >
                <MenuItem value={true} className="active-option">
                  Active
                </MenuItem>
                <MenuItem value={false} className="active-option">
                  Inactive
                </MenuItem>
              </Select>
            </div>
          </div>

          <div className="col-12">
            <Button
              className="mt-2 formbtn globalbtnColor model-btn "
              variant="contained"
              color="primary"
              type="submit"
              disabled={submiting}
            >
              {submiting ? 'SUBMITTING' : 'SUBMIT '}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
