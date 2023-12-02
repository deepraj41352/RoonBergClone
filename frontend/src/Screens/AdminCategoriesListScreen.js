import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import {
  Alert,
  Avatar,
  Button,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
// import { AiFillDelete } from 'react-icons/ai';
// import { MdEdit } from 'react-icons/md';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { Form } from 'react-bootstrap';
import { FormControl } from '@mui/material';
import { BiPlusMedical } from 'react-icons/bi';
import { Store } from '../Store';
import { useContext, useEffect, useReducer, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AvatarImage from '../Components/Avatar';
import { ImCross } from 'react-icons/im';
import { ColorRing } from 'react-loader-spinner';
import Badge from '@mui/material/Badge';
import { ThreeDots } from 'react-loader-spinner';
import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FATCH_REQUEST':
      return { ...state, loading: true };
    case 'FATCH_SUCCESS':
      return { ...state, categoryData: action.payload, loading: false };
    case 'FATCH_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'DELETE_SUCCESS':
      return { ...state, successDelete: action.payload };

    case 'DELETE_RESET':
      return { ...state, successDelete: false };

    case 'UPDATE_SUCCESS':
      return { ...state, successUpdate: action.payload };

    case 'UPDATE_RESET':
      return { ...state, successUpdate: false };
    case 'CATEGORY_CRATED_REQ':
      return { ...state, isSubmiting: true };
    case 'FATCH_SUBMITTING':
      return { ...state, submitting: action.payload };
    default:
      return state;
  }
};

const AntTabs = styled(Tabs)({
  borderBottom: '1px solid #e8e8e8',
  '& .MuiTabs-indicator': {
    backgroundColor: '#052c65',
  },
});

const AntTab = styled((props) => <Tab disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: 'none',
    minWidth: 0,
    [theme.breakpoints.up('sm')]: {
      minWidth: 0,
    },
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing(1),
    color: 'rgba(0, 0, 0, 0.85)',
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:hover': {
      color: '#052c65',
      fontWeight: 'bold',
      opacity: 1,
    },
    '&.Mui-selected': {
      color: '#052c65',
      fontWeight: theme.typography.fontWeightMedium,
    },
    '&.Mui-focusVisible': {
      backgroundColor: '#d1eaff',
    },
  })
);

const columns = [
  {
    width: 100,
    className: 'boldHeader',

    renderCell: (params) => {
      function generateColorFromAscii(str) {
        let color = '#';
        const combination = str
          .split('')
          .map((char) => char.charCodeAt(0))
          .reduce((acc, value) => acc + value, 0);
        color += (combination * 12345).toString(16).slice(0, 6);
        return color;
      }

      const name = params.row.categoryName[0].toLowerCase();
      const color = generateColorFromAscii(name);
      return (
        <>
          {params.row.categoryImage !== 'null' ? (
            <Avatar src={params.row.categoryImage} />
          ) : (
            <AvatarImage name={name} bgColor={color} />
          )}
        </>
      );
    },
  },

  {
    field: 'categoryName',
    headerName: 'Category',
    width: 100,
    className: 'boldHeader',
  },
  {
    field: 'categoryDescription',
    headerName: 'Description',
    width: 150,
    headerClassName: 'bold-header',
  },
  {
    field: '_id',
    headerName: 'ID',
    width: 250,
    headerClassName: 'bold-header',
  },
];

const getRowId = (row) => row._id;

