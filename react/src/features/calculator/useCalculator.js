import { useCallback, useMemo, useState } from 'react';

function compute(a, b, op) {
  if (op === '+') return a + b;
  if (op === '−') return a - b;
  if (op === '×') return a * b;
  if (op === '÷') {
    if (b === 0) return Infinity;
    return a / b;
  }
  return b;
}

function trimTrailing(str) {
  if (str.indexOf('.') === -1) return str;
  let s = str;
  while (s.length > 0 && s.charAt(s.length - 1) === '0') {
    s = s.slice(0, -1);
  }
  if (s.length > 0 && s.charAt(s.length - 1) === '.') {
    s = s.slice(0, -1);
  }
  if (s === '-0') return '0';
  return s;
}

function formatNumber(num) {
  if (!Number.isFinite(num)) return 'Ошибка';
  const abs = Math.abs(num);
  let str;
  if (abs >= 1e12 || (abs !== 0 && abs < 1e-9)) {
    const exp = num.toExponential(9);
    const parts = exp.split('e');
    let mant = trimTrailing(parts[0]);
    const e = parts.length > 1 ? 'e' + parts[1] : '';
    str = mant + e;
  } else {
    let p = num.toPrecision(12);
    if (p.indexOf('e') !== -1) {
      const parts = p.split('e');
      let mant = trimTrailing(parts[0]);
      const e = parts.length > 1 ? 'e' + parts[1] : '';
      str = mant + e;
    } else {
      str = trimTrailing(p);
    }
  }
  return str;
}

