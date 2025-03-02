import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../state/LoginProvider";

// fullCalendar + datePicker 관련
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import koLocale from "@fullcalendar/core/locales/ko";
import "react-datepicker/dist/react-datepicker.css";

import EventModal from "./EventModal";
import ScheduleViewerModal from "./ScheduleViewerModal";
import Header from "./Header";
import "./Home.css";
import HomeImage from "../HomeImage.jpg";

const Home = () => {
  const navigate = useNavigate();

  const { isLogin, userInfo } = useContext(LoginContext);
  const [isModalOpen, setIsModalOpen] = useState(false); // 일정 추가 창
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false); // 일정 리스트 창

  const [eventTitle, setEventTitle] = useState("");
  const [eventPlace, setEventPlace] = useState("");
  const [eventContent, setEventContent] = useState("");
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [selectedEvent, setSelectedEvent] = useState(null); // 선택한 이벤트
  const [selectedEventId, setSelectedEventId] = useState(null); // 선택한 이벤트 ID 값
  const [events, setEvents] = useState([]); // 화면에 표시되는 이벤트들

  const [scheduleList, setScheduleList] = useState([]); // DB에서 받아온 이벤트 리스트
  const [filteredSchedule, setFilteredSchedule] = useState([]); // 리스트 중 특정 날짜의 이벤트 필터링 값

  // 날짜를 fullCalendar 날짜 형식에 맞게 변경하는 함수
  const formatDateToLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  };

  // 일정 데이터 추가
  const handleAddEvent = async () => {
    if (!eventTitle || !startDate) {
      alert("일정 제목과 시작 날짜를 입력하세요.");
      return;
    }

    const newEvent = {
      title: eventTitle,
      place: eventPlace,
      start: formatDateToLocal(startDate),
      end: formatDateToLocal(endDate),
      content: eventContent,
    };

    try {
      const response = await axios.post("/api/write/schedule", newEvent);

      if (response.status === 200) {
        setEvents((prevEvents) => [...prevEvents, newEvent]);
        alert("일정이 추가 되었습니다.");
        setIsModalOpen(false);
        setEventTitle("");
        setEventPlace("");
        setEventContent("");
        getScheduleList();
        navigate("/");
      } else {
        alert("일정 추가 실패");
      }
    } catch (error) {
      console.error("일정 추가 중 오류 발생:", error);
      alert("일정 추가에 실패했습니다.");
    }
  };

  // 일정 데이터 수정
  const modifyEvent = async () => {
    const modifyId = selectedEventId;

    if (!modifyId) {
      alert("수정할 일정이 선택되지 않았습니다.");
      return;
    }

    const check = window.confirm("일정을 수정하시겠습니까 ?");

    if (check) {
      const modifyData = {
        title: eventTitle,
        place: eventPlace,
        start: formatDateToLocal(startDate),
        end: formatDateToLocal(endDate),
        content: eventContent,
      };

      try {
        const response = await axios.post(
          `/api/modify/schedule/${modifyId}`,
          modifyData
        );

        if (response.status == 200) {
          setEvents((prevEvents) => [...prevEvents, modifyData]);
          setIsModalOpen(false);
          alert("일정이 수정 되었습니다.");
          setSelectedEvent(null);
          getScheduleList();
        }
      } catch (error) {
        console.error("일정 수정 중 오류 발생:", error);
        alert("일정 수정을 실패했습니다.");
      }
    }
  };

  // 일정 데이터 삭제
  const deleteSchedule = async (eventId) => {
    const idToDelete = eventId || selectedEventId;
    console.log(idToDelete);

    if (!idToDelete) {
      alert("삭제할 일정이 선택되지 않았습니다.");
      return;
    }

    const check = window.confirm("일정을 삭제 하시겠습니까 ?");

    try {
      if (check) {
        const response = await axios.delete(
          `/api/delete/schedule/${idToDelete}`
        );

        if (response.status == 200) {
          alert("일정 삭제 성공 !");
          setEvents((prevEvents) =>
            prevEvents.filter((event) => event.id !== idToDelete)
          );
          setSelectedEventId(null);
          setIsModalOpen(false);
          setIsScheduleModalOpen(false);
          getScheduleList();
        }
      }
    } catch (error) {
      console.log("일정 삭제 중 에러 발생", error);
      alert("일정 삭제 중 에러 발생");
    }
  };

  // 로그인 사용자의 일정 리스트
  const getScheduleList = async () => {
    try {
      const response = await axios.get("/api/all/schedule");
      const data = response.data;

      setScheduleList(data);

      // fullCalendar의 데이터 형식에 맞춰 형태 변경
      const formattedEvents = data.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        place: event.place,
        content: event.content,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("일정 리스트를 불러오는데 실패했습니다..:", error);
    }
  };

  // 특정 날짜의 이벤트 출력
  const handleEvent = async (info) => {
    const eventId = info.event.id || info;
    console.log(eventId);

    setSelectedEventId(eventId);

    try {
      const response = await axios.get(`/api/schedule/${eventId}`);
      const data = response.data;

      setSelectedEvent({
        title: data.title,
        start: data.start,
        end: data.end,
        place: data.place,
        content: data.content,
      });

      setEventTitle(data.title);
      setEventPlace(data.place);
      setEventContent(data.content);
      setStartDate(new Date(data.start));
      setEndDate(new Date(data.end));
      setIsModalOpen(true);
    } catch (error) {
      console.error("일정 정보를 불러오지 못했습니다.:", error);
      alert("일정 정보를 불러오지 못했습니다.");
    }
  };

  // 특정 쉘 클릭 시 일정 추가 창 open
  const handleDateClick = (info) => {
    const { date } = info;

    setIsScheduleModalOpen(false);

    setSelectedEvent(null);

    setStartDate(date);
    setEndDate(null);
    setEventTitle("");
    setEventPlace("");
    setEventContent("");

    setIsModalOpen(true);
  };

  // 특정 날짜의 텍스트 클릭 시 해당 날짜의 일정 리스트를 보여줌
  const handelScheduleClick = (info) => {
    const day = formatDateToLocal(new Date(info)).split("T")[0];

    setStartDate(info);

    const filteredSchedules = scheduleList.filter(
      (event) => event.start.split("T")[0] == day
    );

    setFilteredSchedule(filteredSchedules);

    setIsScheduleModalOpen(true);
  };

  useEffect(() => {
    if (userInfo?.username) {
      getScheduleList();
    }
  }, [userInfo?.username]);
  

  useEffect(() => {}, [eventTitle, eventPlace, startDate, endDate]);

  return (
    <div>
      <Header />
      <div className="home-container">
        {isLogin ? (
          <div>
            <div className="calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                initialView="dayGridMonth"
                locale={koLocale}
                height="900px"
                headerToolbar={{
                  left: "prev,next today addEventButton",
                  center: "title",
                  right: "dayGridMonth,dayGridWeek,dayGridDay",
                }}
                customButtons={{
                  addEventButton: {
                    text: "일정 추가",
                    click: () => {
                      setStartDate(null);
                      setIsModalOpen(true);
                    },
                  },
                }}
                eventContent={(eventInfo) => {
                  // 달력에 표시되는 일정 커스텀

                  return (
                    <div className="calendarEvent">
                      <span>{eventInfo.timeText}</span> &nbsp;
                      <span>{eventInfo.event.title}</span>
                    </div>
                  );
                }}
                // 특정 날의 텍스트 선택 가능하게 하는 것
                navLinks={true}
                // 특정 날 텍스트 선택시 이벤트
                navLinkDayClick={handelScheduleClick}
                // 특정 날짜 쉘 클릭 시
                dateClick={handleDateClick}
                // 특정 날짜의 이벤트 클릭 시
                eventClick={handleEvent}
                events={events}
              />
            </div>

            <EventModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleAddEvent}
              selectedEvent={selectedEvent}
              eventTitle={eventTitle}
              setEventTitle={setEventTitle}
              eventPlace={eventPlace}
              setEventPlace={setEventPlace}
              eventContent={eventContent}
              setEventContent={setEventContent}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              deleteSchedule={deleteSchedule}
              selectedEventId={selectedEventId}
              modifyEvent={modifyEvent}
            />
            <ScheduleViewerModal
              isScheduleOpen={isScheduleModalOpen}
              onClose={() => setIsScheduleModalOpen(false)}
              selectedEvent={selectedEvent}
              handleDateClick={handleDateClick}
              filteredSchedule={filteredSchedule}
              deleteSchedule={deleteSchedule}
              modifyEvent={modifyEvent}
              setIsModalOpen={setIsModalOpen}
              setSelectedEvent={setSelectedEvent}
              setEventTitle={setEventTitle}
              setEventPlace={setEventPlace}
              setEventContent={setEventContent}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              setSelectedEventId={setSelectedEventId}
              handleEvent={handleEvent}
              scheduleDate={startDate}
              handelScheduleClick={handelScheduleClick}
            />
          </div>
        ) : (
          <div className="nonLogin-HomePage">
            <p>여러분의 하루 일정을 기록해보세요 !</p>
            <div className="nonLogin-HomePage-content">
              <span>시간별 일정을 만들고 관리해보세요.</span>
              <img src={HomeImage} className="logoutHome-image" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
