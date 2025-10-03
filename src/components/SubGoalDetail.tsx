import React, { useState, useCallback, useRef } from 'react';
import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useGrid, MyEvent } from '../context/GridContext';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const SubGoalDetail: React.FC = () => {
  const navigate = useNavigate();
  const { subGridKey } = useParams<{ subGridKey: string }>();
  const { 
    currentGridState, 
    colorMap,
    allEvents,
    addEvent,
    deleteEvent
  } = useGrid();

  // --- Grid Data --
  const gridData = subGridKey ? currentGridState.subGrids[subGridKey] : [];
  const [mainGridRow, mainGridCol] = subGridKey ? subGridKey.split('-').map(Number) : [0, 0];
  const mainGoal = currentGridState.mainGrid[mainGridRow][mainGridCol];
  const backgroundColor = subGridKey ? colorMap[subGridKey] : 'white';

  // --- State ---
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>(Views.WEEK);

  // --- Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [newEventStart, setNewEventStart] = useState<Date | null>(null);
  const [newEventEnd, setNewEventEnd] = useState<Date | null>(null);
  const [selectedSubGoal, setSelectedSubGoal] = useState<{row: number, col: number} | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleSelectSlot = useCallback(({ start, end }: { start: Date, end: Date }) => {
    setNewEventStart(start);
    setNewEventEnd(end);
    setShowModal(true);
  }, []);

  const handleSaveEvent = () => {
    const title = titleInputRef.current?.value;
    if (selectedSubGoal && title && newEventStart && newEventEnd) {
      const cellKey = `${selectedSubGoal.row}-${selectedSubGoal.col}`;
      const selectedCellContent = gridData[selectedSubGoal.row][selectedSubGoal.col];
      const hashtag = selectedCellContent ? `#${selectedCellContent.replace(/\s+/g, '_')}` : '#new_task';

      const newEvent: MyEvent = {
        id: Date.now(),
        start: newEventStart,
        end: newEventEnd,
        title: `${hashtag} ${title}`,
        cellKey: cellKey,
        subGridKey: subGridKey || '',
      };
      addEvent(cellKey, newEvent);

      setShowModal(false);
      setSelectedSubGoal(null);
      if (titleInputRef.current) {
        titleInputRef.current.value = '';
      }
    }
  };

  const handleSelectEvent = useCallback((event: MyEvent) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(event.cellKey, event);
    }
  }, [deleteEvent]);

  const handleNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate]);
  const handleView = useCallback((newView: View) => setView(newView), [setView]);

  const eventPropGetter = useCallback((event: MyEvent) => ({
    style: {
      backgroundColor: colorMap[event.subGridKey],
    }
  }), [colorMap]);

  // --- Render Logic ---
  const currentEvents = Object.values(allEvents).flat();

  if (!subGridKey || !gridData) {
    return <div>Loading...</div>;
  }

  return (
    <Container 
      fluid 
      className="mt-4" 
      style={{
        backgroundColor: backgroundColor, 
        minHeight: '100vh', 
        paddingTop: '1rem', 
        paddingBottom: '1rem' 
      }}
    >
      <Row className="justify-content-center mb-4">
        <Col xs="auto" style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem' }}>
          <Button onClick={() => navigate(-1)} className="mb-3">Back</Button>
          <h1 className="text-center">{mainGoal || 'Sub-Goal'}</h1>
        </Col>
      </Row>
      <Row>
        <Col md={12} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem' }}>
           <p className="text-center text-muted">
            Click or drag on the calendar to add a new task for the selected cell
          </p>
          <Calendar
            localizer={localizer}
            events={currentEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            selectable
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventPropGetter}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            view={view}
            onView={handleView}
            date={date}
            onNavigate={handleNavigate}
          />
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveEvent(); }}>
            <Form>
              <Form.Group>
                <Form.Label>Sub-Goal</Form.Label>
                <Form.Control as="select" onChange={(e) => {
                  const [row, col] = e.target.value.split('-').map(Number);
                  setSelectedSubGoal({row, col});
                }}>
                  <option>Select a sub-goal</option>
                  {gridData.flatMap((row, r) => 
                    row.map((cell, c) => 
                      cell && <option key={`${r}-${c}`} value={`${r}-${c}`}>{cell}</option>
                    )
                  )}
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Event Title</Form.Label>
                <Form.Control type="text" ref={titleInputRef} />
              </Form.Group>
            </Form>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" type="submit" onClick={handleSaveEvent}>Save Event</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default SubGoalDetail;
