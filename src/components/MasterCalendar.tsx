import React, { useState, useCallback } from 'react'; // Import useState and useCallback
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useGrid, MyEvent } from '../context/GridContext';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar'; // Import Views and View
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const MasterCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { allEvents, colorMap } = useGrid();

  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>(Views.MONTH);

  const handleNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate]);
  const handleView = useCallback((newView: View) => setView(newView), [setView]);

  const events = Object.values(allEvents).flat();

  const eventStyleGetter = (event: MyEvent) => {
    const color = colorMap[event.subGridKey] || '#808080';
    const style = {
      backgroundColor: color,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'black',
      border: '0px',
      display: 'block'
    };
    return {
      style: style
    };
  };

  const handleSelectEvent = (event: MyEvent) => {
    if (event.subGridKey) {
      navigate(`/subgoal/${event.subGridKey}`);
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center mb-4">
        <Col xs="auto">
          <Button onClick={() => navigate('/')} className="mb-3">Back to Main</Button>
          <h1 className="text-center">Master Calendar</h1>
        </Col>
      </Row>
      <Row>
        <Col style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '80vh' }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            view={view}
            onView={handleView}
            date={date}
            onNavigate={handleNavigate}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default MasterCalendar;
