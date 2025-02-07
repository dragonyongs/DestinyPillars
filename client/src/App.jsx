import { useState } from "react";
import YearSelector from "./components/YearSelector";
import MonthSelector from "./components/MonthSelector";
import DaySelector from "./components/DaySelector";
import TimeSelector from "./components/TimeSelector";
import ResultViewer from "./components/ResultViewer";

function App() {
  // 입력값 상태
  const [yearInput, setYearInput] = useState("");
  const [monthInput, setMonthInput] = useState("");
  const [dayInput, setDayInput] = useState("");
  const [timeInput, setTimeInput] = useState("");

  // 계산된 사주 기둥 상태
  // const [yearPillar, setYearPillar] = useState("");
  const [monthPillar, setMonthPillar] = useState("");
  const [dayPillar, setDayPillar] = useState("");
  const [timePillar, setTimePillar] = useState("");
  const [yearStemIndex, setYearStemIndex] = useState(null);
  const [shouldCalculate, setShouldCalculate] = useState(false);

  const handleCalculate = () => {
    setShouldCalculate(prev => !prev); // 버튼 클릭 시 계산 트리거
  };

  return (
    <div className="container mx-auto p-4">
      <YearSelector
        year={yearInput}
        setYear={setYearInput}
        setYearStemIndex={setYearStemIndex}
      />
      <MonthSelector
        month={monthInput}
        setMonth={setMonthInput}
        setMonthPillar={setMonthPillar}
        yearStemIndex={yearStemIndex}
      />
      <DaySelector
        year={yearInput}
        month={monthInput}
        day={dayInput}
        setDay={setDayInput}
        setDayPillar={setDayPillar}
      />
      <TimeSelector
        time={timeInput}
        setTime={setTimeInput}
        setTimePillar={setTimePillar}
        dayPillar={dayPillar}
      />

      <button 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" 
        onClick={handleCalculate}
      >
        계산하기
      </button>

      <ResultViewer
        year={yearInput}
        month={monthInput}
        day={dayInput}
        time={timeInput}
        yearStemIndex={yearStemIndex}
        trigger={shouldCalculate}
      />
    </div>
  );
}

export default App;

// 연주(年柱): 을축(乙丑)
// 월주(月柱): 병자(丙子)
// 일주(日柱): 계미(癸未)
// 시주(時柱): 병오(丙午)