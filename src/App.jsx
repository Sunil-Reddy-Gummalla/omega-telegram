import './App.css';
import Header from './components/Header'; // Import Header component
import PredictionBoard from './components/PredictionBoard'; // Import PredictionCard component

function App() {
  return (
    <div className="app-container"> {/* Unique class for scoping */}
      {/* Render Header component */}
      <Header />

      {/* Always render PredictionCard */}
      <div className="prediction-container">
        <PredictionBoard />
      </div>
    </div>
  );
}

export default App;
