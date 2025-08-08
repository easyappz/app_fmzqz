import React, { useEffect } from 'react';
import Calculator from '../features/calculator/Calculator.jsx';

const CalculatorPage = () => {
  useEffect(() => {
    document.title = 'Калькулятор';
  }, []);

  return (
    <div className="app-shell">
      <Calculator />
    </div>
  );
};

export default CalculatorPage;
