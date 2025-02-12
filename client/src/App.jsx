import { useState } from "react";
// import YearSelector from "./components/YearSelector";
// import MonthSelector from "./components/MonthSelector";
// import DaySelector from "./components/DaySelector";
import TimeSelector from "./components/TimeSelector";
import DateSelector from "./components/DateSelector";
import ResultViewer from "./components/ResultViewer";
import GenderSelector from "./components/GenderSelector";

function App() {
  // 입력값 상태
  // const [yearInput, setYearInput] = useState("");
  // const [monthInput, setMonthInput] = useState("");
  // const [dayInput, setDayInput] = useState("");
  const [timeInput, setTimeInput] = useState("");

  const [birthDateInput, setBirthDateInput] = useState("");

  // 계산된 사주 기둥 상태
  // const [yearPillar, setYearPillar] = useState("");
  const [monthPillar, setMonthPillar] = useState("");
  const [dayPillar, setDayPillar] = useState("");
  const [timePillar, setTimePillar] = useState("");
  const [yearStemIndex, setYearStemIndex] = useState(null);
  const [gender, setGender] = useState("");
  // const [shouldCalculate, setShouldCalculate] = useState(false);

  // const handleCalculate = () => {
  //   setShouldCalculate(prev => !prev); // 버튼 클릭 시 계산 트리거
  // };

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6 min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="flex justify-between items-center gap-x-3">
        <DateSelector 
          birthDate={birthDateInput} 
          setBirthDate={setBirthDateInput} 
          setMonthPillar={setMonthPillar} 
          setDayPillar={setDayPillar} 
          setYearStemIndex={setYearStemIndex} />
        <TimeSelector
          time={timeInput}
          setTime={setTimeInput}
          setTimePillar={setTimePillar}
          dayPillar={dayPillar}
        />
        <GenderSelector 
          gender={gender}
          setGender={setGender}
        />
      </div>
      {/* <button 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" 
        onClick={handleCalculate}
      >
        계산하기
      </button> */}

      <ResultViewer
        birth={birthDateInput}
        time={timeInput}
        yearStemIndex={yearStemIndex}
        gender={gender}
        // trigger={shouldCalculate}
      />
    </div>
  );
}

export default App;