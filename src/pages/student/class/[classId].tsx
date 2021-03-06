import React, { useEffect, useState } from 'react';
import { Modal, Table, Form, Input, Button, Space, Select, DatePicker } from 'antd';
import { ClassDetail, EditClass } from '@core/services/api';
import moment from 'moment';
import { openNotification } from '@utils/Noti';
import { useRouter } from 'next/router';
import Layout from 'Layouts';
import ClassAddStudentModal from 'components/Modal/teacher-admin/ClassAddStudentModal';
import { CLASS_STATUS } from '@core/constants';

const ClassStatusList = [CLASS_STATUS.active, CLASS_STATUS.finish];
const { Option } = Select;

interface Props {}

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

const index: React.FC<Props> = ({}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { classId } = router.query;
  const [studentData, setStudentData] = useState([]);
  const [showModal, setShowModal] = React.useState<boolean>(false);

  const LoadDetail = () => {
    setLoading(true);
    ClassDetail(classId as string)
      .then((resp) => {
        const data = resp.data?.Data?.class;
        if (data) {
          fillForm(data);
          setStudentData(resp.data?.Data?.students);
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

    setLoading(true);
    EditClass(classId as string, values)
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
    {
      title: 'T??y ch???n',
      key: 'action',
    },
  ];
  useEffect(() => {
    LoadDetail();
  }, []);

  useEffect(() => {
    if (showModal) {
      LoadDetail();
    }
  }, [showModal]);

  return (
    <Layout title={'Danh s??ch l???p'} backButton backButtonUrl="/teacher/class">
      <div>
        <Form {...formItemLayout} form={form} name="register" onFinish={handleSubmit} scrollToFirstError>
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
            <Select>
              {ClassStatusList.map((item: any) => (
                <Option value={item?.value}>{item.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
                {'C???p nh???t'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      <div>
        <Table columns={columns} dataSource={studentData} pagination={false} />
        {/* <Pagination
          defaultPageSize={pageSize}
          defaultCurrent={currentPage}
          onChange={onPagingChange}
          current={currentPage}
          total={totalRecord}
        /> */}
      </div>

      <div>
        <Button type="primary" htmlType="submit" onClick={() => setShowModal(true)}>
          {'Th??m h???c sinh'}
        </Button>
        <Modal
          width={755}
          bodyStyle={{ height: 'max-content' }}
          title={'Th??m h???c sinh l???p'}
          visible={showModal}
          onCancel={() => setShowModal(false)}
          destroyOnClose
          footer={null}
          className="edit-profile-modal"
        >
          <ClassAddStudentModal classId={classId as string} />
        </Modal>
      </div>
    </Layout>
  );
};

export default index;
