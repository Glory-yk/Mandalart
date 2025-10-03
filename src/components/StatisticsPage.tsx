import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useGrid } from '../context/GridContext';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentGridState, allEvents } = useGrid();

  // --- Calculate Statistics ---

  // 1. Goal Completion
  const mainGoalCells = currentGridState.mainGrid.flat();
  const filledCells = mainGoalCells.filter(cell => cell.trim() !== '').length;
  const totalCells = mainGoalCells.length;
  const completionRate = totalCells > 0 ? (filledCells / totalCells) * 100 : 0;

  // 2. Total Tasks
  const allEventsFlat = Object.values(allEvents).flat();
  const totalTasks = allEventsFlat.length;

  // 3. Tasks per Day of Week
  const tasksPerDay: { [key: string]: number } = {
    Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0
  };
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  allEventsFlat.forEach(event => {
    if (event.start) {
      const dayIndex = new Date(event.start).getDay();
      const dayName = dayNames[dayIndex];
      tasksPerDay[dayName]++;
    }
  });

  const chartData = {
    labels: dayNames,
    datasets: [
      {
        label: 'Tasks per Day',
        data: dayNames.map(day => tasksPerDay[day]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Task Distribution',
      },
    },
  };

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center mb-4">
        <Col xs="auto">
          <Button onClick={() => navigate('/')} className="mb-3">Back to Main</Button>
          <h1 className="text-center">Statistics</h1>
        </Col>
      </Row>
      <Row className="g-4">
        <Col md={6} lg={4}>
          <Card className="text-center h-100">
            <Card.Header as="h5">Main Goal Completion</Card.Header>
            <Card.Body>
              <Card.Title style={{ fontSize: '3rem' }}>{completionRate.toFixed(1)}%</Card.Title>
              <Card.Text>({filledCells} / {totalCells} goals filled)</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4}>
          <Card className="text-center h-100">
            <Card.Header as="h5">Total Tasks Created</Card.Header>
            <Card.Body>
              <Card.Title style={{ fontSize: '3rem' }}>{totalTasks}</Card.Title>
              <Card.Text>across all sub-goals</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          {/* Placeholder for another stat if needed */}
        </Col>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Bar options={chartOptions} data={chartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StatisticsPage;
