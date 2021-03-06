import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Space, Select, DatePicker, Tabs, Table } from 'antd';
import { ClassEditStudent, StudentDetail, EditStudent } from '@core/services/api';
import moment from 'moment';
import { openNotification } from '@utils/Noti';
const { Option } = Select;

interface IModalInfo {
  classId: string | null;
  studentId: string | null;
  onCloseModal?: () => void;
  onSubmitAndReload?: () => void;
}

const dateFormat = 'DD/MM/YYYY';

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
  fileUrl: 'https://res.cloudinary.com/dhi8xksch/raw/upload/v1650360615/tpt96vjetzt7ap6h2qug.xlsx',
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

const StudentDetailModal: React.FC<IModalInfo> = ({
  classId = null,
  studentId = null,
  onCloseModal = () => { },
  onSubmitAndReload = () => { },
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const fillForm = (data: any) => {
    form.setFieldsValue({
      StudentName: data?.StudentName,
      StudentDob: moment(data?.StudentDob, dateFormat),
      StudentGender: data?.StudentGender,
      StudentPhone: data?.StudentPhone,
    });
  };

  useEffect(() => {
    getStudentDetail();
  }, []);

  const getStudentDetail = () => {
    setLoading(true);
    StudentDetail(studentId!)
      .then((res) => {
        fillForm(res.data?.Data?.student);
      })
      .catch((error) => {
        console.log('error', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = (values: any) => {

    const params = {
      ...values,
      StudentDob: values['StudentDob'].format(dateFormat),
    };

    EditStudent(studentId as string, params)
      .then((resp) => {
        console.log('resp', resp.data);
        if (resp.data.Success) {
          openNotification('S???a h???c sinh', 'S???a h???c sinh th??nh c??ng', 'success');
        } else {
          openNotification('S???a h???c sinh', resp.data.Message, 'error');
        }
      })
      .catch((error) => {
        console.log('error', error);
        openNotification('S???a h???c sinh', 'S???a h???c sinh th???t b???i', 'error');
      })
      .finally(() => {
        setLoading(false);
      });

    return;

    if (classId == null) {

      EditStudent(studentId as string, params)
        .then((resp) => {
          console.log('resp', resp.data);
          if (resp.data.Success) {
            openNotification('S???a h???c sinh', 'S???a h???c sinh th??nh c??ng', 'success');
          } else {
            openNotification('S???a h???c sinh', resp.data.Message, 'error');
          }
        })
        .catch((error) => {
          console.log('error', error);
          openNotification('S???a h???c sinh', 'S???a h???c sinh th???t b???i', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      const params = {
        ...values,
        StudentId: studentId,
        StudentDob: values['StudentDob'].format(dateFormat),
      };

      ClassEditStudent(classId as string, params)
        .then((resp) => {
          console.log('resp', resp.data);
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

  return (
    <Form {...formItemLayout} form={form} name="register" onFinish={handleSubmit} scrollToFirstError>
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
        <Input />
      </Form.Item>
      <Form.Item name="StudentDob" label="Ng??y sinh" rules={[{ required: true, message: 'Ch???n ng??y sinh!' }]}>
        <DatePicker format={dateFormat} />
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
            {'S???a'}
          </Button>
          <Button htmlType="button" onClick={onCloseModal}>
            H???y
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default StudentDetailModal;
