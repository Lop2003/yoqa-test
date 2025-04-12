import {
  Layout,
  Modal,
  Input,
  Form,
  Button,
  Select,
  message,
  ColorPicker,
  DatePicker,
  Space,
  Typography,
  Tag,
  Tooltip,
} from "antd";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { useState, useEffect } from "react";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import dayjs from "dayjs";
import locale from "antd/es/date-picker/locale/th_TH";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import "../../styles/Course.css";
import "../../styles/Calendar.css";
import { getCourses } from "../../services/courseService";
import classService from "../../services/classService";
import { getUsers } from "../../services/userService";
import {
  CalendarOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const DragAndDropCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

const Schedule = () => {
  const [instructorType, setInstructorType] = useState(null);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [form] = Form.useForm();
  const [isDuplicating, setIsDuplicating] = useState(false);

  // เก็บข้อมูลวันที่ที่ต้องการทำซ้ำ
  const [duplicateDates, setDuplicateDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // 📌 โหลดข้อมูลคอร์สและคลาสทั้งหมด
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const courseData = await getCourses();
      setCourses(courseData.courses);

      const classData = await classService.getAllClasses();

      const userData = await getUsers();
      setUsers(userData.users);

      const formattedEvents = classData.data.map((cls) => ({
        id: cls._id,
        title: cls.title,
        instructor: cls.instructor,
        room_number: cls.room_number,
        description: cls.description,
        passcode: cls.passcode,
        zoom_link: cls.zoom_link,
        color: cls.color,
        start: new Date(cls.start_time),
        end: new Date(cls.end_time),
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // 📌 เปิด Modal เพื่อเพิ่มหรือแก้ไขคลาส
  const handleOpenModal = (event = null, start = null, end = null) => {
    if (event) {
      setCurrentEvent(event);
      form.setFieldsValue({
        title: event.title,
        instructor: event.instructor,
        room_number: event.room_number,
        description: event.description,
        color: event.color,
        passcode: event.passcode,
        zoom_link: event.zoom_link,
        start_time: event.start
          ? dayjs(event.start).format("YYYY-MM-DDTHH:mm")
          : null,
        end_time: event.end
          ? dayjs(event.end).format("YYYY-MM-DDTHH:mm")
          : null,
      });
    } else {
      setCurrentEvent(null);
      form.resetFields();
      form.setFieldsValue({
        title: "",
        instructor: "",
        room_number: "",
        description: "",
        passcode: "",
        zoom_link: "",
        start_time: start ? dayjs(start).format("YYYY-MM-DDTHH:mm") : null,
        end_time: end ? dayjs(end).format("YYYY-MM-DDTHH:mm") : null,
      });
    }
    setIsModalOpen(true);
    setIsDuplicating(false);
    setDuplicateDates([]); // รีเซ็ตวันที่ที่เลือกเมื่อเปิด Modal ใหม่
    setSelectedDate(null);
  };

  // 📌 ปิด Modal และโหลดข้อมูลใหม่
  const handleCloseModal = async () => {
    setIsModalOpen(false);
    await fetchData();
    form.resetFields();
    setIsDuplicating(false);
    setDuplicateDates([]);
    setSelectedDate(null);
  };

  // 📌 เพิ่มหรือแก้ไขคลาส
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedColor =
        typeof values.color === "string" ? values.color : "789DBC";

      const classData = {
        title: values.title,
        instructor: values.instructor,
        room_number: values.room_number,
        description: values.description,
        color: formattedColor,
        passcode: values.passcode,
        zoom_link: values.zoom_link,
        start_time: values.start_time
          ? new Date(values.start_time).toISOString()
          : null,
        end_time: values.end_time
          ? new Date(values.end_time).toISOString()
          : null,
      };

      if (currentEvent) {
        await classService.updateClass(currentEvent.id, classData);
        message.success("Class updated successfully!");
      } else {
        await classService.createClass(classData);
        message.success("Class added successfully!");
      }

      await handleCloseModal();
    } catch (error) {
      message.error("Error saving class!");
      console.error(error);
    }
  };

  // 📌 ลบคลาส
  const handleDeleteEvent = async () => {
    try {
      await classService.deleteClass(currentEvent.id);
      message.success("Class deleted successfully!");

      await handleCloseModal();
    } catch (error) {
      message.error("Error deleting class!");
      console.error(error);
    }
  };

  // 📌 ลากแล้วเปลี่ยนเวลา
  const handleEventDrop = async ({ event, start, end }) => {
    try {
      await classService.updateClass(event.id, {
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });
      message.success("Class rescheduled successfully!");

      await fetchData();
    } catch (error) {
      message.error("Error updating class schedule!");
      console.error(error);
    }
  };

  // 📌 เพิ่มวันที่ที่ต้องการทำซ้ำ
  const addDuplicateDate = () => {
    if (!selectedDate) {
      message.warning("กรุณาเลือกวันที่");
      return;
    }

    // ตรวจสอบว่าวันที่ซ้ำหรือไม่
    const dateString = selectedDate.format("YYYY-MM-DD");
    if (
      duplicateDates.some((date) => date.format("YYYY-MM-DD") === dateString)
    ) {
      message.warning("วันที่นี้ถูกเลือกไว้แล้ว");
      return;
    }

    setDuplicateDates([...duplicateDates, selectedDate]);
    setSelectedDate(null); // รีเซ็ตการเลือกวันที่
  };

  // 📌 ลบวันที่ที่ต้องการทำซ้ำ
  const removeDuplicateDate = (dateToRemove) => {
    setDuplicateDates(
      duplicateDates.filter(
        (date) =>
          date.format("YYYY-MM-DD") !== dateToRemove.format("YYYY-MM-DD")
      )
    );
  };

  // 📌 ทำซ้ำคลาสตามวันที่ที่เลือก
  const handleDuplicateEvent = async () => {
    try {
      if (!currentEvent || duplicateDates.length === 0) {
        message.warning("กรุณาเลือกวันที่สำหรับการทำซ้ำคลาสอย่างน้อย 1 วัน");
        return;
      }

      // เวลาของคลาสต้นฉบับ
      const originalDate = dayjs(currentEvent.start);
      const originalHour = originalDate.hour();
      const originalMinute = originalDate.minute();

      // คำนวณความยาวเวลาของคลาส (หน่วยเป็นนาที)
      const classDurationMinutes = dayjs(currentEvent.end).diff(
        originalDate,
        "minute"
      );

      // สร้างคลาสสำหรับแต่ละวันที่เลือก
      for (const date of duplicateDates) {
        // สร้างวันที่และเวลาใหม่
        const newStartDate = date.hour(originalHour).minute(originalMinute);

        // คำนวณเวลาสิ้นสุด
        const newEndDate = newStartDate.add(classDurationMinutes, "minute");

        // ส่งข้อมูลไปสร้างคลาสใหม่
        await classService.duplicateClass(currentEvent.id, {
          start_time: newStartDate.toISOString(),
          end_time: newEndDate.toISOString(),
        });
      }

      message.success(`ทำซ้ำคลาสสำเร็จ ${duplicateDates.length} วัน`);
      await handleCloseModal();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการทำซ้ำคลาส");
      console.error(error);
    }
  };

  // 📌 ควบคุมการทำซ้ำหลายวัน
  const handleMultipleDates = (dates) => {
    if (dates && dates.length > 0) {
      const startDate = dates[0];
      const endDate = dates[1];

      if (startDate && endDate) {
        // สร้างรายการวันที่ระหว่างวันที่เริ่มต้นและวันที่สิ้นสุด
        const allDates = [];
        let currentDate = startDate;

        while (
          currentDate.isBefore(endDate) ||
          currentDate.isSame(endDate, "day")
        ) {
          allDates.push(currentDate);
          currentDate = currentDate.add(1, "day");
        }

        // กรองวันที่ที่ซ้ำซ้อนกับที่มีอยู่แล้ว
        const newDates = allDates.filter(
          (newDate) =>
            !duplicateDates.some(
              (existingDate) =>
                existingDate.format("YYYY-MM-DD") ===
                newDate.format("YYYY-MM-DD")
            )
        );

        setDuplicateDates([...duplicateDates, ...newDates]);
      }
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", display: "flex" }}>
      <Sider width={220} className="lg:block hidden">
        <Sidebar />
      </Sider>

      <Layout>
        <Header title="Schedule" />

        <Content className="course-container">
          <div className="course-header">
            <h2>Schedule</h2>
          </div>
          <div style={{ padding: "16px" }}>
            <DragAndDropCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500, padding: "16px", borderRadius: "8px" }}
              selectable
              resizable
              onSelectEvent={(event) => handleOpenModal(event)}
              onSelectSlot={({ start, end }) =>
                handleOpenModal(null, start, end)
              }
              onEventDrop={handleEventDrop}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: event.color ? `#${event.color}` : "#789DBC",
                },
              })}
            />
          </div>
        </Content>
      </Layout>

      {/* Modal สำหรับเพิ่ม/แก้ไข/ทำซ้ำคลาส */}
      <Modal
        title={
          isDuplicating
            ? "ทำซ้ำคลาส"
            : currentEvent
            ? "Edit Class"
            : "Add Class"
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          currentEvent && (
            <Button
              key="duplicate"
              onClick={() => setIsDuplicating(!isDuplicating)}
              icon={<CopyOutlined />}
            >
              {isDuplicating ? "กลับไปแก้ไข" : "ทำซ้ำคลาส"}
            </Button>
          ),
          currentEvent && !isDuplicating && (
            <Button key="delete" danger onClick={handleDeleteEvent}>
              Delete
            </Button>
          ),
          <Button key="cancel" onClick={handleCloseModal}>
            Cancel
          </Button>,
          isDuplicating ? (
            <Button
              key="duplicate-confirm"
              type="primary"
              onClick={handleDuplicateEvent}
              disabled={duplicateDates.length === 0}
            >
              ทำซ้ำคลาส
            </Button>
          ) : (
            <Button key="submit" type="primary" onClick={handleSubmit}>
              {currentEvent ? "Save" : "Add"}
            </Button>
          ),
        ]}
      >
        {isDuplicating && currentEvent ? (
          <div className="duplication-form">
            <div style={{ marginBottom: 20 }}>
              <Title level={5}>
                ทำซ้ำคลาส &quot;{currentEvent.title}&quot;
              </Title>
              <Text>
                วันที่ต้นฉบับ: {dayjs(currentEvent.start).format("DD/MM/YYYY")}
              </Text>
              <Text style={{ display: "block", marginTop: 5 }}>
                เวลา: {dayjs(currentEvent.start).format("HH:mm")} -{" "}
                {dayjs(currentEvent.end).format("HH:mm")} น.
              </Text>
            </div>

            <div style={{ marginTop: 20 }}>
              <Title level={5}>เลือกวันที่ต้องการทำซ้ำ</Title>

              <Space
                direction="vertical"
                style={{ width: "100%", marginBottom: 20 }}
              >
                <div style={{ display: "flex", gap: 10 }}>
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    locale={locale}
                    format="DD/MM/YYYY"
                    placeholder="เลือกวันที่"
                    style={{ width: "100%" }}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addDuplicateDate}
                    disabled={!selectedDate}
                  >
                    เพิ่ม
                  </Button>
                </div>

                {/* <Text type="secondary">หรือเลือกช่วงวันที่</Text>

                <RangePicker
                  onChange={handleMultipleDates}
                  locale={locale}
                  format="DD/MM/YYYY"
                /> */}
              </Space>

              {duplicateDates.length > 0 && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 10,
                    background: "#f0f7ff",
                    borderRadius: 4,
                    maxHeight: "150px",
                    overflowY: "auto",
                  }}
                >
                  <div style={{ marginBottom: 10 }}>
                    <Text strong>
                      วันที่ทำซ้ำ ({duplicateDates.length} วัน):
                    </Text>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {duplicateDates
                      .sort((a, b) => a.diff(b)) // เรียงลำดับตามวันที่
                      .map((date, index) => (
                        <Tag
                          key={index}
                          closable
                          onClose={() => removeDuplicateDate(date)}
                          style={{ margin: "4px 0" }}
                        >
                          {date.format("DD/MM/YYYY")}
                        </Tag>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Form form={form} layout="vertical">
            {/* ส่วนเลือกประเภทอาจารย์ */}
            <Form.Item
              label="Instructor Type"
              name="instructor_type"
              rules={[
                { required: true, message: "Please select instructor type" },
              ]}
            >
              <Select
                placeholder="Select instructor type"
                onChange={(value) => {
                  setInstructorType(value);
                  form.setFieldsValue({ instructor: "" });
                }}
              >
                <Select.Option value="internal">Internal Teacher</Select.Option>
                <Select.Option value="guest">Guest Teacher</Select.Option>
              </Select>
            </Form.Item>

            {/* ส่วนเลือกอาจารย์ */}
            {instructorType === "internal" ? (
              <Form.Item
                label="Teacher"
                name="instructor"
                rules={[{ required: true, message: "Please select a teacher" }]}
              >
                <Select placeholder="Select a teacher">
                  {users.map((user) => (
                    <Select.Option
                      key={user._id}
                      value={user.first_name + " " + user.last_name}
                    >
                      {user.first_name + " " + user.last_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            ) : instructorType === "guest" ? (
              <Form.Item
                label="Teacher"
                name="instructor"
                rules={[
                  {
                    required: true,
                    message: "Please enter a guest teacher name",
                  },
                ]}
              >
                <Input placeholder="Enter guest teacher's name" />
              </Form.Item>
            ) : null}

            {/* ส่วนอื่นๆ ของฟอร์ม */}
            <Form.Item
              label="Class Title"
              name="title"
              rules={[
                { required: true, message: "Please select a class title" },
              ]}
            >
              <Select
                placeholder="Select a class"
                onChange={(value) => {
                  const selectedCourse = courses.find(
                    (course) => course.course_name === value
                  );
                  if (selectedCourse) {
                    form.setFieldsValue({
                      description: selectedCourse.details,
                    });
                  }
                }}
              >
                {courses.map((course) => (
                  <Select.Option key={course._id} value={course.course_name}>
                    {course.course_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea rows={2} placeholder="Class description" />
            </Form.Item>

            <Form.Item label="📌 Room Number" name="room_number">
              <Input placeholder="Enter Room Number" />
            </Form.Item>

            <Form.Item label="🔑 Passcode" name="passcode">
              <Input placeholder="Enter Passcode" />
            </Form.Item>

            <Form.Item label="🔗 Zoom Link" name="zoom_link">
              <Input placeholder="Enter Zoom Link" />
            </Form.Item>

            <Form.Item
              label="Start Time"
              name="start_time"
              rules={[{ required: true }]}
            >
              <Input type="datetime-local" />
            </Form.Item>

            <Form.Item
              label="End Time"
              name="end_time"
              rules={[{ required: true }]}
            >
              <Input type="datetime-local" />
            </Form.Item>
            <Form.Item
              label="Color"
              name="color"
              getValueFromEvent={(color) =>
                color.toHexString().replace("#", "")
              }
            >
              <ColorPicker showText format="hex" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Layout>
  );
};

export default Schedule;