export default function useCalculator() {
  const [currentValue, setCurrentValue] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperatorState] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [canClearEntry, setCanClearEntry] = useState(false);

  const updateClearFlag = useCallback((valStr, typing) => {
    const flag = !(typing === false && valStr === '0');
    setCanClearEntry(flag);
  }, []);

  const inputDigit = useCallback((d) => {
    if (d.length !== 1) return;
    if (d < '0' || d > '9') return;

    if (justEvaluated) {
      setPreviousValue(null);
      setOperatorState(null);
      setJustEvaluated(false);
      setIsTyping(true);
      setCurrentValue(d === '0' ? '0' : d);
      updateClearFlag(d === '0' ? '0' : d, true);
      return;
    }

    setIsTyping(true);
    setCurrentValue((prev) => {
      if (prev === 'Ошибка') return d;
      if (prev === '0') {
        const next = d;
        updateClearFlag(next, true);
        return next;
      }
      const next = prev + d;
      // limit length to 14 characters for input
      const limited = next.length > 14 ? next.slice(0, 14) : next;
      updateClearFlag(limited, true);
      return limited;
    });
  }, [justEvaluated, updateClearFlag]);

  const inputDot = useCallback(() => {
    if (justEvaluated) {
      setPreviousValue(null);
      setOperatorState(null);
      setJustEvaluated(false);
      setIsTyping(true);
      setCurrentValue('0.');
      updateClearFlag('0.', true);
      return;
    }
    setIsTyping(true);
    setCurrentValue((prev) => {
      if (prev === 'Ошибка') {
        updateClearFlag('0.', true);
        return '0.';
      }
      if (prev.indexOf('.') !== -1) {
        updateClearFlag(prev, true);
        return prev;
      }
      const next = prev + (prev.length === 0 ? '0.' : '.');
      updateClearFlag(next, true);
      return next;
    });
  }, [justEvaluated, updateClearFlag]);

  const toggleSign = useCallback(() => {
    setCurrentValue((prev) => {
      if (prev === 'Ошибка') return '0';
      if (prev === '0') return '0';
      const next = prev.charAt(0) === '-' ? prev.slice(1) : '-' + prev;
      updateClearFlag(next, isTyping || next !== '0');
      return next;
    });
  }, [isTyping, updateClearFlag]);

  const percent = useCallback(() => {
    setCurrentValue((prev) => {
      if (prev === 'Ошибка') return '0';
      const curr = parseFloat(prev || '0');
      let num;
      if (previousValue !== null && operator !== null) {
        num = (previousValue * curr) / 100;
      } else {
        num = curr / 100;
      }
      const formatted = formatNumber(num);
      setIsTyping(true);
      setJustEvaluated(false);
      updateClearFlag(formatted, true);
      return formatted;
    });
  }, [operator, previousValue, updateClearFlag]);

  const setOperatorFn = useCallback((op) => {
    if (op !== '+' && op !== '−' && op !== '×' && op !== '÷') return;

    if (currentValue === 'Ошибка') {
      setPreviousValue(null);
      setOperatorState(op);
      setCurrentValue('0');
      setIsTyping(false);
      setJustEvaluated(false);
      updateClearFlag('0', false);
      return;
    }

    const currNum = parseFloat(currentValue);

    if (previousValue !== null && operator !== null && isTyping) {
      const result = compute(previousValue, currNum, operator);
      const formatted = formatNumber(result);
      setPreviousValue(Number.isFinite(result) ? parseFloat(formatted) : null);
      setCurrentValue(formatted);
      setOperatorState(op);
      setIsTyping(false);
      setJustEvaluated(false);
      updateClearFlag(formatted, false);
    } else if (previousValue !== null && operator !== null && !isTyping) {
      // Change operator without computing
      setOperatorState(op);
      setJustEvaluated(false);
      updateClearFlag(currentValue, false);
    } else {
      setPreviousValue(currNum);
      setOperatorState(op);
      setIsTyping(false);
      setJustEvaluated(false);
      updateClearFlag(currentValue, false);
    }
  }, [currentValue, isTyping, operator, previousValue, updateClearFlag]);

  const evaluate = useCallback(() => {
    if (operator === null || previousValue === null) {
      setJustEvaluated(true);
      updateClearFlag(currentValue, currentValue !== '0');
      return;
    }
    const currNum = parseFloat(currentValue);
    const result = compute(previousValue, currNum, operator);
    const formatted = formatNumber(result);
    setCurrentValue(formatted);
    setPreviousValue(null);
    setOperatorState(null);
    setIsTyping(false);
    setJustEvaluated(true);
    updateClearFlag(formatted, formatted !== '0');
  }, [currentValue, operator, previousValue, updateClearFlag]);

  const clearAll = useCallback(() => {
    setCurrentValue('0');
    setPreviousValue(null);
    setOperatorState(null);
    setIsTyping(false);
    setJustEvaluated(false);
    updateClearFlag('0', false);
  }, [updateClearFlag]);

  const clearEntry = useCallback(() => {
    setCurrentValue('0');
    setIsTyping(false);
    setJustEvaluated(false);
    updateClearFlag('0', false);
  }, [updateClearFlag]);

  const handleKeyDown = useCallback((e) => {
    const key = e.key;
    // Digits
    if (key >= '0' && key <= '9') {
      e.preventDefault();
      inputDigit(key);
      return;
    }
    if (key === '.') {
      e.preventDefault();
      inputDot();
      return;
    }
    if (key === '+' || key === '-') {
      e.preventDefault();
      setOperatorFn(key === '+' ? '+' : '−');
      return;
    }
    if (key === '*' || key === '/') {
      e.preventDefault();
      setOperatorFn(key === '*' ? '×' : '÷');
      return;
    }
    if (key === '=' || key === 'Enter') {
      e.preventDefault();
      evaluate();
      return;
    }
    if (key === 'Escape') {
      e.preventDefault();
      clearAll();
      return;
    }
    if (key === 'Backspace') {
      e.preventDefault();
      clearEntry();
      return;
    }
    if (key === '%') {
      e.preventDefault();
      percent();
    }
  }, [clearAll, clearEntry, evaluate, inputDigit, inputDot, percent, setOperatorFn]);

  const displayValue = useMemo(() => {
    return currentValue;
  }, [currentValue]);

  return {
    currentValue: displayValue,
    previousValue,
    operator,
    isTyping,
    justEvaluated,
    canClearEntry,
    inputDigit,
    inputDot,
    toggleSign,
    percent,
    setOperator: setOperatorFn,
    evaluate,
    clearAll,
    clearEntry,
    handleKeyDown,
  };
}
