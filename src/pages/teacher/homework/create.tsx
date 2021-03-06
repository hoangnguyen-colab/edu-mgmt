import React, { useState, useRef, useEffect } from 'react';
import Layout from 'Layouts';
import withAuth from '@hocs/withAuth';
import { Form, Input, Button, Space, DatePicker, Upload, Checkbox, Switch } from 'antd';
import moment from 'moment';
import { openNotification } from '@utils/Noti';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import { handleCloudinaryUpload } from 'core/services/cloudinaryUpload';
import { ClassList, CreateHomeWork } from '@core/services/api';
import router from 'next/router';

const Jodit = React.lazy(() => {
  return import('jodit-react');
});

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

const create = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [fileListUpload, setFileListUpload] = useState<any>([]);
  const editor = useRef(null);
  const [describeContent, setDescribeContent] = useState('');
  const isSSR = typeof window === 'undefined';
  const [classData, setClassData] = useState([]);

  useEffect(() => {
    ClassList('', 1, 0, 10)
      .then((resp: any) => {
        const classes = resp.data?.Data?.Data.map((item: any) => ({
          ...item,
          label: item.ClassName + ` (${item.ClassYear})`,
          value: item.ClassId,
        }));
        // let classes = objArray.map(({ foo }) => foo)

        setClassData(classes);
      })
      .catch((error: any) => {
        console.log('error', error);
      });
  }, []);

  const handleSubmit = (values: any) => {
    setLoading(true);
    const params: any = {
      HomeWorkType: values.HomeWorkType.trim(),
      HomeWorkName: values.HomeWorkName.trim(),
      homeWorkContent: describeContent,
      ClassList: values.ClassList,
      OnlyAssignStudent: values.OnlyAssignStudent,
      RequiredLogin: values.RequiredLogin,
    };

    if (values.DueDate) {
      params.DueDate = moment(values.DueDate).unix();
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

    CreateHomeWork(params)
      .then((res) => {
        if (res.data.Success) {
          openNotification('T???o b??i t???p', 'T???o b??i t???p th??nh c??ng', 'success');
          router.push('/teacher/homework');
        } else {
          openNotification('T???o b??i t???p', res.data?.Message, 'error');
        }
      })
      .catch((error) => {
        console.error(error);
        openNotification('T???o b??i t???p', '???? c?? l???i', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
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

  const handleChange = (info: any) => {
  };

  return (
    <Layout title="Th??m m???i b??i t???p" backButton backButtonUrl="/teacher/homework">
      <Form {...formItemLayout} form={form} name="register" onFinish={handleSubmit} scrollToFirstError>
        <Form.Item
          name="HomeWorkName"
          label="T??n b??i t???p"
          rules={[
            {
              required: true,
              message: 'T??n b??i t???p kh??ng th??? tr???ng',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          //  extra="L?? b??i "
          name="HomeWorkType"
          label="Lo???i b??i t???p"
          rules={[
            {
              required: true,
              message: 'Lo???i b??i t???p kh??ng th??? tr???ng',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="DueDate" label="H???n n???p">
          <DatePicker showTime disabledDate={(d) => !d || d.isBefore(Date.now())} />
        </Form.Item>
        <Form.Item label="File b??i t???p">
          <Upload
            fileList={fileListUpload}
            onChange={handleChange}
            beforeUpload={(file) => handleUpload(file)}
            name="logo"
            onRemove={handleRemoveFile}
            accept={'.doc,.docx,application/vnd.ms-excel,.pdf,.png,.jpeg,.jpg'}
          >
            <Button disabled={uploading || loading} loading={uploading || loading} icon={<UploadOutlined />}>
              Ch???n File
            </Button>
          </Upload>
        </Form.Item>
        <Form.Item label="????? b??i / M?? t???">
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
        <Form.Item label="Ch??? h???c sinh c?? trong danh s??ch" name="OnlyAssignStudent">
          <Switch />
        </Form.Item>
        {/* <Form.Item label="B???t ????ng nh???p" name="RequiredLogin">
          <Switch />
        </Form.Item> */}
        <Form.Item
          label="L???p giao b??i"
          name="ClassList"
          rules={[
            {
              required: true,
              message: 'Ch???n l???p',
            },
          ]}
        >
          <Checkbox.Group options={classData} />
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
              {'Th??m m???i'}
            </Button>
            <Button htmlType="button">H???y</Button>
          </Space>
        </Form.Item>
      </Form>
    </Layout>
  );
};
export default withAuth(create);
