import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { Form, Toast } from 'react-bootstrap';
import { BiPlusMedical } from 'react-icons/bi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import { ImCross } from 'react-icons/im';
import { ColorRing, ThreeDots } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useReducer, useState } from 'react';
import Validations from '../Components/Validations';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FATCH_REQUEST':
      return { ...state, loading: true };
    case 'FATCH_SUCCESS':
      return { ...state, AgentData: action.payload, loading: false };
    case 'FATCH_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'FATCH_SUBMITTING':
      return { ...state, submitting: action.payload };
    case 'DELETE_SUCCESS':
      return { ...state, successDelete: action.payload };

    case 'DELETE_RESET':
      return { ...state, successDelete: false };
    case 'FATCH_CATEGORY':
      return { ...state, categoryData: action.payload };
    case 'UPDATE_SUCCESS':
      return { ...state, successUpdate: action.payload };

    case 'UPDATE_RESET':
      return { ...state, successUpdate: false };

    default:
      return state;
  }
};

const columns = [
  {
    field: 'first_name',
    headerName: 'Admin Name',
    width: 200,
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 200,
  },
  // {
  //     field: 'userStatus',
  //     headerName: 'Status',
  //     width: 100,
  // },
  { field: '_id', headerName: 'ID', width: 200 },
];
const getRowId = (row) => row._id;
export default function SuperadminAdminList() {
  const { state } = useContext(Store);
  const { toggleState, userInfo } = state;
  const navigate = useNavigate();
  const role = 'admin';
  const theme = toggleState ? 'dark' : 'light';
  const [isModelOpen, setIsModelOpen] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState();
  const [password, setPassword] = useState('');
  const [selectcategory, setSelectCategory] = useState();
  const [isDeleting, setIsDeleting] = useState(false);
  const [
    {
      loading,
      submitting,
      categoryData,
      error,
      AgentData,
      successDelete,
      successUpdate,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
    AgentData: [],
    successDelete: false,
    categoryData: [],
    successUpdate: false,
    submitting: false,
  });

  useEffect(() => {
    const FatchCategory = async () => {
      try {
        dispatch('FATCH_REQUEST');
        const response = await axios.get(`/api/category/`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        const datas = response.data;
        dispatch({ type: 'FATCH_CATEGORY', payload: datas });
      } catch (error) {
        console.log(error);
      }
    };
    FatchCategory();
  }, []);

  const handleCloseRow = () => {
    setIsModelOpen(false);
  };

  const handleNew = () => {
    setIsModelOpen(true);
  };

  useEffect(() => {
    const FatchAgentData = async () => {
      try {
        dispatch('FATCH_REQUEST');
        const response = await axios.post(`/api/user/`, { role: role });
        const datas = response.data;
        const rowData = datas.map((items) => {
          const categoryName = categoryData.find(
            (category) => category._id === items.agentCategory
          );
          return {
            ...items,
            _id: items._id,
            first_name: items.first_name,
            email: items.email,
            userStatus: items.userStatus ? 'Active' : 'Inactive',
            agentCategory: categoryName ? categoryName.categoryName : '',
          };
        });
        dispatch({ type: 'FATCH_SUCCESS', payload: rowData });
      } catch (error) {
        console.log(error);
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else if (successUpdate) {
      dispatch({ type: 'UPDATE_RESET' });
    } else {
      FatchAgentData();
    }
  }, [successDelete, successUpdate, categoryData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'FATCH_SUBMITTING', payload: true });
    try {
      const response = await axios.post(
        `/api/user/add`,
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
          role: role,
          userStatus: status,
          agentCategory: selectcategory,
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      if (response.status === 200) {
        toast.success('Admin Created Successfully !');
        setIsModelOpen(false);
        setFirstName('');
        setLastName('');
        setStatus('');
        setEmail('');
        setSelectCategory('');
        dispatch({ type: 'UPDATE_SUCCESS', payload: true });
        dispatch({ type: 'FATCH_SUBMITTING', payload: false });
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
      dispatch({ type: 'FATCH_SUBMITTING', payload: false });
    }
  };

  const deleteHandle = async (userid) => {
    setIsDeleting(true);
    if (window.confirm('Are You Sure To Delete?')) {
      try {
        const response = await axios.delete(`/api/user/${userid}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        if (response.status === 200) {
          setIsDeleting(false);
          toast.success('Admin Deleted Successfully!');
          dispatch({
            type: 'DELETE_SUCCESS',
            payload: true,
          });
        } else {
          toast.error('Failed To Delete Admin.');
        }
      } catch (error) {
        setIsDeleting(false);
        console.error(error);
        toast.error('An Error Occurred While Deleting Admin.');
      }
    } else {
      setIsDeleting(false);
    }
  };

  // const handleCloseRow = () => {
  //   setIsModelOpen(false);
  // };

  const handleModel = () => {
    setIsModelOpen(true);
  };

  const handleEdit = (userid) => {
    navigate(`/superadmineditadmin/${userid}`);
  };
  return (
    <>
      {loading ? (
        <>
          <div className="ThreeDot">
            <ThreeDots
              height="80"
              width="80"
              radius="9"
              className="ThreeDot justify-content-center"
              color="#0e0e3d"
              ariaLabel="three-dots-loading"
              wrapperStyle={{}}
              wrapperClassName=""
              visible={true}
            />
          </div>
        </>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <>
          <div className="overlayLoading">
            {isDeleting && (
              <div className="overlayLoadingItem1">
                <ColorRing
                  visible={true}
                  height="40"
                  width="40"
                  ariaLabel="blocks-loading"
                  wrapperStyle={{}}
                  wrapperClass="blocks-wrapper"
                  const
                  colors={['white', 'white', 'white', 'white', 'white']}
                />
              </div>
            )}
            <Box sx={{ width: '100%' }}>
              <DataGrid
                className={
                  theme == 'light'
                    ? `${theme}DataGrid mx-2 tableContainer`
                    : `tableContainer ${theme}DataGrid mx-2`
                }
                rows={AgentData}
                columns={[
                  ...columns,
                  {
                    field: 'categoryStatus',
                    headerName: 'Status',
                    width: 100,
                    renderCell: (params) => {
                      const isInactive =
                        params.row.categoryStatus === 'Inactive';
                      const cellClassName = isInactive
                        ? 'inactive-cell'
                        : 'active-cell';

                      return (
                        <div className={`status-cell ${cellClassName}`}>
                          {params.row.categoryStatus}
                        </div>
                      );
                    },
                  },
                  {
                    field: 'action',
                    headerName: 'Action',
                    width: 250,
                    renderCell: (params) => {
                      return (
                        <Grid item xs={8}>
                          <button
                            variant="contained"
                            className="mx-2 edit-btn"
                            onClick={() => handleEdit(params.row._id)}
                          >
                            Edit
                          </button>
                          <button
                            variant="outlined"
                            className="mx-2 delete-btn global-font"
                            onClick={() => deleteHandle(params.row._id)}
                          >
                            Delete
                          </button>
                        </Grid>
                      );
                    },
                  },
                ]}
                getRowId={getRowId}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 5,
                    },
                  },
                }}
                pageSizeOptions={[5]}
                disableRowSelectionOnClick
                localeText={{ noRowsLabel: 'Category Data Is Not Avalible' }}
              />
            </Box>
          </div>
        </>
      )}
    </>
  );
}
