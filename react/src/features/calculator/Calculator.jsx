import React, { useEffect, useMemo, useRef } from 'react';
import useCalculator from './useCalculator';
import './Calculator.css';

function Display({ value, hint }) {
  const length = value ? value.length : 1;
  const fontSize = useMemo(() => {
    if (length <= 6) return '64px';
    if (length <= 8) return '52px';
    if (length <= 10) return '44px';
    if (length <= 12) return '36px';
    if (length <= 14) return '30px';
    return '26px';
  }, [length]);
  return (
    <div className="calc-display" aria-live="polite" aria-atomic="true">
      <div className="calc-display-hint">{hint}</div>
      <div className="calc-display-value" style={{ fontSize }}>{value}</div>
    </div>
  );
}

function Key({ label, aria, onPress, variant = 'digit', active = false, grow = false }) {
  const className = [
    'key',
    variant === 'func' ? 'key-func' : '',
    variant === 'op' ? 'key-op' : '',
    variant === 'eq' ? 'key-eq' : '',
    variant === 'digit' ? 'key-digit' : '',
    active ? 'key-active' : '',
    grow ? 'key-grow' : ''
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={className}
      role="button"
      aria-label={aria}
      onClick={onPress}
    >
      {label}
    </button>
  );
}

export default function Calculator() {
  const {
    currentValue,
    previousValue,
    operator,
    isTyping,
    canClearEntry,
    inputDigit,
    inputDot,
    toggleSign,
    percent,
    setOperator,
    evaluate,
    clearAll,
    clearEntry,
    handleKeyDown
  } = useCalculator();

  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  const hint = useMemo(() => {
    if (previousValue === null && !operator) return '';
    const prev = previousValue !== null ? previousValue : '';
    const op = operator ? ' ' + operator : '';
    return String(prev) + op + (isTyping ? '' : '');
  }, [previousValue, operator, isTyping]);

  const onClear = () => {
    if (canClearEntry) clearEntry();
    else clearAll();
  };

  return (
    <div
      className="calc-wrap"
      tabIndex={0}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <div className="calc">
        <Display value={currentValue} hint={hint} />
        <div className="keys">
          <Key label={canClearEntry ? 'C' : 'AC'} aria={canClearEntry ? 'Стереть ввод' : 'Сбросить всё'} onPress={onClear} variant="func" />
          <Key label="±" aria="Поменять знак" onPress={toggleSign} variant="func" />
          <Key label="%" aria="Процент" onPress={percent} variant="func" />
          <Key label="÷" aria="Деление" onPress={() => setOperator('÷')} variant="op" active={operator === '÷' && !isTyping} />

          <Key label="7" aria="Семь" onPress={() => inputDigit('7')} />
          <Key label="8" aria="Восемь" onPress={() => inputDigit('8')} />
          <Key label="9" aria="Девять" onPress={() => inputDigit('9')} />
          <Key label="×" aria="Умножение" onPress={() => setOperator('×')} variant="op" active={operator === '×' && !isTyping} />

          <Key label="4" aria="Четыре" onPress={() => inputDigit('4')} />
          <Key label="5" aria="Пять" onPress={() => inputDigit('5')} />
          <Key label="6" aria="Шесть" onPress={() => inputDigit('6')} />
          <Key label="−" aria="Вычитание" onPress={() => setOperator('−')} variant="op" active={operator === '−' && !isTyping} />

          <Key label="1" aria="Один" onPress={() => inputDigit('1')} />
          <Key label="2" aria="Два" onPress={() => inputDigit('2')} />
          <Key label="3" aria="Три" onPress={() => inputDigit('3')} />
          <Key label="+" aria="Сложение" onPress={() => setOperator('+')} variant="op" active={operator === '+' && !isTyping} />

          <Key label="0" aria="Ноль" onPress={() => inputDigit('0')} grow />
          <Key label="," aria="Десятичная точка" onPress={inputDot} />
          <Key label="=" aria="Равно" onPress={evaluate} variant="eq" />
        </div>
      </div>
    </div>
  );
}