export default function AdminContractorListScreen() {
  const navigate = useNavigate();
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCatogry] = useState('');
  const [status, setStatus] = useState('');
  const [categoryDesc, setCatogryDesc] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [updateData, setUpdateData] = useState(true);
  const [ShowErrorMessage, setShowErrorMessage] = useState(false);
  const [
    {
      loading,
      error,
      categoryData,
      successDelete,
      successUpdate,
      isSubmiting,
      submitting,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
    categoryData: [],
    successDelete: false,
    successUpdate: false,
    isSubmiting: false,
    submitting: false,
  });
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    console.log('newValue', newValue);
    if (newValue == 1) {
      navigate('/admin');
    }
  };

  const handleEdit = (rowId) => {
    navigate(`/adminEditCategory/${rowId}`);
  };

  const handleCloseRow = () => {
    setIsModelOpen(false);
  };

  const handleNew = () => {
    setSelectedRowData(null);
    setIsModelOpen(true);
    setIsNewCategory(true);
  };
  const handleSubmitNewCategory = () => {
    setIsModelOpen(false);
  };

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { toggleState, userInfo } = state;
  const theme = toggleState ? 'dark' : 'light';

  useEffect(() => {
    const FatchcategoryData = async () => {
      try {
        dispatch('FATCH_REQUEST');
        const response = await axios.get(`/api/category/`);
        const datas = response.data;
        const rowData = datas.map((items) => {
          return {
            ...items,
            _id: items._id,
            categoryName: items.categoryName,
            categoryDescription:
              items.categoryDescription == ''
                ? 'No description'
                : items.categoryDescription,
            categoryImage: items.categoryImage,
            categoryStatus:
              items.categoryStatus == true ? 'Active' : 'Inactive',
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
      FatchcategoryData();
    }
  }, [successDelete, successUpdate, updateData]);

  const submitHandler = async (e) => {
    e.preventDefault();
    dispatch({ type: 'FATCH_SUBMITTING', payload: true });
    const formDatas = new FormData();

    formDatas.append('categoryImage', selectedFile);
    formDatas.append('categoryName', category);
    formDatas.append('categoryDescription', categoryDesc);
    formDatas.append('categoryStatus', status);

    try {
      dispatch({ type: 'CATEGORY_CRATED_REQ' });
      const { data } = await axios.post(`/api/category/`, formDatas, {
        headers: {
          'content-type': 'multipart/form-data',

          authorization: `Bearer ${userInfo.token}`,
        },
      });
      toast.success('Category Created Successfully !');
      setUpdateData(!updateData);
      dispatch({ type: 'UPDATE_SUCCESS' });
      dispatch({ type: 'FATCH_SUBMITTING', payload: false });
      setCatogry('');
      setCatogryDesc('');
      setSelectedFile(null);
      setStatus('');
    } catch (err) {
      toast.error(err.response?.data?.message);
      dispatch({ type: 'FATCH_SUBMITTING', payload: false });
    } finally {
      setIsModelOpen(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const deleteHandle = async (userid) => {
    setIsDeleting(true);
    if (window.confirm('Are you sure to delete?')) {
      try {
        const response = await axios.delete(`/api/category/${userid}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        if (response.status === 200) {
          toast.success('Category Deleted Successfully!');
          setUpdateData(!updateData);
          setIsDeleting(false);
          dispatch({
            type: 'DELETE_SUCCESS',
            payload: true,
          });
        } else {
          toast.error('Failed To Delete Category.');
        }
      } catch (error) {
        setIsDeleting(false);
        console.error(error);
        toast.error('An Error Occurred While Deleting Category.');
      }
    } else {
      setIsDeleting(false);
    }
  };

  const validation = (e) => {
    const inputValue = e.target.value;
    setCatogry(inputValue);
    const firstLetterRegex = /^[a-zA-Z]/;
    if (!firstLetterRegex.test(inputValue.charAt(0))) {
      setShowErrorMessage(true);
    } else {
      setShowErrorMessage(false);
    }
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
              className="ThreeDot justi`fy-content-center"
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
          <Box sx={{ width: '100%' }}>
            <Box sx={{ bgcolor: '#fff' }}>
              <AntTabs
                value={value}
                onChange={handleChange}
                aria-label="ant example"
              >
                <AntTab label="Category" />
                <AntTab label="Create" />
              </AntTabs>
            </Box>
          </Box>
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
                rows={categoryData}
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
          <Modal
            open={isModelOpen}
            onClose={handleCloseRow}
            className="overlayLoading modaleWidth"
          >
            <Box
              className="modelBg"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 1,
              }}
            >
              {submitting && (
                <div className="overlayLoadingItem1">
                  <ColorRing
                    visible={true}
                    height="40"
                    width="40"
                    ariaLabel="blocks-loading"
                    wrapperStyle={{}}
                    wrapperClass="blocks-wrapper"
                    colors={[
                      'rgba(0, 0, 0, 1) 0%',
                      'rgba(255, 255, 255, 1) 68%',
                      'rgba(0, 0, 0, 1) 93%',
                    ]}
                  />
                </div>
              )}
              {/* <Form onSubmit={submitHandler}>
                <TextField
                  required
                  className="mb-3"
                  value={category}
                  onChange={(e) => setCatogry(e.target.value)}
                  label="Task Name"
                  fullWidth
                  type="text"
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  className="mt-2 formbtn updatingBtn globalbtnColor"
                >
                  {isSubmiting ? 'SUBMITTING' : 'SUBMIT '}
                </Button>
              </Form> */}
              <Form
                className="scrollInAdminproject p-3"
                // onSubmit={submitHandler}
              >
                <ImCross
                  color="black"
                  className="formcrossbtn"
                  onClick={handleCloseRow}
                />
                <h4 className="d-flex justify-content-center">Add Category</h4>

                <TextField
                  className="mb-3"
                  value={category}
                  label="Category Name"
                  fullWidth
                  onChange={validation}
                  required
                />
                {ShowErrorMessage && (
                  <Alert
                    variant="danger"
                    className="error nameValidationErrorBox"
                  >
                    The first letter of the Category should be an alphabet
                  </Alert>
                )}
                <TextField
                  className="mb-3"
                  value={categoryDesc}
                  label="Add Description"
                  required
                  fullWidth
                  onChange={(e) => setCatogryDesc(e.target.value)}
                />
                <FormControl className="mb-3">
                  <InputLabel>Select Status</InputLabel>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  className="mb-3"
                  type="file"
                  fullWidth
                  onChange={handleFileChange}
                  required
                  style={{ display: 'none' }}
                />
                <FormControl className="mb-3 cateLogoImgContainer">
                  <InputLabel className="cateLogoImgLabel">
                    {selectedFile ? selectedFile.name : 'Upload Logo'}
                  </InputLabel>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                  <label htmlFor="file-input">
                    <Button
                      variant="contained"
                      component="span"
                      className="globalbtnColor"
                    >
                      Browse
                    </Button>
                  </label>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  onClick={submitHandler}
                  className="mt-2 formbtn updatingBtn globalbtnColor model-btn "
                >
                  {submitting && isSubmiting ? 'SUBMITTING' : 'SUBMIT '}
                </Button>
              </Form>
            </Box>
          </Modal>
        </>
      )}
    </>
  );
}
