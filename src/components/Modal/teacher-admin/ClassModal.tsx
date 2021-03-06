import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Space, Select, DatePicker, Typography, Divider } from 'antd';
import { ClassDetail, CreateClass, EditClass } from '@core/services/api';
import moment from 'moment';
import { openNotification } from '@utils/Noti';
import { CLASS_STATUS } from '@core/constants';

const { Option } = Select;

interface IModalInfo {
  studentSide?: boolean,
  classId?: string;
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

const ClassStatusList = [CLASS_STATUS.active, CLASS_STATUS.finish];

const ClassModal: React.FC<IModalInfo> = ({
  studentSide = false,
  classId = null,
  onCloseModal = () => { },
  onSubmitAndReload = () => { },
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [classData, setClassData] = useState<any>(null);

  const LoadDetail = () => {
    setLoading(true);
    ClassDetail(classId!)
      .then((resp) => {
        const data = resp.data?.Data?.class;
        if (data) {
          setClassData(data);
          fillForm(data);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fillForm = (data: any) => {
    const year = data?.ClassYear.split('-');

    const status = ClassStatusList.find((x) => x.value === data?.ClassStatus);

    form.setFieldsValue({
      ClassName: data?.ClassName,
      ClassYear: moment(year[0] + '-1-1'),
      ClassStatus: status?.value,
    });
  };

  const handleSubmit = (values: any) => {
    values.ClassYear = values['ClassYear']?.format('YYYY');

    if (classId && classId !== '') {
      setLoading(true);
      EditClass(classId!, values)
        .then((resp) => {
          if (resp.data.Success) {
            openNotification('C???p nh???t l???p', 'C???p nh???t l???p th??nh c??ng', 'success');
          } else {
            openNotification('C???p nh???t l???p', resp.data.Message, 'error');
          }
        })
        .catch((error) => {
          console.log('error', error);
          openNotification('C???p nh???t l???p', 'C???p nh???t l???p th???t b???i', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(true);
      CreateClass(values)
        .then((resp) => {
          if (resp.data.Success) {
            openNotification('Th??m m???i l???p', 'Th??m m???i l???p th??nh c??ng', 'success');
          } else {
            openNotification('Th??m m???i l???p', resp.data.Message, 'error');
          }
        })
        .catch((error) => {
          console.log('error', error);
          openNotification('Th??m m???i l???p', 'Th??m m???i l???p th???t b???i', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    if (classId && classId !== '') {
      LoadDetail();
    }
  }, [classId]);

  return (
    <div>
      <Form {...formItemLayout} form={form} name="register" onFinish={handleSubmit} scrollToFirstError>
        {studentSide ?
          <div>
            <Typography.Title level={4}>Th??ng tin l???p:</Typography.Title>
            <Typography>
              <pre>T??n l???p: {classData?.ClassName}</pre>
            </Typography>
            <Typography>
              <pre>N??m h???c: {classData?.ClassYear}</pre>
            </Typography>
            <Typography>
              <pre>Tr???ng th??i: {ClassStatusList.find(x => x.value == classData?.ClassStatus)?.label}</pre>
            </Typography>

            <Divider />
            <Typography.Title level={4}>Gi??o vi??n:</Typography.Title>
            <Typography>
              <pre>H??? t??n: {classData?.Teacher?.TeacherName}</pre>
            </Typography>
            <Typography>
              <pre>S??t: {classData?.Teacher?.TeacherPhone}</pre>
            </Typography>
            <Typography>
              <pre>Ng??y sinh: {classData?.Teacher?.TeacherDob}</pre>
            </Typography>
            <Typography>
              <pre>Gi???i t??nh: {classData?.Teacher?.TeacherGender}</pre>
            </Typography>
            <Typography>
              <pre>Email: {classData?.Teacher?.TeacherEmail}</pre>
            </Typography>

            <Form.Item {...tailFormItemLayout}>
              <Space>
                <React.Fragment>
                  <Button htmlType="button" onClick={onCloseModal}>
                    H???y
                  </Button>
                </React.Fragment>
              </Space>
            </Form.Item>
          </div>
          :
          <React.Fragment>
            <Form.Item
              name="ClassName"
              label="T??n l???p"
              rules={[
                {
                  required: true,
                  message: 'T??n l???p kh??ng th??? tr???ng',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="ClassYear"
              label="N??m h???c"
              rules={[{ type: 'object' as const, required: true, message: 'Ch???n n??m h???c!' }]}
            >
              <DatePicker picker="year" />
            </Form.Item>
            <Form.Item name="ClassStatus" label="Tr???ng th??i">
              <Select >
                {ClassStatusList.map((item: any) => (
                  <Option value={item?.value}>{item.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <Space>
                <React.Fragment>
                  <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                    {classId && classId !== '' ? 'C???p nh???t' : 'Th??m m???i'}
                  </Button>
                  <Button htmlType="button" onClick={onCloseModal}>
                    H???y
                  </Button>
                  {classId && classId !== '' && (
                    <Button type="ghost" htmlType="button" onClick={onSubmitAndReload}>
                      X??a
                    </Button>
                  )}
                </React.Fragment>
              </Space>
            </Form.Item>

          </React.Fragment>
        }
      </Form>
    </div>
  );
};

export default ClassModal;
