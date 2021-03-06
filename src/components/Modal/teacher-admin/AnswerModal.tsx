import React, { useEffect, useState, useRef } from 'react';
import { Form, Input, Button, Space, Select, Typography, InputNumber, Row, Col, Divider } from 'antd';
import { AnswerDetail, ResultSubmit, ResultEdit } from '@core/services/api';
import moment from 'moment';
import { openNotification } from '@utils/Noti';
import { CLASS_STATUS } from '@core/constants';
import Parser from 'html-react-parser';
import 'moment/locale/vi';
moment.locale('vi');
const Jodit = React.lazy(() => {
  return import('jodit-react');
});
import { saveFile } from '@utils/FileUtil';

const { Option } = Select;

interface IModalInfo {
  answerId?: string;
  onCloseModal?: () => void;
  onSubmitAndReload?: () => void;
}

const AnswerModal: React.FC<IModalInfo> = ({
  answerId = null,
  onCloseModal = () => { },
  onSubmitAndReload = () => { },
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [answerData, setAnswerData] = useState<any | null>(null);
  const editor = useRef(null);
  const [describeContent, setDescribeContent] = useState('');
  const isSSR = typeof window === 'undefined';
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [scoreNumber, setScoreNumber] = useState<string | number>(0);
  const [resultId, setResultId] = useState<string>('');

  const LoadDetail = () => {
    setLoading(true);
    AnswerDetail(answerId!)
      .then((resp) => {
        const data = resp.data?.Data;
        if (data) {
          setAnswerData(data);
        }
        if (data?.result) {
          setResultId(data?.result?.ResultId);
          setDescribeContent(data?.result?.ResultContent);
          setScoreNumber(data?.result?.FinalScore);
          form.setFieldsValue({
            FinalScore: data?.result?.FinalScore,
          });
          setSubmitted(true);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = () => {
    // setLoading(true);
    const params: any = {
      FinalScore: scoreNumber,
      ResultContent: describeContent,
      AnswerId: answerId,
    };

    if (submitted) {
      ResultEdit(resultId, params)
        .then((res) => {
          if (res.data.Success) {
            openNotification('S???a ??i???m', 'S???a ??i???m th??nh c??ng', 'success');
          } else {
            openNotification('S???a ??i???m', res.data?.Message, 'error');
          }
        })
        .catch((error) => {
          console.error(error);
          openNotification('S???a ??i???m', '???? c?? l???i', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      ResultSubmit(params)
        .then((res) => {
          if (res.data.Success) {
            openNotification('Ch???m ??i???m', 'Ch???m ??i???m th??nh c??ng', 'success');
            setSubmitted(true);
            setResultId(res.data?.result?.ResultId);
          } else {
            openNotification('Ch???m ??i???m', res.data?.Message, 'error');
          }
        })
        .catch((error) => {
          console.error(error);
          openNotification('Ch???m ??i???m', '???? c?? l???i', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const saveManual = (item: any) => {
    saveFile(item.FileUploadUrl, item.FileUploadName);
  };

  useEffect(() => {
    if (answerId && answerId !== '') {
      LoadDetail();
    }
  }, [answerId]);

  return (
    <div>
      <Typography.Title level={3}>{'Th??ng tin b??i l??m h???c sinh'}</Typography.Title>
      <Typography>
        <pre>H??? t??n: {answerData?.answer?.answer?.Student?.StudentName}</pre>
      </Typography>
      <Typography>
        <pre>S??t: {answerData?.answer?.Student?.StudentPhone}</pre>
      </Typography>
      <Typography>
        <pre>Ng??y sinh: {answerData?.answer?.Student?.StudentDob}</pre>
      </Typography>
      <Typography>
        <pre>Gi???i t??nh: {answerData?.answer?.Student?.StudentGender}</pre>
      </Typography>
      <Typography>
        <pre>Gi??? n???p: {moment(answerData?.answer?.Student?.SubmitTime).format('llll')}</pre>
      </Typography>
      {answerData?.files && answerData?.files?.length > 0 && (
        <React.Fragment>
          <Divider />
          <Row>
            <Col span={6}>
              <Typography.Title level={4}>File n???p: </Typography.Title>
            </Col>
            <Col span={18}>
              {answerData?.files?.map((item: any) => {
                return (
                  <>
                    <Row>
                      <Col span={12}>
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

      {answerData?.answer?.AnswerContent && (
        <div style={{
          marginTop: 40,
        }}>
          <Row>
            <Col span={24}>
              <Typography.Title level={4}>L???i gi???i / M?? t???: </Typography.Title>
            </Col>
            <Col span={24}>
              <div
                style={{
                  backgroundColor: 'light-gray',
                  width: '100%',
                  height: '100%',
                }}
              >
                {Parser(answerData?.answer?.AnswerContent)}
              </div>
            </Col>
          </Row>
          <Divider />
        </div>
      )}
      <br />
      <Typography.Title level={3}>{'Gi??o vi??n ch???m ??i???m'}</Typography.Title>
      <Form form={form} name="register" onFinish={handleSubmit} scrollToFirstError>
        <Form.Item label="??i???m" name="FinalScore" rules={[{ required: true, message: 'Nh???p ??i???m' }]}>
          <InputNumber min={0} max={10} value={scoreNumber} onChange={setScoreNumber} />
        </Form.Item>
        <Form.Item label="L???i ph??">
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

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
              {submitted ? 'S???a ??i???m' : 'Ch??m ??i???m'}
            </Button>
            <Button htmlType="button" onClick={onCloseModal}>
              H???y
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AnswerModal;
