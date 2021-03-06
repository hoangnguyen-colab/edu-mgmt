import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Space, Select, DatePicker, Tabs, Upload, Table, Row, Col } from 'antd';
import { ClassAddStudent, StudentReadExcel, StudentDetailPhone, StudentAddStudent } from '@core/services/api';
import moment from 'moment';
import { openNotification } from '@utils/Noti';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { saveFile } from '@utils/FileUtil';
const { TabPane } = Tabs;
const { Option } = Select;

const { Dragger } = Upload;

const dateFormat = 'DD/MM/YYYY';

interface IModalInfo {
  classId: string | null;
  onCloseModal?: () => void;
  onSubmitAndReload?: () => void;
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const fileExample = {
  id: 'ityus3zhytcz0pthgomg.xlsx',
  fileUrl: 'https://res.cloudinary.com/dhi8xksch/raw/upload/v1651215105/ityus3zhytcz0pthgomg.xlsx',
  fileName: 'file_mau.xlsx',
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const ClassAddStudentModal: React.FC<IModalInfo> = ({
  classId = null,
  onCloseModal = () => { },
  onSubmitAndReload = () => { },
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileUpload, setFileUpload] = useState<object | null>(null);
  const [studentData, setStudentData] = useState([]);
  const [phone, setPhone] = useState<string>('');

  const isAddToClass = classId !== null;

  const handleFindStudent = () => {
    setLoading(true);
    StudentDetailPhone(phone)
      .then((res) => {
        if (res.data?.Data?.student) {
          fillForm(res.data?.Data?.student);
        }
      })
      .catch((error) => {
        console.log('error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fillForm = (data: any) => {
    form.setFieldsValue({
      StudentName: data?.StudentName,
      StudentDOB: moment(data?.StudentDob, dateFormat),
      StudentGender: data?.StudentGender,
      StudentPhone: data?.StudentPhone,
    });
  };

  const handleSubmit = (values: any) => {
    values.StudentDOB = values['StudentDOB'].format('DD/MM/YYYY');
    const params = {
      classId: classId,
      studentList: [values],
    };

    addStudents(params);
  };

  const addStudents = (params: object) => {
    setLoading(true);
    if (isAddToClass) {
      ClassAddStudent(params)
        .then((resp) => {
          if (resp.data.Success) {
            openNotification('Th??m h???c sinh', 'Th??m h???c sinh th??nh c??ng', 'success');
          } else {
            openNotification('Th??m h???c sinh', resp.data.Message, 'error');
          }
        })
        .catch((error) => {
          console.log('error', error);
          openNotification('Th??m h???c sinh', 'Th??m h???c sinh th???t b???i', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      StudentAddStudent(params)
        .then((resp) => {
          if (resp.data.Success) {
            openNotification('Th??m h???c sinh', 'Th??m h???c sinh th??nh c??ng', 'success');
          } else {
            openNotification('Th??m h???c sinh', resp.data.Message, 'error');
          }
        })
        .catch((error) => {
          console.log('error', error);
          openNotification('Th??m h???c sinh', 'Th??m h???c sinh th???t b???i', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    }

  };

  const saveManual = () => {
    saveFile(fileExample.fileUrl, fileExample.fileName);
  };

  const handleReadExcel = () => {
    let formData = new FormData();
    formData.append('file', fileUpload);

    setUploading(true);
    StudentReadExcel(formData)
      .then((res: any) => {
        setStudentData(res.data?.Data || []);
      })
      .catch((err: any) => {
        console.error(err);
        openNotification('?????c file', '???? c?? l???i', 'error');
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleImportExcel = () => {
    const params = {
      classId: classId,
      studentList: studentData,
    };
    addStudents(params);
  };

  const columns = [
    {
      title: 'H??? t??n',
      dataIndex: 'StudentName',
    },
    {
      title: 'Ng??y sinh',
      dataIndex: 'StudentDob',
    },
    {
      title: 'Gi???i t??nh',
      dataIndex: 'StudentGender',
    },
    {
      title: 'S??t',
      dataIndex: 'StudentPhone',
    },
  ];

  const handleSetPhone = ({ target: { value } }: any) => {
    setPhone(value);
    form.setFieldsValue({
      StudentPhone: value,
    });
  };

  return (
    <Tabs defaultActiveKey="1" onChange={() => { }}>
      <TabPane tab="Th??m th??? c??ng" key="1">
        <Form {...formItemLayout} form={form} name="register" onFinish={handleSubmit} scrollToFirstError>
          <Form.Item
            name="StudentPhone"
            label="S??T"
            rules={[
              {
                required: true,
                message: 'S??? ??i???n tho???i h???c sinh kh??ng th??? tr???ng',
              },
            ]}
          >
            <Input.Group compact>
              <Input style={{ width: 'calc(100% - 200px)' }} value={phone} onChange={handleSetPhone} />
              {isAddToClass && (
                <Button type="primary" loading={loading} disabled={loading} onClick={handleFindStudent}>
                  {' '}
                  {'T??m h???c sinh'}
                </Button>
              )}
            </Input.Group>
          </Form.Item>
          <Form.Item
            name="StudentName"
            label="T??n"
            rules={[
              {
                required: true,
                message: 'T??n h???c sinh kh??ng th??? tr???ng',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="StudentGender" label="Gi???i t??nh">
            <Select placeholder="Gi???i tinh">
              <Option value="Nam">Nam</Option>
              <Option value="N???">N???</Option>
            </Select>
          </Form.Item>
          <Form.Item name="StudentDOB" label="Ng??y sinh" rules={[{ required: true, message: 'Ch???n ng??y sinh!' }]}>
            <DatePicker format={dateFormat} />
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                {'Th??m v??o l???p'}
              </Button>
              <Button htmlType="button" onClick={onCloseModal}>
                H???y
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </TabPane>
      <TabPane tab="Nh???p t??? file" key="2">
        <div>
          <p>
            File m???u:{' '}
            <a download={fileExample.fileName} onClick={saveManual}>
              file_mau.xlsx
            </a>
          </p>
        </div>
        <div>
          <Upload
            multiple={true}
            beforeUpload={(file) => setFileUpload(file)}
            name="logo"
            onRemove={() => setFileUpload(null)}
          >
            {!fileUpload && (
              <Button disabled={uploading || loading} loading={uploading || loading} icon={<UploadOutlined />}>
                Ch???n File
              </Button>
            )}
          </Upload>
          <Row>
            <Col span={12}>
              {fileUpload && (
                <Button type="primary" htmlType="submit" loading={loading} disabled={loading} onClick={handleReadExcel}>
                  {'?????c file h???c sinh'}
                </Button>
              )}
            </Col>
            <Col span={12}>
              {fileUpload && studentData.length > 0 && (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={loading}
                  onClick={handleImportExcel}
                >
                  {'Ho??n t???p nh???p file'}
                </Button>
              )}
            </Col>
          </Row>

          <Table columns={columns} dataSource={studentData} pagination={false} />
        </div>
      </TabPane>
    </Tabs>
  );
};

export default ClassAddStudentModal;
