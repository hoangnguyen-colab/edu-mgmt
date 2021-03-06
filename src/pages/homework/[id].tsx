import React, { useState, useRef, useEffect } from 'react';
import Layout from 'Layouts';
import withAuth from '@hocs/withAuth';
import { Form, Input, Button, Space, Typography, Row, Col, Checkbox, Divider, Select, Upload } from 'antd';
import moment from 'moment';
import { openNotification } from '@utils/Noti';
import { handleCloudinaryUpload } from 'core/services/cloudinaryUpload';
import { HomeWorkDetail, UserDetailNonId, HomeWorkCheck, AnswerSubmit } from '@core/services/api';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { saveFile } from '@utils/FileUtil';
import Parser from 'html-react-parser';
import { USER_ROLE } from '@core/constants/role';
import 'moment/locale/vi';
moment.locale('vi');
const Jodit = React.lazy(() => {
  return import('jodit-react');
});

const index = () => {
  const router = useRouter();
  const { id: homeWorkId } = router.query;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [homeWorkData, setHomeWorkData] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [answerData, setAnswerData] = useState<any>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [studentCheck, setStudentCheck] = useState<boolean>(false);

  useEffect(() => {
    const role = localStorage.getItem('roles');
    if (role === USER_ROLE.student) {
      getUserDetail();
    }
    getHomeWorkDetail();
  }, []);

  const getHomeWorkDetail = async () => {
    if (homeWorkId && homeWorkId !== undefined) {
      setLoading(true);
      HomeWorkDetail(homeWorkId! as string)
        .then((res: any) => {
          const data = res.data?.Data;
          if (data) {
            setHomeWorkData(data);
          }
        })
        .catch((error: any) => {
          console.log('error', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const getUserDetail = () => {
    UserDetailNonId()
      .then((res) => {
        fillForm(res?.data?.Data?.account);
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  const fillForm = (data: any) => {
    form.setFieldsValue({
      StudentDob: data?.UserDob,
      StudentName: data?.Fullname,
      StudentPhone: data?.UserPhone,
    });
  };

  let options: any = [];
  homeWorkData?.class?.map((item: any) => options.push({ label: item?.ClassName, value: item?.ClassId }));

  const StudentInfoContent = () => {
    const onFinish = (values: any) => {
      const params = {
        ...values,
        HomeWorkId: homeWorkId,
      };

      setLoading(true);

      HomeWorkCheck(params)
        .then((res) => {
          const data = res.data?.Data;
          if (res.data.Success) {
            setStudentInfo(data?.student || values);
            setClassId(data?.class?.ClassId || null);
            setAnswerData(data?.answer ? {
              answer: data?.answer,
              files: data?.files || [],
            } : null);
            setResultData(data?.result || null);
            setStudentCheck(true);
          } else {
            openNotification('Th??ng b??o', res.data.Message, 'error');
          }
        })
        .catch((error) => {
          console.log('error', error, 'error');
          openNotification('???? c?? l???i', 'Th??? l???i sau', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    };

    const onFinishFailed = (errorInfo: any) => {
      console.log('Failed:', errorInfo);
    };

    return (
      <>
        <h1>Nh???p th??ng tin h???c sinh:</h1>
        <Form
          name="basic"
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="T??n h???c sinh"
            name="StudentName"
            rules={[{ required: true, message: 'H??? t??n h???c sinh kh??ng th??? tr???ng!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Ng??y sinh (ng??y/th??ng/n??m - dd/mm/yyyy)"
            name="StudentDob"
            rules={[{ required: true, message: 'Ng??y sinh kh??ng th??? tr???ng' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="S??? ??i???n tho???i (h???c sinh/ph??? huynh)"
            name="StudentPhone"
            rules={[{ required: true, message: 'S??? ??i???n tho???i kh??ng th??? tr???ng' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="H???c sinh l???p" name="ClassId" rules={[{ required: true, message: 'Ch???n l???p' }]}>
            <Select options={options} />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit" disabled={loading} loading={loading}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </>
    );
  };

  return (
    <Layout title="Chi ti???t b??i t???p" backButton backButtonUrl="/">
      {studentCheck ? (
        <HomeWorkDetailContent
          homeWorkData={homeWorkData}
          studentInfo={studentInfo}
          classId={classId}
          answer={answerData}
          result={resultData}
        />
      ) : (
        StudentInfoContent()
      )}
      {/* <HomeWorkDetailContent homeWorkData={homeWorkData} studentInfo={studentInfo} /> */}
    </Layout>
  );
};
export default index;

const HomeWorkDetailContent = ({ homeWorkData = null, studentInfo = null, classId = null, answer = null, result = null }: any) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [submitDone, setSubmitDone] = useState<boolean>(false);
  const [describeContent, setDescribeContent] = useState('');
  const isSSR = typeof window === 'undefined';
  const editor = useRef(null);
  const [defaultFileList, setDefaultFileList] = useState<any>([]);
  const [fileListUpload, setFileListUpload] = useState<any>([]);

  useEffect(() => {
    if (answer != null) {
      fillForm(answer);
    }

  }, [answer, result])

  const fillForm = (data: any) => {
    setFileList(data.files);
    const defaultFilesList = data?.files?.map((item: any) => ({
      uid: item.FileUploadId,
      name: item.FileUploadName,
      status: 'done',
      url: item.FileUploadUrl,
    }));

    setDefaultFileList(defaultFilesList || []);
    setFileListUpload(defaultFilesList || []);
    setDescribeContent(data?.answer?.AnswerContent);
  };

  const handleUpload = (file: any) => {
    const sizeLimit = 10;
    const filesLimit = 5;
    const fileCheck = (file.size / 1024 / 1024) > sizeLimit;

    const fileList = [...fileListUpload, file];

    if (fileCheck) {
      openNotification('Upload File', `File kh??ng ???????c qu?? ${sizeLimit}mb`, 'error');
      return;
    }
    if (fileList.length > filesLimit) {
      openNotification('Upload File', `T???i ??a ${filesLimit} t???p tin t???i l??n`, 'error');
      return;
    }

    setUploading(true);
    handleCloudinaryUpload(file)
      .then((res: any) => {
        file.FileUploadUrl = res.secure_url;
        file.FileUploadName = file.name;
        const files = [...fileList, file];
        setFileList(files as any);
        setFileListUpload(fileList);
      })
      .catch((err: any) => {
        console.error(err);
        openNotification('Upload File', '???? c?? l???i', 'error');
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleRemoveFile = (file: any) => {
    const files = [...fileList];
    const removedFiles = files.filter(function (e: any) {
      return e.uid !== file.uid;
    });
    setFileList(removedFiles);
  };

  const saveManual = (item: any) => {
    saveFile(item.FileUploadUrl, item.FileUploadName);
  };

  const handleViewFile = () => {
    // router.push();
  };

  const handleSubmit = () => {
    if (!classId || classId === '') {
      openNotification('N???p b??i t???p', '???? c?? l???i vui l??ng th??? l???i sau', 'error');
    }
    // setLoading(true);
    const params: any = {
      AnswerContent: describeContent,
      ClassId: classId,
      HomeWorkId: homeWorkData?.homeWork?.HomeWorkId,
    };
    if (studentInfo && studentInfo?.StudentId) {
      params.StudentId = studentInfo.StudentId;
    } else {
      params.StudentName = studentInfo?.StudentName;
      params.StudentDob = studentInfo?.StudentDob;
      params.StudentPhone = studentInfo?.StudentPhone;
    }

    if (fileList.length > 0) {
      const files: any = [];
      fileList.forEach((item: any) => {
        files.push({
          FileUploadUrl: item.FileUploadUrl,
          FileUploadName: item.FileUploadName,
        });
      });
      params.FileList = files;
    }

    AnswerSubmit(params)
      .then((res) => {
        if (res.data?.Success) {
          setSubmitDone(true);
          openNotification('N???p b??i t???p', 'N???p b??i th??nh c??ng', 'success');
        } else {
          openNotification('N???p b??i t???p', res.data?.Message, 'error');
        }
      })
      .catch((error) => {
        console.log('error', error);
        openNotification('N???p b??i t???p', '???? c?? l???i vui l??ng th??? l???i sau', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (info: any) => {
  };

  return (
    <React.Fragment>
      {homeWorkData?.homeWork?.HomeWorkName && (
        <Typography.Title
          style={{
            textAlign: 'center',
          }}
        >
          B??i t???p: {homeWorkData?.homeWork?.HomeWorkName}
        </Typography.Title>
      )}
      {homeWorkData?.homeWork?.HomeWorkType && (
        <Typography.Title level={2}>Lo???i b??i t???p: {homeWorkData?.homeWork?.HomeWorkType}</Typography.Title>
      )}
      {homeWorkData?.homeWork?.DueDate && (
        <Typography.Title level={2}>H???n n???p: {moment(homeWorkData?.homeWork?.DueDate).format('lll')}</Typography.Title>
      )}
      {moment(homeWorkData?.homeWork?.DueDate) > moment(Date.now()) &&
        <Typography.Title level={2}>Qu?? h???n n???p</Typography.Title>
      }
      <Divider />

      {result &&
        <div style={{
          borderWidth: 1,
          borderStyle: 'ridge',
          borderColor: '#404040',
          marginTop: 10,
          marginBottom: 10,
        }}>
          <Row >
            <Col span={8} >
              <div style={{
                padding: 10,
              }}>
                <Typography.Title level={4}>??i???m:</Typography.Title>
                <Typography.Title level={2} type="danger"
                  style={{
                    textAlign: 'center',
                  }}>
                  {result?.FinalScore}
                </Typography.Title>
              </div>
            </Col>
            <div style={{
              borderWidth: 1,
              borderStyle: 'ridge',
              borderColor: '#404040',
            }} />
            <Col>
              <div style={{
                padding: 10,
              }}>
                <Typography.Title level={4}>L???i ph??:</Typography.Title>
                <Typography.Title level={2}
                  style={{
                    textAlign: 'center',
                  }}>{Parser(result?.ResultContent)}</Typography.Title>
              </div>
            </Col >
          </Row>
        </div>
      }

      {homeWorkData?.files && homeWorkData?.files?.length > 0 && (
        <React.Fragment>
          <Row>
            <Col span={6}>
              <Typography.Title level={2}>File b??i t???p: </Typography.Title>
            </Col>
            <Col span={18}>
              {homeWorkData?.files?.map((item: any) => {
                return (
                  <>
                    <Row>
                      <Col span={12}>
                        {/* <a key={item.FileUploadId} download={item.FileUploadName} onClick={() => saveManual(item)}>
                    {item.FileUploadName}
                  </a> */}
                        <a key={item.FileUploadId}>{item.FileUploadName}</a>
                      </Col>
                      <Col span={12}>
                        <a target="_blank" href={`/file/${item.FileUploadId}`} rel="noopener noreferrer">
                          <Button type="primary">Xem</Button>
                        </a>
                        <Button onClick={() => saveManual(item)}>T???i xu???ng</Button>
                      </Col>
                    </Row>
                    <br></br>
                  </>
                );
              })}
            </Col>
          </Row>
          <Divider />
        </React.Fragment>
      )}

      {homeWorkData?.homeWork?.HomeWorkContent && (
        <div style={{
          marginTop: 40,
        }}>
          <Row>
            <Col span={24}>
              <Typography.Title level={2} style={{
                textAlign: 'center',
              }}>????? b??i: </Typography.Title>
            </Col>
            <Col span={24}>
              <div
                style={{
                  backgroundColor: 'light-gray',
                  width: '100%',
                  height: '100%',
                }}
              >
                {Parser(homeWorkData?.homeWork?.HomeWorkContent)}
              </div>
            </Col>
          </Row>
          <Divider />
        </div>
      )}

      {result ? (
        <div></div>
      )
        :
        (
          <React.Fragment>
            <Typography.Title level={2}>B??i n???p: </Typography.Title>
            <Form form={form} name="register" onFinish={handleSubmit} scrollToFirstError>
              {defaultFileList &&
                <Form.Item label="File ????p ??n">
                  <Upload
                    onChange={handleChange}
                    beforeUpload={(file) => handleUpload(file)}
                    name="logo"
                    onRemove={handleRemoveFile}
                    defaultFileList={defaultFileList}
                    fileList={fileListUpload}
                    accept={'.doc,.docx,application/vnd.ms-excel,.pdf,.png,.jpeg,.jpg'}
                  >
                    <Button disabled={uploading || loading} loading={uploading || loading} icon={<UploadOutlined />}>
                      Ch???n File
                    </Button>
                  </Upload>
                </Form.Item>
              }
              <Form.Item label="L???i gi???i">
                {!isSSR && (
                  <React.Suspense fallback={<div>??ang t???i so???n th???o</div>}>
                    <Jodit
                      ref={editor}
                      value={describeContent}
                      config={{ readonly: false }}
                      onBlur={(newContent) => setDescribeContent(newContent)}
                      onChange={(newContent) => { }}
                    />
                  </React.Suspense>
                )}
              </Form.Item>

              {!submitDone && (
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                      {'N???p b??i'}
                    </Button>
                    <Button htmlType="button">H???y</Button>
                  </Space>
                </Form.Item>
              )}
            </Form>
          </React.Fragment>
        )}
    </React.Fragment>
  );
};
