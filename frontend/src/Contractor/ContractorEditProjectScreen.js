import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import { Store } from '../Store';
import { Button, Form } from 'react-bootstrap';
import MultiSelect from 'react-multiple-select-dropdown-lite';
import 'react-multiple-select-dropdown-lite/dist/index.css';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ColorRing, ThreeDots } from 'react-loader-spinner';
import { TextField } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import dayjs from 'dayjs';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FATCH_REQUEST':
      return { ...state, loading: true };
    case 'FATCH_SUCCESS':
      return { ...state, projectData: action.payload, loading: false };
    case 'FATCH_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SUCCESS_CATEGORY':
      return { ...state, categoryData: action.payload, loading: false };
    case 'ERROR_CATEGORY':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_SUCCESS':
      return { ...state, successUpdate: action.payload };

    case 'UPDATE_RESET':
      return { ...state, successUpdate: false };

    default:
      return state;
  }
};

function ContractorEditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { toggleState, userInfo } = state;
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [createdDate, setCreatedDate] = useState();
  const [endDate, setEndDate] = useState();
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const theme = toggleState ? 'dark' : 'light';
  const [isSubmit, setSubmit] = useState(false);
  const [
    { loading, error, projectData, categoryData, successUpdate },
    dispatch,
  ] = React.useReducer(reducer, {
    loading: true,
    error: '',
    projectData: {},
    categoryData: {},
    successUpdate: false,
  });
  const [conversations, setConversation] = useState([]);
  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get(`/api/conversation/${id}`);
        setConversation(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        dispatch('FETCH_REQUEST');
        const response = await axios.get(`/api/project/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        const ProjectDatas = response.data;
        setEndDate(
          ProjectDatas.endDate ? ProjectDatas.endDate.split('T')[0] : null
        );
        setCreatedDate(
          ProjectDatas.createdDate
            ? ProjectDatas.createdDate.split('T')[0]
            : null
        );
        setSelectedOptions(
          ProjectDatas.assignedAgent.map((item) => item.categoryId).join(',')
        );

        dispatch({ type: 'FATCH_SUCCESS', payload: ProjectDatas });
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();
  }, []);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        dispatch('FETCH_REQUEST');
        const response = await axios.get(`/api/category`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        const category = response.data;
        dispatch({ type: 'SUCCESS_CATEGORY', payload: category });
      } catch (error) {
        console.error('Error fetching category data:', error);
      }
    };

    fetchCategoryData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Construct the updated data object
      setSubmit(true);
      const categoryIds = selectedOptions.split(',');
      const projectCategory = categoryIds.map((categoryId) => {
        const category = categoryData.find((cat) => cat._id === categoryId);
        return {
          categoryId,
          categoryName: category ? category.categoryName : 'Unknown Category',
        };
      });

      const updatedData = {
        projectName: projectData.projectName,
        projectDescription: projectData.projectDescription,
        projectCategory, // Assign the constructed projectCategory array here
        createdDate: createdDate,
        endDate: endDate,
      };

      const response = await axios.put(
        `/api/project/update/${id}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      if (response.status === 200) {
        toast.success('Project Updated Successfully !');
        navigate('/project-list-screen');
        setSubmit(false);
      }
    } catch (error) {
      console.error('API Error:', error);
      setSubmit(false);
    }
  };

  const options =
    categoryData && Array.isArray(categoryData)
      ? categoryData.map((item) => ({
          label: item.categoryName,
          value: item._id,
        }))
      : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: 'FATCH_SUCCESS',
      payload: {
        ...projectData,
        [name]: value,
      },
    });
  };

  const handleCategoryChange = (selected) => {
    setSelectedOptions(selected);
  };

  const currentDate = dayjs();

  const validateDates = (newStartDate, newEndDate) => {
    setCreatedDate(newStartDate);
    setEndDate(newEndDate);
    const selectedStartDate = dayjs(newStartDate);
    const selectedEndDate = dayjs(newEndDate);

    if (
      selectedStartDate.isAfter(currentDate, 'day') ||
      selectedStartDate.isSame(currentDate, 'day')
    ) {
      setCreatedDate(newStartDate);
      setStartDateError('');

      if (newEndDate) {
        if (
          selectedEndDate.isAfter(selectedStartDate, 'day') ||
          selectedEndDate.isSame(selectedStartDate, 'day')
        ) {
          setEndDate(newEndDate);
          setEndDateError('');
        } else {
          setEndDateError(
            'End date must be greater than or equal to the Start Date.'
          );
        }
      }
    } else {
      setStartDateError(
        'Start date must be greater than or equal to the current date.'
      );
    }
  };
  return (
    <div>
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
        <div>
          <div className="overlayLoading">
            {isSubmit && (
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
            <div className="d-flex w-100 my-3 gap-4 justify-content-center align-item-center projectScreenCard-outer ">
              <Card className={`projectScreenCard ${theme}CardBody`}>
                <Card.Header className={`${theme}CardHeader`}>
                  Project Details
                </Card.Header>
                <div className="FormContainerEdit pt-4">
                  <Card.Body className="text-start">
                    <Form className="px-3" onSubmit={handleSubmit}>
                      <TextField
                        required
                        type="text"
                        name="projectName"
                        value={projectData.projectName}
                        onChange={handleInputChange}
                        className=" mb-3"
                        label="Project Name"
                        fullWidth
                        InputLabelProps={{
                          shrink: projectData.projectName ? true : false,
                        }}
                      />
                      <TextField
                        value={projectData.projectDescription}
                        onChange={handleInputChange}
                        name="projectDescription"
                        className=" mb-3"
                        label="Project Description"
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        InputLabelProps={{
                          shrink: projectData.projectDescription ? true : false,
                        }}
                      />

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">
                          Select Options:
                        </Form.Label>
                        <MultiSelect
                          className="categorieslist"
                          onChange={handleCategoryChange}
                          options={options}
                          defaultValue={selectedOptions}
                        />
                      </Form.Group>
                      <div className="d-flex gap-3 mb-3">
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <div className="d-flex flex-column">
                            <DatePicker
                              label="Start Date"
                              value={createdDate}
                              onChange={(newValue) =>
                                validateDates(newValue, endDate)
                              }
                              renderInput={(params) => (
                                <TextField {...params} />
                              )}
                            />
                            {startDateError && (
                              <div className="Datevalidation">
                                {startDateError}
                              </div>
                            )}
                          </div>
                          <div className="d-flex flex-column">
                            <DatePicker
                              label="End Date"
                              value={endDate}
                              onChange={(newValue) =>
                                validateDates(createdDate, newValue)
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  style={{ color: 'white' }}
                                />
                              )}
                            />
                            {endDateError && (
                              <div className="Datevalidation">
                                {endDateError}
                              </div>
                            )}
                          </div>
                        </LocalizationProvider>
                      </div>
                      {/* <div className="d-flex gap-3 mb-3">
                        <Form.Group className="w-100" controlId="start-date">
                          <Form.Label className="fw-bold">Start Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="createdDate"
                            value={createdDate}
                            onChange={(e) => setCreatedDate(e.target.value)}
                            placeholder="Start Date"
                          />
                        </Form.Group>
                        <Form.Group className="w-100" controlId="end-date">
                          <Form.Label className="fw-bold">End Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="End Date"
                          />
                        </Form.Group>
                      </div> */}
                      <div className="d-flex justify-content-end">
                        <Button
                          variant="primary"
                          type="submit"
                          className="globalbtnColor updatingBtn"
                          disabled={isSubmit}
                        >
                          {isSubmit ? 'UPDATING' : 'UPDATE'}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </div>
              </Card>
              <Card className={`projectScreenCard2 ${theme}CardBody`}>
                <Card.Header className={`${theme}CardHeader`}>
                  Messages
                </Card.Header>
                <Card.Body className="d-flex flex-wrap gap-3 ">
                  <div
                    className="text-center w-100"
                    style={{
                      display:
                        projectData &&
                        projectData.conversions &&
                        projectData.conversions.length < 1
                          ? 'block'
                          : 'none',
                    }}
                  >
                    No Chat Available
                  </div>

                  {projectData?.conversions?.map((conversion) => {
                    const assignedAgent = projectData.assignedAgent.find(
                      (assignedAgent) =>
                        assignedAgent.agentId === conversion.members[0]
                    );
                    return (
                      <>
                        {userInfo.role == 'agent' ? (
                          <>
                            {conversion.members.includes(userInfo._id) && (
                              <>
                                <Card className="chatboxes">
                                  {/* <Card.Header>{assignedAgent.categoryId}</Card.Header> */}
                                  <Card.Body>
                                    <Link
                                      to={`/chatWindowScreen/${conversion._id}`}
                                    >
                                      <Button
                                        className="chatBtn"
                                        type="button"
                                        // onClick={conversionHandler(conversion._id)}
                                      >
                                        Chat Now
                                      </Button>
                                    </Link>
                                  </Card.Body>
                                </Card>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {categoryData &&
                              assignedAgent &&
                              assignedAgent.categoryName && (
                                <Card className="chatboxes">
                                  <Card.Header>
                                    {assignedAgent.categoryName}
                                  </Card.Header>
                                  <Card.Body>
                                    <Link
                                      to={`/chatWindowScreen/${conversion._id}`}
                                    >
                                      <Button
                                        className="chatBtn"
                                        type="button"
                                        // onClick={conversionHandler(conversion._id)}
                                      >
                                        {assignedAgent.agentName}
                                      </Button>
                                    </Link>
                                  </Card.Body>
                                </Card>
                              )}
                          </>
                        )}
                      </>
                    );
                  })}
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractorEditProject;
