import { calculateDayPillar } from "../utils/pillarCalculator";

export default function DaySelector({ year, month, day, setDay, setDayPillar }) {
  const handleDayChange = (e) => {
    const inputDay = e.target.value;
    setDay(inputDay);
    const numDay = parseInt(inputDay);
    
    if (numDay >= 1 && numDay <= 31) {
      const { stem, branch } = calculateDayPillar(year, month, numDay);
      
      if (stem && branch) {
        setDayPillar({ stem, branch }); // 객체 형태로 저장
      }
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium">출생 일 입력</label>
      <input
        type="number"
        min="1"
        max="31"
        value={day}
        onChange={handleDayChange}
        className="p-2 border rounded w-full"
        placeholder="1 ~ 31"
      />
    </div>
  );
}
